import type { z } from "zod";
import type { TestimonialSchema } from "../schema";

/**
 * Testimonios de clientes.
 *
 * Se deja vacío a propósito: no se publican testimonios inventados. Mientras la
 * lista esté vacía, la sección muestra la frase de marca como cita editorial.
 * Al pegar el primer testimonio real, la sección cambia sola a carrusel.
 *
 * Ejemplo de la forma esperada:
 *
 * {
 *   id: "mandarin",
 *   quote: {
 *     es: "Frase textual del cliente.",
 *     en: "Verbatim quote from the client.",
 *   },
 *   author: "Nombre Apellido",
 *   role: { es: "Gerente, Empresa", en: "Manager, Company" },
 * }
 */
export const testimonials: z.input<typeof TestimonialSchema>[] = [];
