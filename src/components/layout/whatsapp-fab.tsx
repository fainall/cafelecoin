interface WhatsAppFabProps {
  href: string;
  label: string;
}

/**
 * Acceso directo a WhatsApp: una pastilla sobria anclada abajo a la derecha.
 * Nada de burbujas verdes brillantes.
 */
export function WhatsAppFab({ href, label }: WhatsAppFabProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="border-ink-line bg-ink/90 text-bone hover:border-bone/40 fixed right-5 bottom-5 z-50 hidden items-center gap-2.5 border px-4 py-3 backdrop-blur-lg transition-colors sm:right-8 sm:bottom-8 sm:inline-flex"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.16c-.24.68-1.42 1.31-1.95 1.35-.5.05-.99.23-3.34-.7-2.81-1.11-4.6-3.98-4.74-4.17-.14-.19-1.13-1.5-1.13-2.87 0-1.36.71-2.03.96-2.31.25-.28.55-.35.73-.35.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.57.8 1.97.87 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.17-.19.69-.8.87-1.08.18-.28.37-.23.62-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.33.07.11.07.65-.17 1.33Z" />
      </svg>
      <span className="meta">{label}</span>
    </a>
  );
}
