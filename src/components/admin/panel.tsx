"use client";

import { useMemo, useState } from "react";

import { Correo } from "./correo";
import type { Backend } from "@/lib/admin/repositorio";
import type { StoredLead } from "@/lib/leads/schema";
import { orderStatuses, type OrderStatus, type StoredOrder } from "@/lib/orders/schema";

interface PanelAdminProps {
  pedidos: StoredOrder[];
  solicitudes: StoredLead[];
  backend: Backend;
  correo: {
    gestionActiva: boolean;
    buzonActivo: boolean;
    dominio: string;
    casilla: string;
  };
}

/** Colores de cada estado: el vistazo tiene que bastar. */
const TONO: Record<OrderStatus, string> = {
  pendiente: "border-gold/50 text-gold-light",
  pagado: "border-emerald-500/50 text-emerald-300",
  despachado: "border-sky-500/50 text-sky-300",
  entregado: "border-forest-line text-cream-faint",
  cancelado: "border-danger/50 text-danger",
};

const ETIQUETA: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  despachado: "Despachado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const plata = (monto: number, moneda: string) =>
  `${moneda === "CLP" || moneda === "COP" ? "$" : ""}${monto.toLocaleString("es-CL")}`;

export function PanelAdmin({ pedidos, solicitudes, backend, correo }: PanelAdminProps) {
  const [vista, setVista] = useState<"pedidos" | "solicitudes" | "correo">("pedidos");
  const [estados, setEstados] = useState<Record<string, OrderStatus>>({});
  const [guardando, setGuardando] = useState<string | null>(null);

  const estadoDe = (pedido: StoredOrder) => estados[pedido.code] ?? pedido.status;

  const totales = useMemo(() => {
    const vivos = pedidos.filter((p) => estadoDe(p) !== "cancelado");
    const porCobrar = vivos.filter((p) => estadoDe(p) === "pendiente");
    const porDespachar = vivos.filter((p) => estadoDe(p) === "pagado");
    const vendido = vivos.reduce((suma, p) => suma + p.total.amount, 0);
    const moneda = pedidos[0]?.total.currency ?? "CLP";
    return { porCobrar: porCobrar.length, porDespachar: porDespachar.length, vendido, moneda };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidos, estados]);

  async function cambiar(code: string, status: OrderStatus) {
    setGuardando(code);
    const previo = estados[code];
    // Se pinta enseguida y se revierte si el servidor dice que no.
    setEstados((actual) => ({ ...actual, [code]: status }));

    const respuesta = await fetch("/api/admin/pedido", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, status }),
    }).catch(() => null);

    if (!respuesta?.ok) {
      setEstados((actual) => {
        const copia = { ...actual };
        if (previo) copia[code] = previo;
        else delete copia[code];
        return copia;
      });
      alert("No se pudo guardar el cambio.");
    }
    setGuardando(null);
  }

  async function salir() {
    await fetch("/api/admin/sesion", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <main className="bg-forest text-cream min-h-screen px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-[82rem]">
        <header className="border-forest-line flex flex-wrap items-baseline justify-between gap-4 border-b pb-6">
          <p className="font-display text-sm tracking-[0.28em] uppercase">
            Le Coin · Administración
          </p>
          <button
            onClick={salir}
            className="label text-cream-faint hover:text-gold-light transition-colors"
          >
            Cerrar sesión
          </button>
        </header>

        {backend === "ninguno" && (
          <p className="border-danger/50 text-cream-dim mt-8 border-l-2 py-2 pl-4 text-sm">
            No hay ningún almacén duradero conectado, así que esta pantalla no puede mostrar nada.
            Los pedidos que entren ahora solo quedan en el registro del servidor y se pierden.
            Conecta Redis (Upstash) desde Vercel y aparecerán aquí solos.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Dato titulo="Por cobrar" valor={String(totales.porCobrar)} />
          <Dato titulo="Por despachar" valor={String(totales.porDespachar)} />
          <Dato titulo="Vendido" valor={plata(totales.vendido, totales.moneda)} />
        </div>

        <nav className="border-forest-line mt-10 flex gap-8 border-b">
          {(["pedidos", "solicitudes", "correo"] as const).map((cual) => (
            <button
              key={cual}
              onClick={() => setVista(cual)}
              data-activo={vista === cual}
              className="label text-cream-faint data-[activo=true]:border-gold data-[activo=true]:text-gold-light -mb-px border-b-2 border-transparent pb-4 transition-colors"
            >
              {cual === "pedidos"
                ? `Pedidos (${pedidos.length})`
                : cual === "solicitudes"
                  ? `Solicitudes (${solicitudes.length})`
                  : "Correo"}
            </button>
          ))}
        </nav>

        {vista === "pedidos" && (
          <ListaPedidos
            pedidos={pedidos}
            estadoDe={estadoDe}
            cambiar={cambiar}
            guardando={guardando}
          />
        )}
        {vista === "solicitudes" && <ListaSolicitudes solicitudes={solicitudes} />}
        {vista === "correo" && <Correo {...correo} />}
      </div>
    </main>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="border-forest-line border p-6">
      <p className="label text-cream-faint">{titulo}</p>
      <p className="font-display text-cream mt-2 text-3xl tracking-[0.06em]">{valor}</p>
    </div>
  );
}

function ListaPedidos({
  pedidos,
  estadoDe,
  cambiar,
  guardando,
}: {
  pedidos: StoredOrder[];
  estadoDe: (pedido: StoredOrder) => OrderStatus;
  cambiar: (code: string, status: OrderStatus) => void;
  guardando: string | null;
}) {
  if (pedidos.length === 0) {
    return <p className="text-cream-dim py-16 text-center">Todavía no ha entrado ningún pedido.</p>;
  }

  return (
    <ul className="mt-8 space-y-4">
      {pedidos.map((pedido) => {
        const estado = estadoDe(pedido);

        return (
          <li key={pedido.code} className="border-forest-line bg-forest-soft/40 border p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <p className="font-display text-cream text-lg tracking-[0.12em]">{pedido.code}</p>
                <p className="text-cream-faint mt-1 text-sm">{fecha(pedido.placedAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-cream text-xl tracking-[0.06em]">
                  {plata(pedido.total.amount, pedido.total.currency)}
                </p>
                <span className={`label mt-1 inline-block border px-3 py-1 ${TONO[estado]}`}>
                  {ETIQUETA[estado]}
                </span>
              </div>
            </div>

            <div className="border-forest-line mt-5 grid gap-6 border-t pt-5 sm:grid-cols-2">
              <div>
                <p className="label text-cream-faint">Comprador</p>
                <p className="text-cream-dim mt-2 text-sm leading-relaxed">
                  {pedido.name}
                  <br />
                  <a href={`mailto:${pedido.email}`} className="hover:text-gold-light">
                    {pedido.email}
                  </a>
                  <br />
                  <a
                    href={`https://wa.me/${pedido.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-light"
                  >
                    {pedido.phone}
                  </a>
                </p>
              </div>

              <div>
                <p className="label text-cream-faint">Despacho</p>
                <p className="text-cream-dim mt-2 text-sm leading-relaxed">
                  {pedido.address}
                  <br />
                  {pedido.city}, {pedido.region} ({pedido.country})
                  {pedido.notes && (
                    <>
                      <br />
                      <span className="text-cream-faint italic">{pedido.notes}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <ul className="border-forest-line mt-5 border-t pt-5">
              {pedido.items.map((item) => (
                <li key={item.formatId} className="flex justify-between py-1 text-sm">
                  <span className="text-cream-dim">
                    {item.quantity} × {item.label}
                  </span>
                  <span className="text-cream">
                    {plata(item.subtotal.amount, item.subtotal.currency)}
                  </span>
                </li>
              ))}
              <li className="text-cream-faint mt-2 text-sm">
                Peso total: {(pedido.weightGrams / 1000).toFixed(2).replace(".", ",")} kg · Cobro:{" "}
                {pedido.payment}
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {orderStatuses.map((posible) => (
                <button
                  key={posible}
                  disabled={posible === estado || guardando === pedido.code}
                  onClick={() => cambiar(pedido.code, posible)}
                  className={`label border px-4 py-2 transition-colors disabled:opacity-40 ${
                    posible === estado
                      ? TONO[posible]
                      : "border-forest-line text-cream-faint hover:border-gold/50 hover:text-gold-light"
                  }`}
                >
                  {ETIQUETA[posible]}
                </button>
              ))}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ListaSolicitudes({ solicitudes }: { solicitudes: StoredLead[] }) {
  if (solicitudes.length === 0) {
    return (
      <p className="text-cream-dim py-16 text-center">Todavía no ha entrado ninguna solicitud.</p>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {solicitudes.map((solicitud) => (
        <li key={solicitud.id} className="border-forest-line bg-forest-soft/40 border p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="font-display text-cream text-lg">{solicitud.company}</p>
            <p className="text-cream-faint text-sm">{fecha(solicitud.receivedAt)}</p>
          </div>

          <p className="text-cream-dim mt-3 text-sm leading-relaxed">
            {solicitud.name} ·{" "}
            <a href={`mailto:${solicitud.email}`} className="hover:text-gold-light">
              {solicitud.email}
            </a>
            {solicitud.phone && (
              <>
                {" · "}
                <a
                  href={`https://wa.me/${solicitud.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-light"
                >
                  {solicitud.phone}
                </a>
              </>
            )}
          </p>

          <p className="text-cream-faint mt-2 text-sm">
            {solicitud.country} · {solicitud.channel}
            {solicitud.monthlyVolumeKg ? ` · ${solicitud.monthlyVolumeKg} kg/mes` : ""}
            {solicitud.formatIds.length > 0 ? ` · ${solicitud.formatIds.join(", ")}` : ""}
          </p>

          {solicitud.message && (
            <p className="border-forest-line text-cream-dim mt-4 border-l-2 pl-4 text-sm italic">
              {solicitud.message}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
