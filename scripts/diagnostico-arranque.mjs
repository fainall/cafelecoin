/**
 * Por qué no arranca la aplicación en el servidor.
 *
 * Cuando el proceso Node muere al iniciarse, LiteSpeed no enseña el error:
 * sirve su propio marcador «It works!» y no queda rastro visible. Este script
 * hace a mano lo que hace el arranque, paso a paso, y publica dónde se rompe.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

console.log("cwd:", process.cwd());
console.log("node:", process.version, process.platform, process.arch);
console.log("NODE_ENV:", process.env.NODE_ENV);

try {
  console.log("next:", require("next/package.json").version);
} catch (error) {
  console.log("next NO SE PUEDE CARGAR:", error.message);
  process.exit(1);
}

const { existsSync, readdirSync } = require("node:fs");
console.log(".next existe:", existsSync(".next"));
if (existsSync(".next")) {
  console.log(".next contiene:", readdirSync(".next").join(", "));
}
console.log("BUILD_ID:", existsSync(".next/BUILD_ID") ? "sí" : "NO");

const next = require("next");
const app = next({ dev: false, dir: process.cwd() });

try {
  await app.prepare();
  console.log("\nprepare() salió bien: el arranque debería funcionar.");
} catch (error) {
  console.log("\nprepare() FALLÓ:");
  console.log(error && error.stack ? error.stack.split("\n").slice(0, 12).join("\n") : error);
  process.exit(1);
}
process.exit(0);
