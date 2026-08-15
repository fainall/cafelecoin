import { Photo } from "./photo";
import { surfaces, type Tone } from "./surface";

interface ProductShotProps {
  /** Recorte sin fondo en /public/img (ver scripts/quitar-fondo.py). */
  src: string;
  alt: string;
  /** Texto del panel de reserva mientras no exista la fotografía. */
  caption: string;
  tone?: Tone;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Fotografía de producto recortada, con sombra de apoyo para que no flote.
 * Si el archivo aún no existe se muestra un panel neutro con el formato.
 */
export function ProductShot({
  src,
  alt,
  caption,
  tone = "dark",
  className = "",
  sizes = "(max-width: 1024px) 70vw, 30vw",
  priority = false,
}: ProductShotProps) {
  const s = surfaces[tone];

  return (
    <Photo
      src={src}
      alt={alt}
      fit="contain"
      sizes={sizes}
      priority={priority}
      className={className}
      fallback={
        <div className={`flex h-full w-full items-center justify-center border ${s.line}`}>
          <span className={`label ${s.faint}`}>{caption}</span>
        </div>
      }
    />
  );
}
