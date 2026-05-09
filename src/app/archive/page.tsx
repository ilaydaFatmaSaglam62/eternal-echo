import { FolderHeart, FolderLock, Folder, Plane } from "lucide-react";

const CATEGORIES = [
  { name: "All", icon: Folder },
  { name: "Personal", icon: FolderLock },
  { name: "Love", icon: FolderHeart },
  { name: "Travel", icon: Plane },
];

const MOCK_MEMORIES = [
  { id: 1, title: "Summer in Paris", date: "August 12, 2025", category: "Travel", excerpt: "The light over the Seine today was indescribable..." },
  { id: 2, title: "Midnight Thoughts", date: "November 3, 2025", category: "Personal", excerpt: "Sometimes silence is the loudest sound in the room." },
  { id: 3, title: "Our First Anniversary", date: "January 15, 2026", category: "Love", excerpt: "One year has felt like a single heartbeat." },
  { id: 4, title: "Weekend Retreat", date: "March 22, 2026", category: "Travel", excerpt: "Found peace in the mountains, away from everything." },
  { id: 5, title: "Career Milestone", date: "April 10, 2026", category: "Personal", excerpt: "Finally launched the project we've been working on." },
  { id: 6, title: "Random Evening", date: "May 1, 2026", category: "Personal", excerpt: "Just a quiet night with a good book and tea." },
];

export default function ArchivePage() {
  return (
    <main className="flex-1 flex flex-col p-6 lg:p-12 font-sans bg-[var(--background)] max-w-7xl mx-auto w-full">
      
      {/* Header & Categories */}
      <div className="mb-12">
        <h1 className="font-playfair text-4xl text-[var(--foreground)] mb-8">Past Memories</h1>
        
        <div className="flex flex-wrap gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.name} className="flex items-center gap-2 px-5 py-2.5 rounded-full border-subtle bg-white hover:bg-[var(--accent)] transition-colors shadow-layered group">
                <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--foreground)] transition-colors" strokeWidth={1} />
                <span className="text-sm font-medium tracking-wide text-[var(--foreground)] opacity-90">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_MEMORIES.map((memory) => (
          <div key={memory.id} className="bg-white p-8 rounded-2xl border-subtle shadow-layered hover:shadow-[0_20px_60px_rgba(44,42,40,0.05)] transition-all duration-500 cursor-pointer flex flex-col h-64 group relative overflow-hidden">
            
            <div className="flex justify-between items-start mb-6">
              <span className="font-inter uppercase tracking-widest text-[10px] font-medium text-[var(--text-muted)]">
                {memory.category}
              </span>
              <span className="font-playfair italic text-xs text-[var(--text-muted)]">
                {memory.date}
              </span>
            </div>

            <h3 className="font-playfair text-xl text-[var(--foreground)] mb-4 leading-tight group-hover:text-[#D4AF37] transition-colors">
              {memory.title}
            </h3>
            
            <p className="font-inter text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3 font-light">
              {memory.excerpt}
            </p>

            {/* Subtle Hover Overlay */}
            <div className="absolute inset-0 border-[0.5px] border-transparent group-hover:border-[#D4AF37]/20 rounded-2xl pointer-events-none transition-colors duration-500" />
          </div>
        ))}
      </div>

    </main>
  );
}
