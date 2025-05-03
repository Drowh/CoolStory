import React, { forwardRef, InputHTMLAttributes, KeyboardEvent } from "react";
import classNames from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
  fullWidth?: boolean;
  onEnterPress?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", fullWidth = false, onEnterPress, onKeyDown, ...props }, ref) => {
    const baseStyles =
      "bg-gray-700 text-gray-100 rounded-md border border-gray-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none px-4 py-3 text-base transition-colors duration-200 w-full";

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "";

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onEnterPress) {
        onEnterPress();
      }
      
      if (onKeyDown) {
        onKeyDown(e as KeyboardEvent<HTMLInputElement>);
      }
    };

    return (
      <div className={`${fullWidth ? "w-full" : "w-full"} relative`}>
        <input
          ref={ref}
          className={classNames(baseStyles, errorStyles, className)}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;