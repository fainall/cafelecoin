import { Archivo, Cinzel, Cormorant_Garamond } from "next/font/google";

import "../globals.css";

/**
 * Marco propio del panel.
 *
 * El panel vive fuera de /[locale], así que necesita su propio documento: no
 * hereda el del sitio público. Tampoco lo quiere —aquí no hay cabecera, ni
 * carrito, ni cambio de idioma— y así ninguna herramienta de gestión puede
 * romper la portada.
 */
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${cormorant.variable} ${archivo.variable}`}>
      <body className="bg-forest text-cream antialiased">{children}</body>
    </html>
  );
}
