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
          <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-900 text-textPrimary">
            {!hasStarted ? (
              <WelcomeScreen onStart={() => setHasStarted(true)} />
            ) : (
              <div className="relative flex min-h-screen flex-col">
                <header className="relative mx-6 mt-4 flex items-center justify-between rounded-3xl bg-tile bg-tileGradient border border-tileBorder px-6 py-4 text-textPrimary shadow-tile before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:border-tileBorderStrong hover:shadow-tileStrong">
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
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
                    onClick={closeToron}
                  >
                    <div className="max-w-4xl w-full px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative rounded-3xl bg-tile bg-tileGradient border border-tileBorder p-6 text-textPrimary shadow-tile before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:border-tileBorderStrong hover:shadow-tileStrong">
                        <h2 className="text-xl font-semibold">Toron Analysis</h2>
                        <p className="mt-2 text-sm text-textSecondary">
                          Toron surfaces reasoning-backed cards to keep your workspace organized.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {cards.map((card) => (
                            <div
                              key={card.id}
                              className="rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 text-textMuted shadow-tile transition hover:border-tileBorderStrong"
                            >
                              <div className="text-sm font-semibold text-textPrimary">{card.title}</div>
                              <p className="mt-2 text-sm text-textMuted">{card.reason}</p>
                              <div className="mt-4 flex gap-2 text-sm">
                                <button
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-textPrimary shadow-tile transition hover:bg-emerald-500"
                                  onClick={() => card.onAccept?.(card.id)}
                                >
                                  Accept
                                </button>
                                <button
                                  className="rounded-full border border-tileBorder px-3 py-1 text-textMuted transition hover:border-tileBorderStrong"
                                  onClick={() => card.onIgnore?.(card.id)}
                                >
                                  Ignore
                                </button>
                                <button
                                  className="rounded-full border border-tileBorder px-3 py-1 text-textMuted transition hover:border-tileBorderStrong"
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
