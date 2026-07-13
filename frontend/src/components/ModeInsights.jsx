import { motion } from "framer-motion";

function ModeInsights({ modeInsights }) {
  if (!modeInsights || modeInsights.mode === "sales") return null;

  const { mode, insights, stockout_alerts } = modeInsights;
  const modeLabels = {
    marketing: "Marketing Performance",
    inventory: "Inventory Status",
    personal_finance: "Spending Breakdown",
  };

  return (
    <div className="space-y-4">
      <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-6">
        <h3 className="font-display text-lg text-white mb-4">{modeLabels[mode] || "Insights"}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-mist font-mono mb-1">{insight.label}</p>
              <p className="font-mono text-xl text-white">{insight.value}</p>
              {insight.detail && <p className="text-xs text-mist mt-1">{insight.detail}</p>}
            </div>
          ))}
        </div>
      </motion.div>

      {stockout_alerts && stockout_alerts.length > 0 && (
        <div className="space-y-2">
          {stockout_alerts.map((alert, idx) => (
            <div key={idx} className="bg-rose/10 border-l-4 border-l-rose rounded-r-lg p-4">
              <p className="text-sm text-white font-medium">{alert.product}</p>
              <p className="text-sm text-rose">{alert.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModeInsights;