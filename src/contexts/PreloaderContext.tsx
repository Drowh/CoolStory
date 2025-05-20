"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { usePageTransition } from "../hooks/usePageTransition";

interface PreloaderContextType {
  isLoading: boolean;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(
  undefined
);

interface PreloaderProviderProps {
  children: ReactNode;
}

export const PreloaderProvider = ({ children }: PreloaderProviderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!sessionStorage.getItem("app-loaded")) {
      sessionStorage.setItem("app-loaded", "true");
    }
  }, []);

  const handleTransitionStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  usePageTransition(handleTransitionStart, handleTransitionComplete, 3000);

  return (
    <PreloaderContext.Provider value={{ isLoading }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloader = (): PreloaderContextType => {
  const context = useContext(PreloaderContext);
  if (context === undefined) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }
  return context;
};
