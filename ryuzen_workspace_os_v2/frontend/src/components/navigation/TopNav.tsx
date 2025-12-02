import React from "react";
import { Link } from "react-router-dom";

const TopNav: React.FC = () => (
  <header className="top-nav">
    <Link to="/workspace" className="brand">
      Ryuzen Workspace OS V2
    </Link>
  </header>
);

export default TopNav;
