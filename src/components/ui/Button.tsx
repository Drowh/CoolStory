import React, { ButtonHTMLAttributes } from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "solid" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "solid",
  size = "md",
  ...props
}) => {
  const variantStyles = {
    solid: "bg-gray-700 hover:bg-gray-600 text-gray-100",
    ghost: "bg-transparent text-gray-400 hover:text-gray-200",
    outline: "border border-gray-600 text-gray-100 hover:bg-gray-700",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      {...props}
      className={classNames(
        "rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-pink-500",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
