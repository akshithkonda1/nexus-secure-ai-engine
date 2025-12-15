export default function TopBar() {
  return (
    <header className="topbar">
      <select aria-label="Model" defaultValue="Toron" className="input-select">
      </select>
      <div className="topbar-actions">
        <button type="button" className="ghost">
          Configuration
        </button>
        <button type="button" className="ghost">
          Export
        </button>
      </div>
    </header>
  );
}
