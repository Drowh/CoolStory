"use client";
import { useEffect } from "react";
import initFluidCursor from "@/hooks/useFluidCursor";

const FluidCursor = () => {
  useEffect(() => {
    initFluidCursor();
  }, []);
  return (
    <div className="fixed top-0 left-0 z-[100] pointer-events-none">
      <canvas id="fluid" className="w-screen h-screen" />
    </div>
  );
};

export default FluidCursor;
