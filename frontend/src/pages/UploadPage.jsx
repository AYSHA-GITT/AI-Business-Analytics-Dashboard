import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FileUpload from "../components/FileUpload";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function UploadPage({ setUploadResult }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSuccess = async (data) => {
    setUploadResult(data);

    const { error } = await supabase.from("datasets").insert({
      user_id: user.id,
      filename: data.filename,
      mode: data.mode,
      rows: data.rows,
      columns: data.columns,
      column_info: data.column_info,
      quality_report: data.quality_report,
      forecast_data: data.forecast_data,
      anomalies: data.anomalies,
      mode_insights: data.mode_insights,
      preview: data.preview,
      date_col: data.date_col,
      number_col: data.number_col,
    });

    if (error) {
      toast.error("Saved locally, but couldn't save to your account: " + error.message);
    } else {
      toast.success("Saved to your dashboard history");
    }

    navigate("/overview");
  };

  return (
    <div className="max-w-2xl">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-mono text-xs text-amber uppercase tracking-widest mb-2"
      >
        Step 01
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="font-display text-4xl mb-3"
      >
        Bring in your <span className="glow-text">data</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-mist mb-10 leading-relaxed"
      >
        Upload a CSV or Excel export — sales, marketing, inventory, or your own spending.
        We'll read the columns, check the quality, forecast what's next, and flag anything unusual.
      </motion.p>
      <FileUpload onUploadSuccess={handleSuccess} />
    </div>
  );
}

export default UploadPage;