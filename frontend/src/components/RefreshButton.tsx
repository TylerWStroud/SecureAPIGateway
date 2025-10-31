import React, { useState, useRef } from "react";
import { RefreshWhite } from "../assets";
import "./Components.css";

type Props = {
  onClick: () => void;
};

export const RefreshButton: React.FC<Props> = ({ onClick }) => {
    const [rotation, setRotation] = useState(0);
    const canRotate = useRef(true);
    
  const handleRefreshHover = () => {
    if(canRotate.current){
    setRotation((prev) => prev + 360);
    canRotate.current = false;
    setTimeout(() => {
      canRotate.current = true;
    }, 2000);
    }
  };

  return (
    <button
        onClick={onClick}
        onMouseEnter={handleRefreshHover}
        className="refresh-button"
        >
      <img
        src={RefreshWhite}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 1s ease",
        }}
        alt="Refresh"
      />
    </button>
  );
};

export default RefreshButton;
