"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Disc3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToKvkk, setAgreedToKvkk] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreedToKvkk) {
      setError("You must agree to the KVKK Data Privacy terms.");
      return;
    }

    if (password !== "abc123") {
      setError("Incorrect password. Please try again.");
      return;
    }

    router.push("/home");
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-[var(--background)] font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-[var(--editor-bg)] paper-texture p-10 rounded-2xl shadow-layered border-subtle flex flex-col items-center"
      >
        <Link href="/" className="flex items-center gap-3 group mb-10">
          <Disc3 className="w-8 h-8 text-[var(--foreground)] transition-transform group-hover:rotate-180 duration-1000 ease-in-out" strokeWidth={1} />
          <span className="font-playfair text-2xl tracking-wide text-[var(--foreground)] font-semibold">Cuvée</span>
        </Link>

        <h1 className="font-playfair text-2xl font-medium text-[var(--foreground)] mb-2 w-full text-center">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--text-muted)] text-center mb-8">
          Enter your details to access your eternal archive.
        </p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)] ml-1">Email Address</label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--accent)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-[var(--text-muted)]"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)] ml-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--accent)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[#D4AF37]/50 transition-colors placeholder:text-[var(--text-muted)]"
              required
            />
          </div>

          <label className="flex items-start gap-3 mt-2 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={agreedToKvkk}
                onChange={(e) => setAgreedToKvkk(e.target.checked)}
                className="peer appearance-none w-4 h-4 border border-[var(--border-color)] rounded bg-[var(--accent)] checked:bg-[var(--foreground)] checked:border-[var(--foreground)] cursor-pointer transition-colors"
              />
              <svg className="absolute w-3 h-3 text-[var(--background)] pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              I have read and agree to the <span className="underline underline-offset-2">KVKK Data Privacy Policy</span>.
            </span>
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-500/80 font-medium text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={!agreedToKvkk}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium tracking-widest uppercase shadow-layered"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-xs text-[var(--text-muted)] text-center">
          Don't have an archive? <span className="text-[#D4AF37] font-medium cursor-pointer hover:underline underline-offset-4">Request Access</span>
        </p>
      </motion.div>
    </main>
  );
}