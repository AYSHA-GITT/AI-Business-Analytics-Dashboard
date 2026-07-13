import { motion } from "framer-motion";

function AnomalyList({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return <div className="glass rounded-2xl p-6 text-mist text-sm">No unusual patterns detected in this data.</div>;
  }

  return (
    <div className="space-y-3">
      {anomalies.map((anomaly, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ x: 4 }}
          className={`glass rounded-2xl p-5 border-l-4 ${anomaly.direction === "spike" ? "border-l-teal" : "border-l-rose"}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-sm text-white">{anomaly.date}</span>
            <span className={`text-xs font-mono px-2 py-1 rounded-full ${anomaly.direction === "spike" ? "bg-teal/10 text-teal" : "bg-rose/10 text-rose"}`}>
              {anomaly.direction === "spike" ? "▲ spike" : "▼ drop"}
            </span>
          </div>
          <p className="text-sm text-mist mb-1 font-mono">
            ₹{anomaly.value.toLocaleString()} vs avg ₹{anomaly.average.toLocaleString()}
          </p>
          <p className="text-sm text-white/80">{anomaly.explanation}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default AnomalyList;