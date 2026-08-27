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
  crearSesion,
  puedeCambiarPassword,
  resumirPassword,
  sesionValida,
} = await import("./sesion");

const DEL_ENTORNO = "clave-del-entorno";

beforeEach(() => {
  almacen.clear();
  hayAlmacen = true;
  process.env.ADMIN_PASSWORD = DEL_ENTORNO;
});

describe("credencial vigente", () => {
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

describe("sesiones", () => {
  it("acepta la cookie que acaba de emitir", async () => {
    const sesion = await crearSesion();
    expect(await sesionValida(sesion.value)).toBe(true);
  });

  it("rechaza una cookie manipulada, vacía o caducada", async () => {
    const sesion = await crearSesion();
    const [expira, firma] = sesion.value.split(".");

    expect(await sesionValida(undefined)).toBe(false);
    expect(await sesionValida(`${expira}.${"0".repeat(firma.length)}`)).toBe(false);
    expect(await sesionValida(`${Date.now() + 9e9}.${firma}`)).toBe(false);
    expect(await sesionValida(`${Date.now() - 1000}.${firma}`)).toBe(false);
  });

  it("cambiar la contraseña tumba las sesiones abiertas", async () => {
    const vieja = await crearSesion();
    await cambiarPassword(DEL_ENTORNO, "una-clave-nueva");

    expect(await sesionValida(vieja.value)).toBe(false);
    expect(await sesionValida((await crearSesion()).value)).toBe(true);
  });
});
