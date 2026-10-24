import { NextResponse, type NextRequest } from "next/server";

import { COOKIE, leerSesion } from "@/lib/admin/sesion";
import {
  CABECERAS_MANTENIMIENTO,
  enMantenimiento,
  paginaMantenimiento,
} from "@/lib/mantenimiento";
import { isLocale, negotiateLocale } from "@/i18n/config";

/**
 * Dos cosas antes de que la petición llegue a la app:
 *
 *   • El modo mantenimiento, si está puesto.
 *   • El prefijo de idioma obligatorio: / → /es (o /en según Accept-Language).
 *
 * En mantenimiento NO cae todo. El panel y su API siguen en pie, porque es
 * desde ahí donde se atiende y se trabaja mientras la tienda está cerrada —
 * un mantenimiento que también deja fuera a quien debe arreglarlo no sirve.
 * Lo que sí se corta es la entrada de pedidos y solicitudes: ese es el punto.
 */

/** Rutas que siguen vivas con el sitio cerrado. */
const SIEMPRE_ABIERTO = ["/admin", "/api/admin"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SIEMPRE_ABIERTO.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
    return NextResponse.next();
  }

  if (enMantenimiento() && !(await tienePase(request))) {
    const idioma = negotiateLocale(request.headers.get("accept-language")) === "en" ? "en" : "es";
    return new NextResponse(paginaMantenimiento(idioma), {
      status: 503,
      headers: CABECERAS_MANTENIMIENTO,
    });
  }

  // El resto de la API no lleva prefijo de idioma: se deja pasar tal cual.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const [, first = ""] = pathname.split("/");
  if (isLocale(first)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

/**
 * Quien ya entró al panel puede ver el sitio real mientras está cerrado, para
 * comprobar que quedó bien antes de reabrir.
 *
 * Solo se comprueba si la cookie existe. Un visitante cualquiera no la trae,
 * así que el mantenimiento no le cuesta una consulta al almacén a nadie.
 */
async function tienePase(request: NextRequest): Promise<boolean> {
  const galleta = request.cookies.get(COOKIE)?.value;
  if (!galleta) return false;

  // Si el almacén falla, se prefiere mostrar el mantenimiento a abrir el sitio.
  const sesion = await leerSesion(galleta).catch(() => null);
  return sesion?.rol === "admin";
}

export const config = {
  matcher: [
    // Todo salvo estáticos de Next y archivos con extensión.
    //
    // robots.txt y sitemap.xml quedan fuera a propósito: tienen que seguir
    // respondiendo 200 incluso en mantenimiento. Un robots.txt que devuelve
    // 5xx hace que Google deje de rastrear el sitio entero, que es justo lo
    // contrario de lo que busca un 503 bien puesto.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
