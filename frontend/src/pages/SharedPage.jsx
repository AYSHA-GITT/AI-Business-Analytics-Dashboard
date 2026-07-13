import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BackgroundOrbs from "../layout/BackgroundOrbs";
import QualityReport from "../components/QualityReport";
import CategoryChart from "../components/CategoryChart";
import ForecastChart from "../components/ForecastChart";
import AnomalyList from "../components/AnomalyList";
import ModeInsights from "../components/ModeInsights";

function SharedPage() {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase.from("datasets").select("*").eq("id", id).eq("is_public", true).single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setDataset(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-void flex items-center justify-center text-mist font-mono">loading…</div>;
  if (notFound) return <div className="min-h-screen bg-void flex items-center justify-center text-mist">This dashboard doesn't exist or is no longer public.</div>;

  return (
    <div className="min-h-screen bg-void p-10 relative">
      <BackgroundOrbs />
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div>
          <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Shared Dashboard · Read-only</p>
          <h1 className="font-display text-4xl text-white mb-2">{dataset.filename}</h1>
          <p className="text-mist font-mono text-sm">{dataset.rows} rows · {dataset.columns} columns</p>
        </div>

        <ModeInsights modeInsights={dataset.mode_insights} />
        <QualityReport qualityReport={dataset.quality_report} />
        <CategoryChart uploadResult={dataset} />
        {dataset.forecast_data && <ForecastChart forecastData={dataset.forecast_data} />}
        <AnomalyList anomalies={dataset.anomalies} />

        <p className="text-center text-mist text-xs font-mono pt-6">built with Ledger — an AI business analytics platform</p>
      </div>
    </div>
  );
}

export default SharedPage;