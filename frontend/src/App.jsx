import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Layout from "./layout/Layout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import UploadPage from "./pages/UploadPage";
import OverviewPage from "./pages/OverviewPage";
import ForecastPage from "./pages/ForecastPage";
import AnomaliesPage from "./pages/AnomaliesPage";
import ChatPage from "./pages/ChatPage";
import HistoryPage from "./pages/HistoryPage";
import ComparePage from "./pages/ComparePage";
import SharedPage from "./pages/SharedPage";

function App() {
  const [uploadResult, setUploadResult] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-slate font-mono">
        loading…
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/shared/:id" element={<SharedPage />} />

        {!user ? (
          <Route
            path="*"
            element={showAuth ? <AuthPage /> : <LandingPage onGetStarted={() => setShowAuth(true)} />}
          />
        ) : (
          <Route path="/" element={<Layout uploadResult={uploadResult} />}>
            <Route index element={<UploadPage setUploadResult={setUploadResult} />} />
            <Route path="history" element={<HistoryPage setUploadResult={setUploadResult} />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="overview" element={uploadResult ? <OverviewPage uploadResult={uploadResult} /> : <Navigate to="/" />} />
            <Route path="forecast" element={uploadResult ? <ForecastPage uploadResult={uploadResult} /> : <Navigate to="/" />} />
            <Route path="anomalies" element={uploadResult ? <AnomaliesPage uploadResult={uploadResult} /> : <Navigate to="/" />} />
            <Route path="chat" element={uploadResult ? <ChatPage /> : <Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;