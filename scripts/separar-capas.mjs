/**
 * Recorta el plano cercano del paisaje.
 *
 *   node scripts/separar-capas.mjs
 *
 * Antes esto calculaba una silueta columna por columna para tres capas. No
 * funcionaba: en un paisaje con bruma no existe un borde duro, así que la línea
 * calculada se veía como lo que era, un recorte, con su ondulación y su halo.
 *
 * Ahora solo se recorta la ladera de cafetos, que sí tiene un contraste real
 * contra el cielo, y se hace píxel a píxel: el alfa sale de la luminosidad, con
 * una rampa ancha. El borde lo dibuja la propia vegetación, no un algoritmo.
 */

import path from "node:path";

import sharp from "sharp";

const SRC = path.join("imagenes", "capa-4-ladera.jpeg");
const OUT = path.join("public", "img", "cafetal-frente.webp");

/** Por debajo de este brillo es vegetación; por encima, cielo. */
const VEGETACION = 120;
const CIELO = 186;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const luz = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  const alfa =
    luz <= VEGETACION
      ? 255
      : luz >= CIELO
        ? 0
        : Math.round(((CIELO - luz) / (CIELO - VEGETACION)) * 255);
  data[i + 3] = alfa;
}

// Un desenfoque suave del alfa termina de fundir el borde con el aire.
const compuesta = sharp(data, { raw: { width, height, channels } });
const rgb = await compuesta.clone().removeAlpha().raw().toBuffer();
const alfa = await compuesta.clone().extractChannel(3).blur(2.4).raw().toBuffer();

await sharp(rgb, { raw: { width, height, channels: 3 } })
  .joinChannel(alfa, { raw: { width, height, channels: 1 } })
  .resize({ width: 2400, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 100, effort: 6 })
  .toFile(OUT);

console.log(`frente    ${SRC} -> ${OUT}`);
