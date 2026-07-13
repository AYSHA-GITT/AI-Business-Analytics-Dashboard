import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import BackgroundOrbs from "../layout/BackgroundOrbs";
import toast from "react-hot-toast";

function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isSignup ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (isSignup) {
      toast.success("Account created! You can now log in.");
      setIsSignup(false);
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 relative">
      <BackgroundOrbs />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-3xl p-8 w-full max-w-sm relative z-10"
      >
        <p className="font-display text-lg glow-text mb-1">Ledger.</p>
        <h1 className="font-display text-2xl mb-6">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-mist mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet/50"
            />
          </div>
          <div>
            <label className="text-sm text-mist mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet/50"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full glow-btn text-white py-2 rounded-xl text-sm font-medium disabled:opacity-40"
          >
            {loading ? "Please wait…" : isSignup ? "Sign Up" : "Log In"}
          </motion.button>
        </form>

        <p className="text-sm text-mist mt-6 text-center">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)} className="text-amber font-medium">
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default AuthPage;