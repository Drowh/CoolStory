"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePreloader } from "../contexts/PreloaderContext";
import { useEffect } from "react";
import LoaderContent from "./LoaderContent";

const Preloader = () => {
  const { isLoading } = usePreloader();

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isLoading) {
        document.body.classList.add("overflow-hidden");
      } else {
        const timer = setTimeout(() => {
          document.body.classList.remove("overflow-hidden");
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2,
            }}
            className="relative py-10"
          >
            <LoaderContent />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
