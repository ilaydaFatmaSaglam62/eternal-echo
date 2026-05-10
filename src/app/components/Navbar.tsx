"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Disc3, Wallet, Search, Volume2, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FoundMemory {
  id: string;
  code?: string;
  title: string;
  text: string;
  audioUrl: string;
  imageUrl: string;
  category: string;
  unlockDate: string | null;
  createdAt: string;
  isLocked: boolean;
  ipfsHash: string;
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [foundMemory, setFoundMemory] = useState<FoundMemory | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  const isCodeFormat = /^[A-Za-z0-9]{4}$/.test(searchQuery.trim());

  const handleSearch = async () => {
    if (!isCodeFormat) return;
    setSearching(true);
    setNotFound(false);
    setFoundMemory(null);

    try {
      const res = await fetch('/api/get-memories');
      const data = await res.json();
      if (data.memories) {
        const code = searchQuery.trim().toUpperCase();
        // Kod ile eşleşen memory'yi bul
        const match = data.memories.find((m: FoundMemory) => {
          if (m.code && m.code.toUpperCase() === code) return true;
          // Eski kayıtlar için ipfsHash'den türetilmiş kodu kontrol et
          const fallbackCode = (m.ipfsHash || m.id).slice(-4).toUpperCase();
          return fallbackCode === code;
        });
        if (match) {
          setFoundMemory(match);
        } else {
          setNotFound(true);
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isCodeFormat) {
      handleSearch();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
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
              placeholder="Enter 4-digit code..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value.toUpperCase()); setNotFound(false); setFoundMemory(null); }}
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => { if (!searchQuery) setIsSearchActive(false); }}
              onKeyDown={handleKeyDown}
              className="bg-transparent outline-none text-xs w-44 placeholder:text-[var(--text-muted)] text-[var(--foreground)] tracking-widest font-mono font-medium"
              maxLength={4}
            />
            {isCodeFormat && (
              <button
                onClick={handleSearch}
                disabled={searching}
                className="text-[9px] uppercase tracking-widest font-semibold text-[#D4AF37] hover:text-[var(--foreground)] transition-colors"
              >
                {searching ? '...' : 'Go'}
              </button>
            )}
          </div>

          <AnimatePresence>
            {/* Found Memory */}
            {foundMemory && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-10 right-0 w-80 bg-white shadow-2xl border-subtle rounded-2xl p-5 flex flex-col gap-4 z-50 origin-top-right"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm tracking-widest bg-[var(--foreground)] text-[var(--background)] px-2.5 py-1 rounded">
                    #{searchQuery}
                  </span>
                  <span className="font-inter uppercase tracking-widest text-[9px] font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                    {foundMemory.category || 'Personal'}
                  </span>
                </div>

                <p className="font-playfair text-sm italic text-[var(--foreground)] leading-relaxed line-clamp-4">
                  &ldquo;{foundMemory.text?.slice(0, 200)}{foundMemory.text?.length > 200 ? '...' : ''}&rdquo;
                </p>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span className="font-playfair italic">{formatDate(foundMemory.createdAt)}</span>
                  {foundMemory.isLocked ? (
                    <span className="flex items-center gap-1 text-[#D4AF37]"><Lock className="w-3 h-3" /> Locked</span>
                  ) : foundMemory.audioUrl ? (
                    <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" /> Has Audio</span>
                  ) : null}
                </div>

                {!foundMemory.isLocked && foundMemory.audioUrl && (
                  <audio controls src={foundMemory.audioUrl} className="w-full h-8" />
                )}

                <button
                  onClick={() => {
                    router.push('/archive');
                    setSearchQuery('');
                    setFoundMemory(null);
                    setIsSearchActive(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-medium tracking-widest uppercase hover:bg-black transition-colors"
                >
                  View in Archive →
                </button>
              </motion.div>
            )}

            {/* Not Found */}
            {notFound && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-10 right-0 w-64 bg-white shadow-layered border-subtle rounded-xl p-4 z-50 text-center"
              >
                <p className="font-playfair text-sm text-[var(--text-muted)] italic">No memory found with code</p>
                <p className="font-mono font-bold tracking-widest text-[var(--foreground)] mt-1">#{searchQuery}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
