import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api";
import toast from "react-hot-toast";

function ComparePage() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [labelA, setLabelA] = useState("This Period");
  const [labelB, setLabelB] = useState("Previous Period");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!fileA || !fileB) { toast.error("Please select both files"); return; }
    const formData = new FormData();
    formData.append("file_a", fileA);
    formData.append("file_b", fileB);
    formData.append("label_a", labelA);
    formData.append("label_b", labelB);
    setLoading(true);
    try {
      const response = await api.post("/api/compare", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
      setResult(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-4xl text-white mb-2">Compare datasets</h1>
        <p className="text-mist">Upload two files — two time periods, two regions, or two teams — and see the difference.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[{ label: labelA, setLabel: setLabelA, setFile: setFileA }, { label: labelB, setLabel: setLabelB, setFile: setFileB }].map((f, idx) => (
          <div key={idx} className="glass rounded-2xl p-6">
            <label className="text-sm text-mist mb-2 block">Label</label>
            <input
              value={f.label}
              onChange={(e) => f.setLabel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4"
            />
            <label className="text-sm text-mist mb-2 block">File {idx === 0 ? "A" : "B"}</label>
            <input type="file" accept=".csv,.xlsx" onChange={(e) => f.setFile(e.target.files[0])} className="text-sm text-mist" />
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCompare}
        disabled={loading}
        className="glow-btn text-white px-6 py-3 rounded-full text-sm font-medium disabled:opacity-40"
      >
        {loading ? "Comparing…" : "Compare"}
      </motion.button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-mist font-mono mb-1">{result.label_a}</p>
              <p className="font-mono text-2xl text-white">₹{(result.total_a / 100000).toFixed(1)}L</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-mist font-mono mb-1">{result.label_b}</p>
              <p className="font-mono text-2xl text-white">₹{(result.total_b / 100000).toFixed(1)}L</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-xs text-mist font-mono mb-1">change</p>
              <p className={`font-mono text-2xl ${result.change_pct >= 0 ? "text-teal" : "text-rose"}`}>
                {result.change_pct >= 0 ? "+" : ""}{result.change_pct}%
              </p>
            </div>
          </div>

          {result.category_breakdown && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg text-white mb-4">Breakdown by category</h3>
              <div className="space-y-2">
                {result.category_breakdown.map((row, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                    <span className="text-sm text-white">{row.category}</span>
                    <div className="flex gap-4 items-center font-mono text-sm">
                      <span className="text-mist">₹{row.value_a.toLocaleString()}</span>
                      <span className="text-mist">→</span>
                      <span className="text-white">₹{row.value_b.toLocaleString()}</span>
                      <span className={row.difference >= 0 ? "text-teal" : "text-rose"}>
                        ({row.difference >= 0 ? "+" : ""}{row.difference.toLocaleString()})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default ComparePage;