import React from "react";
import { Link } from "react-router-dom";

const osLinks = [
  { path: "/workspace/pages", label: "Pages" },
  { path: "/workspace/notes", label: "Notes" },
  { path: "/workspace/boards", label: "Boards" },
  { path: "/workspace/flows", label: "Flows" },
  { path: "/workspace/toron", label: "Toron" },
];

const OSBar: React.FC = () => {
  return (
    <nav className="osbar">
      {osLinks.map((link) => (
        <Link key={link.path} to={link.path} className="osbar-link">
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default OSBar;
