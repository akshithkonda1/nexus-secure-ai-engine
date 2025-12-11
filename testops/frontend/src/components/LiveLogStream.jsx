export default function LiveLogStream({ logs }) {
  return (
    <div className="log-window">
      <h3>Live Logs</h3>
      <pre>
        {logs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </pre>
    </div>
  );
}
