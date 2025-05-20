"use client";

import React, { useState, useEffect } from "react";
import { Righteous } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const Logo: React.FC = () => {
  const [currentText, setCurrentText] = useState("CoolStory");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) =>
        prev === "CoolStory" ? "BebeRony" : "CoolStory"
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ml-9 perspective-[400px] h-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentText}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="origin-center"
        >
          <h1
            className={`${righteous.className} text-4xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-pink-300 to-pink-500`}
          >
            {currentText}
          </h1>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Logo;
