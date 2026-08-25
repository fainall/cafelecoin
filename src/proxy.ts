import { NextResponse, type NextRequest } from "next/server";

import { isLocale, negotiateLocale } from "@/i18n/config";

/**
 * Prefijo de idioma obligatorio: /  → /es (o /en según Accept-Language).
 * Las rutas ya localizadas pasan sin tocarse.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first = ""] = pathname.split("/");

  if (isLocale(first)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Todo salvo API, panel, estáticos de Next y archivos con extensión.
    "/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
