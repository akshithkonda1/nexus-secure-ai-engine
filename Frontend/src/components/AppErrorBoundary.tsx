import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function AppErrorBoundary() {
  const err = useRouteError();
  const message = isRouteErrorResponse(err)
    ? `${err.status} ${err.statusText}`
    : err instanceof Error
      ? err.message
      : "Something went wrong";

  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold">We hit a snag.</h1>
        <p className="mt-2 text-sm opacity-75">{message}</p>
        <button
          onClick={() => location.reload()}
          className="mt-5 rounded-xl bg-[rgba(var(--brand),1)] px-4 py-2 text-white"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
