import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Upload", num: "01", end: true },
  { to: "/history", label: "History", num: "—", alwaysOn: true },
  { to: "/compare", label: "Compare", num: "—", alwaysOn: true },
  { to: "/overview", label: "Overview", num: "02" },
  { to: "/forecast", label: "Forecast", num: "03" },
  { to: "/anomalies", label: "Anomalies", num: "04" },
  { to: "/chat", label: "Ask Data", num: "05" },
];

function Sidebar({ hasData }) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 shrink-0 h-screen sticky top-0 p-4 z-10"
    >
      <div className="glass rounded-3xl h-full flex flex-col overflow-hidden">
        <div className="px-6 py-8 border-b border-white/10">
          <p className="font-display text-xl tracking-tight glow-text">Ledger.</p>
          <p className="text-xs text-mist mt-1 font-mono truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const disabled = !hasData && item.num !== "01" && !item.alwaysOn;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`relative flex items-center gap-3 mx-3 my-1 px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive ? "text-white" : "text-mist hover:text-white"
                } ${disabled ? "pointer-events-none opacity-30" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.2), rgba(139,92,246,0.2))", boxShadow: "0 0 20px rgba(139,92,246,0.25)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative font-mono text-xs text-mist">{item.num}</span>
                <span className="relative font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="text-xs text-mist hover:text-white font-mono transition-colors"
          >
            ← log out
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;