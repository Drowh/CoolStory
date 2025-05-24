"use client";
import { useEffect } from "react";
import initFluidCursor from "@/hooks/useFluidCursor";
import { useSettingsStore } from "@/stores/settingsStore";

const FluidCursor = () => {
  const fluidCursorEnabled = useSettingsStore(
    (state) => state.fluidCursorEnabled
  );

  useEffect(() => {
    if (fluidCursorEnabled) {
      initFluidCursor();
    }
  }, [fluidCursorEnabled]);

  if (!fluidCursorEnabled) return null;

  return (
    <div className="fixed top-0 left-0 z-[100] pointer-events-none">
      <canvas id="fluid" className="w-screen h-screen" />
    </div>
  );
};

export default FluidCursor;
