import axios from "axios";
import { create } from "zustand";

import { getItem, setItem } from "@/lib/storage";

export type DebateResponse = {
  model: string;
  text: string;
  score: number;
};

export type DebateHistoryItem = {
  id: string;
  query: string;
  timestamp: number;
  responses: DebateResponse[];
  consensus: string;
  overallScore: number | null;
};

type TelemetryPayload = {
  event: string;
  data?: Record<string, unknown>;
};

type DebateState = {
  query: string;
  responses: DebateResponse[];
  consensus: string;
  overallScore: number | null;
  loading: boolean;
  error: string | null;
  queryCount: number;
  history: DebateHistoryItem[];
  telemetryOptIn: boolean;
  submitQuery: (value?: string) => Promise<void>;
  setQuery: (value: string) => void;
  setOptIn: (value: boolean) => Promise<void>;
  logSurveyFeedback: (feedback: "up" | "down") => Promise<void>;
  clearError: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const TELEMETRY_ENDPOINT = "/api/telemetry";

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const resolveTelemetryOptIn = async () => {
  const stored = await getItem<string>("nexus.telemetryOptIn");
  return stored === "true";
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let activeQueryController: AbortController | null = null;

async function postTelemetry(payload: TelemetryPayload) {
  try {
    await http.post(TELEMETRY_ENDPOINT, payload);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Telemetry request failed", error);
    }
  }
}

export const useDebateStore = create<DebateState>((set, get) => ({
  query: "",
  responses: [],
  consensus: "",
  overallScore: null,
  loading: false,
  error: null,
  queryCount: 0,
  history: [],
  telemetryOptIn: false,
  async submitQuery(value) {
    const pendingQuery = (value ?? get().query).trim();
    if (!pendingQuery) {
      set({ error: "Please enter a question to ask the models." });
      return;
    }

    set({ loading: true, error: null, query: pendingQuery });

    let lastError: unknown;
    if (activeQueryController) {
      activeQueryController.abort();
    }
    const controller = new AbortController();
    activeQueryController = controller;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await http.post(
          "/api/debate",
          { query: pendingQuery },
          { signal: controller.signal },
        );
        const data = response.data as {
          responses?: DebateResponse[];
          consensus?: string;
          overall_score?: number;
        };
        const responses = data.responses ?? [];
        const consensus = data.consensus ?? "";
        const overallScore = data.overall_score ?? null;

        set((state) => {
          const nextHistory: DebateHistoryItem[] = [
            {
              id: crypto.randomUUID?.() ?? `${Date.now()}`,
              query: pendingQuery,
              timestamp: Date.now(),
              responses,
              consensus,
              overallScore,
            },
            ...state.history,
          ].slice(0, 10);
          return {
            responses,
            consensus,
            overallScore,
            loading: false,
            error: null,
            queryCount: state.queryCount + 1,
            history: nextHistory,
          };
        });

        if (get().telemetryOptIn) {
          void postTelemetry({
            event: "query_submitted",
            data: { query: pendingQuery, consensus, overallScore },
          });
        }

        activeQueryController = null;
        return;
      } catch (error) {
        if ((error as Error)?.name === "CanceledError" || (error as DOMException)?.name === "AbortError") {
          activeQueryController = null;
          return;
        }
        lastError = error;
        if (attempt < 2) {
          await delay(500 * (attempt + 1));
        }
      }
    }

    activeQueryController = null;

    set({
      loading: false,
      error: "We couldn’t reach the debate service. Please try again shortly.",
    });

    if (get().telemetryOptIn) {
      void postTelemetry({
        event: "query_failed",
        data: { message: lastError instanceof Error ? lastError.message : String(lastError) },
      });
    }
  },
  setQuery(value) {
    set({ query: value });
  },
  async setOptIn(value) {
    set({ telemetryOptIn: value });
    await setItem("nexus.telemetryOptIn", value ? "true" : "false");
    await postTelemetry({
      event: "telemetry_opt_in",
      data: { value },
    });
  },
  async logSurveyFeedback(feedback) {
    if (!get().telemetryOptIn) {
      return;
    }
    await postTelemetry({
      event: "beta_survey",
      data: { feedback, queryCount: get().queryCount },
    });
  },
  clearError() {
    set({ error: null });
  },
}));

resolveTelemetryOptIn()
  .then((value) => {
    useDebateStore.setState({ telemetryOptIn: value });
  })
  .catch((error) => {
    if (import.meta.env.DEV) {
      console.error("Failed to hydrate telemetry opt-in", error);
    }
  });
