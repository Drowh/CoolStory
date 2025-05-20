import React from "react";
import Image from "next/image";
import cat from "../../../../assets/icons/cat.png";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start mt-4 w-full">
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 border border-gray-700 mr-3 flex items-center justify-center shadow-md overflow-hidden">
        <Image
          src={cat}
          alt="Assistant"
          className="w-full h-full object-cover"
          width={40}
          height={40}
        />
      </div>
      <div className="bg-gray-800 px-4 py-3 rounded-lg text-gray-300 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
