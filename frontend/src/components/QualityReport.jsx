import { motion } from "framer-motion";

function QualityReport({ qualityReport }) {
  if (!qualityReport) return null;
  const { quality_score, total_issues, issues } = qualityReport;

  const scoreColor = quality_score >= 80 ? "text-teal" : quality_score >= 60 ? "text-amber" : "text-rose";
  const severityStyles = {
    high: "bg-rose/10 text-rose",
    medium: "bg-amber/10 text-amber",
    low: "bg-white/10 text-mist",
  };

  return (
    <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-6">
      <div className="flex justify-between items-baseline mb-4">
        <h3 className="font-display text-lg text-white">Data quality</h3>
        <span className={`font-mono text-2xl font-medium ${scoreColor}`}>
          {quality_score}<span className="text-mist text-sm">/100</span>
        </span>
      </div>

      {total_issues === 0 ? (
        <p className="text-mist text-sm">No issues found — clean dataset.</p>
      ) : (
        <div className="space-y-2">
          {issues.map((issue, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <span className={`text-xs font-mono px-2 py-1 rounded-full whitespace-nowrap ${severityStyles[issue.severity]}`}>
                {issue.severity}
              </span>
              <p className="text-sm text-white/80">{issue.message}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default QualityReport;