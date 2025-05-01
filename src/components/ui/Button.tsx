import React, { ButtonHTMLAttributes, useRef } from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "solid" | "ghost" | "outline" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  ripple?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  variant = "solid",
  size = "md",
  icon,
  ripple = true,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const variantStyles = {
    solid: "bg-gray-700 hover:bg-gray-600 text-gray-100 active:bg-gray-800",
    ghost:
      "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-700/40",
    outline: "border border-gray-600 text-gray-100 hover:bg-gray-700",
    gradient:
      "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || props.disabled) return;
    const btn = btnRef.current!;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement("span");

    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-circle");

    btn.appendChild(circle);
    circle.addEventListener("animationend", () => {
      circle.remove();
    });
  };

  return (
    <button
      {...props}
      ref={btnRef}
      onClick={(e) => {
        handleRipple(e);
        props.onClick?.(e);
      }}
      className={classNames(
        "rounded-md transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-pink-500 relative overflow-hidden transform hover:scale-102 active:scale-98",
        variantStyles[variant],
        sizeStyles[size],
        props.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-center">
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

export default Button;
