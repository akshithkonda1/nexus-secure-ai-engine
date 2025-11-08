import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

type VoiceRecorderProps = {
  onCapture: (payload: { transcript: string; blob: Blob | null }) => void;
  compact?: boolean;
};

export function VoiceRecorder({ onCapture, compact }: VoiceRecorderProps) {
  const { status, levels, elapsed, start, stop, cancel } = useVoiceRecorder();

  const isRecording = status === "recording";

  const friendlyTimer = useMemo(() => {
    const mins = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, "0");
    const secs = (elapsed % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [elapsed]);

  const handleToggle = useCallback(async () => {
    if (isRecording) {
      const blob = await stop();
      const transcript = createMockTranscript(elapsed);
      onCapture({ transcript, blob });
      return;
    }
    try {
      await start();
    } catch (error) {
      console.error("Voice recorder start failed", error);
      cancel();
    }
  }, [cancel, elapsed, isRecording, onCapture, start, stop]);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-white/80 text-[color:var(--brand)] shadow-soft transition hover:border-[color:var(--brand)] hover:text-white hover:bg-[color:var(--brand)] dark:bg-white/10"
        aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
      >
        {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      <div className="hidden sm:flex h-12 items-center overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white/60 px-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-end gap-[3px]">
          {levels.map((value, idx) => (
            <motion.span
              key={idx}
              animate={{ height: isRecording ? `${Math.max(6, value * 32)}px` : "6px" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-[3px] rounded-full bg-[color:var(--brand)]/80"
              style={{ opacity: isRecording ? Math.max(0.25, value) : 0.35 }}
            />
          ))}
        </div>
        <span className="ml-3 text-xs font-medium tracking-wide text-[rgb(var(--text)/0.6)]">
          {isRecording ? friendlyTimer : compact ? "" : "Voice"}
        </span>
      </div>
    </div>
  );
}

function createMockTranscript(seconds: number) {
  if (!seconds) return "Voice memo";
  if (seconds < 5) return "Voice memo (short)";
  if (seconds < 15) return "Voice memo – summarise this snippet";
  return "Voice memo – please transcribe and summarise.";
}
