import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@/components/ui/IconButton";

function useGoBack() {
  let nav: ReturnType<typeof useNavigate> | null = null;
  try {
    nav = useNavigate();
  } catch (error) {
    nav = null;
  }

  return useCallback(() => {
    if (nav) {
      nav(-1);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    }
  }, [nav]);
}

export default function BackButtons() {
  const goBack = useGoBack();

  return (
    <>
      <div className="fixed left-4 bottom-4 z-[70]">
        <IconButton label="Back" onClick={goBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      </div>

      <div className="fixed right-4 bottom-4 z-[70]">
        <button
          type="button"
          onClick={goBack}
          className="rounded-xl px-4 h-11 inline-flex items-center gap-2 border border-slate-300/80 bg-white/90 dark:bg-slate-900/85 backdrop-blur-sm shadow-sm hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 6l-6 6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
    </>
  );
}
