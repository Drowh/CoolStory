import React, { ButtonHTMLAttributes, useRef } from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "solid" | "ghost" | "outline" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "solid",
  size = "md",
  icon,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const variantStyles = {
    solid:
      "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition-colors duration-200",
    ghost:
      "bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/40 transition-colors duration-200",
    outline:
      "border border-zinc-200 text-zinc-900 hover:bg-zinc-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700/40 transition-colors duration-200",
    gradient:
      "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-200",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      {...props}
      ref={btnRef}
      className={classNames(
        "rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50 relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        props.disabled
          ? "opacity-60 cursor-not-allowed hover:scale-100"
          : "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;
