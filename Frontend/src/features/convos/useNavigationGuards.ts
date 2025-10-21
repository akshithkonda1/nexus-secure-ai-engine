import { useEffect } from "react";

export function useNavigationGuards() {
  useEffect(() => {
    const stopSubmit = (e: Event) => e.preventDefault();
    const stopAnchors = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("a");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      const isExternal = el.getAttribute("target") === "_blank";
      const looksLikeNav = href === "/" || href === "#" || href === "" || href.startsWith("http") === false;
      if (!isExternal && looksLikeNav) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener("submit", stopSubmit, true);
    document.addEventListener("click", stopAnchors, true);
    return () => {
      document.removeEventListener("submit", stopSubmit, true);
      document.removeEventListener("click", stopAnchors, true);
    };
  }, []);
}
