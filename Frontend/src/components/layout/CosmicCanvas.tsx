import React from "react";

const CosmicCanvas: React.FC = () => {
  return (
    <div className="cosmic-canvas" aria-hidden>
      <div className="cosmic-layer aurora" />
      <div className="cosmic-layer glow" />
      <div className="cosmic-stars" />
    </div>
  );
};

export default CosmicCanvas;
