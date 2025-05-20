"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type TransitionCallback = () => void;

export const usePageTransition = (
  onStart: TransitionCallback,
  onComplete: TransitionCallback,
  delay = 800
): void => {
  const pathname = usePathname();

  const toggleMainContent = (show: boolean) => {
    if (typeof window !== "undefined") {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.style.opacity = show ? "1" : "0";
        mainContent.style.transition = "opacity 0.3s ease-in-out";
      }
    }
  };

  useEffect(() => {
    toggleMainContent(false);
    onStart();

    const handleInitialLoad = () => {
      setTimeout(() => {
        onComplete();
        toggleMainContent(true);
      }, delay);
    };

    if (document.readyState === "complete") {
      handleInitialLoad();
    } else {
      window.addEventListener("load", handleInitialLoad);
      return () => window.removeEventListener("load", handleInitialLoad);
    }
  }, [delay, onComplete, onStart]);

  useEffect(() => {
    if (!pathname) return;

    toggleMainContent(false);
    onStart();

    const timer = setTimeout(() => {
      onComplete();
      toggleMainContent(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, onStart, onComplete, delay]);
};
