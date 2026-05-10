"use client";

import { useState, useEffect } from "react";
import { FolderHeart, FolderLock, Folder, Plane, Volume2, Lock, Users, Brain, Trash2, X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { name: "All", icon: Folder },
  { name: "Personal", icon: FolderLock },
  { name: "Love", icon: FolderHeart },
  { name: "Travel", icon: Plane },
  { name: "Social", icon: Users },
  { name: "Deep", icon: Brain },
];

interface Memory {
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

export default function ArchivePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/get-memories');
      const data = await res.json();
      console.log('Archive fetch result:', data);
      if (data.memories) {
        setMemories(data.memories);

        const knownCats = CATEGORIES.map(c => c.name.toLowerCase());
        const dynamicCats = [...new Set(
          data.memories
            .map((m: Memory) => m.category)
            .filter((c: string) => c && !knownCats.includes(c.toLowerCase()))
        )] as string[];
        setExtraCategories(dynamicCats);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memory: Memory) => {
    if (confirmDeleteId !== memory.ipfsHash) {
      setConfirmDeleteId(memory.ipfsHash);
      return;
    }

    setDeletingId(memory.ipfsHash);
    try {
      const res = await fetch('/api/delete-memory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipfsHash: memory.ipfsHash }),
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.filter(m => m.ipfsHash !== memory.ipfsHash));
        if (selectedMemory?.ipfsHash === memory.ipfsHash) setSelectedMemory(null);
      } else {
        console.error('Delete failed:', data.error);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    if (confirmDeleteId) {
      const timer = setTimeout(() => setConfirmDeleteId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 4 haneli kod üretici (eski kayıtlar için)
  const getMemoryCode = (memory: Memory): string => {
    if (memory.code) return memory.code;
    // Eski kayıtlar için ipfsHash'den türet
    const hash = memory.ipfsHash || memory.id;
    return hash.slice(-4).toUpperCase();
  };

  const allCategories = [
    ...CATEGORIES,
    ...extraCategories.map(name => ({ name, icon: Folder })),
  ];

  const filteredMemories = selectedCategory === "All"
    ? memories
    : memories.filter(m => m.category?.toLowerCase() === selectedCategory.toLowerCase());

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <main className="flex-1 flex flex-col p-6 lg:p-12 font-sans bg-[var(--background)] max-w-7xl mx-auto w-full">
      <div className="mb-12">
        <h1 className="font-playfair text-4xl text-[var(--foreground)] mb-8">Past Memories</h1>
        <div className="flex flex-wrap gap-4">
          {allCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-subtle shadow-layered group transition-colors ${selectedCategory === cat.name ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-white hover:bg-[var(--accent)]'
                  }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1} />
                <span className="text-sm font-medium tracking-wide">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="font-playfair text-[var(--text-muted)] italic">Loading your memories...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="font-playfair text-2xl text-[var(--text-muted)] italic">No memories yet.</p>
          <p className="text-sm text-[var(--text-muted)]">Mint your first eternal memory to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredMemories.map((memory) => (
              <motion.div
                key={memory.ipfsHash || memory.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                onDoubleClick={() => setSelectedMemory(memory)}
                className="bg-white p-8 rounded-2xl border-subtle shadow-layered hover:shadow-[0_20px_60px_rgba(44,42,40,0.05)] transition-all duration-500 cursor-pointer flex flex-col gap-4 group relative overflow-hidden"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(memory); }}
                  disabled={deletingId === memory.ipfsHash}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 ${
                    confirmDeleteId === memory.ipfsHash
                      ? 'bg-red-500 text-white shadow-md scale-110'
                      : 'bg-transparent text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                  } ${deletingId === memory.ipfsHash ? 'animate-pulse' : ''}`}
                  title={confirmDeleteId === memory.ipfsHash ? 'Click again to confirm delete' : 'Delete memory'}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>

                {/* Confirm text */}
                <AnimatePresence>
                  {confirmDeleteId === memory.ipfsHash && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-12 right-3 bg-red-500 text-white text-[10px] font-medium px-2 py-1 rounded shadow-md z-10 whitespace-nowrap"
                    >
                      Click again to delete
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Memory Code Badge */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] font-mono font-bold tracking-widest bg-[var(--foreground)] text-[var(--background)] px-2 py-1 rounded">
                    #{getMemoryCode(memory)}
                  </span>
                </div>

                {memory.imageUrl && !memory.imageUrl.includes('placehold') && (
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-[var(--border-color)]">
                    <img src={memory.imageUrl} alt="Memory" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <span className="font-inter uppercase tracking-widest text-[10px] font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                    {memory.category || 'Personal'}
                  </span>
                  <span className="font-playfair italic text-xs text-[var(--text-muted)]">
                    {formatDate(memory.createdAt)}
                  </span>
                </div>

                <p className="font-playfair text-base text-[var(--foreground)] line-clamp-3 italic opacity-90">
                  &ldquo;{memory.text?.slice(0, 120)}...&rdquo;
                </p>

                {memory.isLocked ? (
                  <div className="flex items-center gap-2 text-[#D4AF37] text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked until {memory.unlockDate ? formatDate(memory.unlockDate) : '—'}</span>
                  </div>
                ) : memory.audioUrl && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Voice Memory</span>
                    </div>
                    <audio controls src={memory.audioUrl} className="w-full h-8" />
                  </div>
                )}

                {/* Double click hint */}
                <div className="text-[9px] text-[var(--text-muted)] text-center opacity-0 group-hover:opacity-60 transition-opacity">
                  Double-click to expand
                </div>

                <div className="absolute inset-0 border-[0.5px] border-transparent group-hover:border-[#D4AF37]/20 rounded-2xl pointer-events-none transition-colors duration-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ========== EXPANDED MEMORY MODAL ========== */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 sm:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--accent)] transition-colors text-[var(--text-muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>

              {/* Code badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono font-bold text-sm tracking-widest bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-lg">
                  #{getMemoryCode(selectedMemory)}
                </span>
                <button
                  onClick={() => handleCopyCode(getMemoryCode(selectedMemory))}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[#D4AF37] transition-colors"
                >
                  {copiedCode ? (
                    <><Check className="w-3 h-3 text-green-500" /> Copied!</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copy Code</>
                  )}
                </button>
              </div>

              {/* Category & Date */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-inter uppercase tracking-widest text-[11px] font-medium text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full">
                  {selectedMemory.category || 'Personal'}
                </span>
                <span className="font-playfair italic text-sm text-[var(--text-muted)]">
                  {formatDate(selectedMemory.createdAt)}
                </span>
              </div>

              {/* Image */}
              {selectedMemory.imageUrl && !selectedMemory.imageUrl.includes('placehold') && (
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-[var(--border-color)] mb-8">
                  <img src={selectedMemory.imageUrl} alt="Memory" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Full Text */}
              <div className="mb-8">
                <p className="font-playfair text-xl leading-relaxed text-[var(--foreground)] italic">
                  &ldquo;{selectedMemory.text}&rdquo;
                </p>
              </div>

              {/* Audio Player */}
              {selectedMemory.isLocked ? (
                <div className="flex items-center gap-3 text-[#D4AF37] text-sm bg-[#D4AF37]/5 p-4 rounded-xl">
                  <Lock className="w-5 h-5" />
                  <span className="font-playfair italic">
                    Locked until {selectedMemory.unlockDate ? formatDate(selectedMemory.unlockDate) : '—'}
                  </span>
                </div>
              ) : selectedMemory.audioUrl && (
                <div className="bg-[var(--accent)] p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-3">
                    <Volume2 className="w-4 h-4" />
                    <span className="font-medium uppercase tracking-widest text-[10px]">Voice Memory</span>
                  </div>
                  <audio controls src={selectedMemory.audioUrl} className="w-full" />
                </div>
              )}

              {/* IPFS info */}
              <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-wide truncate">
                  IPFS: {selectedMemory.ipfsHash}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}