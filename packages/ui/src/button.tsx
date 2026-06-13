import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { LoaderCircle, type LucideIcon } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  children,
  disabled,
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  size = "md",
  style,
  variant = "primary",
  ...props
}: ButtonProps) {
  const isIconOnly = size === "icon";
  const isDisabled = disabled || isLoading;
  const iconSize = isIconOnly ? 20 : 18;
  const renderedIcon = isLoading ? (
    <LoaderCircle aria-hidden="true" size={iconSize} style={styles.spinner} />
  ) : Icon ? (
    <Icon aria-hidden="true" size={iconSize} strokeWidth={2.4} />
  ) : null;

  return (
    <>
      <style>{keyframes}</style>
      <button
        {...props}
        disabled={isDisabled}
        style={{
          ...styles.base,
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...(isDisabled ? styles.disabled : null),
          ...style,
        }}
      >
        {renderedIcon && iconPosition === "left" ? renderedIcon : null}
        {children ? <span style={styles.label}>{children}</span> : null}
        {renderedIcon && iconPosition === "right" ? renderedIcon : null}
      </button>
    </>
  );
}

const keyframes = `
@keyframes button-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
`;

const colors = {
  blue: "#062f63",
  blueDark: "#031d3e",
  black: "#050505",
  border: "#c6d1dd",
  white: "#ffffff",
  danger: "#b42318",
  dangerDark: "#7a1a13",
};

const styles = {
  base: {
    appearance: "none",
    border: "1px solid transparent",
    borderRadius: "6px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 700,
    letterSpacing: "0",
    lineHeight: 1,
    textDecoration: "none",
    transition:
      "background-color 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease",
    whiteSpace: "nowrap",
  },
  label: {
    display: "inline-block",
  },
  disabled: {
    cursor: "not-allowed",
    opacity: 0.56,
  },
  spinner: {
    animation: "button-spin 900ms linear infinite",
  },
} satisfies Record<string, CSSProperties>;

const variantStyles = {
  primary: {
    background: colors.blue,
    borderColor: colors.blue,
    color: colors.white,
  },
  secondary: {
    background: colors.black,
    borderColor: colors.black,
    color: colors.white,
  },
  outline: {
    background: colors.white,
    borderColor: colors.blue,
    color: colors.blue,
  },
  ghost: {
    background: "transparent",
    borderColor: "transparent",
    color: colors.blue,
  },
  destructive: {
    background: colors.danger,
    borderColor: colors.danger,
    color: colors.white,
  },
} satisfies Record<ButtonVariant, CSSProperties>;

const sizeStyles = {
  sm: {
    minHeight: "34px",
    padding: "0 12px",
    fontSize: "14px",
  },
  md: {
    minHeight: "40px",
    padding: "0 16px",
    fontSize: "15px",
  },
  lg: {
    minHeight: "48px",
    padding: "0 20px",
    fontSize: "16px",
  },
  icon: {
    width: "40px",
    height: "40px",
    padding: 0,
    fontSize: "15px",
  },
} satisfies Record<ButtonSize, CSSProperties>;
