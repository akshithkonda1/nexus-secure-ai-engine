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
          <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-900 text-neutral-200 leading-relaxed">
            {!hasStarted ? (
              <WelcomeScreen onStart={() => setHasStarted(true)} />
            ) : (
              <div className="relative flex min-h-screen flex-col">
                <header className="relative z-[10] mx-6 mt-4 flex items-center justify-between rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 p-6 md:p-8 text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01]">
                  <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
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
                    className="fixed inset-0 z-[30] flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={closeToron}
                  >
                    <div className="max-w-4xl w-full px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative z-[30] rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 p-6 md:p-8 text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_8px_40px_rgba(0,0,0,0.25)] scale-[1.01] animate-[fadeIn_120ms_ease-out]">
                        <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Toron Analysis</h2>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                          Toron surfaces reasoning-backed cards to keep your workspace organized.
                        </p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {cards.map((card) => (
                            <div
                              key={card.id}
                              className="relative overflow-hidden rounded-2xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 p-5 md:p-6 text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01] backdrop-blur-xl"
                            >
                              <div className="absolute inset-0 pointer-events-none rounded-2xl backdrop-blur-xl" />
                              <div className="relative text-sm font-semibold text-neutral-800 dark:text-neutral-100">{card.title}</div>
                              <p className="relative mt-2 text-sm text-neutral-700 dark:text-neutral-300">{card.reason}</p>
                              <div className="relative mt-4 flex gap-2 text-sm">
                                <button
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-neutral-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01] hover:bg-emerald-500"
                                  onClick={() => card.onAccept?.(card.id)}
                                >
                                  Accept
                                </button>
                                <button
                                  className="rounded-full border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-1 text-neutral-800 dark:text-neutral-200 transition-transform duration-300 hover:scale-[1.01]"
                                  onClick={() => card.onIgnore?.(card.id)}
                                >
                                  Ignore
                                </button>
                                <button
                                  className="rounded-full border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-1 text-neutral-800 dark:text-neutral-200 transition-transform duration-300 hover:scale-[1.01]"
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
