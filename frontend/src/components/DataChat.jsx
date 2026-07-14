import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import toast from "react-hot-toast";

function DataChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setQuestion("");
    setMessages((prev) => [...prev, { type: "question", text: userQuestion }]);
    setLoading(true);

    try {
      const response = await api.post("/api/chat", { question: userQuestion });

      setMessages((prev) => [...prev, { type: "answer", text: response.data.answer }]);
    } catch (error) {
      const message = error.response?.data?.detail || "Something went wrong";
      toast.error(message);
      setMessages((prev) => [...prev, { type: "error", text: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-[32rem]">
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-mist text-sm">Try: "What was the highest revenue day?" or "Which product sold the most?"</p>
        )}
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`p-3 rounded-xl text-sm max-w-[85%] ${
                msg.type === "question"
                  ? "glow-btn text-white ml-auto"
                  : msg.type === "error"
                  ? "bg-rose/10 text-rose"
                  : "bg-white/5 text-white"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 h-1.5 rounded-full bg-amber"
              />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="flex gap-2 p-4 border-t border-white/10">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your data…"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet/50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="glow-btn text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
        >
          Ask
        </motion.button>
      </form>
    </div>
  );
}

export default DataChat;