"use client";

import { useState, useEffect } from "react";
import { FolderHeart, FolderLock, Folder, Plane, Volume2, Lock, Users, Brain } from "lucide-react";

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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);

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

        // Dinamik kategori tespiti: Mevcut CATEGORIES dışında olanları bul
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
          {filteredMemories.map((memory) => (
            <div key={memory.id} className="bg-white p-8 rounded-2xl border-subtle shadow-layered hover:shadow-[0_20px_60px_rgba(44,42,40,0.05)] transition-all duration-500 cursor-pointer flex flex-col gap-4 group relative overflow-hidden">

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

              <div className="absolute inset-0 border-[0.5px] border-transparent group-hover:border-[#D4AF37]/20 rounded-2xl pointer-events-none transition-colors duration-500" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}