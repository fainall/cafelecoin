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
 * Cada llamada trae la casilla que va a abrir. El administrador usa la del
 * entorno; un empleado, la suya, que llega desde su sesión. Nadie lee la
 * bandeja de otro porque nadie tiene la contraseña de otro: quien decide es
 * el servidor de correo al autenticar, no este código.
 *
 * El servidor y los puertos sí son del entorno: son los mismos para todos.
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

/** La casilla que se va a abrir en esta llamada. */
export interface Casillero {
  usuario: string;
  password: string;
}

interface Servidor {
  host: string;
  imapPuerto: number;
  smtpPuerto: number;
}

function servidor(): Servidor | null {
  const host = process.env.CORREO_HOST;
  if (!host) return null;

  return {
    host,
    imapPuerto: Number(process.env.CORREO_IMAP_PUERTO ?? 993),
    smtpPuerto: Number(process.env.CORREO_SMTP_PUERTO ?? 465),
  };
}

/** La casilla del administrador, la de siempre, desde el entorno. */
export function casilleroDelEntorno(): Casillero | null {
  const usuario = process.env.CORREO_USUARIO;
  const password = process.env.CORREO_PASSWORD;
  return usuario && password ? { usuario, password } : null;
}

export const buzonHabilitado = () => servidor() !== null && casilleroDelEntorno() !== null;

/** Un empleado solo necesita el servidor: su casilla la trae él. */
export const servidorHabilitado = () => servidor() !== null;

/* ──────────────────────────────── Recibir ──────────────────────────────── */

/** Abre, hace lo suyo y cierra. En serverless no hay conexión que reutilizar. */
async function conIMAP<T>(
  casillero: Casillero,
  tarea: (cliente: ImapFlow) => Promise<T>,
): Promise<T> {
  const donde = servidor();
  if (!donde) throw new Error("El servidor de correo no está configurado");

  const cliente = new ImapFlow({
    host: donde.host,
    port: donde.imapPuerto,
    secure: true,
    auth: { user: casillero.usuario, pass: casillero.password },
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
export async function leerBandeja(casillero: Casillero, limite = 25): Promise<MensajeResumen[]> {
  return conIMAP(casillero, async (cliente) => {
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
export async function leerMensaje(
  casillero: Casillero,
  uid: number,
): Promise<MensajeCompleto | null> {
  return conIMAP(casillero, async (cliente) => {
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

export async function enviarCorreo(
  casillero: Casillero,
  { para, asunto, cuerpo }: Envio,
): Promise<string> {
  const donde = servidor();
  if (!donde) throw new Error("El servidor de correo no está configurado");

  const transporte = nodemailer.createTransport({
    host: donde.host,
    port: donde.smtpPuerto,
    secure: donde.smtpPuerto === 465,
    auth: { user: casillero.usuario, pass: casillero.password },
  });

  const resultado = await transporte.sendMail({
    from: casillero.usuario,
    to: para,
    subject: asunto,
    text: cuerpo,
  });

  return resultado.messageId;
}

/* ─────────────────────────────── Verificar ─────────────────────────────── */

/**
 * ¿Son válidas estas credenciales? Se pregunta conectando: el servidor de
 * correo es la única autoridad sobre eso, y así el panel no guarda ni compara
 * contraseñas de buzón por su cuenta.
 */
export async function credencialesValidas(casillero: Casillero): Promise<boolean> {
  try {
    await conIMAP(casillero, async () => undefined);
    return true;
  } catch {
    return false;
  }
}
