import React, { ButtonHTMLAttributes, useState } from "react";
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
  const [rippleStyle, setRippleStyle] = useState({
    left: "0px",
    top: "0px",
    opacity: 0,
  });
  const [isRippling, setIsRippling] = useState(false);

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

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;

    setRippleStyle({ left: `${left}px`, top: `${top}px`, opacity: 1 });
    setIsRippling(true);

    setTimeout(() => {
      setIsRippling(false);
    }, 600);
  };

  return (
    <button
      {...props}
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

      {/* Ripple effect */}
      {isRippling && ripple && (
        <span
          className="absolute rounded-full bg-white/30 animate-ripple"
          style={{
            left: rippleStyle.left,
            top: rippleStyle.top,
            width: "120px",
            height: "120px",
            marginLeft: "-60px",
            marginTop: "-60px",
            opacity: rippleStyle.opacity,
          }}
        />
      )}
    </button>
  );
};

export default Button;
