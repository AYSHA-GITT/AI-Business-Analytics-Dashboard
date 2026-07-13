import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import BackgroundOrbs from "./BackgroundOrbs";

function Layout({ uploadResult }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-void relative">
      <BackgroundOrbs />
      <Sidebar hasData={!!uploadResult} />
      <main className="flex-1 p-10 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Layout;