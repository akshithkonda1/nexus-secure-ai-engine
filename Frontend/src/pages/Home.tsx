import { ArrowRight, MessageSquare, Layout, Zap, Sparkles, Target, Brain, Lock, Puzzle, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn, bg, text, border, shadow } from "../utils/theme";

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

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className={cn(
              "mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
              "border-orange-200 bg-orange-50 text-orange-700",
              "dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
            )}>
              <Zap className="h-4 w-4" />
              Powered by ALOE Framework
            </div>

            {/* Headline */}
            <h1 className={cn(
              "mb-6 text-5xl font-bold tracking-tight lg:text-6xl",
              text.primary
            )}>
              Human-Centric AI for
              <span className={cn(
                "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
                "dark:from-blue-400 dark:to-purple-400"
              )}> Decisive Action</span>
            </h1>

            {/* Subheading */}
            <p className={cn(
              "mb-10 text-xl leading-relaxed",
              text.secondary
            )}>
              Ryuzen is a cognitive operating system that prioritizes honesty and accuracy —
              preserving uncertainty, exposing model disagreement, and empowering you to make better decisions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/toron")}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]",
                  "dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-400/20"
                )}
              >
                Start with Toron AI
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate("/workspace")}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border px-8 py-4 text-base font-semibold",
                  border.default,
                  text.primary,
                  bg.surface,
                  "transition-all hover:border-[var(--accent-primary)] hover:shadow-md"
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
      <section className={cn("border-b px-6 py-16", border.subtle, bg.elevated)}>
        <div className="mx-auto max-w-4xl text-center">
          <div className={cn(
            "mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-blue-500 to-purple-600"
          )}>
            <Target className="h-7 w-7 text-white" />
          </div>

          <h2 className={cn("mb-6 text-3xl font-bold", text.primary)}>
            Why Ryuzen Exists
          </h2>

          <p className={cn("mb-6 text-lg leading-relaxed", text.secondary)}>
            Most AI systems project false confidence. They give you one answer without showing uncertainty or alternative perspectives.
            This creates blind spots in your decision-making.
          </p>

          <p className={cn("text-lg font-semibold leading-relaxed", text.primary)}>
            Ryuzen is different. We believe in <span className="text-blue-600 dark:text-blue-400">epistemic honesty</span> —
            showing you when AI models agree, when they disagree, and where uncertainty exists.
            This transparency enables both accurate answers <em>and</em> critical thinking.
          </p>
        </div>
      </section>

      {/* Core Products */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className={cn("mb-4 text-4xl font-bold", text.primary)}>
              Two Products, One Philosophy
            </h2>
            <p className={cn("text-lg", text.secondary)}>
              Built on ALOE — AI as a Life Orchestration Engine
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* TORON Card */}
            <div className={cn(
              "group rounded-2xl border p-8",
              border.subtle,
              bg.surface,
              shadow.md,
              "transition-all hover:shadow-xl hover:-translate-y-1"
            )}>
              <div className={cn(
                "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl",
                "bg-gradient-to-br from-blue-500 to-blue-600"
              )}>
                <MessageSquare className="h-8 w-8 text-white" />
              </div>

              <h3 className={cn("mb-4 text-2xl font-bold", text.primary)}>
                TORON
              </h3>

              <p className={cn(
                "mb-6 text-base font-semibold",
                "text-blue-600 dark:text-blue-400"
              )}>
                Multi-Model AI Reasoning Engine
              </p>

              <p className={cn("mb-6 leading-relaxed", text.secondary)}>
                TORON orchestrates <strong>11 leading AI models</strong> to give you more complete, nuanced answers.
                Instead of hiding disagreement, TORON <em>shows you</em> where models agree and where they differ —
                empowering you to make informed decisions with confidence.
              </p>

              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>Your data, your choice:</strong> Complete control over what's shared, even on free tier
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>No vendor lock-in:</strong> Access to Claude, GPT, Gemini, Llama, and more in one place
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>Transparent reasoning:</strong> See how different AI models approach your question
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>Lightning fast:</strong> Get comprehensive answers in 1.8-4 seconds
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/toron")}
                className={cn(
                  "group/btn flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "transition-all hover:shadow-lg hover:shadow-blue-500/25",
                  "dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-400/20"
                )}
              >
                Try Toron Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>

            {/* Workspace Card */}
            <div className={cn(
              "group rounded-2xl border p-8",
              border.subtle,
              bg.surface,
              shadow.md,
              "transition-all hover:shadow-xl hover:-translate-y-1"
            )}>
              <div className={cn(
                "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl",
                "bg-gradient-to-br from-purple-500 to-purple-600"
              )}>
                <Layout className="h-8 w-8 text-white" />
              </div>

              <h3 className={cn("mb-4 text-2xl font-bold", text.primary)}>
                Workspace
              </h3>

              <p className={cn(
                "mb-6 text-base font-semibold",
                "text-purple-600 dark:text-purple-400"
              )}>
                AI-Powered Productivity Environment
              </p>

              <p className={cn("mb-6 leading-relaxed", text.secondary)}>
                Your unified command center for managing everything that matters.
                Workspace brings together your tasks, calendar, files, and team collaboration —
                all enhanced by AI intelligence that learns your workflow.
              </p>

              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>Everything in one place:</strong> Calendar, tasks, lists, and connectors in a unified view
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>Connect your tools:</strong> 34 integrations including GitHub, Slack, Google Drive, and Linear
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>Your private workspace:</strong> Focus modes (Pages, Notes, Boards) remain completely private
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn(
                    "mt-0.5 h-5 w-5 flex-shrink-0",
                    "text-purple-600 dark:text-purple-400"
                  )} />
                  <span className={cn("text-sm", text.secondary)}>
                    <strong className={text.primary}>AI-enhanced:</strong> Smart suggestions and automation without compromising your control
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/workspace")}
                className={cn(
                  "group/btn flex w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 font-semibold",
                  "border-purple-600 text-purple-600",
                  "dark:border-purple-400 dark:text-purple-400",
                  "transition-all",
                  "hover:bg-purple-600 hover:text-white",
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
      <section className={cn("border-y px-6 py-20", border.subtle, bg.elevated)}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className={cn(
              "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl",
              "bg-gradient-to-br from-orange-500 to-amber-600"
            )}>
              <Zap className="h-8 w-8 text-white" />
            </div>

            <h2 className={cn("mb-4 text-4xl font-bold", text.primary)}>
              Built on ALOE
            </h2>

            <p className={cn("mx-auto max-w-2xl text-lg", text.secondary)}>
              AI as a Life Orchestration Engine — the cognitive operating system that powers Ryuzen's epistemic honesty
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Principle 1 */}
            <div className={cn("rounded-xl border p-6", border.subtle, bg.surface)}>
              <div className={cn(
                "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-blue-100 dark:bg-blue-900/30"
              )}>
                <Brain className={cn(
                  "h-6 w-6",
                  "text-blue-600 dark:text-blue-400"
                )} />
              </div>
              <h3 className={cn("mb-2 text-lg font-bold", text.primary)}>
                Epistemic Honesty
              </h3>
              <p className={cn("text-sm leading-relaxed", text.secondary)}>
                Preserves uncertainty, exposes disagreement between models, separates claims from evidence
              </p>
            </div>

            {/* Principle 2 */}
            <div className={cn("rounded-xl border p-6", border.subtle, bg.surface)}>
              <div className={cn(
                "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-purple-100 dark:bg-purple-900/30"
              )}>
                <Target className={cn(
                  "h-6 w-6",
                  "text-purple-600 dark:text-purple-400"
                )} />
              </div>
              <h3 className={cn("mb-2 text-lg font-bold", text.primary)}>
                User Agency
              </h3>
              <p className={cn("text-sm leading-relaxed", text.secondary)}>
                You maintain control. TORON learns from widgets but never accesses focus modes without permission
              </p>
            </div>

            {/* Principle 3 */}
            <div className={cn("rounded-xl border p-6", border.subtle, bg.surface)}>
              <div className={cn(
                "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-emerald-100 dark:bg-emerald-900/30"
              )}>
                <Lock className={cn(
                  "h-6 w-6",
                  "text-emerald-600 dark:text-emerald-400"
                )} />
              </div>
              <h3 className={cn("mb-2 text-lg font-bold", text.primary)}>
                Privacy-First
              </h3>
              <p className={cn("text-sm leading-relaxed", text.secondary)}>
                Optional telemetry across all tiers. Even free users control what data is shared
              </p>
            </div>

            {/* Principle 4 */}
            <div className={cn("rounded-xl border p-6", border.subtle, bg.surface)}>
              <div className={cn(
                "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-orange-100 dark:bg-orange-900/30"
              )}>
                <Puzzle className={cn(
                  "h-6 w-6",
                  "text-orange-600 dark:text-orange-400"
                )} />
              </div>
              <h3 className={cn("mb-2 text-lg font-bold", text.primary)}>
                Unified Integration
              </h3>
              <p className={cn("text-sm leading-relaxed", text.secondary)}>
                TORON's intelligence flows seamlessly into Workspace's organization, creating coherent workflows
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className={cn("mb-4 text-3xl font-bold", text.primary)}>
              Sustainable Business Model
            </h2>
            <p className={cn("text-lg", text.secondary)}>
              Two revenue streams ensure long-term sustainability without compromising privacy
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Consumer SaaS */}
            <div className={cn("rounded-xl border p-6", border.subtle, bg.surface)}>
              <h3 className={cn("mb-4 text-xl font-bold", text.primary)}>
                Consumer Subscriptions
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn(
                    "h-4 w-4",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={text.secondary}><strong>Student:</strong> $9.99/mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn(
                    "h-4 w-4",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={text.secondary}><strong>Pro:</strong> $19.99/mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={cn(
                    "h-4 w-4",
                    "text-blue-600 dark:text-blue-400"
                  )} />
                  <span className={text.secondary}><strong>Premium:</strong> $49.99/mo (currently $99.99)</span>
                </div>
              </div>
            </div>

            {/* Telemetry Marketplace */}
            <div className={cn("rounded-xl border p-6", border.subtle, bg.surface)}>
              <h3 className={cn("mb-4 text-xl font-bold", text.primary)}>
                Telemetry Marketplace
              </h3>
              <p className={cn("mb-4 text-sm leading-relaxed", text.secondary)}>
                Anonymized multi-model comparison data sold to AI providers at <strong>$125K per provider annually</strong>.
                Provides insights unavailable through internal data collection.
              </p>
              <p className={cn("text-xs italic", text.tertiary)}>
                Always optional. Users control participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={cn("border-t px-6 py-16", border.subtle, bg.elevated)}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={cn("mb-6 text-3xl font-bold", text.primary)}>
            Ready to Experience Epistemic Honesty?
          </h2>

          <p className={cn("mb-8 text-lg", text.secondary)}>
            Start with TORON or explore Workspace. Your journey toward better decision-making begins here.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/toron")}
              className={cn(
                "group flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white",
                "bg-gradient-to-r from-blue-600 to-purple-600",
                "transition-all hover:shadow-xl hover:shadow-blue-500/25 hover:scale-[1.02]",
                "dark:from-blue-500 dark:to-purple-500 dark:hover:shadow-blue-400/20"
              )}
            >
              Launch Toron
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate("/workspace")}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-8 py-4 text-lg font-semibold",
                border.default,
                text.primary,
                bg.surface,
                "transition-all hover:border-[var(--accent-primary)] hover:shadow-md"
              )}
            >
              Open Workspace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
