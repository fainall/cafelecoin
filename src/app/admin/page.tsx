import type { Metadata } from "next";
import { cookies } from "next/headers";

import { PanelAdmin } from "@/components/admin/panel";
import { Acceso } from "@/components/admin/acceso";
import { getAdminRepository } from "@/lib/admin/repositorio";
import { adminHabilitado, COOKIE, sesionValida } from "@/lib/admin/sesion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

/**
 * Panel de administración.
 *
 * Fuera del sistema de idiomas a propósito: no es parte del sitio público, no
 * se traduce y no se indexa. Se renderiza en cada visita porque su gracia es
 * mostrar lo que entró hace un minuto.
 */
export default async function AdminPage() {
  if (!adminHabilitado()) {
    return (
      <Aviso titulo="El panel está apagado">
        Falta la variable <code className="text-gold-light">ADMIN_PASSWORD</code> con al menos 8
        caracteres. Sin ella el panel no abre, que es mejor que dejar una clave por defecto rondando
        en un repositorio público.
      </Aviso>
    );
  }

  const galleta = (await cookies()).get(COOKIE)?.value;
  if (!sesionValida(galleta)) return <Acceso />;

  const repositorio = getAdminRepository();
  const [pedidos, solicitudes] = await Promise.all([
    repositorio.listOrders(),
    repositorio.listLeads(),
  ]);

  return <PanelAdmin pedidos={pedidos} solicitudes={solicitudes} backend={repositorio.backend} />;
}

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="bg-forest text-cream flex min-h-screen items-center justify-center px-6">
      <div className="border-forest-line max-w-lg border p-10">
        <p className="font-display text-cream text-sm tracking-[0.28em] uppercase">{titulo}</p>
        <p className="text-cream-dim mt-5 leading-relaxed">{children}</p>
      </div>
    </main>
  );
}
