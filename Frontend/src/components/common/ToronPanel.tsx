import Draggable from "react-draggable";
import { useRef } from "react";

export default function ToronPanel({ children, className = "" }) {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
      <div
        ref={nodeRef}
        className={`relative w-[350px] h-[170px] rounded-[14px]
          bg-gradient-to-br from-[#0d111f]/90 to-[#09121f]/70
          border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.60)]
          backdrop-blur-2xl p-5 flex flex-col justify-between select-none
          transition-all ${className}`}
      >
        <div className="drag-handle cursor-move absolute top-2 right-2 text-white/30 hover:text-white/60">
          ⠿
        </div>

        {children}
      </div>
    </Draggable>
  );
}
