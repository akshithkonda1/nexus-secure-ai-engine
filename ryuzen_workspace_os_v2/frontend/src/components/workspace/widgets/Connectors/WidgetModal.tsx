import React from "react";
import WidgetModalFrame from "../WidgetModalFrame";
import ConnectorsPanel from "../../panels/ConnectorsPanel";

const ConnectorsWidgetModal: React.FC = () => {
  return (
    <WidgetModalFrame title="Connectors">
      <ConnectorsPanel />
    </WidgetModalFrame>
  );
};

export default ConnectorsWidgetModal;
