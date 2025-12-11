export default function StatusBubbles({ status }) {
  const statusMap = {
    running: "🟡 Running",
    complete: "🟢 Complete",
    failed: "🔴 Failed",
  };

  return (
    <div className="status-bubbles">
      <span>{statusMap[status] || "⚪ Idle"}</span>
    </div>
  );
}
