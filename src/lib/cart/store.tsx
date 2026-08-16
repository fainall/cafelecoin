"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { Format } from "@/content/schema";
import {
  addLine,
  countUnits,
  removeLine,
  setQuantity,
  summarize,
  type CartLine,
  type CartSummary,
  type SalesMode,
} from "./cart";

/**
 * Estado del carrito en el navegador.
 *
 * Las líneas viven en un almacén externo al árbol de React y se leen con
 * useSyncExternalStore: así no hay que sincronizar localStorage desde un efecto
 * —que provoca renders en cascada— y el carrito queda igualado entre pestañas.
 *
 * Solo se guardan identificadores y cantidades: los precios se recalculan
 * siempre desde el catálogo que entrega el servidor, así que un carrito viejo
 * nunca puede fijar un precio antiguo.
 */

const CLAVE = "lecoin.carrito.v1";

/** Referencia estable: el servidor siempre entrega el mismo array vacío. */
const VACIO: CartLine[] = [];

let lineas: CartLine[] = VACIO;
let cargado = false;
const oyentes = new Set<() => void>();

function leerAlmacenado(): CartLine[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return VACIO;

    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos)) return VACIO;

    // Se valida a mano: el almacenamiento es editable por quien visita.
    const limpias = datos.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const { formatId, quantity } = item as Record<string, unknown>;
      if (typeof formatId !== "string" || typeof quantity !== "number") return [];
      if (!Number.isFinite(quantity) || quantity <= 0) return [];
      return [{ formatId, quantity: Math.floor(quantity) }];
    });

    return limpias.length > 0 ? limpias : VACIO;
  } catch {
    return VACIO;
  }
}

function guardar() {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(lineas));
  } catch {
    // Modo privado o almacenamiento lleno: el carrito sigue en memoria.
  }
}

function emitir() {
  for (const avisar of oyentes) avisar();
}

/** Otra pestaña tocó el carrito: se recarga y se avisa. */
function alCambiarOtraPestana(evento: StorageEvent) {
  if (evento.key !== null && evento.key !== CLAVE) return;
  lineas = leerAlmacenado();
  emitir();
}

function suscribir(avisar: () => void) {
  if (!cargado) {
    lineas = leerAlmacenado();
    cargado = true;
  }

  if (oyentes.size === 0) {
    window.addEventListener("storage", alCambiarOtraPestana);
  }
  oyentes.add(avisar);

  return () => {
    oyentes.delete(avisar);
    if (oyentes.size === 0) {
      window.removeEventListener("storage", alCambiarOtraPestana);
    }
  };
}

const instantanea = () => lineas;
const instantaneaServidor = () => VACIO;

function actualizar(siguiente: CartLine[]) {
  lineas = siguiente;
  guardar();
  emitir();
}

/* ─────────────────────────────── Contexto ─────────────────────────────── */

interface CartContextValue {
  lines: CartLine[];
  summary: CartSummary;
  units: number;
  mode: SalesMode;
  setMode: (mode: SalesMode) => void;
  add: (formatId: string, quantity?: number) => void;
  setQty: (formatId: string, quantity: number) => void;
  remove: (formatId: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  catalogue,
  children,
}: {
  catalogue: Format[];
  children: ReactNode;
}) {
  const lines = useSyncExternalStore(suscribir, instantanea, instantaneaServidor);
  const [mode, setMode] = useState<SalesMode>("retail");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Las operaciones leen el módulo, no el render: `lineas` siempre está al día.
  const add = useCallback((formatId: string, quantity = 1) => {
    actualizar(addLine(lineas, formatId, quantity));
  }, []);

  const setQty = useCallback((formatId: string, quantity: number) => {
    actualizar(setQuantity(lineas, formatId, quantity));
  }, []);

  const remove = useCallback((formatId: string) => {
    actualizar(removeLine(lineas, formatId));
  }, []);

  const clear = useCallback(() => actualizar(VACIO), []);

  const summary = useMemo(() => summarize(lines, catalogue, mode), [lines, catalogue, mode]);
  const units = useMemo(() => countUnits(lines), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({ lines, summary, units, mode, setMode, add, setQty, remove, clear, open, setOpen }),
    [lines, summary, units, mode, add, setQty, remove, clear, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return contexto;
}
