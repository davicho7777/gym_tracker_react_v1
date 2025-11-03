import React, { useContext } from "react";
import { cn } from "../../lib/utils";
import SettingsContext from "../../context/SettingsContext";

const Button = ({
  children,
  variant, // if not provided, choose based on theme
  size = "md",
  className,
  ...props
}) => {
  // useContext directly so Button can be used outside of a SettingsProvider in tests
  const ctx = useContext(SettingsContext);
  const theme = (ctx && ctx.theme) || "default";
  // choose a sensible default variant per theme when none provided
  const defaultVariantByTheme = {
    default: "primary",
    dark: "neutral",
    tripi: "ghost",
    vivid: "outline",
  };
  const resolvedVariant = variant || defaultVariantByTheme[theme] || "primary";
  const base =
    "btn inline-flex items-center justify-center rounded-lg font-semibold transition transform-gpu focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "btn--primary text-white btn--shadow-yellow",
    neutral: "btn--neutral text-gray-800 btn--shadow-blue",
    ghost: "btn--ghost text-gray-800 btn--shadow-black",
    outline: "btn--outline text-gray-800 btn--shadow-green",
  };

  const sizes = {
    sm: "btn--sm",
    md: "btn--md",
    lg: "btn--lg",
    icon: "btn--icon",
  };

  return (
    <button
      className={cn(
        base,
        variants[resolvedVariant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      data-theme={theme}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
