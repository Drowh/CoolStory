"use client";

import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
});

export default function LoaderContent() {
  return (
    <div className="text-center">
      <div className="pb-4 leading-relaxed">
        <h1
          className={`
            ${dancingScript.className} 
            text-6xl md:text-7xl 
            bg-clip-text text-transparent 
            bg-gradient-to-r from-pink-500 via-pink-300 to-pink-500 
            bg-[length:200%_auto] 
            animate-shimmer
            inline-block
            py-2
          `}
        >
          CoolStory BebeRony
        </h1>
      </div>

      <div className="flex justify-center mt-2">
        <div className="w-24 h-1 bg-gradient-to-r from-pink-200 to-pink-500 rounded-full overflow-hidden animate-progress-bar" />
      </div>
    </div>
  );
}
