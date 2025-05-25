import React, { forwardRef } from "react";

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  isActive: boolean;
  id: string;
  "aria-controls": string;
  "aria-selected": boolean;
  onClick: () => void;
}

const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  (
    {
      label,
      isActive,
      onClick,
      id,
      "aria-controls": ariaControls,
      "aria-selected": ariaSelected,
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      "py-1 px-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm";

    const activeClasses = "bg-pink-500 text-white scale-105 shadow-lg";
    const inactiveClasses =
      "bg-zinc-100 dark:bg-gray-700 text-zinc-900 dark:text-gray-200 hover:bg-zinc-200 dark:hover:bg-gray-600 hover:scale-105";

    return (
      <button
        ref={ref}
        onClick={onClick}
        role="tab"
        aria-selected={ariaSelected}
        aria-controls={ariaControls}
        id={id}
        className={`${baseClasses} ${
          isActive ? activeClasses : inactiveClasses
        }`}
        {...rest}
      >
        {label}
      </button>
    );
  }
);

TabButton.displayName = "TabButton";

export default TabButton;
