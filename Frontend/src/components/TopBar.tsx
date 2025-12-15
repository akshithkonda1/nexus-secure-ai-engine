export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button type="button" className="ghost">Session</button>
        <button type="button" className="ghost">Config</button>
        <button type="button" className="ghost">Export</button>
      </div>
    </header>
  );
}
