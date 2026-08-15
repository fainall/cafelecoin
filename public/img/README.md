# Imágenes del sitio

Estos archivos se generan desde las fotos originales de `/imagenes` con los
scripts del proyecto; no se editan a mano.

```bash
pnpm imagenes
```

## Inventario actual

| Archivo                      | Origen                       | Dónde aparece                      |
| ---------------------------- | ---------------------------- | ---------------------------------- |
| `finca.webp`                 | Paisaje, solo comprimido     | Fondo de la portada                |
| `producto-250g.webp`         | Foto de empaque, sin fondo   | Portada, portafolio, ficha de lote |
| `producto-250g-reverso.webp` | Etiqueta trasera, sin fondo  | Ficha del origen                   |
| `producto-2500g.webp`        | Bolsas HoReCa, sin fondo     | Portafolio (protagonista)          |
| `ambiente-taza.jpg`          | Pieza de campaña recortada   | Disponible, sin usar               |
| `ambiente-cocina.jpg`        | Pieza de campaña recortada   | Disponible, sin usar               |
| `ambiente-barra.jpg`         | Pieza de campaña recortada   | Disponible, sin usar               |
| `og-cover.jpg`               | Derivada de `ambiente-barra` | Vista previa en WhatsApp y redes   |

## Cómo se generan

1. **Quitar el fondo** (requiere Python con `rembg`, solo la primera vez):

   ```bash
   py -3 -m pip install --user rembg onnxruntime pillow
   ```

   ```bash
   py -3 scripts/quitar-fondo.py imagenes/FOTO.jpg .tmp-img/producto-XXX.png
   ```

2. **Ajustar y optimizar** (recorta el contorno, redimensiona, convierte a WebP
   y recorta el texto quemado de las piezas de campaña):

   ```bash
   pnpm imagenes
   ```

Los recortes de campaña quitan el titular y la franja de precio impresos sobre
la foto: en el sitio esos textos los pone el HTML, no la imagen.

## Lo que aún falta fotografiar

- `finca.webp` es hoy una imagen **generada**, no una foto del predio. Sirve
  para lanzar, pero conviene reemplazarla por una fotografía real de la finca en
  la próxima cosecha: basta dejar el archivo en `/imagenes` con ese nombre y
  volver a correr `pnpm imagenes`.
- `recoleccion.jpg` — manos del recolector con grano maduro (aún sin usar en el
  sitio; hoy esa sección usa `ambiente-taza.jpg`).

Al agregar una foto nueva, regístrala en `src/content/data/*.ts` (campo `image`)
para que tenga texto alternativo en español e inglés.
