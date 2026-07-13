import AnomalyList from "../components/AnomalyList";

function AnomaliesPage({ uploadResult }) {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Step 04</p>
        <h1 className="font-display text-4xl text-white mb-2">Unusual days</h1>
        <p className="text-mist">Days where {uploadResult.number_col} broke from the normal pattern, with the likely cause.</p>
      </div>
      <AnomalyList anomalies={uploadResult.anomalies} />
    </div>
  );
}

export default AnomaliesPage;