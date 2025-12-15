export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        <select aria-label="Model" defaultValue="gpt4o" className="input-select">
          <option value="gpt4o">CreateGPT v4.0</option>
          <option value="gpt35">CreateGPT v3.5</option>
        </select>
        <button type="button" className="ghost">Configuration</button>
        <button type="button" className="ghost">Session</button>
        <button type="button" className="ghost">Export</button>
      </div>
    </header>
  );
}
