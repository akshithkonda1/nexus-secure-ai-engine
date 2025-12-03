import React from "react";
import WidgetModalFrame from "../WidgetModalFrame";
import CalendarPanel from "../../panels/CalendarPanel";

const CalendarWidgetModal: React.FC = () => {
  return (
    <WidgetModalFrame title="Calendar">
      <CalendarPanel />
    </WidgetModalFrame>
  );
};

export default CalendarWidgetModal;
