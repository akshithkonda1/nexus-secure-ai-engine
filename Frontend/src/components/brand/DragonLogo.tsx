import React from "react";

export interface DragonLogoProps {
  size?: number;
  className?: string;
}

export const DragonLogo: React.FC<DragonLogoProps> = ({ size, className }) => (
  <img
    src="/assets/ryuzen-dragon.svg"
    alt="Ryuzen logo"
    width={size}
    height={size}
    className={`ryuzen-logo ${className ?? ""}`}
  />
);

export default DragonLogo;
