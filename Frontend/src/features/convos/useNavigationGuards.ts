import { useEffect } from "react";

export function useNavigationGuards() {
  useEffect(() => {
    const stopSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const stopAnchors = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const isExternal = a.target === "_blank" || /^https?:\/\//i.test(href);
      if (!isExternal && (href === "" || href === "#" || href === "/")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("submit", stopSubmit, true);
    document.addEventListener("click", stopAnchors, true);
    return () => {
      document.removeEventListener("submit", stopSubmit, true);
      document.removeEventListener("click", stopAnchors, true);
    };
  }, []);
}
