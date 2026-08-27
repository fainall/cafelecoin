import "server-only";

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { getAdminRepository } from "./repositorio";

/**
 * Puerta del panel.
 *
 * Hay dos credenciales posibles y una manda sobre la otra:
 *
 *   1. La que se haya cambiado desde el panel, guardada en el almacén como
 *      resumen scrypt. Si existe, es la que vale.
 *   2. ADMIN_PASSWORD, en el entorno. Sirve para el primer acceso y como
 *      rescate si el almacén se cae.
 *
 * Así se puede cambiar la clave sin volver a Vercel, pero el sitio nunca se
 * queda sin forma de entrar. La contraseña propiamente dicha no se guarda en
 * ninguna parte: solo su resumen con sal.
 *
 * La sesión es una cookie firmada con la credencial vigente. Al cambiarla, la
 * firma deja de cuadrar y todas las sesiones abiertas caen — que es justo lo
 * que se espera al cambiar una contraseña.
 */

export const COOKIE = "lecoin_admin";
export const CLAVE_AJUSTE = "admin_password";
const DURACION_HORAS = 12;
const MINIMO = 8;

/** Credencial vigente: el resumen guardado, o la del entorno si no hay. */
interface Credencial {
  /** Lo que se usa para firmar la cookie. Cambia cuando cambia la contraseña. */
  secreto: string;
  /** Guardada como resumen (se verifica con scrypt) o en claro (se compara). */
  resumen: boolean;
}

function delEntorno(): string | null {
  const valor = process.env.ADMIN_PASSWORD;
  return valor && valor.length >= MINIMO ? valor : null;
}

async function credencialVigente(): Promise<Credencial | null> {
  // Un almacén caído no debe dejar a nadie fuera: se cae al entorno.
  const guardada = await getAdminRepository()
    .leerAjuste(CLAVE_AJUSTE)
    .catch(() => null);

  if (guardada) return { secreto: guardada, resumen: true };

  const entorno = delEntorno();
  return entorno ? { secreto: entorno, resumen: false } : null;
}

/** ¿Está el panel habilitado? Sin ninguna credencial, no. */
export function adminHabilitado(): boolean {
  return delEntorno() !== null;
}

/* ────────────────────────────── Contraseñas ────────────────────────────── */

/** scrypt con sal aleatoria. Formato: scrypt:<sal>:<resumen>, en hexadecimal. */
export function resumirPassword(password: string): string {
  const sal = randomBytes(16);
  const resumen = scryptSync(password, sal, 64);
  return `scrypt:${sal.toString("hex")}:${resumen.toString("hex")}`;
}

/** Compara sin filtrar por tiempo cuántos caracteres coincidían. */
function igualSeguro(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function verificarResumen(password: string, guardado: string): boolean {
  const [tipo, salHex, resumenHex] = guardado.split(":");
  if (tipo !== "scrypt" || !salHex || !resumenHex) return false;

  const esperado = Buffer.from(resumenHex, "hex");
  const calculado = scryptSync(password, Buffer.from(salHex, "hex"), esperado.length);
  return igualSeguro(calculado, esperado);
}

export async function comprobarPassword(candidata: string): Promise<boolean> {
  const credencial = await credencialVigente();
  if (!credencial) return false;

  return credencial.resumen
    ? verificarResumen(candidata, credencial.secreto)
    : igualSeguro(Buffer.from(candidata), Buffer.from(credencial.secreto));
}

/**
 * Cambia la contraseña. Devuelve por qué falló, para poder decirlo en pantalla
 * en vez de un "no se pudo" que no ayuda a nadie.
 */
export type ResultadoCambio = "ok" | "actual_incorrecta" | "nueva_corta" | "sin_almacen";

export async function cambiarPassword(actual: string, nueva: string): Promise<ResultadoCambio> {
  if (!(await comprobarPassword(actual))) return "actual_incorrecta";
  if (nueva.length < MINIMO) return "nueva_corta";

  const guardado = await getAdminRepository()
    .guardarAjuste(CLAVE_AJUSTE, resumirPassword(nueva))
    .catch(() => false);

  return guardado ? "ok" : "sin_almacen";
}

/** ¿Se puede cambiar la contraseña desde aquí? Solo si hay dónde guardarla. */
export function puedeCambiarPassword(): boolean {
  return getAdminRepository().backend !== "ninguno";
}

/* ─────────────────────────────── Sesiones ─────────────────────────────── */

function firmar(expira: number, secreto: string): string {
  return createHmac("sha256", secreto).update(String(expira)).digest("hex");
}

export async function crearSesion(): Promise<{ value: string; maxAge: number }> {
  const credencial = await credencialVigente();
  if (!credencial) throw new Error("El panel no tiene credencial configurada");

  const expira = Date.now() + DURACION_HORAS * 60 * 60 * 1000;
  return {
    value: `${expira}.${firmar(expira, credencial.secreto)}`,
    maxAge: DURACION_HORAS * 60 * 60,
  };
}

export async function sesionValida(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;

  const credencial = await credencialVigente();
  if (!credencial) return false;

  const [crudo, firma] = cookie.split(".");
  const expira = Number(crudo);
  if (!Number.isFinite(expira) || !firma) return false;
  if (expira < Date.now()) return false;

  return igualSeguro(Buffer.from(firma), Buffer.from(firmar(expira, credencial.secreto)));
}
