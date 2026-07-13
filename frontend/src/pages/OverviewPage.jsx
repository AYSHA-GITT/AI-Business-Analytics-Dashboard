import { motion } from "framer-motion";
import QualityReport from "../components/QualityReport";
import CategoryChart from "../components/CategoryChart";
import ModeInsights from "../components/ModeInsights";
import CustomMetricBuilder from "../components/CustomMetricBuilder";
import { exportDashboardAsPDF } from "../utils/exportPDF";
import toast from "react-hot-toast";

function OverviewPage({ uploadResult }) {
  const handleExport = () => {
    try {
      exportDashboardAsPDF(uploadResult);
      toast.success("Report downloaded");
    } catch (err) {
      toast.error("PDF failed: " + err.message);
    }
  };

  const numericColumns = Object.keys(uploadResult.column_info || {}).filter(
    (col) => uploadResult.column_info[col].detected_type === "number"
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-xs text-amber uppercase tracking-widest mb-2">Step 02</p>
          <h1 className="font-display text-4xl text-white mb-2">{uploadResult.filename}</h1>
          <p className="text-mist font-mono text-sm">{uploadResult.rows} rows · {uploadResult.columns} columns</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="glow-btn text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
        >
          Export PDF
        </motion.button>
      </div>

      <ModeInsights modeInsights={uploadResult.mode_insights} />
      <QualityReport qualityReport={uploadResult.quality_report} />
      <CustomMetricBuilder numericColumns={numericColumns} />
      <CategoryChart uploadResult={uploadResult} />
    </div>
  );
}

export default OverviewPage;