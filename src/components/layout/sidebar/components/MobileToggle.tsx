import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface MobileToggleProps {
  onClick: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ onClick }) => {
  return (
    <div className="fixed top-2.5 left-2 z-[52] animate-fade-in-scale">
      <button
        onClick={onClick}
        className="bg-white dark:bg-gray-800 border border-zinc-200 dark:border-gray-700 text-zinc-600 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-gray-100 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Открыть меню"
      >
        <FontAwesomeIcon icon="bars" className="text-lg" aria-hidden="true" />
      </button>
    </div>
  );
};

export default MobileToggle;
