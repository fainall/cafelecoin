import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-[100rem] flex-col justify-center px-6 py-40 sm:px-10 lg:px-16">
      <p className="index text-cherry-bright">404</p>
      <h1 className="display text-bone mt-6 text-[clamp(2.5rem,6vw,5rem)]">
        Este rincón no existe.
        <span className="text-bone-muted mt-3 block text-2xl italic">
          This corner does not exist.
        </span>
      </h1>
      <Link
        href="/"
        className="border-ink-line text-bone meta hover:border-bone hover:bg-bone hover:text-ink mt-12 w-fit border px-8 py-4 transition-colors"
      >
        Le Coin
      </Link>
    </div>
  );
}
