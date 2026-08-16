/**
 * Prepara las fotos de producto para el sitio.
 *
 *   node scripts/procesar-imagenes.mjs
 *
 * Entra: fotos originales en /imagenes (no se versionan ni se sirven).
 * Sale:  /public/img listo para next/image.
 *
 * Dos operaciones:
 *  1. Ambiente: recorta el titular y la franja de precio impresos en las piezas
 *     de campaña, y deja solo la fotografía.
 *  2. Producto: ajusta los recortes sin fondo (ver scripts/quitar-fondo.py),
 *     los recorta al contorno real y los deja a un ancho razonable.
 */

import { access, mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const RAW = "imagenes";
const OUT = path.join("public", "img");

/** Fotografías de fondo: solo se redimensionan y comprimen. */
const fondos = [
  { src: "finca-original.jpeg", out: "finca.webp", width: 2400, quality: 76 },
  // Cielo de la escena por capas; las tres capas de terreno las recorta
  // scripts/separar-capas.mjs.
  { src: "capa-1-cielo.jpeg", out: "cielo.webp", width: 2400, quality: 74 },
];

/**
 * Detalles del propio empaque usados como elemento gráfico.
 * La acuarela botánica de la bolsa es el lenguaje visual de la marca para el
 * origen: sale de ahí y no de una ilustración inventada.
 */
const detalles = [
  {
    src: "IMG-20260813-WA0092.jpg",
    out: "botanica.webp",
    // Zona limpia: sin la válvula desgasificadora ni la franja negra inferior.
    crop: { left: 240, top: 498, width: 420, height: 190 },
    width: 1260,
  },
];

/** Recortes de las piezas de campaña: quitan el texto quemado en la imagen. */
const ambiente = [
  {
    src: "IMG-20260813-WA0080.jpg",
    out: "ambiente-taza.jpg",
    crop: { left: 0, top: 312, width: 767, height: 742 },
  },
  {
    src: "IMG-20260813-WA0081.jpg",
    out: "ambiente-cocina.jpg",
    crop: { left: 0, top: 242, width: 770, height: 812 },
  },
  {
    src: "IMG-20260813-WA0083.jpg",
    out: "ambiente-barra.jpg",
    crop: { left: 0, top: 236, width: 767, height: 776 },
  },
];

/**
 * Recortes sin fondo generados por rembg.
 * Se guardan en WebP con alfa: mismo resultado visual, una fracción del peso.
 */
const productos = [
  { src: "producto-250g.png", out: "producto-250g.webp", width: 900 },
  { src: "producto-250g-reverso.png", out: "producto-250g-reverso.webp", width: 900 },
  { src: "producto-2500g.png", out: "producto-2500g.webp", width: 1200 },
];

const TMP = path.join(".tmp-img");

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function comprimirFondos() {
  for (const item of fondos) {
    const src = path.join(RAW, item.src);
    if (!(await exists(src))) {
      console.warn(`· falta ${src}, se omite`);
      continue;
    }

    const target = path.join(OUT, item.out);
    await sharp(src)
      .resize({ width: item.width, withoutEnlargement: true })
      .webp({ quality: item.quality, effort: 6 })
      .toFile(target);

    const { width, height } = await sharp(target).metadata();
    console.log(`fondo     ${item.src} -> ${target}  ${width}×${height}`);
  }
}

async function recortarDetalles() {
  for (const item of detalles) {
    const src = path.join(RAW, item.src);
    if (!(await exists(src))) {
      console.warn(`· falta ${src}, se omite`);
      continue;
    }

    const target = path.join(OUT, item.out);
    await sharp(src)
      .extract(item.crop)
      .resize({ width: item.width, kernel: "lanczos3" })
      .webp({ quality: 88, effort: 6 })
      .toFile(target);
    console.log(`detalle   ${item.src} -> ${target}`);
  }
}

async function recortarAmbiente() {
  for (const item of ambiente) {
    const src = path.join(RAW, item.src);
    if (!(await exists(src))) {
      console.warn(`· falta ${src}, se omite`);
      continue;
    }

    const target = path.join(OUT, item.out);
    await sharp(src).extract(item.crop).jpeg({ quality: 82, mozjpeg: true }).toFile(target);
    console.log(`ambiente  ${item.src} -> ${target}`);
  }
}

async function ajustarProductos() {
  for (const item of productos) {
    const src = path.join(TMP, item.src);
    if (!(await exists(src))) {
      console.warn(`· falta ${src} (genera el recorte con quitar-fondo.py), se omite`);
      continue;
    }

    const target = path.join(OUT, item.out);
    await sharp(src)
      // Elimina el margen transparente sobrante alrededor del empaque.
      .trim({ threshold: 1 })
      .resize({ width: item.width, withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100, effort: 6 })
      .toFile(target);

    const { width, height, size } = await sharp(target).metadata();
    console.log(
      `producto  ${item.src} -> ${target}  ${width}×${height}  ${Math.round(size / 1024)} KB`,
    );
  }
}

/** Imagen de vista previa para WhatsApp y redes: el paisaje de origen. */
async function generarPortada() {
  const src = path.join(OUT, "finca.webp");
  if (!(await exists(src))) return;

  const target = path.join(OUT, "og-cover.jpg");
  await sharp(src)
    .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(target);
  console.log(`portada   -> ${target}`);
}

await mkdir(OUT, { recursive: true });
await comprimirFondos();
await recortarDetalles();
await recortarAmbiente();
await ajustarProductos();
await generarPortada();
