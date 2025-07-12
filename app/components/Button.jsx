import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Props:
 * - variant: "primary" | "secondary" | "gradient"
 * - loading: boolean (default false)
 * - icon: optional icon (React element)
 * - children: button text
 */
export default function Button({
  children = "Click Me",
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  icon = null,
  variant = "primary",
  className = "",
}) {
  const baseStyle = "inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-2xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800 shadow-md",
    secondary: "bg-white text-black border border-neutral-300 hover:bg-neutral-100",
    gradient: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md",
  };

  const style = `${baseStyle} ${variants[variant]} ${className}`;

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={style}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
