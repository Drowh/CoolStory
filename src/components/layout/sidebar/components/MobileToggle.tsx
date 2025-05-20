import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface MobileToggleProps {
  onClick: () => void;
}

const MobileToggle: React.FC<MobileToggleProps> = ({ onClick }) => {
  return (
    <div className="fixed top-2.5 left-2 z-[52] animate-fade-in-scale">
      <button
        onClick={onClick}
        className="bg-[#111827] border border-gray-600 text-gray-200 px-3 py-1 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        aria-label="Открыть меню"
      >
        <FontAwesomeIcon icon="bars" />
      </button>
    </div>
  );
};

export default MobileToggle; 