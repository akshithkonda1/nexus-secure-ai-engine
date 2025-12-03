import React, { useMemo, useState } from "react";
import { BottomNav } from "../components/Navigation/BottomNav";
import { ModeSwitch } from "../components/Navigation/ModeSwitch";
import { WorkspaceBell } from "../components/Navigation/WorkspaceBell";
import { SystemBell } from "../components/Navigation/SystemBell";
import { CalendarWidget } from "../components/Corners/CalendarWidget";
import { ConnectorsWidget } from "../components/Corners/ConnectorsWidget";
import { EventsWidget } from "../components/Corners/EventsWidget";
import { ListsWidget } from "../components/Corners/ListsWidget";
import { PageSurface } from "../components/PageSurface/PageSurface";
import { WelcomeScreen } from "../components/Onboarding/WelcomeScreen";
import { ThemeProvider } from "./providers/ThemeProvider";
import { ModeProvider } from "./providers/ModeProvider";
import { WorkspaceProvider } from "./providers/WorkspaceProvider";
import { useToronStore } from "../state/toronStore";
import "../styles/globals.css";
import "../styles/animations.css";
import "../styles/tokens.css";

export const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showCorners, setShowCorners] = useState(false);
  const { isModalOpen, openToron, closeToron, cards } = useToronStore();

  const bellsVisible = useMemo(() => hasStarted && showCorners, [hasStarted, showCorners]);

  return (
    <ThemeProvider>
      <ModeProvider>
        <WorkspaceProvider>
          <div className="min-h-screen bg-bgElevated text-textMuted">
            {!hasStarted ? (
              <WelcomeScreen onStart={() => setHasStarted(true)} />
            ) : (
              <div className="relative flex min-h-screen flex-col">
                <header className="flex items-center justify-between px-6 py-4">
                  <div className="text-lg font-semibold tracking-tight">Workspace</div>
                  <div className="flex items-center gap-3">
                    <ModeSwitch />
                    {bellsVisible && (
                      <>
                        <WorkspaceBell />
                        <SystemBell />
                      </>
                    )}
                  </div>
                </header>
                <main className="flex-1 px-6 pb-28">
                  <PageSurface
                    onFirstKeystroke={() => setShowCorners(true)}
                    showCorners={showCorners}
                    onAnalyze={openToron}
                  />
                  {showCorners && (
                    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <ListsWidget />
                      <CalendarWidget />
                      <ConnectorsWidget />
                      <EventsWidget />
                    </section>
                  )}
                </main>
                <BottomNav onAnalyze={openToron} />
                {isModalOpen && (
                  <div
                    role="presentation"
                    className="fixed inset-0 z-40 flex items-center justify-center bg-bgElevated/70"
                    onClick={closeToron}
                  >
                    <div className="max-w-4xl w-full px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="rounded-2xl bg-bgElevated/90 p-6 shadow-2xl ring-1 ring-neutral-800">
                        <h2 className="text-xl font-semibold">Toron Analysis</h2>
                        <p className="mt-2 text-sm text-textMuted">
                          Toron surfaces reasoning-backed cards to keep your workspace organized.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {cards.map((card) => (
                            <div
                              key={card.id}
                              className="rounded-xl border border-borderStrong bg-bgElevated p-4 shadow hover:shadow-lg transition"
                            >
                              <div className="text-sm font-semibold text-textMuted">{card.title}</div>
                              <p className="mt-2 text-sm text-textMuted">{card.reason}</p>
                              <div className="mt-4 flex gap-2 text-sm">
                                <button
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-textPrimary transition hover:bg-emerald-500"
                                  onClick={() => card.onAccept?.(card.id)}
                                >
                                  Accept
                                </button>
                                <button
                                  className="rounded-full border border-borderStrong px-3 py-1 text-textMuted transition hover:bg-bgElevated"
                                  onClick={() => card.onIgnore?.(card.id)}
                                >
                                  Ignore
                                </button>
                                <button
                                  className="rounded-full border border-borderStrong px-3 py-1 text-textMuted transition hover:bg-bgElevated"
                                  onClick={() => card.onExplain?.(card.id)}
                                >
                                  Explain
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </WorkspaceProvider>
      </ModeProvider>
    </ThemeProvider>
  );
};

export default App;
