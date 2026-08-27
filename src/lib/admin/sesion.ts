import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { getAdminRepository } from "./repositorio";

/**
 * Puerta del panel.
 *
 * Entran dos clases de persona y no ven lo mismo:
 *
 *   • El administrador, con ADMIN_PASSWORD o la que haya guardado desde el
 *     panel. Lo ve todo.
 *   • Un empleado, con la dirección y la contraseña de SU casilla. Solo ve su
 *     correo.
 *
 * Al empleado no se le inventa una contraseña aparte, y es a propósito: IMAP
 * necesita la del buzón en claro para leerlo, así que una segunda clave
 * obligaría a guardar la del buzón de forma reversible — un llavero de
 * contraseñas en la base. Usando la suya no se guarda ninguna: la escribe al
 * entrar, la valida el propio servidor de correo, y viaja cifrada dentro de la
 * cookie mientras dure la sesión.
 *
 * Todo se firma con un secreto derivado de la credencial del administrador, de
 * modo que cambiarla cierra las sesiones abiertas, también las del equipo. Es
 * lo que se espera de un cambio de contraseña.
 */

export const COOKIE = "lecoin_admin";
export const CLAVE_AJUSTE = "admin_password";
const DURACION_HORAS = 12;
const MINIMO = 8;

export type Rol = "admin" | "empleado";

export interface Sesion {
  rol: Rol;
  /** Solo empleados: su casilla. */
  correo?: string;
  /** Solo empleados: contraseña del buzón, ya descifrada. */
  claveCorreo?: string;
  expira: number;
}

/* ─────────────────────────── Credencial del admin ─────────────────────────── */

interface Credencial {
  secreto: string;
  /** Guardada como resumen scrypt (se verifica) o en claro (se compara). */
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

/** ¿Está el panel habilitado? Sin credencial de administrador, no. */
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

/* ──────────────────────────── Secretos de sesión ──────────────────────────── */

/**
 * Dos llaves distintas para dos usos distintos, sacadas de la misma raíz.
 * Reutilizar una sola para firmar y para cifrar es un error clásico.
 */
async function llaves(): Promise<{ firma: Buffer; cifra: Buffer } | null> {
  const credencial = await credencialVigente();
  if (!credencial) return null;

  const derivar = (uso: string) =>
    createHmac("sha256", credencial.secreto).update(`lecoin-sesion-v1:${uso}`).digest();

  return { firma: derivar("firma"), cifra: derivar("cifra") };
}

/** AES-256-GCM. El GCM además autentica: un texto manipulado no descifra. */
function cifrar(texto: string, llave: Buffer): string {
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", llave, iv);
  const cuerpo = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  return [iv, cifrador.getAuthTag(), cuerpo].map((b) => b.toString("base64url")).join("~");
}

function descifrar(paquete: string, llave: Buffer): string | null {
  try {
    const [iv, tag, cuerpo] = paquete.split("~").map((p) => Buffer.from(p, "base64url"));
    if (!iv || !tag || !cuerpo) return null;

    const descifrador = createDecipheriv("aes-256-gcm", llave, iv);
    descifrador.setAuthTag(tag);
    return Buffer.concat([descifrador.update(cuerpo), descifrador.final()]).toString("utf8");
  } catch {
    // Tag inválido: la cookie viene de otra llave o está manipulada.
    return null;
  }
}

/* ─────────────────────────────── Sesiones ─────────────────────────────── */

/** Lo que viaja dentro de la cookie. Nombres cortos: es una cookie. */
interface Carga {
  r: Rol;
  c?: string;
  k?: string;
  e: number;
}

export interface CookieSesion {
  value: string;
  maxAge: number;
}

async function emitir(carga: Omit<Carga, "e">): Promise<CookieSesion> {
  const juego = await llaves();
  if (!juego) throw new Error("El panel no tiene credencial configurada");

  const expira = Date.now() + DURACION_HORAS * 60 * 60 * 1000;
  const cuerpo = Buffer.from(JSON.stringify({ ...carga, e: expira }), "utf8").toString("base64url");
  const firma = createHmac("sha256", juego.firma).update(cuerpo).digest("base64url");

  return { value: `${cuerpo}.${firma}`, maxAge: DURACION_HORAS * 60 * 60 };
}

export async function crearSesionAdmin(): Promise<CookieSesion> {
  return emitir({ r: "admin" });
}

export async function crearSesionEmpleado(
  correo: string,
  claveCorreo: string,
): Promise<CookieSesion> {
  const juego = await llaves();
  if (!juego) throw new Error("El panel no tiene credencial configurada");

  return emitir({ r: "empleado", c: correo, k: cifrar(claveCorreo, juego.cifra) });
}

/** Devuelve la sesión, o null si la cookie falta, caducó o no cuadra. */
export async function leerSesion(cookie: string | undefined): Promise<Sesion | null> {
  if (!cookie) return null;

  const juego = await llaves();
  if (!juego) return null;

  const corte = cookie.lastIndexOf(".");
  if (corte < 0) return null;

  const cuerpo = cookie.slice(0, corte);
  const firma = cookie.slice(corte + 1);
  const esperada = createHmac("sha256", juego.firma).update(cuerpo).digest("base64url");
  if (!igualSeguro(Buffer.from(firma), Buffer.from(esperada))) return null;

  let carga: Carga;
  try {
    carga = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8")) as Carga;
  } catch {
    return null;
  }

  if (!Number.isFinite(carga.e) || carga.e < Date.now()) return null;

  if (carga.r === "admin") return { rol: "admin", expira: carga.e };

  if (carga.r !== "empleado" || !carga.c || !carga.k) return null;
  const claveCorreo = descifrar(carga.k, juego.cifra);
  if (!claveCorreo) return null;

  return { rol: "empleado", correo: carga.c, claveCorreo, expira: carga.e };
}
