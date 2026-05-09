"use client";

import { useState } from "react";
import Link from "next/link";
import { Disc3, Wallet, Search, Plus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const isHashFormat = /^[A-Za-z0-9]{6}$/.test(searchQuery.trim());

  const handleAdd = () => {
    setIsAdded(true);
    setTimeout(() => {
      setIsSearchActive(false);
      setSearchQuery("");
      setIsAdded(false);
    }, 2000);
  };

  return (
    <nav className="w-full border-b border-[#E8E5DF] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-8">
          <Link href="/home" className="flex items-center gap-3 group">
            <Disc3 className="w-6 h-6 text-[var(--foreground)] transition-transform group-hover:rotate-180 duration-1000 ease-in-out" strokeWidth={1} />
            <span className="font-playfair text-xl tracking-wide text-[var(--foreground)] font-semibold">Cuvée</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-inter text-sm tracking-wide ml-4">
            <Link href="/home" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Make a Memory</Link>
            <Link href="/archive" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Archive</Link>
            <Link href="/wallet" className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--border-color)] bg-white shadow-sm hover:shadow-md transition-all duration-300 text-xs font-inter font-medium tracking-wide text-[var(--foreground)] group">
              <Wallet className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#AB9FF2] transition-colors" strokeWidth={1.5} />
              <span>Connect Phantom</span>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className={`flex items-center gap-2 border-b ${isSearchActive ? 'border-[#D4AF37]' : 'border-[var(--border-color)]'} transition-colors pb-1`}>
            <Search className={`w-3.5 h-3.5 ${isSearchActive ? 'text-[#D4AF37]' : 'text-[var(--text-muted)]'}`} />
            <input
              type="text"
              placeholder="Enter 6-digit code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => { if (!searchQuery) setIsSearchActive(false); }}
              className="bg-transparent outline-none text-xs w-48 placeholder:text-[var(--text-muted)] text-[var(--foreground)] tracking-widest font-medium"
              maxLength={6}
            />
          </div>

          <AnimatePresence>
            {isSearchActive && isHashFormat && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-10 right-0 w-64 bg-white shadow-layered border-subtle rounded-xl p-4 flex flex-col gap-4 z-50 origin-top-right"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-2 py-0.5 rounded w-fit">
                      Shared with me
                    </span>
                    <span className="font-playfair font-medium text-[var(--foreground)]">Memory Found</span>
                    <span className="text-xs font-inter text-[var(--text-muted)] tracking-wide">ID: {searchQuery}</span>
                  </div>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={isAdded}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-300 text-xs font-medium tracking-wide border ${isAdded
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-[var(--foreground)] text-[var(--background)] border-transparent hover:bg-black'
                    }`}
                >
                  {isAdded ? (
                    <><CheckCircle2 className="w-4 h-4" /> Added to Archive</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Add to My Archive</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
