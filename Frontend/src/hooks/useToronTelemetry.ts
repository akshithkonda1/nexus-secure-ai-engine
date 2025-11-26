export type ToronTelemetryEvent =
  | "render_error"
  | "interaction"
  | "state_anomaly"
  | "network_error"
  | "message_send";

export type TelemetryPayload = Record<string, unknown>;

// Minimal telemetry hook that never throws and never leaks PII.
export const useToronTelemetry = () => (event: ToronTelemetryEvent, payload: TelemetryPayload = {}) => {
  try {
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => !key.toLowerCase().includes("user") && !key.toLowerCase().includes("email")),
    );
    // In production this could forward to a secure endpoint.
    console.debug("[ToronTelemetry]", event, sanitizedPayload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Telemetry logging failed", error);
  }
};

export default useToronTelemetry;
