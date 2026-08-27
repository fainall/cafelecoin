import "server-only";

/**
 * Casillas de correo, a través de la API de cPanel.
 *
 * El correo de lecoin.cl vive en el cPanel que ya se paga, así que crear una
 * cuenta desde el panel es hablar con su UAPI. Se autentica con un token de
 * API —no con la contraseña de la cuenta—, que se puede revocar sin cambiar
 * nada más.
 *
 * Sin CPANEL_API_TOKEN esta parte del panel no aparece, igual que el resto:
 * se prefiere una sección ausente a una que falle al pulsarla.
 */

export interface Casilla {
  /** Dirección completa: nombre@dominio. */
  email: string;
  /** Espacio ocupado y límite, en megabytes. `0` en el límite es sin tope. */
  usadoMb: number;
  limiteMb: number;
}

interface CPanelConfig {
  url: string;
  user: string;
  token: string;
  dominio: string;
}

export function cpanelConfig(): CPanelConfig | null {
  const url = process.env.CPANEL_URL;
  const user = process.env.CPANEL_USER;
  const token = process.env.CPANEL_API_TOKEN;
  const dominio = process.env.CORREO_DOMINIO;

  return url && user && token && dominio
    ? { url: url.replace(/\/$/, ""), user, token, dominio }
    : null;
}

export const correoHabilitado = () => cpanelConfig() !== null;

interface RespuestaUapi<T> {
  status: 0 | 1;
  errors?: string[] | null;
  data?: T;
}

async function uapi<T>(
  config: CPanelConfig,
  modulo: string,
  funcion: string,
  parametros: Record<string, string | number> = {},
): Promise<T> {
  const consulta = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) consulta.set(clave, String(valor));

  const respuesta = await fetch(`${config.url}/execute/${modulo}/${funcion}?${consulta}`, {
    headers: { authorization: `cpanel ${config.user}:${config.token}` },
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error(`cPanel respondió ${respuesta.status}`);
  }

  const cuerpo = (await respuesta.json()) as RespuestaUapi<T>;
  // UAPI devuelve 200 con status 0 cuando la operación falla: el código HTTP
  // no basta para saber si salió bien.
  if (cuerpo.status !== 1) {
    throw new Error(cuerpo.errors?.join(" · ") ?? "cPanel rechazó la operación");
  }

  return cuerpo.data as T;
}

/* ─────────────────────────────── Operaciones ─────────────────────────────── */

interface PopCrudo {
  email?: string;
  user?: string;
  domain?: string;
  diskused?: string | number;
  diskquota?: string | number;
  _diskused?: string | number;
  _diskquota?: string | number;
}

const aMegas = (valor: string | number | undefined): number => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.round(numero) : 0;
};

export async function listarCasillas(): Promise<Casilla[]> {
  const config = cpanelConfig();
  if (!config) throw new Error("El correo no está configurado");

  const crudas = await uapi<PopCrudo[]>(config, "Email", "list_pops_with_disk", {
    domain: config.dominio,
  });

  return (
    (crudas ?? [])
      .map((pop) => ({
        email: pop.email ?? `${pop.user}@${pop.domain ?? config.dominio}`,
        usadoMb: aMegas(pop._diskused ?? pop.diskused),
        limiteMb: aMegas(pop._diskquota ?? pop.diskquota),
      }))
      // cPanel incluye la cuenta principal del sistema, que no es una casilla.
      .filter((casilla) => casilla.email.includes("@"))
  );
}

/**
 * Crea una casilla. La contraseña la elige quien administra y viaja una sola
 * vez: no se guarda en ningún sitio de este lado.
 */
export async function crearCasilla(
  nombre: string,
  password: string,
  cuotaMb: number,
): Promise<void> {
  const config = cpanelConfig();
  if (!config) throw new Error("El correo no está configurado");

  await uapi(config, "Email", "add_pop", {
    email: nombre,
    password,
    quota: cuotaMb,
    domain: config.dominio,
  });
}

export async function borrarCasilla(email: string): Promise<void> {
  const config = cpanelConfig();
  if (!config) throw new Error("El correo no está configurado");

  const [nombre] = email.split("@");
  await uapi(config, "Email", "delete_pop", { email: nombre, domain: config.dominio });
}
