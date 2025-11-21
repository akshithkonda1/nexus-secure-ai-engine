export default function ToronGrid({ children }) {
  return (
    <div
      className="
        grid
        grid-cols-3
        gap-6
        p-6
        w-full
        h-full
      "
    >
      {children}
    </div>
  );
}
