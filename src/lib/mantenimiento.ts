/**
 * Modo mantenimiento.
 *
 * Tres decisiones que importan más de lo que parece:
 *
 * 1. Responde 503, no 200. Un buscador que recibe 200 con «volvemos pronto»
 *    archiva ESO como si fuera la página: el contenido real se cae del índice
 *    y recuperarlo cuesta semanas. Con 503 + Retry-After, Google entiende que
 *    es temporal, conserva lo que ya tiene y vuelve más tarde.
 *
 * 2. Es HTML a mano, sin pasar por la app. Se suele entrar en mantenimiento
 *    justamente porque algo del sitio se rompió; una pantalla de mantenimiento
 *    que depende de la app puede caerse por el mismo motivo. Esta no consulta
 *    la base, ni valida contenido, ni compila nada.
 *
 * 3. No lleva fecha de vuelta. Prometer una hora y no cumplirla es peor que no
 *    prometer nada. Si hace falta decir algo concreto, está MANTENIMIENTO_NOTA.
 */

/** El interruptor. Apagado no cuesta nada: es una lectura de variable. */
export function enMantenimiento(): boolean {
  return process.env.MANTENIMIENTO === "1";
}

type Idioma = "es" | "en";

const TEXTOS = {
  es: {
    titulo: "Volvemos pronto",
    pagina: "Le Coin · En mantenimiento",
    cuerpo:
      "Estamos poniendo a punto la tienda. Es cosa de un rato; el café sigue donde siempre, tostándose en Manizales.",
    pedidos: "Si querías encargar, escríbenos y lo dejamos listo:",
    whatsapp: "WhatsApp",
    correo: "Correo",
    instagram: "Instagram",
  },
  en: {
    titulo: "Back shortly",
    pagina: "Le Coin · Under maintenance",
    cuerpo:
      "We're tuning up the shop. It won't be long; the coffee is where it always is, roasting in Manizales.",
    pedidos: "If you were about to order, write to us and we'll sort it out:",
    whatsapp: "WhatsApp",
    correo: "Email",
    instagram: "Instagram",
  },
} as const satisfies Record<Idioma, Record<string, string>>;

/** Datos de contacto. Repetidos a propósito: esta página no importa nada. */
const WHATSAPP = { enlace: "https://wa.me/56982668656", texto: "+56 9 8266 8656" };
const CORREO = "info@lecoin.cl";
const INSTAGRAM = { enlace: "https://www.instagram.com/cafelecoin.tienda/", texto: "@cafelecoin.tienda" };

