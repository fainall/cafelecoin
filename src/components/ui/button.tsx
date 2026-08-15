import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "onDark" | "onLight" | "onCherry";

const base =
  "inline-flex items-center justify-center gap-3 px-8 py-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.1em] transition-colors duration-300";

const variants: Record<Variant, string> = {
  solid: "bg-cherry text-paper hover:bg-cherry-bright",
  onDark: "border border-ink-line text-bone hover:border-bone hover:bg-bone hover:text-ink",
  onLight:
    "border border-paper-line text-graphite hover:border-graphite hover:bg-graphite hover:text-paper",
  onCherry: "border border-white/40 text-white hover:bg-white hover:text-cherry",
};

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  variant = "solid",
  className = "",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
}

export function Button({ variant = "solid", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
