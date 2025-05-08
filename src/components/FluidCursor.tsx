'use client';
import { useEffect } from 'react';
import useFluidCursor from '@/hooks/useFluidCursor';

const FluidCursor = () => {
  useEffect(() => {
    const canvas = document.getElementById('fluid');
    if (canvas) {
      useFluidCursor();
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      <canvas id="fluid" className="w-screen h-screen" />
    </div>
  );
};

export default FluidCursor;