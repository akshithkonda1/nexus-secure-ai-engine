export default function TestResultSummary({ result }) {
  return (
    <div className="result-card">
      <h3>Final Results</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
