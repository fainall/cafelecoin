import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-[82rem] flex-col items-center justify-center px-6 py-40 text-center sm:px-10">
      <p className="eyebrow text-gold-light">404</p>
      <h1 className="display-xl text-cream mt-6 text-[clamp(1.75rem,4vw,3rem)]">
        Este rincón no existe.
      </h1>
      <p className="text-cream-dim mt-4 text-lg italic">This corner does not exist.</p>
      <Link
        href="/"
        className="border-gold/50 text-gold-light hover:bg-gold hover:text-forest-deep font-display mt-10 border px-9 py-4 text-[0.72rem] tracking-[0.22em] uppercase transition-colors"
      >
        Le Coin
      </Link>
    </div>
  );
}
