import Plot from "react-plotly.js";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";

function ForecastChart({ forecastData }) {
  if (!forecastData || forecastData.error) {
    return (
      <div className="glass rounded-2xl p-6 text-mist text-sm">
        {forecastData?.error || "Not enough data to forecast yet."}
      </div>
    );
  }

  const { historical, forecast } = forecastData;
  const lastActual = historical[historical.length - 1]?.actual || 0;
  const totalPredicted = forecast.reduce((sum, r) => sum + r.predicted, 0);
  const avgPredicted = totalPredicted / forecast.length;
  const avgHistorical = historical.reduce((sum, r) => sum + r.actual, 0) / historical.length;
  const trendPct = avgHistorical !== 0 ? ((avgPredicted - avgHistorical) / avgHistorical) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -4, boxShadow: "0 0 30px rgba(139,92,246,0.15)" }} className="glass rounded-2xl p-5">
          <p className="text-xs text-mist font-mono mb-1">last known value</p>
          <p className="font-mono text-xl text-white"><AnimatedNumber value={lastActual} prefix="₹" /></p>
        </motion.div>
        <motion.div whileHover={{ y: -4, boxShadow: "0 0 30px rgba(245,166,35,0.2)" }} className="glass rounded-2xl p-5">
          <p className="text-xs text-mist font-mono mb-1">predicted total ({forecast.length}d)</p>
          <p className="font-mono text-xl text-amber"><AnimatedNumber value={Math.round(totalPredicted)} prefix="₹" /></p>
        </motion.div>
        <motion.div whileHover={{ y: -4, boxShadow: "0 0 30px rgba(45,212,191,0.2)" }} className="glass rounded-2xl p-5">
          <p className="text-xs text-mist font-mono mb-1">trend vs. history</p>
          <p className={`font-mono text-xl ${trendPct >= 0 ? "text-teal" : "text-rose"}`}>
            {trendPct >= 0 ? "+" : ""}{trendPct.toFixed(1)}%
          </p>
        </motion.div>
      </div>

      <div className="glass rounded-2xl p-6">
        <Plot
          data={[
            { x: forecast.map((r) => r.date), y: forecast.map((r) => r.upper_bound), type: "scatter", mode: "lines", line: { width: 0 }, showlegend: false, hoverinfo: "skip" },
            { x: forecast.map((r) => r.date), y: forecast.map((r) => r.lower_bound), type: "scatter", mode: "lines", fill: "tonexty", fillcolor: "rgba(245, 166, 35, 0.15)", line: { width: 0 }, name: "Confidence range" },
            { x: historical.map((r) => r.date), y: historical.map((r) => r.actual), type: "scatter", mode: "lines", line: { color: "#FFFFFF" }, name: "Actual" },
            { x: forecast.map((r) => r.date), y: forecast.map((r) => r.predicted), type: "scatter", mode: "lines", line: { color: "#F5A623", dash: "dash", width: 3 }, name: "Predicted" },
          ]}
          layout={{
            autosize: true,
            margin: { t: 10, r: 20, l: 60, b: 40 },
            height: 440,
            legend: { orientation: "h", y: -0.2, font: { color: "#9CA3AF" } },
            font: { family: "Inter, sans-serif", color: "#9CA3AF" },
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            xaxis: { rangeslider: { visible: true, thickness: 0.08 }, gridcolor: "rgba(255,255,255,0.08)" },
            yaxis: { gridcolor: "rgba(255,255,255,0.08)" },
          }}
          useResizeHandler
          style={{ width: "100%" }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}

export default ForecastChart;