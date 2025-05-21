"use client";

import React from "react";

interface ScrollToBottomButtonProps {
  onClick: () => void;
}

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
}) => {
  return (
    <div className="max-w-3xl mx-auto relative ">
      <button
        onClick={onClick}
        className="
          absolute left-1/2 -translate-x-1/2 -top-[40px]
          w-[35px] h-[35px] md:w-[40px] md:h-[40px] 
          rounded-full bg-gradient-to-r from-pink-600/70 to-purple-700/70 
          text-white text-lg md:text-xl 
          flex items-center justify-center 
          border border-white/50 shadow-lg z-50 
          transition-all duration-300 
          hover:scale-110 hover:shadow-xl hover:opacity-100
          animate-bounce-slow
          opacity-70
        "
        style={{
          boxShadow: "0 3px 10px rgba(219, 39, 119, 0.4)",
        }}
        aria-label="Прокрутить вниз"
      >
        ↓
      </button>
    </div>
  );
};

export default ScrollToBottomButton;