const escapar = (texto: string) =>
  texto.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function paginaMantenimiento(idioma: Idioma = "es"): string {
  const t = TEXTOS[idioma];
  // Una nota opcional para cuando sí hay algo concreto que decir.
  const nota = process.env.MANTENIMIENTO_NOTA?.trim();

  return `<!DOCTYPE html>
<html lang="${idioma === "es" ? "es-CL" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(t.pagina)}</title>
<meta name="description" content="${escapar(t.cuerpo)}">
<!-- El 503 ya le dice al buscador que no archive esto. Este noindex es la
     red por si alguna vez el estado se sirviera mal. -->
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --forest: #151a13;
    --forest-deep: #0f130d;
    --cream: #f6f3ec;
    --cream-dim: #c6c0af;
    --cream-faint: #97927f;
    --gold: #ac9256;
    --gold-light: #d3ba82;
    --linea: #303827;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0;
    background: var(--forest);
    color: var(--cream);
    font-family: "Cormorant Garamond", Georgia, serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    /* Viñeta: el centro algo más claro, como papel bajo una lámpara. */
    background-image: radial-gradient(ellipse at 50% 38%, #1c221a 0%, var(--forest) 45%, var(--forest-deep) 100%);
  }
  .hoja { width: 100%; max-width: 38rem; text-align: center; }

  /* La mancha ocupa todo el cuadro y el monograma se queda en el centro:
     al reves la mancha quedaba escondida detras y no se veia. */
  .sello { position: relative; width: 196px; height: 196px; margin: 0 auto 2.75rem; }
  .sello svg { position: absolute; width: 100%; height: 100%; inset: 0; }
  .sello .monograma { width: 92px; height: 92px; inset: 52px; }
  /* La mancha respira detrás del monograma: el mismo gesto de acuarela que
     abre el sitio, en voz baja. */
  .mancha { animation: respirar 7s ease-in-out infinite alternate; transform-origin: 50% 50%; }
  /* La de atrás va a otro ritmo: dos capas respirando igual se leen como una. */
  .mancha--atras { animation-duration: 9.5s; animation-delay: -2s; }
  @keyframes respirar {
    from { transform: scale(0.96); opacity: 0.55; }
    to   { transform: scale(1.05); opacity: 0.9; }
  }


  h1 {
    font-family: "Cinzel", "Trajan Pro", Georgia, serif;
    font-weight: 400;
    font-size: clamp(1.9rem, 5vw, 3.1rem);
    letter-spacing: 0.1em;
    margin: 0 0 1.5rem;
  }
  .regla { width: 3.5rem; height: 1px; background: var(--gold); margin: 0 auto 1.75rem; opacity: 0.75; }
  p { margin: 0 0 1.25rem; font-size: clamp(1.1rem, 2vw, 1.3rem); line-height: 1.8; color: var(--cream-dim); }
  .nota { font-style: italic; color: var(--gold-light); }

  .contacto { margin-top: 2.75rem; border-top: 1px solid var(--linea); padding-top: 1.75rem; }
  .contacto p { font-size: 1rem; color: var(--cream-dim); margin-bottom: 1.5rem; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem 2.5rem; }
  a {
    color: var(--cream); text-decoration: none; font-size: 1.05rem;
    border-bottom: 1px solid rgba(172, 146, 86, 0.45);
    padding-bottom: 2px; transition: color 0.2s, border-color 0.2s;
  }
  a:hover, a:focus-visible { color: var(--gold-light); border-color: var(--gold-light); }
  .etiqueta {
    display: block;
    font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--cream-faint); margin-bottom: 0.4rem;
  }
  /* Quien prefiere no ver movimiento, no lo ve. */
  @media (prefers-reduced-motion: reduce) { .mancha { animation: none; opacity: 0.65; } }
</style>
</head>
<body>
  <main class="hoja">
    <div class="sello">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <!-- La orilla aguanta casi opaca y cae de golpe al final. Un
               degradado blando desplazado sigue siendo un borrón redondo; lo
               que vuelve irregular la silueta es tener un canto que romper. -->
          <radialGradient id="tinta">
            <stop offset="0%" stop-color="#9c7038" stop-opacity="0.30"/>
            <stop offset="70%" stop-color="#a87b45" stop-opacity="0.34"/>
            <stop offset="88%" stop-color="#b98b52" stop-opacity="0.30"/>
            <stop offset="97%" stop-color="#b98b52" stop-opacity="0.12"/>
            <stop offset="100%" stop-color="#b98b52" stop-opacity="0"/>
          </radialGradient>
          <!-- El filtro necesita más sitio del que ocupa la figura: si no, el
               desplazamiento se recorta contra el borde y vuelve a salir recto. -->
          <filter id="fibra" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="4" seed="11" result="ruido"/>
            <feDisplacementMap in="SourceGraphic" in2="ruido" scale="27" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="fibra2" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.027" numOctaves="3" seed="34" result="ruido2"/>
            <feDisplacementMap in="SourceGraphic" in2="ruido2" scale="19" xChannelSelector="G" yChannelSelector="B"/>
          </filter>
        </defs>
        <!-- Dos capas con semillas distintas y algo descentradas: una mancha
             real nunca es simétrica ni de un solo tono. -->
        <g filter="url(#fibra2)">
          <circle class="mancha mancha--atras" cx="57" cy="62" r="46" fill="url(#tinta)"/>
        </g>
        <g filter="url(#fibra)">
          <circle class="mancha" cx="61" cy="59" r="50" fill="url(#tinta)"/>
        </g>
      </svg>
      <svg class="monograma" viewBox="0 0 64 64" aria-label="Le Coin">
        <rect x="3.5" y="3.5" width="57" height="57" rx="7.5" fill="none" stroke="#ac9256" stroke-width="1.4" opacity="0.55"/>
        <g stroke="#f6f3ec" stroke-width="5.5" fill="none" stroke-linecap="square">
          <path d="M17 19 L17 45 L29 45"/>
          <path d="M50 24.5 A 11.5 11.5 0 1 0 50 39.5"/>
        </g>
      </svg>
    </div>

    <h1>${escapar(t.titulo)}</h1>
    <div class="regla"></div>
    <p>${escapar(t.cuerpo)}</p>
    ${nota ? `<p class="nota">${escapar(nota)}</p>` : ""}

    <div class="contacto">
      <p>${escapar(t.pedidos)}</p>
      <ul>
        <li>
          <span class="etiqueta">${escapar(t.whatsapp)}</span>
          <a href="${WHATSAPP.enlace}" rel="noopener">${WHATSAPP.texto}</a>
        </li>
        <li>
          <span class="etiqueta">${escapar(t.correo)}</span>
          <a href="mailto:${CORREO}">${CORREO}</a>
        </li>
        <li>
          <span class="etiqueta">${escapar(t.instagram)}</span>
          <a href="${INSTAGRAM.enlace}" rel="noopener">${INSTAGRAM.texto}</a>
        </li>
      </ul>
    </div>
  </main>
</body>
</html>`;
}

/** Cabeceras del 503. Retry-After en segundos: una hora. */
export const CABECERAS_MANTENIMIENTO = {
  "content-type": "text/html; charset=utf-8",
  "retry-after": "3600",
  // Que ningún intermediario guarde esto: al volver, debe desaparecer solo.
  "cache-control": "no-store, must-revalidate",
} as const;
