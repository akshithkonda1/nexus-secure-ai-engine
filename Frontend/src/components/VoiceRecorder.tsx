import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

type VoiceRecorderProps = {
  onCapture: (payload: { transcript: string; blob: Blob | null }) => void;
  compact?: boolean;
};

export default function VoiceRecorder({ active, onStart, onStop, onError }: Props) {
  const [isRec, setIsRec] = useState(!!active);
  const [permDenied, setPermDenied] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsRec(!!active);
  }, [active]);

  async function start() {
    try {
      setPermDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      sourceRef.current = src;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyserRef.current = analyser;

      animate();

      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stopAnimation();
        stopStreamTracks();
        await cleanupAudio();

        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const transcript = await tryTranscribe(blob).catch(() => "");
        onStop?.(transcript, blob);
      };
      rec.start();

      setIsRec(true);
      onStart?.();
    } catch (err) {
      stopAnimation();
      stopStreamTracks();
      await cleanupAudio();
      setIsRec(false);

      const isPermissionError =
        err instanceof DOMException &&
        ["NotAllowedError", "SecurityError", "AbortError"].includes(err.name);
      setPermDenied(isPermissionError);

      onError?.(err);
    }
    try {
      mediaRef.current?.stop();
      stopStreamTracks();
      setIsRec(false);
    } catch (e) {
      onError?.(e);
    }
  }

  async function cleanupAudio() {
    try {
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      if (audioCtxRef.current) {
        await audioCtxRef.current.close().catch(() => undefined);
      }
      sourceRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current = null;
    } catch {}
  }

  function stopStreamTracks() {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function animate() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0085FF";
      ctx.beginPath();

      const slice = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += slice;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
  }

  function stopAnimation() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }

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
