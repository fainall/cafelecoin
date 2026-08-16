/**
 * Separa la ladera en primer plano del resto del paisaje.
 *
 *   node scripts/separar-planos.mjs
 *
 * La foto de la portada tiene una separación tonal muy marcada: el terreno
 * cercano es verde oscuro y la bruma del valle es clara. Recorriendo cada
 * columna de abajo hacia arriba hasta encontrar luz sostenida se obtiene la
 * silueta del terreno; con ella se genera una capa transparente que el sitio
 * mueve a otra velocidad, de modo que el empaque queda detrás del cerro.
 */

import path from "node:path";

import sharp from "sharp";

const SRC = path.join("imagenes", "finca-original.jpeg");
const OUT = path.join("public", "img", "finca-frente.webp");

/** Por encima de este brillo se considera bruma, no terreno. */
const LUZ_BRUMA = 118;
/** Píxeles claros seguidos que confirman que ya se salió del terreno. */
const CONFIRMAR = 14;
/** Ventana del suavizado horizontal de la silueta. */
const SUAVIZADO = 24;
/** Difuminado vertical del borde, en píxeles. */
const PLUMA = 26;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const luma = (x, y) => {
  const i = (y * width + x) * channels;
  return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
};

// 1. Silueta: primera fila (desde abajo) donde empieza la bruma.
//    Hay columnas en sombra donde nunca aparece bruma; ésas continúan la
//    silueta de su vecina en lugar de dispararse hasta el borde superior.
const TECHO = Math.round(height * 0.36);
const crudo = new Array(width);
let ultimo = Math.round(height * 0.62);

for (let x = 0; x < width; x += 1) {
  let claros = 0;
  let corte = 0;
  for (let y = height - 1; y >= 0; y -= 1) {
    if (luma(x, y) > LUZ_BRUMA) {
      claros += 1;
      if (claros >= CONFIRMAR) {
        corte = y + CONFIRMAR;
        break;
      }
    } else {
      claros = 0;
    }
  }

  if (corte === 0) corte = ultimo;
  corte = Math.max(corte, TECHO);
  crudo[x] = corte;
  ultimo = corte;
}

// 2. Suavizado horizontal: los árboles sueltos no deben morder la silueta.
const silueta = new Array(width);
for (let x = 0; x < width; x += 1) {
  let suma = 0;
  let cuenta = 0;
  for (let d = -SUAVIZADO; d <= SUAVIZADO; d += 1) {
    const vecino = x + d;
    if (vecino >= 0 && vecino < width) {
      suma += crudo[vecino];
      cuenta += 1;
    }
  }
  silueta[x] = suma / cuenta;
}

// 3. Alfa: opaco bajo la silueta, con el borde difuminado.
for (let x = 0; x < width; x += 1) {
  const corte = silueta[x];
  for (let y = 0; y < height; y += 1) {
    const i = (y * width + x) * channels + 3;
    const distancia = y - corte;
    data[i] = distancia <= 0 ? 0 : distancia >= PLUMA ? 255 : Math.round((distancia / PLUMA) * 255);
  }
}

await sharp(data, { raw: { width, height, channels } })
  .resize({ width: 2400, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 100, effort: 6 })
  .toFile(OUT);

const alturas = silueta.filter(Boolean);
console.log(
  `frente    ${OUT}  silueta entre y=${Math.round(Math.min(...alturas))} y y=${Math.round(Math.max(...alturas))} de ${height}`,
);
