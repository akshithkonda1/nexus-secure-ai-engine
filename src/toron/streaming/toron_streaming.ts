// src/toron/streaming/toron_streaming.ts

export type ToronStreamPhase =
  | "gathering"
  | "validating"
  | "escalating"
  | "synthesizing"

export type ToronStreamTier = "T1" | "T2" | "OPUS"

export type ToronStreamEvent = {
  type: "state" | "progress" | "final"
  tier?: ToronStreamTier
  phase?: ToronStreamPhase
  confidence_estimate?: number
  partial_output?: string
}

export type ToronStreamListener = (event: ToronStreamEvent) => void

export class ToronStreamer {
  private listeners: Set<ToronStreamListener> = new Set()

  subscribe(listener: ToronStreamListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  emit(event: ToronStreamEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch {
        // Streaming must never crash the app
      }
    })
  }

  clear(): void {
    this.listeners.clear()
  }
}
