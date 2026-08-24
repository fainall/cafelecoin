/**
 * Arranque para Passenger (cPanel / CloudLinux Node.js Selector).
 *
 * No se llama server.js a proposito: al crear la aplicacion, cPanel deja su
 * propia plantilla con ese nombre y sin seguimiento de git, y el pull se
 * niega a sobrescribirla.
 *
 * Passenger no ejecuta comandos, ejecuta un archivo: no puede lanzar
 * `next start`. Este archivo hace lo mismo por la vía programática, sobre la
 * salida normal de `next build`, así que no hace falta compilar en modo
 * `standalone` ni copiar a mano los estáticos.
 *
 * El puerto lo impone Passenger por la variable de entorno; el 3000 es solo
 * para poder levantarlo a mano si hace falta depurar en el servidor.
 */
// Passenger carga este archivo como CommonJS: aquí no cabe un import.
/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("node:http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const app = next({ dev: false, dir: __dirname });
const atender = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((peticion, respuesta) => {
        atender(peticion, respuesta).catch((error) => {
          console.error("Fallo atendiendo", peticion.url, error);
          respuesta.statusCode = 500;
          respuesta.end("Error interno");
        });
      })
      .listen(port);
  })
  .catch((error) => {
    console.error("Next no pudo arrancar:", error);
    process.exit(1);
  });
