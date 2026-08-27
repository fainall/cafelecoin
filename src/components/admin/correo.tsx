"use client";

import { useEffect, useState } from "react";

interface Casilla {
  email: string;
  usadoMb: number;
  limiteMb: number;
}

interface Mensaje {
  uid: number;
  asunto: string;
  de: string;
  fecha: string;
  leido: boolean;
  cuerpo?: string;
}

interface CorreoProps {
  /** Hay token de cPanel: se pueden crear y borrar casillas. */
  gestionActiva: boolean;
  /** Hay casilla configurada: se puede leer y responder. */
  buzonActivo: boolean;
  dominio: string;
  casilla: string;
}

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const campo =
  "w-full border-b border-forest-line bg-transparent py-2.5 font-sans text-sm text-cream placeholder:text-cream-faint focus:border-gold focus:outline-none transition-colors";

export function Correo({ gestionActiva, buzonActivo, dominio, casilla }: CorreoProps) {
  const [seccion, setSeccion] = useState<"bandeja" | "casillas">(
    buzonActivo ? "bandeja" : "casillas",
  );

  if (!gestionActiva && !buzonActivo) {
    return (
      <p className="border-danger/50 text-cream-dim mt-8 border-l-2 py-2 pl-4 text-sm">
        El correo no está configurado. Hacen falta las credenciales de cPanel para administrar
        casillas y las de una casilla para leer y responder desde aquí.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3">
        {buzonActivo && (
          <Pestana activa={seccion === "bandeja"} onClick={() => setSeccion("bandeja")}>
            Bandeja · {casilla}
          </Pestana>
        )}
        {gestionActiva && (
          <Pestana activa={seccion === "casillas"} onClick={() => setSeccion("casillas")}>
            Casillas de {dominio}
          </Pestana>
        )}
      </div>

      {seccion === "bandeja" && buzonActivo ? <Bandeja /> : null}
      {seccion === "casillas" && gestionActiva ? <Casillas dominio={dominio} /> : null}
    </div>
  );
}

function Pestana({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-activa={activa}
      className="label border-forest-line text-cream-faint data-[activa=true]:border-gold data-[activa=true]:text-gold-light border px-4 py-2 transition-colors"
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────── Bandeja ──────────────────────────────── */

function Bandeja() {
  const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);
  const [abierto, setAbierto] = useState<Mensaje | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [respondiendo, setRespondiendo] = useState(false);

  useEffect(() => {
    let vivo = true;

    fetch("/api/admin/correo/bandeja")
      .then((r) => r.json())
      .then((d) => {
        if (!vivo) return;
        if (d.ok) setMensajes(d.mensajes);
        else setError(d.error ?? "No se pudo leer la bandeja");
      })
      .catch(() => vivo && setError("No se pudo conectar con el servidor de correo"));

    return () => {
      vivo = false;
    };
  }, []);

  async function abrir(uid: number) {
    setAbierto(null);
    const respuesta = await fetch(`/api/admin/correo/bandeja?uid=${uid}`).then((r) => r.json());
    if (respuesta.ok) setAbierto(respuesta.mensaje);
    else setError(respuesta.error ?? "No se pudo abrir el mensaje");
  }

  if (error) {
    return (
      <p className="border-danger/50 text-cream-dim mt-6 border-l-2 py-2 pl-4 text-sm">{error}</p>
    );
  }

  if (!mensajes) {
    return <p className="text-cream-faint mt-8 text-sm">Conectando con el buzón…</p>;
  }

  if (abierto) {
    return (
      <div className="border-forest-line mt-6 border p-6">
        <button
          onClick={() => setAbierto(null)}
          className="label text-cream-faint hover:text-gold-light transition-colors"
        >
          ← Volver a la bandeja
        </button>

        <p className="font-display text-cream mt-5 text-lg">{abierto.asunto}</p>
        <p className="text-cream-faint mt-1 text-sm">
          {abierto.de} · {fecha(abierto.fecha)}
        </p>

        <pre className="border-forest-line text-cream-dim mt-5 max-h-96 overflow-auto border-t pt-5 font-sans text-sm break-words whitespace-pre-wrap">
          {abierto.cuerpo}
        </pre>

        {respondiendo ? (
          <Redactar
            paraInicial={/<([^>]+)>/.exec(abierto.de)?.[1] ?? abierto.de}
            asuntoInicial={
              abierto.asunto.startsWith("Re:") ? abierto.asunto : `Re: ${abierto.asunto}`
            }
            alTerminar={() => setRespondiendo(false)}
          />
        ) : (
          <button
            onClick={() => setRespondiendo(true)}
            className="bg-gold text-forest-deep font-display hover:bg-gold-light mt-6 px-7 py-3 text-[0.72rem] tracking-[0.22em] uppercase transition-colors"
          >
            Responder
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <Redactar />

      {mensajes.length === 0 ? (
        <p className="text-cream-dim py-12 text-center">La bandeja está vacía.</p>
      ) : (
        <ul className="border-forest-line mt-8 border-t">
          {mensajes.map((mensaje) => (
            <li key={mensaje.uid}>
              <button
                onClick={() => abrir(mensaje.uid)}
                className="border-forest-line hover:bg-forest-soft/40 flex w-full flex-wrap items-baseline justify-between gap-3 border-b px-2 py-4 text-left transition-colors"
              >
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm ${mensaje.leido ? "text-cream-dim" : "text-cream font-medium"}`}
                  >
                    {mensaje.asunto}
                  </span>
                  <span className="text-cream-faint mt-0.5 block truncate text-sm">
                    {mensaje.de}
                  </span>
                </span>
                <span className="text-cream-faint shrink-0 text-sm">{fecha(mensaje.fecha)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ──────────────────────────────── Redactar ──────────────────────────────── */

function Redactar({
  paraInicial = "",
  asuntoInicial = "",
  alTerminar,
}: {
  paraInicial?: string;
  asuntoInicial?: string;
  alTerminar?: () => void;
}) {
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "error">("idle");
  const [detalle, setDetalle] = useState("");

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");

    const datos = new FormData(evento.currentTarget);
    const respuesta = await fetch("/api/admin/correo/enviar", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        para: datos.get("para"),
        asunto: datos.get("asunto"),
        cuerpo: datos.get("cuerpo"),
      }),
    })
      .then((r) => r.json())
      .catch(() => null);

    if (respuesta?.ok) {
      setEstado("listo");
      alTerminar?.();
      return;
    }

    setDetalle(respuesta?.error ?? "No se pudo enviar");
    setEstado("error");
  }

  if (estado === "listo") {
    return (
      <p className="border-gold/50 text-gold-light mt-6 border-l-2 py-2 pl-4 text-sm">Enviado.</p>
    );
  }

  return (
    <form onSubmit={enviar} className="border-forest-line mt-6 border p-6">
      <p className="label text-cream-faint">Escribir</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input
          name="para"
          type="email"
          required
          defaultValue={paraInicial}
          placeholder="Para"
          className={campo}
        />
        <input
          name="asunto"
          required
          defaultValue={asuntoInicial}
          placeholder="Asunto"
          className={campo}
        />
      </div>

      <textarea
        name="cuerpo"
        required
        rows={6}
        placeholder="Mensaje"
        className={`${campo} mt-4 resize-none`}
      />

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="bg-gold text-forest-deep font-display hover:bg-gold-light px-7 py-3 text-[0.72rem] tracking-[0.22em] uppercase transition-colors disabled:opacity-50"
        >
          {estado === "enviando" ? "Enviando…" : "Enviar"}
        </button>
        {estado === "error" && <p className="text-danger text-sm">{detalle}</p>}
      </div>
    </form>
  );
}

/* ──────────────────────────────── Casillas ──────────────────────────────── */

function Casillas({ dominio }: { dominio: string }) {
  const [casillas, setCasillas] = useState<Casilla[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const pedir = () =>
    fetch("/api/admin/correo/casillas")
      .then((r) => r.json())
      .catch(() => null);

  const aplicar = (respuesta: { ok?: boolean; casillas?: Casilla[]; error?: string } | null) => {
    if (respuesta?.ok) {
      setCasillas(respuesta.casillas ?? []);
      setError(null);
    } else {
      setError(respuesta?.error ?? "No se pudo hablar con cPanel");
    }
  };

  // La primera carga va en línea dentro del efecto, con guarda de desmontaje:
  // llamar a una función que ya hace setState desde aquí dispara la regla.
  useEffect(() => {
    let vivo = true;
    pedir().then((respuesta) => {
      if (vivo) aplicar(respuesta);
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => aplicar(await pedir());

  async function crear(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCreando(true);

    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const respuesta = await fetch("/api/admin/correo/casillas", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        nombre: datos.get("nombre"),
        password: datos.get("password"),
        cuotaMb: Number(datos.get("cuotaMb")),
      }),
    })
      .then((r) => r.json())
      .catch(() => null);

    setCreando(false);

    if (respuesta?.ok) {
      formulario.reset();
      await cargar();
    } else {
      setError(respuesta?.error ?? "No se pudo crear la casilla");
    }
  }

  async function borrar(email: string) {
    if (!confirm(`¿Eliminar ${email}? Se pierden los mensajes que tenga guardados.`)) return;

    const respuesta = await fetch(`/api/admin/correo/casillas?email=${encodeURIComponent(email)}`, {
      method: "DELETE",
    })
      .then((r) => r.json())
      .catch(() => null);

    if (respuesta?.ok) await cargar();
    else setError(respuesta?.error ?? "No se pudo eliminar");
  }

  return (
    <>
      <form onSubmit={crear} className="border-forest-line mt-6 border p-6">
        <p className="label text-cream-faint">Crear casilla</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
          <label className="flex items-baseline gap-1">
            <input name="nombre" required placeholder="ventas" className={campo} />
            <span className="text-cream-faint shrink-0 text-sm">@{dominio}</span>
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={12}
            placeholder="Contraseña (12+)"
            className={campo}
          />
          <input
            name="cuotaMb"
            type="number"
            min={128}
            step={128}
            defaultValue={1024}
            className={campo}
          />
        </div>

        <button
          type="submit"
          disabled={creando}
          className="bg-gold text-forest-deep font-display hover:bg-gold-light mt-5 px-7 py-3 text-[0.72rem] tracking-[0.22em] uppercase transition-colors disabled:opacity-50"
        >
          {creando ? "Creando…" : "Crear"}
        </button>
        <p className="text-cream-faint mt-3 text-sm">
          La cuota va en megabytes. La contraseña la eliges tú y no se guarda aquí.
        </p>
      </form>

      {error && (
        <p className="border-danger/50 text-cream-dim mt-6 border-l-2 py-2 pl-4 text-sm">{error}</p>
      )}

      {!casillas ? (
        <p className="text-cream-faint mt-8 text-sm">Consultando cPanel…</p>
      ) : casillas.length === 0 ? (
        <p className="text-cream-dim py-12 text-center">Todavía no hay casillas en {dominio}.</p>
      ) : (
        <ul className="border-forest-line mt-8 border-t">
          {casillas.map((casilla) => (
            <li
              key={casilla.email}
              className="border-forest-line flex flex-wrap items-baseline justify-between gap-3 border-b py-4"
            >
              <span className="text-cream text-sm">{casilla.email}</span>
              <span className="flex items-baseline gap-5">
                <span className="text-cream-faint text-sm">
                  {casilla.usadoMb} MB
                  {casilla.limiteMb > 0 ? ` / ${casilla.limiteMb} MB` : " · sin tope"}
                </span>
                <button
                  onClick={() => borrar(casilla.email)}
                  className="label text-cream-faint hover:text-danger transition-colors"
                >
                  Eliminar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
