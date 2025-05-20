import React from "react";

interface ScrollToBottomButtonProps {
  onClick: () => void;
}

const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="scroll-to-bottom fixed bottom-[160px] md:bottom-[145px] left-1/2 transform -translate-x-1/2 w-[35px] h-[35px] md:w-[40px] md:h-[40px] rounded-full bg-gradient-to-r from-pink-600/70 to-purple-700/70 text-white text-lg md:text-xl flex items-center justify-center border border-white/50 shadow-lg z-50 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:opacity-100"
      style={{
        boxShadow: "0 3px 10px rgba(219, 39, 119, 0.4)",
        animation: "bounce 2s infinite ease-in-out",
        opacity: 0.7,
      }}
      aria-label="Прокрутить вниз"
    >
      ↓
    </button>
  );
};

export default ScrollToBottomButton;
