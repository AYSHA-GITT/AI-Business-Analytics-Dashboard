import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Plot from "react-plotly.js";
import toast from "react-hot-toast";

function WhatIfSimulator() {
  const [growthPct, setGrowthPct] = useState(0);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (value) => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/simulate", { growth_adjustment_pct: value });
      setSimulation(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg text-white mb-1">What if growth changes?</h3>
      <p className="text-mist text-sm mb-6">Drag the slider to simulate faster or slower growth than the current trend.</p>

      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-sm text-rose w-14">-30%</span>
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={growthPct}
          onChange={(e) => setGrowthPct(Number(e.target.value))}
          onMouseUp={() => runSimulation(growthPct)}
          onTouchEnd={() => runSimulation(growthPct)}
          className="flex-1 accent-amber"
        />
        <span className="font-mono text-sm text-teal w-14 text-right">+30%</span>
      </div>

      <motion.div key={growthPct} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-center mb-6">
        <span className="font-mono text-3xl text-white font-medium">
          {growthPct > 0 ? "+" : ""}{growthPct}%
        </span>
      </motion.div>

      {loading && <p className="text-mist text-sm text-center font-mono">recalculating…</p>}

      {simulation && !loading && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-mist font-mono mb-1">baseline</p>
              <p className="font-mono text-lg text-white">₹{(simulation.base_total_30d / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-mist font-mono mb-1">adjusted</p>
              <p className="font-mono text-lg text-amber">₹{(simulation.adjusted_total_30d / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-mist font-mono mb-1">difference</p>
              <p className={`font-mono text-lg ${simulation.difference >= 0 ? "text-teal" : "text-rose"}`}>
                {simulation.difference >= 0 ? "+" : ""}₹{(simulation.difference / 100000).toFixed(1)}L
              </p>
            </div>
          </div>

          <Plot
            data={[
              { x: simulation.historical.map((r) => r.date), y: simulation.historical.map((r) => r.actual), type: "scatter", mode: "lines", line: { color: "#FFFFFF" }, name: "Actual" },
              { x: simulation.base_forecast.map((r) => r.date), y: simulation.base_forecast.map((r) => r.predicted), type: "scatter", mode: "lines", line: { color: "#9CA3AF", dash: "dot" }, name: "Baseline forecast" },
              { x: simulation.adjusted_forecast.map((r) => r.date), y: simulation.adjusted_forecast.map((r) => r.predicted), type: "scatter", mode: "lines", line: { color: "#F5A623", width: 3 }, name: "Adjusted forecast" },
            ]}
            layout={{
              autosize: true,
              margin: { t: 10, r: 20, l: 60, b: 40 },
              height: 380,
              legend: { orientation: "h", y: -0.2, font: { color: "#9CA3AF" } },
              font: { family: "Inter, sans-serif", color: "#9CA3AF" },
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              xaxis: { gridcolor: "rgba(255,255,255,0.08)" },
              yaxis: { gridcolor: "rgba(255,255,255,0.08)" },
            }}
            useResizeHandler
            style={{ width: "100%" }}
            config={{ responsive: true }}
          />
        </>
      )}
    </div>
  );
}

export default WhatIfSimulator;