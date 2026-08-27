import "server-only";

import { getAdminRepository } from "./repositorio";

/**
 * Quién del equipo puede entrar al panel.
 *
 * Tener casilla en el dominio no basta: hay direcciones que son buzones y no
 * personas (info@, contacto@, no-reply@). El administrador decide cuáles
 * corresponden a alguien que además entra aquí.
 *
 * Aquí no hay contraseñas. Solo direcciones autorizadas y el nombre de quien
 * está detrás, para saber a quién se le dio acceso. Quien valida la clave es
 * el servidor de correo, al conectarse.
 *
 * Quitar a alguien de esta lista le cierra el panel pero NO le toca el buzón:
 * su correo sigue existiendo y llegándole. Son dos cosas distintas y conviene
 * que se puedan hacer por separado — alguien que cambia de puesto pierde el
 * panel, no su dirección.
 */

const CLAVE = "equipo";

export interface Empleado {
  /** Dirección completa, en minúsculas. Es la identidad. */
  correo: string;
  nombre: string;
  /** Cuándo se le dio acceso, en ISO. */
  desde: string;
}

/** Normaliza para comparar: el correo no distingue mayúsculas en la parte local. */
export const normalizar = (correo: string) => correo.trim().toLowerCase();

export async function listarEquipo(): Promise<Empleado[]> {
  const crudo = await getAdminRepository()
    .leerAjuste(CLAVE)
    .catch(() => null);
  if (!crudo) return [];

  try {
    const lista = JSON.parse(crudo) as Empleado[];
    return Array.isArray(lista) ? lista : [];
  } catch {
    // Un ajuste corrupto no debe tumbar el panel: se trata como lista vacía.
    return [];
  }
}

async function guardar(lista: Empleado[]): Promise<boolean> {
  return getAdminRepository()
    .guardarAjuste(CLAVE, JSON.stringify(lista))
    .catch(() => false);
}

export type ResultadoAlta = "ok" | "ya_estaba" | "sin_almacen";

export async function agregarEmpleado(
  correo: string,
  nombre: string,
  ahora: string,
): Promise<ResultadoAlta> {
  const direccion = normalizar(correo);
  const lista = await listarEquipo();

  if (lista.some((empleado) => empleado.correo === direccion)) return "ya_estaba";

  const nueva = [...lista, { correo: direccion, nombre: nombre.trim(), desde: ahora }];
  nueva.sort((a, b) => a.correo.localeCompare(b.correo));

  return (await guardar(nueva)) ? "ok" : "sin_almacen";
}

export async function quitarEmpleado(correo: string): Promise<boolean> {
  const direccion = normalizar(correo);
  const lista = await listarEquipo();
  const quedan = lista.filter((empleado) => empleado.correo !== direccion);

  if (quedan.length === lista.length) return false;
  return guardar(quedan);
}

/** ¿Está esta dirección autorizada a entrar? */
export async function estaEnEquipo(correo: string): Promise<boolean> {
  const direccion = normalizar(correo);
  return (await listarEquipo()).some((empleado) => empleado.correo === direccion);
}

/** Sin almacén no hay lista, y sin lista no puede entrar nadie del equipo. */
export function equipoHabilitado(): boolean {
  return getAdminRepository().backend !== "ninguno";
}
