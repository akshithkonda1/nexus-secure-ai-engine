import "@testing-library/jest-dom/vitest";

if (!globalThis.crypto?.randomUUID) {
  const cryptoRef: Partial<Crypto> = { ...globalThis.crypto };
  cryptoRef.randomUUID = () => Math.random().toString(36).slice(2);
  // @ts-expect-error - we are polyfilling for the test environment only
  globalThis.crypto = cryptoRef as Crypto;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  const matchMediaMock = (query: string): MediaQueryList => ({
    matches: query.includes("dark"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
  // @ts-expect-error jsdom polyfill
  window.matchMedia = matchMediaMock;
}
