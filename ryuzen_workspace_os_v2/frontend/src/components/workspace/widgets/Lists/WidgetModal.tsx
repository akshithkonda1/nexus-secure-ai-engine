import React from "react";
import WidgetModalFrame from "../WidgetModalFrame";
import ListsPanel from "../../panels/ListsPanel";

const ListsWidgetModal: React.FC = () => {
  return (
    <WidgetModalFrame title="Lists">
      <ListsPanel />
    </WidgetModalFrame>
  );
};

export default ListsWidgetModal;
