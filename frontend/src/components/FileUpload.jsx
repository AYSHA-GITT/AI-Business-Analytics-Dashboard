import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const modes = [
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "inventory", label: "Inventory" },
  { value: "personal_finance", label: "Personal Finance" },
];

const stepLabels = {
  "waiting to start": "Queued…",
  "reading file": "Reading your file…",
  "detecting columns": "Detecting columns…",
  "forecasting": "Running forecast model…",
  "detecting anomalies": "Scanning for anomalies…",
  "sending alert email": "Sending alert email…",
};

function FileUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [mode, setMode] = useState("sales");
  const pollRef = useRef(null);
  const { user } = useAuth();

  const pollTaskStatus = (taskId) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/api/task-status/${taskId}`);
        const { state, step, result, error } = res.data;

        if (state === "PROCESSING") {
          setStatusText(stepLabels[step] || "Processing…");
        } else if (state === "SUCCESS") {
          clearInterval(pollRef.current);
          await api.post("/api/activate-dataset", {
            temp_path: result.temp_path,
            filename: result.filename,
          });
          setUploading(false);
          setStatusText("");
          toast.success("File analyzed");
          onUploadSuccess(result);
        } else if (state === "FAILURE") {
          clearInterval(pollRef.current);
          setUploading(false);
          setStatusText("");
          toast.error("Processing failed: " + error);
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setUploading(false);
        setStatusText("");
        toast.error("Lost connection while checking progress");
      }
    }, 1500);
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("user_email", user.email);

    setUploading(true);
    setStatusText("Uploading…");

    try {
      const response = await api.post("/api/upload-async", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatusText("Queued…");
      pollTaskStatus(response.data.task_id);
    } catch (error) {
      setUploading(false);
      setStatusText("");
      toast.error(error.response?.data?.detail || "Upload failed");
    }
  }, [mode, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
    disabled: uploading,
  });

  return (
    <div>
      <p className="text-sm text-mist mb-3">What kind of data is this?</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {modes.map((m) => (
          <motion.button
            key={m.value}
            type="button"
            disabled={uploading}
            onClick={() => setMode(m.value)}
            whileHover={{ scale: uploading ? 1 : 1.05 }}
            whileTap={{ scale: uploading ? 1 : 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors disabled:opacity-40 ${
              mode === m.value ? "glow-btn text-white border-transparent" : "glass text-mist hover:text-white"
            }`}
          >
            {m.label}
          </motion.button>
        ))}
      </div>

      <motion.div
        {...getRootProps()}
        animate={{
          scale: isDragActive ? 1.02 : 1,
          boxShadow: isDragActive ? "0 0 50px rgba(139,92,246,0.4)" : "0 0 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.2 }}
        className={`glass rounded-3xl p-16 text-center border-2 border-dashed ${
          uploading ? "cursor-default" : "cursor-pointer"
        } ${isDragActive ? "border-violet" : "border-white/10"}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-amber border-t-transparent rounded-full"
              />
            </div>
            <p className="text-white font-mono text-sm">{statusText}</p>
          </div>
        ) : isDragActive ? (
          <p className="glow-text font-medium text-lg">drop it here</p>
        ) : (
          <div>
            <p className="text-white font-medium mb-1 text-lg">Drag & drop a CSV or Excel file</p>
            <p className="text-mist text-sm">or click to browse</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default FileUpload;