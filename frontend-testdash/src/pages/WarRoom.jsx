import React, { useEffect, useState } from "react";
import { getHistory, getWarRoom } from "../api/testAPI";
import ErrorList from "../components/ErrorList.jsx";

export default function WarRoom() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const history = await getHistory();
        const runs = history.runs || [];
        const collected = [];
        for (const run of runs) {
          const war = await getWarRoom(run.run_id);
          collected.push(...(war.events || []).map((evt) => ({ ...evt, run_id: run.run_id })));
        }
        collected.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setEvents(collected);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="page">
      <h1>War Room</h1>
      <p className="muted">All logged errors sorted by severity and timestamp.</p>
      <ErrorList events={events} />
    </div>
  );
}
