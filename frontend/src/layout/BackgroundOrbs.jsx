import { motion } from "framer-motion";

function BackgroundOrbs() {
  return (
    <div className="bg-orbs">
      <motion.div
        className="orb"
        style={{ width: 500, height: 500, background: "#8B5CF6", top: "-10%", left: "-5%" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb"
        style={{ width: 450, height: 450, background: "#F5A623", top: "40%", right: "-10%" }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="orb"
        style={{ width: 350, height: 350, background: "#2DD4BF", bottom: "-10%", left: "30%" }}
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default BackgroundOrbs;