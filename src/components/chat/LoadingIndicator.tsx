import React from "react";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Загрузка сообщений...",
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-64 w-full"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-20 h-20" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-l-pink-600 border-r-purple-600 border-t-transparent border-b-transparent animate-spin"></div>
        <div className="absolute top-2 left-2 w-16 h-16 rounded-full border-4 border-r-pink-500 border-l-purple-500 border-t-transparent border-b-transparent animate-spin-slow"></div>
        <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-4 border-l-pink-400 border-r-purple-400 border-t-transparent border-b-transparent animate-spin"></div>
      </div>
      <p className="mt-6 text-gray-400 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-medium">
        {message}
      </p>
    </div>
  );
};

export default LoadingIndicator;
