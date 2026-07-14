import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import toast from "react-hot-toast";

function CustomMetricBuilder({ numericColumns }) {
  const [formula, setFormula] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!formula.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/api/custom-metric", { formula });
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setMetrics((prev) => [...prev, response.data]);
        setFormula("");
        toast.success("Metric added");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Could not calculate metric");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-lg text-white mb-2">Custom metrics</h3>
      <p className="text-mist text-sm mb-4">
        Build your own formula using column names, e.g. <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-amber">revenue / units_sold</code>
      </p>

      {numericColumns && numericColumns.length > 0 && (
        <p className="text-xs text-mist font-mono mb-4">Available columns: {numericColumns.join(", ")}</p>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="e.g. revenue / units_sold"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-violet/50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAdd}
          disabled={loading}
          className="glow-btn text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          {loading ? "…" : "Add"}
        </motion.button>
      </div>

      <AnimatePresence>
        {metrics.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {metrics.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -2, boxShadow: "0 0 20px rgba(139,92,246,0.2)" }}
                className="bg-white/5 rounded-xl p-4"
              >
                <p className="text-xs text-mist font-mono mb-1">{m.formula}</p>
                <p className="font-mono text-xl text-white">{m.result.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomMetricBuilder;