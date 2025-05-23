import React from "react";

interface MobileOverlayProps {
  onClose: () => void;
}

const MobileOverlay: React.FC<MobileOverlayProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
      onClick={onClose}
      role="button"
      aria-label="Закрыть боковую панель"
    />
  );
};

export default MobileOverlay;
