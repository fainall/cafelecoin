import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Puerta del panel.
 *
 * Una sola contraseña que vive en ADMIN_PASSWORD y nunca en el código. Sin esa
 * variable el panel no abre: es preferible que no funcione a que quede una
 * clave por defecto rondando en un repositorio público.
 *
 * La sesión es una cookie firmada con esa misma contraseña. No hay base de
 * usuarios que mantener y el servidor no guarda estado: si la firma cuadra y
 * no ha caducado, la sesión vale.
 */

export const COOKIE = "lecoin_admin";
const DURACION_HORAS = 12;

function secreto(): string | null {
  const valor = process.env.ADMIN_PASSWORD;
  return valor && valor.length >= 8 ? valor : null;
}

/** ¿Está el panel habilitado? Sin contraseña, no. */
export function adminHabilitado(): boolean {
  return secreto() !== null;
}

function firmar(expira: number, clave: string): string {
  return createHmac("sha256", clave).update(String(expira)).digest("hex");
}

/** Compara sin filtrar por tiempo cuántos caracteres coincidían. */
function igualSeguro(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function comprobarPassword(candidata: string): boolean {
  const clave = secreto();
  if (!clave) return false;
  return igualSeguro(candidata, clave);
}

export function crearSesion(): { value: string; maxAge: number } {
  const clave = secreto();
  if (!clave) throw new Error("ADMIN_PASSWORD no está configurada");

  const expira = Date.now() + DURACION_HORAS * 60 * 60 * 1000;
  return {
    value: `${expira}.${firmar(expira, clave)}`,
    maxAge: DURACION_HORAS * 60 * 60,
  };
}

export function sesionValida(cookie: string | undefined): boolean {
  const clave = secreto();
  if (!clave || !cookie) return false;

  const [crudo, firma] = cookie.split(".");
  const expira = Number(crudo);
  if (!Number.isFinite(expira) || !firma) return false;
  if (expira < Date.now()) return false;

  return igualSeguro(firma, firmar(expira, clave));
}
