import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ToastProps {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-16 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 transition-opacity duration-300 ${
        type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
      }`}
    >
      <FontAwesomeIcon
        icon={type === "error" ? "exclamation-circle" : "check-circle"}
      />
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="ml-2 text-white hover:text-gray-200"
      >
        <FontAwesomeIcon icon="times" />
      </button>
    </div>
  );
};

export default Toast;
