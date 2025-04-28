import React, { forwardRef, InputHTMLAttributes } from "react";
import classNames from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", fullWidth = false, ...props }, ref) => {
    const baseStyles =
      "bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none p-2 text-sm transition-colors duration-200";

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "";

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        <input
          ref={ref}
          className={classNames(
            baseStyles,
            errorStyles,
            fullWidth ? "w-full" : "",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
