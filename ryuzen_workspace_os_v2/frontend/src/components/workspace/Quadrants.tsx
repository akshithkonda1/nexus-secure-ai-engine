import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/Quadrants.module.css";

const quadrants = [
  { path: "/workspace/lists", label: "Lists", subtitle: "Intentions" },
  { path: "/workspace/calendar", label: "Calendar", subtitle: "Time" },
  { path: "/workspace/tasks", label: "Tasks", subtitle: "Actions" },
  { path: "/workspace/connectors", label: "Connectors", subtitle: "Systems" },
];

const Quadrants: React.FC = () => {
  return (
    <div className={styles.quadrantsGrid}>
      {quadrants.map((q) => (
        <Link key={q.path} to={q.path} className={styles.quadrantCard}>
          <div className={styles.quadrantTitle}>{q.label}</div>
          <div className={styles.quadrantSubtitle}>{q.subtitle}</div>
        </Link>
      ))}
    </div>
  );
};

export default Quadrants;
