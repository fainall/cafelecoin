import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "outline" | "outlineDark";

const base =
  "inline-flex items-center justify-center gap-3 px-9 py-4 font-display text-[0.72rem] uppercase tracking-[0.22em] transition-colors duration-500";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-forest-deep hover:bg-gold-light",
  outline: "border border-gold/50 text-gold-light hover:bg-gold hover:text-forest-deep",
  outlineDark: "border border-ink/20 text-ink hover:bg-ink hover:text-paper",
};

interface LinkButtonProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  variant = "outline",
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

export function Button({ variant = "gold", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
