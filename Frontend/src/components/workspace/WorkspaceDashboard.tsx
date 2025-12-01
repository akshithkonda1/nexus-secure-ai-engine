import React from "react";

import BottomBar from "@/components/workspace/bottom/BottomBar";
import CalendarWidget from "@/components/workspace/widgets/CalendarWidget";
import FocusWidget from "@/components/workspace/widgets/FocusWidget";
import NotesWidget from "@/components/workspace/widgets/NotesWidget";
import TasksWidget from "@/components/workspace/widgets/TasksWidget";

const WorkspaceDashboard: React.FC = () => {
  return (
    <section className="relative flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FocusWidget />
        <TasksWidget />
        <CalendarWidget />
        <NotesWidget />
      </div>
      <BottomBar />
    </section>
  );
};

export default WorkspaceDashboard;
