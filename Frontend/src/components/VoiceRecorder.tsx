import { useEffect, useRef, useState } from "react";

/**
 * VoiceRecorder
 * - Press to start/stop recording.
 * - Animated waveform using WebAudio AnalyserNode.
 * - Attempts to use Web Speech API for transcription if available (best-effort).
 */
type Props = {
  active?: boolean;
  onStart?: () => void;
  onStop?: (transcript: string, audioBlob: Blob | null) => void;
  onError?: (err: unknown) => void;
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
  }

  function stop() {
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => (isRec ? stop() : start())}
        className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
          isRec
            ? "border-red-500 bg-red-600 text-white hover:bg-red-700"
            : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
        }`}
        title={isRec ? "Stop recording" : "Record voice"}
        aria-label={isRec ? "Stop recording" : "Record voice"}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M19 11a7 7 0 01-14 0M12 21v-3" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {/* waveform canvas (shows only when recording) */}
      <div className="hidden sm:block">
        <canvas
          ref={canvasRef}
          width={160}
          height={32}
          className={`rounded-md ${isRec ? "opacity-100" : "opacity-0"} transition-opacity`}
        />
      </div>

      {permDenied && (
        <span className="text-xs text-red-600 dark:text-red-400">Mic permission denied.</span>
      )}
    </div>
  );
}

/** Try Web Speech API for quick transcript (best-effort, safe fallback). */
async function tryTranscribe(_blob: Blob): Promise<string> {
  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SR) return "";

  return new Promise<string>((resolve) => {
    try {
      const rec = new SR();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      let text = "";
      rec.onresult = (e: any) => {
        text = e.results?.[0]?.[0]?.transcript || "";
      };
      rec.onend = () => resolve(text);
      rec.onerror = () => resolve("");
      rec.start();
      setTimeout(() => {
        try {
          rec.stop();
        } catch {}
      }, 5000);
    } catch {
      resolve("");
    }
  });
}
