/**
 * Recorta las capas del paisaje contra el cielo.
 *
 *   node scripts/separar-capas.mjs
 *
 * Cada capa viene con una sola línea de terreno sobre cielo despejado, así que
 * el cielo se detecta por su suavidad: recorriendo cada columna de arriba hacia
 * abajo, el terreno empieza donde el brillo cae respecto al promedio del cielo
 * inmediatamente anterior. Eso se adapta solo al degradado del amanecer, que un
 * umbral fijo no sabría seguir.
 *
 * Bajo esa línea el recorte es macizo; en una banda por encima se decide píxel
 * a píxel, para no decapitar los árboles y las hojas que asoman al cielo.
 */

import path from "node:path";

import sharp from "sharp";

const RAW = "imagenes";
const OUT = path.join("public", "img");

const capas = [
  // La cresta lejana está bañada por el sol: necesita más sensibilidad.
  { src: "capa-2-lejan.jpeg", out: "cerro-lejano.webp", caida: 10, banda: 40, suavizado: 10 },
  { src: "capa-3-cerros.jpeg", out: "cerro-medio.webp", caida: 16, banda: 60, suavizado: 6 },
  { src: "capa-4-ladera.jpeg", out: "cerro-cercano.webp", caida: 18, banda: 150, suavizado: 3 },
];

for (const capa of capas) {
  const src = path.join(RAW, capa.src);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const luma = (x, y) => {
    const i = (y * width + x) * channels;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  // 1. Dónde empieza el terreno en cada columna.
  const crudo = new Array(width).fill(height);
  const VENTANA = 20;

  for (let x = 0; x < width; x += 1) {
    let cieloRef = 0;
    for (let y = 0; y < VENTANA; y += 1) cieloRef += luma(x, y);
    cieloRef /= VENTANA;

    for (let y = VENTANA; y < height; y += 1) {
      const actual = luma(x, y);
      if (cieloRef - actual > capa.caida) {
        crudo[x] = y;
        break;
      }
      // El cielo sigue: se arrastra la referencia para seguir el degradado.
      cieloRef = cieloRef * 0.94 + actual * 0.06;
    }
  }

  // 2. Suavizado horizontal contra el ruido de hojas sueltas.
  const linea = new Array(width);
  for (let x = 0; x < width; x += 1) {
    let suma = 0;
    let cuenta = 0;
    for (let d = -capa.suavizado; d <= capa.suavizado; d += 1) {
      const v = x + d;
      if (v >= 0 && v < width) {
        suma += crudo[v];
        cuenta += 1;
      }
    }
    linea[x] = suma / cuenta;
  }

  // 3. Alfa: macizo bajo la línea, por píxel en la banda de transición.
  for (let x = 0; x < width; x += 1) {
    const corte = linea[x];
    let cieloRef = 0;
    for (let y = 0; y < VENTANA; y += 1) cieloRef += luma(x, y);
    cieloRef /= VENTANA;

    for (let y = 0; y < height; y += 1) {
      const i = (y * width + x) * channels + 3;

      if (y >= corte + 3) {
        data[i] = 255;
      } else if (y > corte - capa.banda) {
        // Zona de copas. La rampa arranca por encima del umbral de detección:
        // los píxeles apenas más oscuros que el cielo son el halo del filo, y
        // dejarlos semiopacos dibuja un contorno claro alrededor de la cresta.
        const contraste = cieloRef - luma(x, y);
        const piso = capa.caida * 0.6;
        const rango = capa.caida * 1.2;
        data[i] =
          contraste <= piso ? 0 : Math.min(255, Math.round(((contraste - piso) / rango) * 255));
      } else {
        data[i] = 0;
      }
    }
  }

  // 4. Se difumina solo el canal alfa: el borde deja de ser un filo recortado
  //    y el resto de la imagen conserva su nitidez.
  const compuesta = sharp(data, { raw: { width, height, channels } });
  const rgb = await compuesta.clone().removeAlpha().raw().toBuffer();
  const alfa = await compuesta.clone().extractChannel(3).blur(1.6).raw().toBuffer();

  const target = path.join(OUT, capa.out);
  await sharp(rgb, { raw: { width, height, channels: 3 } })
    .joinChannel(alfa, { raw: { width, height, channels: 1 } })
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 100, effort: 6 })
    .toFile(target);

  const alto = Math.round(Math.min(...linea));
  console.log(`capa      ${capa.src} -> ${target}  cresta más alta en y=${alto} de ${height}`);
}
