import { ArrowRight, MessageSquare, Layout, Zap, Sparkles, Brain, Lock, Puzzle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn, bg, text, border, shadow } from "../utils/theme";
import RyuzenLogo from "../assets/ryuzen-logo.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Hero Section */}
      <section className={cn(
        "relative overflow-hidden border-b",
        border.subtle,
        "bg-gradient-to-br from-slate-50 via-white to-blue-50",
        "dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20"
      )}>
        {/* Background decoration */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0",
            "bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_60%)]",
            "dark:bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.06),transparent_60%)]"
          )}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className={cn(
              "mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold",
              "border-orange-200 bg-orange-50 text-orange-700",
              "dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
              "shadow-sm"
            )}>
              <Zap className="h-4 w-4" />
              Powered by ALOE Framework
            </div>

            {/* Headline */}
            <h1 className={cn(
              "mb-8 text-6xl font-bold tracking-tight lg:text-7xl",
              text.primary
            )}>
              Human-Centric AI for
              <br />
              <span className={cn(
                "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
                "dark:from-blue-400 dark:to-purple-400"
              )}>Decisive Action</span>
            </h1>

            {/* Subheading */}
            <p className={cn(
              "mx-auto mb-12 max-w-2xl text-xl leading-relaxed",
              text.secondary
            )}>
              A cognitive operating system built on epistemic honesty — preserving uncertainty, 
              exposing model disagreement, and empowering better decision-making through transparency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/toron")}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-10 py-5 text-lg font-semibold text-white",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]",
                  "dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-400/25"
                )}
              >
                Start with Toron AI
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate("/workspace")}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border-2 px-10 py-5 text-lg font-semibold",
                  border.default,
                  text.primary,
                  bg.surface,
                  "transition-all hover:border-blue-600 hover:shadow-lg",
                  "dark:hover:border-blue-400"
                )}
              >
                Explore Workspace
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className={cn("px-6 py-24", bg.elevated)}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-8 inline-flex">
              <img 
                src={RyuzenLogo} 
                alt="Ryuzen Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>

            <h2 className={cn("mb-8 text-4xl font-bold lg:text-5xl", text.primary)}>
              Why Ryuzen Exists
            </h2>

            <div className="space-y-6">
              <p className={cn("text-xl leading-relaxed", text.secondary)}>
                Most AI systems project false confidence. They give you one answer without showing 
                uncertainty or alternative perspectives, creating blind spots that can compromise 
                decision-making entirely.
              </p>

              <p className={cn(
                "text-xl font-semibold leading-relaxed",
                text.primary
              )}>
                Ryuzen takes a different approach. We show you when AI models agree, when they disagree, 
                and where uncertainty exists — using external data sources so you can think critically 
                and learn. This transparency enables both accurate answers and informed judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Products */}
      <section className={cn("border-y px-6 py-24", border.subtle)}>
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <h2 className={cn("mb-4 text-4xl font-bold lg:text-5xl", text.primary)}>
              Two Products, One Philosophy
            </h2>
            <p className={cn("text-xl", text.secondary)}>
              Built on ALOE — AI as a Life Orchestration Engine
            </p>
          </div>

          {/* Product Cards */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* TORON Card */}
            <div className={cn(
              "group rounded-3xl border-2 p-10",
              border.subtle,
              bg.surface,
              shadow.lg,
              "transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300",
              "dark:hover:border-blue-700"
            )}>
              {/* Icon */}
              <div className={cn(
                "mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl",
                "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50",
                "dark:shadow-blue-500/30"
              )}>
                <MessageSquare className="h-10 w-10 text-white" />
              </div>

              {/* Title */}
              <h3 className={cn("mb-3 text-3xl font-bold", text.primary)}>
                TORON
              </h3>

              {/* Subtitle */}
              <p className={cn(
                "mb-6 text-lg font-semibold",
                "text-blue-600 dark:text-blue-400"
              )}>
                Multi-Model AI Reasoning Engine
              </p>

              {/* Description */}
              <p className={cn("mb-8 text-lg leading-relaxed", text.secondary)}>
                TORON orchestrates <strong className={text.primary}>11 leading AI models with 40+ knowledge sources</strong> to 
                deliver comprehensive, nuanced answers. Instead of hiding disagreement, TORON reveals 
                where models align and where they diverge — drawing from Google, Bing, academic libraries, 
                Reddit, and more to empower confident, informed decisions.
              </p>

              {/* Features */}
              <div className="mb-8 space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>Your data, your choice</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      Complete control over sharing, even on free tiers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>No vendor lock-in</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      Access Claude, ChatGPT, Gemini, Llama, and more in one place
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>Transparent reasoning</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      See how different models approach problems and refine them into actionable answers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>Lightning fast</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      Comprehensive answers delivered quickly and reliably
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/toron")}
                className={cn(
                  "group/btn flex w-full items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]",
                  "dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-400/25"
                )}
              >
                Try Toron Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>

            {/* Workspace Card */}
            <div className={cn(
              "group rounded-3xl border-2 p-10",
              border.subtle,
              bg.surface,
              shadow.lg,
              "transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-purple-300",
              "dark:hover:border-purple-700"
            )}>
              {/* Icon */}
              <div className={cn(
                "mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl",
                "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50",
                "dark:shadow-purple-500/30"
              )}>
                <Layout className="h-10 w-10 text-white" />
              </div>

              {/* Title */}
              <h3 className={cn("mb-3 text-3xl font-bold", text.primary)}>
                Workspace
              </h3>

              {/* Subtitle */}
              <p className={cn(
                "mb-6 text-lg font-semibold",
                "text-purple-600 dark:text-purple-400"
              )}>
                AI-Powered Productivity Environment
              </p>

              {/* Description */}
              <p className={cn("mb-8 text-lg leading-relaxed", text.secondary)}>
                Your unified command center for everything that matters. Workspace brings together 
                tasks, calendar, files, and collaboration — all enhanced by Toron intelligence that 
                adapts to your connected ecosystems and workflow patterns.
              </p>

              {/* Features */}
              <div className="mb-8 space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>Everything in one place</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      Calendar, tasks, lists, and connectors unified for natural cognitive flow
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>Connect your tools</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      34 integrations including GitHub, Google Drive, Notion, and Linear
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>Your private workspace</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      Focus modes (Pages, Notes, Boards) remain completely private
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle2 className={cn(
                    "mt-1 h-6 w-6 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <div>
                    <strong className={cn("text-base", text.primary)}>AI-enhanced automation</strong>
                    <p className={cn("text-sm", text.secondary)}>
                      Toron eliminates redundant tasks while preserving your control and agency
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/workspace")}
                className={cn(
                  "group/btn flex w-full items-center justify-center gap-3 rounded-xl border-2 px-8 py-4 text-lg font-semibold",
                  "border-purple-600 text-purple-600",
                  "dark:border-purple-400 dark:text-purple-400",
                  "transition-all",
                  "hover:bg-purple-600 hover:text-white hover:shadow-xl hover:scale-[1.02]",
                  "dark:hover:bg-purple-400 dark:hover:text-slate-900"
                )}
              >
                Explore Workspace
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ALOE Framework */}
      <section className={cn("px-6 py-24", bg.elevated)}>
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-20 text-center">
            <div className={cn(
              "mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl",
              "bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/50",
              "dark:shadow-orange-500/30"
            )}>
              <Zap className="h-10 w-10 text-white" />
            </div>

            <h2 className={cn("mb-4 text-4xl font-bold lg:text-5xl", text.primary)}>
              Built on ALOE
            </h2>

            <p className={cn("mx-auto max-w-3xl text-xl", text.secondary)}>
              AI as a Life Orchestration Engine — the Human Centric cognitive framework powering Toron, Workspace and Ryuzen as a whole
            </p>
          </div>

          {/* Principles Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Principle 1: Epistemic Honesty */}
            <div className={cn(
              "rounded-2xl border-2 p-8",
              border.subtle,
              bg.surface,
              "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300",
              "dark:hover:border-blue-700"
            )}>
              <div className={cn(
                "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl",
                "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <Brain className={cn(
                  "h-7 w-7",
                  "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <h3 className={cn("mb-3 text-xl font-bold", text.primary)}>
                Epistemic Honesty
              </h3>
              <p className={cn("text-base leading-relaxed", text.secondary)}>
                Preserves uncertainty, exposes model disagreement, and separates claims from evidence-backed facts
              </p>
            </div>

            {/* Principle 2: User Agency */}
            <div className={cn(
              "rounded-2xl border-2 p-8",
              border.subtle,
              bg.surface,
              "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-purple-300",
              "dark:hover:border-purple-700"
            )}>
              <div className={cn(
                "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl",
                "bg-purple-100 dark:bg-purple-900/30"
              )}>
                <Sparkles className={cn(
                  "h-7 w-7",
                  "text-purple-600 dark:text-purple-400"
                )} />
              </div>
              <h3 className={cn("mb-3 text-xl font-bold", text.primary)}>
                User Agency
              </h3>
              <p className={cn("text-base leading-relaxed", text.secondary)}>
                You maintain complete control. TORON learns from conversations and widgets, 
                but never accesses private focus modes without explicit permission
              </p>
            </div>

            {/* Principle 3: Privacy-First */}
            <div className={cn(
              "rounded-2xl border-2 p-8",
              border.subtle,
              bg.surface,
              "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-300",
              "dark:hover:border-emerald-700"
            )}>
              <div className={cn(
                "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl",
                "bg-emerald-100 dark:bg-emerald-900/30"
              )}>
                <Lock className={cn(
                  "h-7 w-7",
                  "text-emerald-600 dark:text-emerald-400"
                )} />
              </div>
              <h3 className={cn("mb-3 text-xl font-bold", text.primary)}>
                Privacy-First
              </h3>
              <p className={cn("text-base leading-relaxed", text.secondary)}>
                Your personal data is never sold. Optional telemetry for anonymized AI model improvement 
                can be toggled anytime — participation helps advance both Toron and the broader AI ecosystem
              </p>
            </div>

            {/* Principle 4: Unified Integration */}
            <div className={cn(
              "rounded-2xl border-2 p-8",
              border.subtle,
              bg.surface,
              "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-orange-300",
              "dark:hover:border-orange-700"
            )}>
              <div className={cn(
                "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl",
                "bg-orange-100 dark:bg-orange-900/30"
              )}>
                <Puzzle className={cn(
                  "h-7 w-7",
                  "text-orange-600 dark:text-orange-400"
                )} />
              </div>
              <h3 className={cn("mb-3 text-xl font-bold", text.primary)}>
                Unified Integration
              </h3>
              <p className={cn("text-base leading-relaxed", text.secondary)}>
                TORON's intelligence flows seamlessly into Workspace, creating coherent workflows 
                and a truly unified ecosystem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={cn("border-t px-6 py-24", border.subtle)}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className={cn("mb-6 text-4xl font-bold lg:text-5xl", text.primary)}>
            Ready to Experience Human Centric AI?
          </h2>

          <p className={cn("mb-12 text-xl", text.secondary)}>
            Start with TORON or explore Workspace. Your journey toward better decision-making begins here.
          </p>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/toron")}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-10 py-5 text-lg font-semibold text-white",
                "bg-gradient-to-r from-blue-600 to-purple-600",
                "transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.03]",
                "dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-400/30"
              )}
            >
              Launch Toron
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate("/workspace")}
              className={cn(
                "group flex items-center gap-3 rounded-xl border-2 px-10 py-5 text-lg font-semibold",
                border.default,
                text.primary,
                bg.surface,
                "transition-all hover:border-purple-600 hover:shadow-xl hover:scale-[1.03]",
                "dark:hover:border-purple-400"
              )}
            >
              Open Workspace
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
