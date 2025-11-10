export default function SkeletonBlock() {
  return (
    <div className="panel p-6 space-y-4">
      <div className="skeleton skeleton-line w-48"></div>
      <div className="skeleton skeleton-line w-80"></div>
      <div className="skeleton skeleton-line w-64"></div>
    </div>
  );
}
