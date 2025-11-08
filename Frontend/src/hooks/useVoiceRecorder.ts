import { useCallback, useEffect, useRef, useState } from "react";

type RecorderStatus = "idle" | "recording" | "error";

type UseVoiceRecorderResult = {
  status: RecorderStatus;
  levels: number[];
  elapsed: number;
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  cancel: () => void;
};

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [levels, setLevels] = useState<number[]>(new Array(24).fill(0));
  const [elapsed, setElapsed] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bucketSize = Math.max(1, Math.floor(data.length / 24));
    const buckets = new Array(24).fill(0).map((_, idx) => {
      const start = idx * bucketSize;
      const end = start + bucketSize;
      const slice = data.slice(start, end);
      const avg = slice.reduce((acc, v) => acc + v, 0) / (slice.length || 1);
      return Math.min(1, avg / 255);
    });
    setLevels(buckets);
    rafRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const start = useCallback(async () => {
    if (status === "recording") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      contextRef.current = context;
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (evt) => {
        if (evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setElapsed(0);
      setStatus("recording");
      updateLevels();
      const timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      recorder.addEventListener("stop", () => {
        clearInterval(timer);
        analyser.disconnect();
        source.disconnect();
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [status, updateLevels]);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    analyserRef.current = null;
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;
    setLevels(new Array(24).fill(0));
    setElapsed(0);
    setStatus("idle");
  }, []);

  const stop = useCallback(async () => {
    if (status !== "recording") return null;
    return new Promise<Blob | null>((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        cleanup();
        resolve(null);
        return;
      }
      const finalize = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        cleanup();
        resolve(blob);
      };
      recorder.addEventListener("stop", finalize, { once: true });
      recorder.stop();
    });
  }, [cleanup, status]);

  const cancel = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  return { status, levels, elapsed, start, stop, cancel };
}
