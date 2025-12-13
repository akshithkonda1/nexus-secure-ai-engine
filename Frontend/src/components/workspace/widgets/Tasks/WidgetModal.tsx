import React from "react";
import WidgetModalFrame from "../WidgetModalFrame";
import TasksPanel from "../../panels/TasksPanel";

const TasksWidgetModal: React.FC = () => {
  return (
    <WidgetModalFrame title="Tasks">
      <TasksPanel />
    </WidgetModalFrame>
  );
};

export default TasksWidgetModal;
