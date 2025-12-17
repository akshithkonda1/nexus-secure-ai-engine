import { PropsWithChildren } from "react";
import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-root">
      <div className="layout-shell">
        <Sidebar />
        <div className="content-area">
          <div className="canvas">
            <TopBar />
            <div className="canvas-body">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
