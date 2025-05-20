import React from "react";

interface CharCounterProps {
  count: number;
  maxCount: number;
  warningThreshold: number;
}

const CharCounter: React.FC<CharCounterProps> = ({ 
  count, 
  maxCount, 
  warningThreshold 
}) => (
  <div
    className={`text-xs ${
      count > warningThreshold ? "text-orange-500" : "text-gray-400"
    } mr-2`}
  >
    {count}/{maxCount}
  </div>
);

export default CharCounter; 