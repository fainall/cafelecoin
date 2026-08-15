interface BeanProps {
  className?: string;
  id: string;
}

/**
 * Grano de café con volumen: cuerpo en degradado radial, hendidura marcada y
 * luz de canto. Se usa siempre pequeño y desenfocado, como elemento de
 * profundidad de campo detrás del producto.
 */
function Bean({ className = "", id }: BeanProps) {
  return (
    <svg viewBox="0 0 120 84" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`beanBody-${id}`} cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#8a5730" />
          <stop offset="45%" stopColor="#5a3419" />
          <stop offset="100%" stopColor="#2a170b" />
        </radialGradient>
        <linearGradient id={`beanRim-${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#c08b53" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#c08b53" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="42" rx="56" ry="39" fill={`url(#beanBody-${id})`} />
      {/* Hendidura central */}
      <path
        d="M8 42 C 32 16, 88 68, 112 42"
        fill="none"
        stroke="#170c05"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M8 42 C 32 16, 88 68, 112 42"
        fill="none"
        stroke="#a8703f"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.35"
        transform="translate(0 -3)"
      />
      {/* Luz de canto */}
      <ellipse cx="60" cy="42" rx="56" ry="39" fill={`url(#beanRim-${id})`} />
    </svg>
  );
}

interface FloatingBeansProps {
  className?: string;
}

/** Posición, tamaño, giro, desenfoque y opacidad de cada grano. */
const beans = [
  { top: "6%", left: "4%", size: 46, spin: -20, delay: 0, blur: 1.4, opacity: 0.55 },
  { top: "24%", left: "84%", size: 34, spin: 28, delay: 1800, blur: 2, opacity: 0.42 },
  { top: "62%", left: "2%", size: 30, spin: 14, delay: 3200, blur: 2.2, opacity: 0.38 },
  { top: "78%", left: "80%", size: 42, spin: -12, delay: 900, blur: 1.2, opacity: 0.6 },
];

/**
 * Granos suspendidos alrededor del producto. Pocos, pequeños y fuera de foco:
 * sugieren profundidad sin competir con la fotografía.
 */
export function FloatingBeans({ className = "" }: FloatingBeansProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {beans.map((bean, index) => (
        <span
          key={index}
          className="animate-float absolute block"
          style={{
            top: bean.top,
            left: bean.left,
            width: bean.size,
            opacity: bean.opacity,
            filter: `blur(${bean.blur}px) drop-shadow(0 10px 14px rgba(0,0,0,0.5))`,
            animationDelay: `${bean.delay}ms`,
            ["--spin" as string]: `${bean.spin}deg`,
          }}
        >
          <Bean id={String(index)} className="h-auto w-full" />
        </span>
      ))}
    </div>
  );
}
