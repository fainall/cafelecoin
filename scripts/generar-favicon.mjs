/**
 * Marca de navegador: el monograma LC.
 *
 * A 16 píxeles el logotipo del empaque no se lee —"café / Le / Coin" apilado
 * se convierte en tres manchas—, así que la reducción honesta son dos letras.
 *
 * Van dibujadas como trazos, no como texto: un favicon se rasteriza sin CSS ni
 * tipografías web, y confiar en la fuente del sistema daría un resultado
 * distinto en cada máquina.
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const FONDO = "#0f130d"; // forest-deep
const TINTA = "#f6f3ec"; // cream
const ORO = "#ac9256"; // gold

/** El monograma, en un lienzo de 64. `marco` solo cabe en tamaños grandes. */
function monograma({ marco = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="10" fill="${FONDO}"/>
  ${marco ? `<rect x="3.5" y="3.5" width="57" height="57" rx="7.5" fill="none" stroke="${ORO}" stroke-width="1.4" opacity="0.55"/>` : ""}
  <g stroke="${TINTA}" stroke-width="5.5" fill="none" stroke-linecap="square">
    <path d="M17 19 L17 45 L29 45"/>
    <path d="M50 24.5 A 11.5 11.5 0 1 0 50 39.5"/>
  </g>
</svg>`;
}

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size, { fit: "fill" }).png().toBuffer();

/**
 * Empaqueta varios PNG en un .ico.
 *
 * El formato admite PNG dentro desde Vista, así que no hace falta convertir a
 * mapa de bits: cabecera, una entrada de directorio por tamaño, y los PNG
 * pegados detrás.
 */
function empaquetarIco(imagenes) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // 1 = icono
  cabecera.writeUInt16LE(imagenes.length, 4);

  let desplazamiento = 6 + imagenes.length * 16;
  const entradas = imagenes.map(({ size, data }) => {
    const entrada = Buffer.alloc(16);
    entrada.writeUInt8(size >= 256 ? 0 : size, 0); // 0 significa 256
    entrada.writeUInt8(size >= 256 ? 0 : size, 1);
    entrada.writeUInt8(0, 2); // paleta
    entrada.writeUInt8(0, 3); // reservado
    entrada.writeUInt16LE(1, 4); // planos
    entrada.writeUInt16LE(32, 6); // bits por píxel
    entrada.writeUInt32LE(data.length, 8);
    entrada.writeUInt32LE(desplazamiento, 12);
    desplazamiento += data.length;
    return entrada;
  });

  return Buffer.concat([cabecera, ...entradas, ...imagenes.map((i) => i.data)]);
}

// Sin marco en los tamaños chicos: a 16 píxeles el filete se come las letras.
const conMarco = monograma({ marco: true });
const sinMarco = monograma({ marco: false });

const ico = empaquetarIco([
  { size: 16, data: await png(sinMarco, 16) },
  { size: 32, data: await png(sinMarco, 32) },
  { size: 48, data: await png(conMarco, 48) },
]);

await writeFile("src/app/favicon.ico", ico);
await writeFile("src/app/icon.svg", conMarco);
await writeFile("src/app/apple-icon.png", await png(conMarco, 180));

// Vista previa para revisar cómo queda de verdad, a tamaño real y ampliado.
const destino = process.argv[2];
if (destino) {
  const tiras = await Promise.all(
    [16, 32, 48, 64].map(async (s) => {
      const original = await png(s <= 32 ? sinMarco : conMarco, s);
      return sharp(original).resize(160, 160, { kernel: "nearest" }).png().toBuffer();
    }),
  );
  await sharp({ create: { width: 160 * 4, height: 160, channels: 3, background: "#555" } })
    .composite(tiras.map((input, i) => ({ input, left: i * 160, top: 0 })))
    .png()
    .toFile(destino);
}

console.log("favicon.ico (16/32/48), icon.svg y apple-icon.png escritos");
