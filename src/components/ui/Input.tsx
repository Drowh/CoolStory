import React, { forwardRef, InputHTMLAttributes, KeyboardEvent } from "react";
import classNames from "classnames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
  fullWidth?: boolean;
  onEnterPress?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      className = "",
      fullWidth = false,
      onEnterPress,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "bg-white dark:bg-gray-800 text-zinc-900 dark:text-gray-100 rounded-md border border-zinc-200 dark:border-gray-600 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 outline-none px-4 py-3 text-base transition-all duration-200 w-full placeholder-zinc-400 dark:placeholder-gray-500";

    const errorStyles = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/50"
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
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p 
            id={`${props.id}-error`}
            className="mt-1 text-xs text-red-500 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
