import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faCog } from "@fortawesome/free-solid-svg-icons";
import "../../styles/media.css";

type ModelType = "deepseek" | "maverick" | "claude" | "gpt4o";

interface CustomDropupProps {
  value: ModelType;
  onChange: (value: ModelType) => void;
  className?: string;
}

const CustomDropup: React.FC<CustomDropupProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  const models = [
    { value: "gpt4o", label: "GPT-4o-mini" },
    { value: "claude", label: "Claude 3.7 Sonnet" },
    { value: "maverick", label: "Maverick" },
    { value: "deepseek", label: "DeepSeek V3" },
  ];

  const currentModel = models.find((model) => model.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropupRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          `p-1 w-10 sm:w-26 md:w-40 rounded-md outline-none text-sm flex items-center justify-center sm:justify-between ` +
          `bg-zinc-100 text-zinc-900 border border-zinc-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ` +
          `dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-pink-500 dark:focus:ring-1 dark:focus:ring-pink-500`
        }
      >
        <span className="hidden sm:inline truncate">{currentModel?.label}</span>
        <FontAwesomeIcon icon={faCog} className="sm:hidden text-lg" />
        <FontAwesomeIcon
          icon={faChevronUp}
          className="ml-1 sm:ml-2 transition-transform text-sm sm:text-base"
          transform={isOpen ? { rotate: 180 } : undefined}
        />
      </button>

      {isOpen && (
        <div
          className={
            `absolute bottom-full left-0 mb-1 w-full min-w-40 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto ` +
            `bg-white border border-zinc-200 ` +
            `dark:bg-gray-700 dark:border-gray-600`
          }
        >
          {models.map((model) => (
            <div
              key={model.value}
              className={`px-2 py-1 text-sm cursor-pointer 
                ${
                  model.value === value
                    ? "bg-blue-100 text-blue-800 dark:bg-gray-600 dark:text-white"
                    : "text-zinc-700 hover:bg-zinc-200 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              onClick={() => {
                onChange(model.value as ModelType);
                setIsOpen(false);
              }}
            >
              {model.label}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 320px) {
          button {
            width: 40px;
          }
          .truncate {
            display: none;
          }
          .sm\\:hidden {
            display: inline-flex;
          }
        }

        @media (min-width: 321px) {
          .sm\\:inline {
            display: inline;
          }
          .sm\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomDropup;
