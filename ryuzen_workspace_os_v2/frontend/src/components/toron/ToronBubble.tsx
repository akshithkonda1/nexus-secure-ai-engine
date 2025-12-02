import React from "react";

interface Props {
  notification?: string;
}

const ToronBubble: React.FC<Props> = ({ notification }) => {
  return (
    <div className="toron-bubble">
      <span>Toron</span>
      {notification && <span className="toron-notification">{notification}</span>}
    </div>
  );
};

export default ToronBubble;
