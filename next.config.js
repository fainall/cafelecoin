/**
 * Configuración en JavaScript, no en TypeScript, y no por gusto.
 *
 * Al arrancar, Next compila su archivo de configuración con SWC. El binario
 * nativo de SWC exige GLIBC 2.29 y el hosting trae una anterior, así que no
 * carga nunca; Next cae entonces a la versión WebAssembly, que reserva la
 * memoria de golpe y choca contra el límite de la cuenta. El proceso muere
 * antes de servir nada.
 *
 * Con la configuración en JS plano no hay nada que compilar y SWC no entra en
 * juego. Los tipos se conservan por JSDoc.
 */

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    /**
     * El optimizador de imágenes usa sharp, que también trae binarios nativos
     * atados a la glibc. En ese hosting se sirven las fotos tal cual: ya vienen
     * en WebP desde `pnpm imagenes`, así que no se pierde casi nada.
     */
    unoptimized: process.env.IMAGENES_SIN_OPTIMIZAR === "1",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
