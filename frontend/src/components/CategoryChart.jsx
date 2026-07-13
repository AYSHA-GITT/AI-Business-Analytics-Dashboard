import { useState } from "react";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";

const chartTypes = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
];

function CategoryChart({ uploadResult }) {
  const [chartType, setChartType] = useState("bar");
  const { column_info, preview } = uploadResult;

  const numberCol = Object.keys(column_info).find((c) => column_info[c].detected_type === "number");
  const categoryCol = Object.keys(column_info).find((c) => column_info[c].detected_type === "category");

  if (!numberCol || !categoryCol) return null;

  const categories = preview.map((row) => row[categoryCol]);
  const values = preview.map((row) => row[numberCol]);
  const colors = ["#2DD4BF", "#F5A623", "#8B5CF6", "#F43F5E", "#9CA3AF"];

  const getPlotData = () => {
    if (chartType === "pie") {
      return [{ labels: categories, values, type: "pie", marker: { colors }, textinfo: "label+percent" }];
    }
    if (chartType === "line") {
      return [{ x: categories, y: values, type: "scatter", mode: "lines+markers", line: { color: "#2DD4BF" }, marker: { color: "#2DD4BF", size: 8 } }];
    }
    return [{ x: categories, y: values, type: "bar", marker: { color: "#2DD4BF" } }];
  };

  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg text-white">{numberCol} by {categoryCol}</h3>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {chartTypes.map((ct) => (
            <button
              key={ct.value}
              onClick={() => setChartType(ct.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                chartType === ct.value ? "glow-btn text-white" : "text-mist hover:text-white"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>
      <Plot
        data={getPlotData()}
        layout={{
          autosize: true,
          margin: { t: 10, r: 20, l: 50, b: 40 },
          height: 340,
          font: { family: "Inter, sans-serif", color: "#9CA3AF" },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          showlegend: chartType === "pie",
          xaxis: { gridcolor: "rgba(255,255,255,0.08)" },
          yaxis: { gridcolor: "rgba(255,255,255,0.08)" },
        }}
        useResizeHandler
        style={{ width: "100%" }}
        config={{ responsive: true }}
      />
    </motion.div>
  );
}

export default CategoryChart;