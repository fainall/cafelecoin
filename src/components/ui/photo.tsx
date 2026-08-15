import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";
import type { ReactNode } from "react";

const cache = new Map<string, boolean>();

/**
 * ¿Existe el archivo en /public? Se resuelve en el servidor, en tiempo de
 * render/build, para no pedir imágenes inexistentes: mientras no haya foto real
 * se dibuja la ilustración de respaldo.
 */
function publicFileExists(src: string): boolean {
  if (!src.startsWith("/")) return false;
  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  const exists = existsSync(path.join(process.cwd(), "public", src.replace(/^\//, "")));
  cache.set(src, exists);
  return exists;
}

interface PhotoProps {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  sizes?: string;
  priority?: boolean;
  focus?: string;
  /** "contain" para recortes de producto sin fondo; "cover" para fotografía. */
  fit?: "cover" | "contain";
}

export function Photo({
  src,
  alt,
  fallback,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
  focus,
  fit = "cover",
}: PhotoProps) {
  const hasPhoto = publicFileExists(src);
  const surface = fit === "contain" ? "" : "bg-ink-raised";

  return (
    <div className={`relative overflow-hidden ${surface} ${className}`}>
      {hasPhoto ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={fit === "contain" ? "object-contain" : "object-cover"}
          style={focus ? { objectPosition: focus } : undefined}
        />
      ) : (
        <div role="img" aria-label={alt} className="absolute inset-0">
          {fallback}
        </div>
      )}
    </div>
  );
}
