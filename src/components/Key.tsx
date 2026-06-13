import type { ReactNode } from "react";

type KeyVariant = "default" | "accent" | "function" | "equals";

interface KeyProps {
  children: ReactNode;
  onClick: () => void;
  variant?: KeyVariant;
  wide?: boolean;
  ariaLabel?: string;
}

export function Key({
  children,
  onClick,
  variant = "default",
  wide = false,
  ariaLabel,
}: KeyProps) {
  return (
    <button
      type="button"
      className={`key key--${variant}${wide ? " key--wide" : ""}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
