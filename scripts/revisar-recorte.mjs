/**
 * Compone los recortes sobre un fondo magenta para auditar la transparencia:
 * cualquier resto de fondo o halo blanco salta a la vista.
 *
 *   node scripts/revisar-recorte.mjs
 */

import path from "node:path";

import sharp from "sharp";

const files = ["producto-250g.png", "producto-250g-reverso.png", "producto-2500g.png"];

for (const file of files) {
  const src = path.join("public", "img", file);
  const image = sharp(src);
  const { width, height } = await image.metadata();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 0, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: src }])
    .png()
    .toFile(path.join(".tmp-img", `check-${file}`));

  // Porcentaje de píxeles totalmente transparentes: mide cuánto fondo se quitó.
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  let transparent = 0;
  let partial = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] === 0) transparent += 1;
    else if (data[i] < 250) partial += 1;
  }
  const total = data.length / info.channels;

  console.log(
    `${file}  ${width}×${height}  transparente ${((transparent / total) * 100).toFixed(1)}%  semi ${((partial / total) * 100).toFixed(1)}%`,
  );
}
