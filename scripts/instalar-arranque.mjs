/**
 * Copia el arranque sobre el nombre que espera el servidor.
 *
 * LiteSpeed registra el archivo de arranque cuando se crea la aplicación y no
 * vuelve a mirarlo: cambiar el nombre después en el formulario de cPanel no
 * altera su configuración, y sigue ejecutando el `server.js` de plantilla que
 * él mismo dejó. Como esa plantilla no está bajo control de versiones, git se
 * niega a sobrescribirla en cada pull.
 *
 * La salida: dejar el mismo arranque bajo los dos nombres. Se ejecuta desde
 * «Ejecutar script JS» en el panel, que es la única vía de escritura que la
 * interfaz da sin pelea.
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";

const ORIGEN = "passenger.js";
const DESTINO = "server.js";

if (!existsSync(ORIGEN)) {
  console.error(`No encuentro ${ORIGEN}. ¿Se completó el pull?`);
  process.exit(1);
}

const previo = existsSync(DESTINO) ? readFileSync(DESTINO, "utf8").length : 0;
copyFileSync(ORIGEN, DESTINO);
const ahora = readFileSync(DESTINO, "utf8").length;

console.log(`${DESTINO}: ${previo} → ${ahora} bytes (copiado de ${ORIGEN})`);
console.log(
  ahora === readFileSync(ORIGEN, "utf8").length ? "Arranque instalado." : "La copia no coincide.",
);
