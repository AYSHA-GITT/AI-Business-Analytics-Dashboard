import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function HistoryPage({ setUploadResult }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchDatasets(); }, []);

  const fetchDatasets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("datasets").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false });
    if (error) toast.error("Could not load history: " + error.message);
    else setDatasets(data);
    setLoading(false);
  };

  const handleOpen = (dataset) => {
    setUploadResult({
      filename: dataset.filename, mode: dataset.mode, rows: dataset.rows, columns: dataset.columns,
      column_info: dataset.column_info, quality_report: dataset.quality_report, forecast_data: dataset.forecast_data,
      anomalies: dataset.anomalies, mode_insights: dataset.mode_insights, preview: dataset.preview,
      date_col: dataset.date_col, number_col: dataset.number_col,
    });
    navigate("/overview");
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) toast.error("Could not delete: " + error.message);
    else { toast.success("Deleted"); setDatasets((prev) => prev.filter((d) => d.id !== id)); }
  };

  const handleTogglePublic = async (dataset, e) => {
    e.stopPropagation();
    const newValue = !dataset.is_public;
    const { error } = await supabase.from("datasets").update({ is_public: newValue }).eq("id", dataset.id);
    if (error) { toast.error("Could not update: " + error.message); return; }
    setDatasets((prev) => prev.map((d) => (d.id === dataset.id ? { ...d, is_public: newValue } : d)));
    if (newValue) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${dataset.id}`);
      toast.success("Public link copied to clipboard");
    } else {
      toast.success("Dataset is now private");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white mb-2">Your dashboards</h1>
        <p className="text-mist">Previously analyzed datasets, saved to your account.</p>
      </div>

      {loading && <p className="text-mist font-mono text-sm">loading…</p>}
      {!loading && datasets.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-mist text-sm">No datasets yet — upload one to get started.</div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {datasets.map((dataset, idx) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3, boxShadow: "0 0 25px rgba(139,92,246,0.15)" }}
              onClick={() => handleOpen(dataset)}
              className="glass rounded-2xl p-5 flex justify-between items-center cursor-pointer"
            >
              <div>
                <p className="font-medium text-white">{dataset.filename}</p>
                <p className="text-xs text-mist font-mono mt-1">
                  {dataset.rows} rows · {dataset.columns} columns · {new Date(dataset.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => handleTogglePublic(dataset, e)}
                  className={`text-xs font-mono px-3 py-1 rounded-full ${dataset.is_public ? "bg-teal/10 text-teal" : "bg-white/10 text-mist"}`}
                >
                  {dataset.is_public ? "● public" : "○ make public"}
                </button>
                <button onClick={(e) => handleDelete(dataset.id, e)} className="text-xs text-rose font-mono hover:underline">
                  delete
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default HistoryPage;