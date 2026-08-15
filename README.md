# Le Coin — Coffee from Manizales

Sitio y catálogo digital de **Café Le Coin**: café de origen único cultivado y
procesado en finca propia en Manizales (Caldas, Colombia), con foco comercial en
cadenas de cafeterías, hoteles y distribuidores de **Chile** y **Argentina**.

No es una página estática: el contenido, el catálogo y las solicitudes de
muestras están modelados como datos, de modo que el sitio crece agregando
información, no reescribiendo HTML.

---

## Stack

| Pieza      | Elección                                     |
| ---------- | -------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, Turbopack) |
| Lenguaje   | TypeScript en modo estricto                  |
| Estilos    | Tailwind CSS v4 con tokens de marca en CSS   |
| Validación | Zod 4 (contenido y formularios)              |
| Tests      | Vitest                                       |
| Idiomas    | Español (por defecto) e inglés               |

## Puesta en marcha

```bash
pnpm install
```

```bash
pnpm dev
```

El sitio queda en http://localhost:3000 y redirige a `/es` o `/en` según el
idioma del navegador.

Comandos disponibles:

| Comando       | Qué hace                                     |
| ------------- | -------------------------------------------- |
| `pnpm dev`    | Servidor de desarrollo                       |
| `pnpm build`  | Build de producción (prerenderiza las rutas) |
| `pnpm start`  | Sirve el build                               |
| `pnpm verify` | Tipos + lint + tests (lo que corre en CI)    |
| `pnpm test`   | Tests unitarios                              |
| `pnpm format` | Formatea con Prettier                        |

---

## Lenguaje visual

Registro editorial de origen: composición **centrada y simétrica**, alternancia
de dos superficies (papel crema ↔ verde profundo de cafetal) separadas por
**bordes de papel rasgado y siluetas de cordillera**, oro antiguo como único
acento y una **banda dorada** de llamada a la acción a media página.

Tipografía: **Cinzel** (romana grabada) para títulos y escudo, **Cormorant
Garamond** para lectura, **Archivo** para etiquetas y formularios. Los tokens de
color y tipografía viven en `src/app/globals.css`: cambiarlos ahí cambia el sitio
completo.

Secuencia de la portada: portada → café (papel) → productos (verde) → ficha y
perfil (papel) → banda dorada → testimonios (papel) → exportación (verde) →
contacto (verde profundo) → pie con plano de origen.

Los testimonios **no se inventan**: mientras `src/content/data/testimonials.ts`
esté vacío, la sección muestra la frase de marca como cita editorial; al cargar
el primer testimonio real pasa sola a mostrarlos.

## Arquitectura

```
src/
  app/[locale]/          Páginas por idioma (portada y ficha de cada lote)
  app/api/leads/         Endpoint de solicitudes de muestras
  components/            sections/ · layout/ · ui/ · forms/
  content/               Capa de contenido: esquemas Zod + datos + fuente
  i18n/                  Idiomas y diccionarios
  lib/                   leads (validación y destinos), rate-limit, SEO
  proxy.ts               Redirección al idioma correcto
```

### 1. Capa de contenido

Todo el contenido editorial vive en `src/content/data/` y se valida contra los
esquemas de `src/content/schema.ts` al arrancar el proceso. Si un dato falta o
está mal formado, **el build falla con un mensaje claro** en lugar de publicar
una página rota. También se verifica la integridad referencial (que un lote no
apunte a un formato inexistente, que no haya slugs repetidos).

La UI nunca lee los archivos directamente: depende de la interfaz
`ContentSource`. Migrar a un CMS headless (Sanity, Payload, Strapi) es escribir
otra implementación de esa interfaz y seleccionarla en `getContentSource()`;
ninguna página ni componente cambia.

**Agregar un lote nuevo** → un objeto en `src/content/data/lots.ts`. Eso genera
su página `/es/cafe/<slug>` y `/en/cafe/<slug>`, su ficha técnica, su perfil
sensorial, su tarjeta en el portafolio, su JSON-LD de producto y sus entradas en
el sitemap. Los lotes con `status: "draft"` no se publican (salvo que se active
`CONTENT_INCLUDE_DRAFTS=true`, útil para un entorno de preview).

**Agregar un formato nuevo** → un objeto en `src/content/data/formats.ts`. Las
etiquetas de peso (`250 g`, `2.5 kg`) se derivan de los gramos, nunca se escriben
a mano.

### 2. Idiomas

Cada texto de contenido es un objeto `{ es, en }` tipado: si se agrega un idioma
en `src/i18n/config.ts`, TypeScript señala exactamente qué falta traducir. Los
textos de interfaz están en `src/i18n/dictionaries/`, y un test verifica que
todos los idiomas tengan las mismas claves.

### 3. Solicitudes de muestras

`POST /api/leads` es el contrato: valida con Zod, limita a 5 envíos por IP cada
10 minutos, descarta bots con un campo trampa y entrega el lead a los destinos
configurados en `LEADS_STORE`.

| Destino   | Para qué sirve                                  |
| --------- | ----------------------------------------------- |
| `file`    | NDJSON en `.data/leads.ndjson` (desarrollo/VPS) |
| `console` | Log del servidor                                |
| `webhook` | Zapier, Make, n8n, Slack o el CRM propio        |
| `email`   | Notificación por Resend                         |

Se pueden combinar: `LEADS_STORE=file,email`. Si un destino falla, los demás
igual reciben el lead; solo se responde con error cuando fallan todos.

> En Vercel el sistema de archivos es de solo lectura: usar `webhook` o `email`.

### 4. SEO

Metadatos por idioma con `alternates.languages`, `sitemap.xml` y `robots.txt`
generados desde el contenido, JSON-LD de `Organization` y de `Product` por lote.
Antes de publicar hay que fijar el dominio real en
`src/content/data/contact.ts` (`siteUrl`).

---

## Fotografías

Las fotos originales viven en `/imagenes`; lo que sirve el sitio se genera con:

```bash
pnpm imagenes
```

El recorte sin fondo de los empaques se hace aparte con `rembg` (Python), una
sola vez por foto nueva — ver [`public/img/README.md`](public/img/README.md).
De las piezas de campaña se recorta el titular y la franja de precio: ese texto
lo pone el HTML, no la imagen.

Donde todavía no hay fotografía (los cafetales de la finca), el sitio dibuja una
ilustración vectorial de respaldo; en cuanto exista `public/img/finca.jpg` se usa
sola, optimizada por `next/image`.

## Pendientes de contenido real

Marcados con `EDITAR` en los archivos de `src/content/data/`:

1. `contact.ts` — usuario real de Instagram (el impreso en el empaque no es
   legible). El correo y el dominio ya salen de la etiqueta: `info@lecoin.cl`,
   `www.lecoin.cl`.
2. `lots.ts` — variedades, altitud, ventana de cosecha, valores sensoriales y
   puntaje SCA confirmados por catación. **Nada de esto está verificado todavía.**
3. `formats.ts` — unidades por caja y códigos de barras por formato.
4. `export-info.ts` — confirmar razones sociales y registros legales antes de
   publicar NIT/RUT; hoy solo figuran nombres y plazas.

## Despliegue

Cualquier plataforma que soporte Next.js 16 (Vercel es la ruta más corta).
Variables de entorno: ver [`.env.example`](.env.example).

```bash
pnpm build && pnpm start
```
