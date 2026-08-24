/**
 * Compilación dentro del hosting compartido (cPanel + CloudLinux).
 *
 * `next build` moría con «WebAssembly.instantiate(): Out of memory», tanto con
 * Turbopack como con webpack. No era el compilador: cuando falta el binario
 * nativo de Linux, Next y Tailwind caen a su versión WebAssembly, que reserva
 * un bloque de memoria de golpe y choca contra el límite LVE de la cuenta.
 *
 * Este script comprueba qué binarios nativos resolvieron, instala los que
 * falten y solo entonces compila. Imprime lo que encuentra porque en el
 * servidor no hay más ventana que la salida de este script.
 */
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);

const NATIVOS = [
  "@next/swc-linux-x64-gnu",
  "@tailwindcss/oxide-linux-x64-gnu",
  "lightningcss-linux-x64-gnu",
];

const resuelve = (paquete) => {
  try {
    require.resolve(`${paquete}/package.json`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Que el paquete exista no basta: el .node puede estar ahí y negarse a cargar
 * —glibc vieja, instrucciones que el procesador no tiene—, y entonces la
 * librería cae a WebAssembly sin decir por qué. Cargarlo de verdad es la
 * única comprobación que vale.
 */
const carga = (paquete) => {
  try {
    require(paquete);
    return "carga";
  } catch (error) {
    return `NO CARGA: ${error.message.split("
")[0]}`;
  }
};

console.log("plataforma:", process.platform, process.arch, "· node", process.version);

const faltantes = NATIVOS.filter((paquete) => {
  const hay = resuelve(paquete);
  console.log(hay ? "  presente" : "  FALTA   ", paquete);
  return !hay;
});

if (faltantes.length > 0) {
  console.log("\ninstalando los que faltan…");
  execSync(`npm install --no-save --no-audit --no-fund ${faltantes.join(" ")}`, {
    stdio: "inherit",
  });
  for (const paquete of faltantes) {
    console.log(resuelve(paquete) ? "  ya resuelve" : "  SIGUE SIN RESOLVER", paquete);
  }
} else {
  console.log("\nno falta ninguno: el fallo viene de otro sitio");
}

console.log("\ncompilando…");
execSync("npx next build", { stdio: "inherit" });
