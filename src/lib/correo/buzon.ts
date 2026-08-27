import "server-only";

import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";

/**
 * Bandeja del panel: leer y responder sin salir de aquí.
 *
 * Aquí sí hay dependencias, al revés que con Mercado Pago o Resend: IMAP y
 * SMTP no son APIs HTTP, son protocolos con estado sobre TCP. Escribirlos a
 * mano sería reimplementar dos clientes de correo enteros.
 *
 * El panel atiende UNA casilla —la de ventas—, no todas. Leer un buzón exige
 * su contraseña, y tener las de todas las cuentas guardadas sería convertir
 * esta variable de entorno en un llavero. Las demás casillas se crean desde
 * el panel y se leen desde el webmail de cPanel o el móvil, como siempre.
 */

export interface MensajeResumen {
  uid: number;
  asunto: string;
  de: string;
  fecha: string;
  leido: boolean;
  extracto: string;
}

export interface MensajeCompleto extends MensajeResumen {
  cuerpo: string;
}

interface BuzonConfig {
  host: string;
  usuario: string;
  password: string;
  imapPuerto: number;
  smtpPuerto: number;
}

export function buzonConfig(): BuzonConfig | null {
  const host = process.env.CORREO_HOST;
  const usuario = process.env.CORREO_USUARIO;
  const password = process.env.CORREO_PASSWORD;

  if (!host || !usuario || !password) return null;

  return {
    host,
    usuario,
    password,
    imapPuerto: Number(process.env.CORREO_IMAP_PUERTO ?? 993),
    smtpPuerto: Number(process.env.CORREO_SMTP_PUERTO ?? 465),
  };
}

export const buzonHabilitado = () => buzonConfig() !== null;

/* ──────────────────────────────── Recibir ──────────────────────────────── */

/** Abre, hace lo suyo y cierra. En serverless no hay conexión que reutilizar. */
async function conIMAP<T>(
  config: BuzonConfig,
  tarea: (cliente: ImapFlow) => Promise<T>,
): Promise<T> {
  const cliente = new ImapFlow({
    host: config.host,
    port: config.imapPuerto,
    secure: true,
    auth: { user: config.usuario, pass: config.password },
    logger: false,
  });

  await cliente.connect();
  try {
    return await tarea(cliente);
  } finally {
    await cliente.logout().catch(() => {});
  }
}

const texto = (valor: unknown): string => (typeof valor === "string" ? valor : "");

/** Los últimos mensajes, del más nuevo al más viejo. */
export async function leerBandeja(limite = 25): Promise<MensajeResumen[]> {
  const config = buzonConfig();
  if (!config) throw new Error("El buzón no está configurado");

  return conIMAP(config, async (cliente) => {
    const cerrojo = await cliente.getMailboxLock("INBOX");
    try {
      const buzon = cliente.mailbox;
      const total = typeof buzon === "object" ? buzon.exists : 0;
      if (!total) return [];

      const desde = Math.max(1, total - limite + 1);
      const mensajes: MensajeResumen[] = [];

      for await (const mensaje of cliente.fetch(`${desde}:*`, {
        uid: true,
        envelope: true,
        flags: true,
        bodyStructure: false,
      })) {
        const remitente = mensaje.envelope?.from?.[0];

        mensajes.push({
          uid: mensaje.uid,
          asunto: texto(mensaje.envelope?.subject) || "(sin asunto)",
          de: remitente ? `${remitente.name || ""} <${remitente.address}>`.trim() : "(desconocido)",
          fecha: (mensaje.envelope?.date ?? new Date()).toISOString(),
          leido: mensaje.flags?.has("\\Seen") ?? false,
          extracto: "",
        });
      }

      return mensajes.reverse();
    } finally {
      cerrojo.release();
    }
  });
}

/** Un mensaje entero. Leerlo lo marca como leído, como haría cualquier cliente. */
export async function leerMensaje(uid: number): Promise<MensajeCompleto | null> {
  const config = buzonConfig();
  if (!config) throw new Error("El buzón no está configurado");

  return conIMAP(config, async (cliente) => {
    const cerrojo = await cliente.getMailboxLock("INBOX");
    try {
      const mensaje = await cliente.fetchOne(String(uid), {
        uid: true,
        envelope: true,
        flags: true,
        source: true,
      });
      if (!mensaje || typeof mensaje === "boolean") return null;

      const remitente = mensaje.envelope?.from?.[0];
      const cuerpo = extraerTexto(mensaje.source?.toString("utf8") ?? "");

      await cliente.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true }).catch(() => {});

      return {
        uid,
        asunto: texto(mensaje.envelope?.subject) || "(sin asunto)",
        de: remitente ? `${remitente.name || ""} <${remitente.address}>`.trim() : "(desconocido)",
        fecha: (mensaje.envelope?.date ?? new Date()).toISOString(),
        leido: true,
        extracto: cuerpo.slice(0, 160),
        cuerpo,
      };
    } finally {
      cerrojo.release();
    }
  });
}

/**
 * Saca el texto plano de un mensaje crudo.
 *
 * No es un analizador MIME completo: se queda con la primera parte de texto y
 * deshace el «quoted-printable», que es lo que rompe los acentos. Para leer de
 * un vistazo y responder alcanza; para el correo con formato está el webmail.
 */
function extraerTexto(crudo: string): string {
  const separador = crudo.indexOf("\r\n\r\n");
  if (separador < 0) return crudo.slice(0, 4000);

  const cabeceras = crudo.slice(0, separador).toLowerCase();
  let cuerpo = crudo.slice(separador + 4);

  const frontera = /boundary="?([^";\r\n]+)"?/.exec(cabeceras)?.[1];
  if (frontera) {
    const partes = cuerpo.split(`--${frontera}`);
    const plana = partes.find((parte) => /content-type:\s*text\/plain/i.test(parte));
    if (plana) {
      const corte = plana.indexOf("\r\n\r\n");
      cuerpo = corte >= 0 ? plana.slice(corte + 4) : plana;
    }
  }

  if (/quoted-printable/i.test(cabeceras) || /quoted-printable/i.test(crudo.slice(0, 2000))) {
    cuerpo = cuerpo
      .replace(/=\r\n/g, "")
      .replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  return cuerpo.trim().slice(0, 8000);
}

/* ───────────────────────────────── Enviar ───────────────────────────────── */

export interface Envio {
  para: string;
  asunto: string;
  cuerpo: string;
}

export async function enviarCorreo({ para, asunto, cuerpo }: Envio): Promise<string> {
  const config = buzonConfig();
  if (!config) throw new Error("El buzón no está configurado");

  const transporte = nodemailer.createTransport({
    host: config.host,
    port: config.smtpPuerto,
    secure: config.smtpPuerto === 465,
    auth: { user: config.usuario, pass: config.password },
  });

  const resultado = await transporte.sendMail({
    from: config.usuario,
    to: para,
    subject: asunto,
    text: cuerpo,
  });

  return resultado.messageId;
}
