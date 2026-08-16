/**
 * Diccionario base (fuente de verdad de las claves).
 * Los demás idiomas se tipan contra este objeto: si falta una clave, falla el build.
 */
export const es = {
  nav: {
    story: "Historia",
    process: "Proceso",
    origin: "Origen",
    profile: "Perfil",
    portfolio: "Portafolio",
    export: "Exportación",
    contact: "Contacto",
    cta: "Solicitar muestras",
    menu: "Menú",
    skipToContent: "Ir al contenido",
  },
  hero: {
    eyebrow: "Manizales · Caldas · Colombia",
    primaryCta: "Ver portafolio",
    secondaryCta: "Solicitar muestras para catación",
    scroll: "Desliza",
  },
  sections: {
    story: { eyebrow: "Nuestro", title: "Café" },
    process: { eyebrow: "De la tierra", title: "A la taza" },
    origin: { eyebrow: "Ficha del", title: "Origen" },
    profile: { eyebrow: "Perfil", title: "Sensorial" },
    portfolio: { eyebrow: "Nuestros", title: "Productos" },
    export: { eyebrow: "Calidad y", title: "Exportación" },
    testimonials: { eyebrow: "Lo que", title: "Dicen" },
    contact: { eyebrow: "Hablemos", title: "Contacto" },
  },
  band: {
    title: "Más que raro. Único.",
    subtitle: "Café con aroma intenso y un equilibrio perfecto de acidez y cuerpo.",
    cta: "Solicitar muestras",
  },
  common: {
    learnMore: "Conocer más",
    seeAll: "Ver todo",
  },
  process: {
    intro: "Controlamos el ciclo completo dentro de la finca. Cada paso deja su huella en la taza.",
    partner: "Socio estratégico",
  },
  origin: {
    species: "Especie",
    variety: "Variedad",
    altitude: "Altitud",
    region: "Región",
    process: "Beneficio",
    harvest: "Recolección",
    drying: "Secado",
    fertilization: "Fertilización",
    water: "Agua",
    roasting: "Tostión",
    traceability: "Trazabilidad",
    masl: "msnm",
    altitudeCaption: "La altitud lentifica la maduración: más azúcares, más acidez, más carácter.",
  },
  profile: {
    notesLabel: "Notas de taza",
    attributesLabel: "Intensidad sensorial",
    scoreLabel: "Puntaje de catación",
    scoreUnit: "puntos SCA",
    scoreNote: "Categoría café de especialidad (80+ SCA).",
    scale: "Escala 0–10",
  },
  portfolio: {
    retail: "Línea Retail",
    retailNote: "estantería y hogar",
    horeca: "Línea HoReCa",
    horecaNote: "cafeterías de especialidad, hoteles y restaurantes",
    valve: "Válvula desgasificadora",
    valveNote:
      "El formato de cafetería de 2.5 kg incluye válvula desgasificadora: la taza llega como salió del tueste.",
    grind: "Grano entero o molido a pedido",
    viewLot: "Ver ficha del lote",
    unitsPerBox: "unidades por caja",
  },
  lot: {
    backToPortfolio: "Volver al portafolio",
    availableFormats: "Formatos disponibles",
    technicalSheet: "Ficha técnica",
    cupping: "Perfil de taza",
    requestSample: "Solicitar muestra de este lote",
    harvestWindow: "Cosecha",
    status: {
      published: "Disponible",
      draft: "Próximo lote",
    },
  },
  export: {
    labelling: "Normativa y etiquetado",
    logistics: "Logística",
    valueTitle: "Lo que ofrecemos a su operación",
    supplyChain: "Cadena de origen",
  },
  contact: {
    whatsapp: "WhatsApp",
    email: "Correo",
    instagram: "Instagram",
    origin: "Origen",
    closing: "Solicita hoy tus muestras para catación.",
  },
  form: {
    title: "Solicitud de muestras",
    intro: "Cuéntanos de tu operación y coordinamos el envío de muestras para catación.",
    name: "Nombre y apellido",
    company: "Empresa",
    email: "Correo electrónico",
    phone: "Teléfono / WhatsApp",
    country: "País",
    channel: "Tipo de operación",
    volume: "Volumen estimado (kg/mes)",
    formats: "Formatos de interés",
    message: "Mensaje",
    messagePlaceholder:
      "Ej.: somos una cadena de 8 cafeterías en Santiago, buscamos grano para espresso.",
    consent: "Autorizo el tratamiento de mis datos para ser contactado por Café Le Coin.",
    submit: "Enviar solicitud",
    submitting: "Enviando…",
    success:
      "¡Gracias! Recibimos tu solicitud. Te contactamos dentro de las próximas 24 horas hábiles.",
    error: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.",
    required: "Campo obligatorio",
    optional: "opcional",
    countries: {
      CL: "Chile",
      AR: "Argentina",
      CO: "Colombia",
      OTHER: "Otro",
    },
    channels: {
      cafe: "Cafetería / cadena",
      hotel: "Hotel o restaurante",
      distributor: "Distribuidor / importador",
      retail: "Retail / tienda",
      other: "Otro",
    },
  },
  footer: {
    tagline: "Café de origen único · Manizales, Colombia",
    claim: "Más que un café, una experiencia.",
    rights: "Todos los derechos reservados.",
    language: "Idioma",
  },
  meta: {
    homeTitle: "Le Coin — Café de origen único · Manizales, Colombia",
    homeDescription:
      "Café de especialidad Single Estate cultivado y procesado en nuestra finca en Manizales, Caldas. Trazabilidad total, procesos artesanales y formatos retail y HoReCa para exportación.",
    lotDescriptionPrefix: "Ficha técnica y perfil sensorial del lote",
  },
};

/** Forma del diccionario: los otros idiomas deben implementarla por completo. */
export type Dictionary = typeof es;
