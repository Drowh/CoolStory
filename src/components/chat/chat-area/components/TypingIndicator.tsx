import React from "react";
import Image from "next/image";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start mt-4 w-full">
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full  mr-3 flex items-center justify-center shadow-sm overflow-hidden">
        <Image
          src="/assets/icons/cat.png"
          alt="Assistant"
          className="w-full h-full object-cover"
          width={40}
          height={40}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg text-zinc-900 dark:text-gray-300 shadow-sm border border-zinc-100 dark:border-gray-700">
        <div className="flex items-center space-x-1.5">
          <div
            className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"
            style={{ animationDuration: "0.6s" }}
          />
          <div
            className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"
            style={{ animationDuration: "0.6s", animationDelay: "0.2s" }}
          />
          <div
            className="w-1.5 h-1.5 bg-pink-600 rounded-full animate-bounce"
            style={{ animationDuration: "0.6s", animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
