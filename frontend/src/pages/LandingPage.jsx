import { motion } from "framer-motion";
import BackgroundOrbs from "../layout/BackgroundOrbs";

const features = [
  { num: "01", title: "Auto-charts", desc: "Drop in a CSV and get instant visualizations — no setup." },
  { num: "02", title: "Forecasting", desc: "30-day predictions with confidence ranges, powered by real ML." },
  { num: "03", title: "Anomaly detection", desc: "Unusual spikes and drops, flagged with plain-English reasons." },
  { num: "04", title: "Ask your data", desc: "Type a question in plain English, get a real answer." },
  { num: "05", title: "What-if simulator", desc: "Drag a slider to see how growth changes affect revenue." },
  { num: "06", title: "Saved dashboards", desc: "Every upload is saved to your account for later." },
];

function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      <BackgroundOrbs />

      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-6xl mx-auto">
        <p className="font-display text-xl glow-text">Ledger.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="glow-btn text-white px-5 py-2 rounded-full text-sm font-medium"
        >
          Log In / Sign Up
        </motion.button>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-8 pt-20 pb-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs text-amber uppercase tracking-widest mb-4"
        >
          AI-powered business analytics
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl md:text-6xl leading-tight mb-6"
        >
          Turn any spreadsheet into a <span className="glow-text">forecast</span>, in seconds
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-mist text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload sales, marketing, or inventory data. Get automatic charts, quality
          checks, 30-day forecasts, anomaly detection — and a chat that answers
          questions about your own numbers.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="glow-btn text-white px-8 py-3 rounded-full font-medium"
        >
          Get Started — it's free
        </motion.button>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-8 pb-24 grid md:grid-cols-3 gap-6">
        {features.map((f, idx) => (
          <motion.div
            key={f.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            whileHover={{ y: -6, boxShadow: "0 0 30px rgba(139,92,246,0.2)" }}
            className="glass rounded-2xl p-6"
          >
            <p className="font-mono text-xs text-amber mb-3">{f.num}</p>
            <h3 className="font-display text-lg mb-2">{f.title}</h3>
            <p className="text-mist text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <footer className="relative z-10 text-center pb-10 text-mist text-xs font-mono">
        built as a final-year engineering project
      </footer>
    </div>
  );
}

export default LandingPage;