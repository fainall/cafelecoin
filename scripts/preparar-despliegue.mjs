/**
 * Deja un build hecho en Windows listo para correr en el servidor Linux.
 *
 * El hosting no puede compilar —choca contra el límite de memoria de la
 * cuenta—, así que la compilación se hace aquí y se sube ya hecha. El problema
 * es que Next graba en `required-server-files` la ruta absoluta del proyecto y
 * los separadores del sistema donde se compiló, y allá no existe ninguna «E:».
 *
 * La corrección es quirúrgica, campo por campo: un reemplazo global de barras
 * invertidas destrozaría `htmlLimitedBots`, que es una expresión regular.
 *
 *   node scripts/preparar-despliegue.mjs /home2/mantecio/lecoin-app
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const destino = process.argv[2];
if (!destino) {
  console.error("Falta la ruta de la aplicación en el servidor.");
  process.exit(1);
}

const JSON_PATH = ".next/required-server-files.json";
const JS_PATH = ".next/required-server-files.js";
const PREFIJO_JS = "self.__SERVER_FILES_MANIFEST=";

if (!existsSync(JSON_PATH)) {
  console.error(`No existe ${JSON_PATH}: compila antes de preparar el despliegue.`);
  process.exit(1);
}

const manifiesto = JSON.parse(readFileSync(JSON_PATH, "utf8"));

/** Rutas absolutas del equipo donde se compiló. */
const ABSOLUTAS = [
  ["appDir", (m) => m, "appDir"],
  ["config.outputFileTracingRoot", (m) => m.config, "outputFileTracingRoot"],
  ["config.repoRoot", (m) => m.config, "repoRoot"],
  ["config.turbopack.root", (m) => m.config.turbopack, "root"],
];

for (const [etiqueta, contenedor, clave] of ABSOLUTAS) {
  const objeto = contenedor(manifiesto);
  if (objeto && typeof objeto[clave] === "string") {
    console.log(`  ${etiqueta}: ${objeto[clave]} → ${destino}`);
    objeto[clave] = destino;
  }
}

// La lista de archivos viaja con separadores de Windows.
if (Array.isArray(manifiesto.files)) {
  const antes = manifiesto.files.filter((f) => f.includes("\\")).length;
  manifiesto.files = manifiesto.files.map((f) => f.split("\\").join("/"));
  console.log(`  files: ${antes} rutas con separador de Windows corregidas`);
}

const serializado = JSON.stringify(manifiesto, null, 2);
writeFileSync(JSON_PATH, serializado);
if (existsSync(JS_PATH)) writeFileSync(JS_PATH, PREFIJO_JS + serializado);

// Red de seguridad: que no quede rastro del equipo de compilación.
const restos = serializado.match(/[A-Za-z]:\\/g);
if (restos) {
  console.error(`\nQuedaron ${restos.length} rutas de Windows sin corregir.`);
  process.exit(1);
}

console.log(`\nBuild preparado para ${destino}`);
