import { describe, expect, it } from "vitest";

import { safeFormatDistance, safeMessage, safeSession, safeTimestamp } from "@/shared/lib/toronSafe";

describe("toron safe utils", () => {
  it("handles missing timestamp", () => {
    expect(safeTimestamp(undefined)).toBe("unknown");
  });

  it("formats invalid date as recently", () => {
    expect(safeFormatDistance("not-a-date")).toBe("recently");
  });

  it("sanitizes malformed message", () => {
    const msg = safeMessage({});
    expect(msg.content).toBe("");
    expect(msg.role).toBe("assistant");
  });

  it("sanitizes malformed session", () => {
    const session = safeSession({ title: "" });
    expect(session.title).toBe("Untitled Session");
    expect(session.messages).toEqual([]);
  });
});
