import React from "react";

import dragonLogo from "@/assets/ryuzen-dragon.svg";

export interface DragonLogoProps {
  size?: number;
  className?: string;
}

export const DragonLogo: React.FC<DragonLogoProps> = ({ size, className }) => (
  <img
    src={dragonLogo}
    alt="Ryuzen logo"
    width={size}
    height={size}
    className={`ryuzen-logo ${className ?? ""}`}
  />
);

export default DragonLogo;
