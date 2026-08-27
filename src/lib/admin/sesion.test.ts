import { beforeEach, describe, expect, it, vi } from "vitest";

// El módulo habla con el almacén; aquí se le pone uno de mentira que solo
// recuerda lo último escrito, para poder probar el cambio de contraseña.
const almacen = new Map<string, string>();
let hayAlmacen = true;

vi.mock("server-only", () => ({}));
vi.mock("./repositorio", () => ({
  getAdminRepository: () => ({
    backend: hayAlmacen ? "redis" : "ninguno",
    leerAjuste: async (clave: string) => almacen.get(clave) ?? null,
    guardarAjuste: async (clave: string, valor: string) => {
      if (!hayAlmacen) return false;
      almacen.set(clave, valor);
      return true;
    },
  }),
}));

const {
  cambiarPassword,
  comprobarPassword,
  crearSesionAdmin,
  crearSesionEmpleado,
  leerSesion,
  puedeCambiarPassword,
  resumirPassword,
} = await import("./sesion");

const DEL_ENTORNO = "clave-del-entorno";

beforeEach(() => {
  almacen.clear();
  hayAlmacen = true;
  process.env.ADMIN_PASSWORD = DEL_ENTORNO;
});

describe("credencial del administrador", () => {
  it("acepta la del entorno cuando no hay ninguna guardada", async () => {
    expect(await comprobarPassword(DEL_ENTORNO)).toBe(true);
    expect(await comprobarPassword("otra cosa")).toBe(false);
  });

  it("la guardada manda sobre la del entorno", async () => {
    expect(await cambiarPassword(DEL_ENTORNO, "una-clave-nueva")).toBe("ok");

    expect(await comprobarPassword("una-clave-nueva")).toBe(true);
    expect(await comprobarPassword(DEL_ENTORNO)).toBe(false);
  });

  it("no guarda la contraseña en claro", async () => {
    await cambiarPassword(DEL_ENTORNO, "una-clave-nueva");

    const guardado = [...almacen.values()].join(" ");
    expect(guardado).not.toContain("una-clave-nueva");
    expect(guardado).toMatch(/^scrypt:[0-9a-f]+:[0-9a-f]+$/);
  });

  it("dos veces la misma contraseña da resúmenes distintos", () => {
    expect(resumirPassword("misma-clave")).not.toBe(resumirPassword("misma-clave"));
  });
});

describe("cambio de contraseña", () => {
  it("exige la actual", async () => {
    expect(await cambiarPassword("no-es-esa", "una-clave-nueva")).toBe("actual_incorrecta");
    expect(await comprobarPassword(DEL_ENTORNO)).toBe(true);
  });

  it("rechaza una nueva demasiado corta", async () => {
    expect(await cambiarPassword(DEL_ENTORNO, "corta")).toBe("nueva_corta");
  });

  it("avisa cuando no hay dónde guardarla", async () => {
    hayAlmacen = false;
    expect(puedeCambiarPassword()).toBe(false);
    expect(await cambiarPassword(DEL_ENTORNO, "una-clave-nueva")).toBe("sin_almacen");
    // Y la de antes sigue sirviendo: nadie se queda fuera.
    expect(await comprobarPassword(DEL_ENTORNO)).toBe(true);
  });
});

describe("sesión de administrador", () => {
  it("acepta la cookie que acaba de emitir", async () => {
    const sesion = await leerSesion((await crearSesionAdmin()).value);
    expect(sesion?.rol).toBe("admin");
  });

  it("rechaza una cookie manipulada, vacía o caducada", async () => {
    const { value } = await crearSesionAdmin();
    const [cuerpo, firma] = value.split(".");

    expect(await leerSesion(undefined)).toBeNull();
    expect(await leerSesion("")).toBeNull();
    expect(await leerSesion(cuerpo)).toBeNull();
    expect(await leerSesion(`${cuerpo}.${"A".repeat(firma.length)}`)).toBeNull();

    // Alargar la caducidad exige refirmar, y sin la llave no se puede.
    const estirada = Buffer.from(
      JSON.stringify({ r: "admin", e: Date.now() + 9e9 }),
      "utf8",
    ).toString("base64url");
    expect(await leerSesion(`${estirada}.${firma}`)).toBeNull();
  });

  it("cambiar la contraseña tumba las sesiones abiertas", async () => {
    const vieja = await crearSesionAdmin();
    await cambiarPassword(DEL_ENTORNO, "una-clave-nueva");

    expect(await leerSesion(vieja.value)).toBeNull();
    expect(await leerSesion((await crearSesionAdmin()).value)).not.toBeNull();
  });
});

describe("sesión de empleado", () => {
  const CORREO = "fernando@lecoin.cl";
  const CLAVE = "la-del-buzon";

  it("devuelve su casilla y su clave para poder abrir IMAP", async () => {
    const { value } = await crearSesionEmpleado(CORREO, CLAVE);
    const sesion = await leerSesion(value);

    expect(sesion?.rol).toBe("empleado");
    expect(sesion?.correo).toBe(CORREO);
    expect(sesion?.claveCorreo).toBe(CLAVE);
  });

  it("no lleva la clave del buzón legible en la cookie", async () => {
    const { value } = await crearSesionEmpleado(CORREO, CLAVE);

    expect(value).not.toContain(CLAVE);
    // El cuerpo va en base64url; descodificado tampoco debe aparecer.
    const claro = Buffer.from(value.split(".")[0], "base64url").toString("utf8");
    expect(claro).toContain(CORREO);
    expect(claro).not.toContain(CLAVE);
  });

  it("no se puede cambiar de casilla ni ascender a admin editando la cookie", async () => {
    const { value } = await crearSesionEmpleado(CORREO, CLAVE);
    const [cuerpo, firma] = value.split(".");
    const carga = JSON.parse(Buffer.from(cuerpo, "base64url").toString("utf8"));

    const recodificar = (objeto: unknown) =>
      Buffer.from(JSON.stringify(objeto), "utf8").toString("base64url");

    // Apuntar a la casilla de otra persona.
    const ajeno = recodificar({ ...carga, c: "otro@lecoin.cl" });
    expect(await leerSesion(`${ajeno}.${firma}`)).toBeNull();

    // Convertirse en administrador.
    const ascendido = recodificar({ ...carga, r: "admin" });
    expect(await leerSesion(`${ascendido}.${firma}`)).toBeNull();
  });

  it("una clave cifrada de otra sesión no se puede injertar", async () => {
    const mia = await crearSesionEmpleado(CORREO, CLAVE);
    const otra = await crearSesionEmpleado("otro@lecoin.cl", "otra-clave");

    const cargaMia = JSON.parse(Buffer.from(mia.value.split(".")[0], "base64url").toString("utf8"));
    const cargaOtra = JSON.parse(
      Buffer.from(otra.value.split(".")[0], "base64url").toString("utf8"),
    );

    const injertada = Buffer.from(
      JSON.stringify({ ...cargaMia, k: cargaOtra.k }),
      "utf8",
    ).toString("base64url");

    expect(await leerSesion(`${injertada}.${mia.value.split(".")[1]}`)).toBeNull();
  });

  it("cambiar la contraseña del admin también cierra las del equipo", async () => {
    const { value } = await crearSesionEmpleado(CORREO, CLAVE);
    await cambiarPassword(DEL_ENTORNO, "una-clave-nueva");

    expect(await leerSesion(value)).toBeNull();
  });
});
