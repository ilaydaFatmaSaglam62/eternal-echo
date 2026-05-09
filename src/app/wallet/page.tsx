"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Copy, ExternalLink, ArrowUpRight, Disc3 } from "lucide-react";

const OWNED_MEMORIES = [
    {
        id: "CUVEE-7X9B",
        category: "Personal",
        date: "May 9, 2026",
        excerpt: "The quiet moments of the morning, watching the sunrise over the city skyline...",
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=600&auto=format&fit=crop",
    },
    {
        id: "CUVEE-3A2P",
        category: "Travel",
        date: "April 15, 2026",
        excerpt: "Lost in the narrow streets of Rome, finding beauty in the ancient stones.",
        image: null,
    },
    {
        id: "CUVEE-9Y1M",
        category: "Deep",
        date: "March 2, 2026",
        excerpt: "Sometimes the hardest choices lead to the most profound peace.",
        image: null,
    },
];

export default function WalletDashboard() {
    const [copied, setCopied] = useState(false);
    const mockWalletAddress = "8x9T...2pKZ";

    const handleCopy = () => {
        navigator.clipboard.writeText("8x9T4fP9LmN2pKZ");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="flex-1 flex flex-col items-center p-6 lg:p-12 font-sans overflow-x-hidden relative">
            <div className="w-full max-w-6xl mt-8 lg:mt-12 flex flex-col gap-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div>
                        <h1 className="font-playfair text-3xl md:text-4xl font-medium text-[var(--foreground)] mb-3">Your Eternal Vault</h1>
                        <p className="text-sm text-[var(--text-muted)] max-w-md">Manage your connected Phantom wallet and explore your minted memory NFTs.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-[var(--editor-bg)] paper-texture px-5 py-3 rounded-full border border-[var(--border-color)] shadow-layered">
                        <Wallet className="w-4 h-4 text-[#AB9FF2]" />
                        <span className="text-sm font-medium tracking-wide text-[var(--foreground)]">{mockWalletAddress}</span>
                        <div className="w-px h-4 bg-[var(--border-color)] mx-1"></div>
                        <button onClick={handleCopy} className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors relative">
                            <Copy className="w-4 h-4" />
                            {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-white text-[10px] px-2 py-1 rounded">Copied</span>}
                        </button>
                        <button className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-[var(--accent)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)] flex flex-col justify-between h-40"
                    >
                        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)]">SOL Balance</span>
                        <div className="flex items-end gap-2">
                            <span className="font-playfair text-4xl text-[var(--foreground)]">0.00</span>
                            <span className="text-sm text-[var(--text-muted)] mb-1">SOL</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-[var(--accent)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)] flex flex-col justify-between h-40"
                    >
                        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--text-muted)]">Network</span>
                        <div className="flex items-end gap-2">
                            <span className="font-playfair text-2xl text-[var(--foreground)]">Devnet</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="bg-[var(--foreground)] p-8 rounded-2xl shadow-layered flex flex-col justify-between h-40 relative overflow-hidden group"
                    >
                        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--background)]/70">Minted Memories</span>
                        <div className="flex items-end justify-between">
                            <span className="font-playfair text-4xl text-[var(--background)]">∞</span>
                            <button className="flex items-center gap-1 text-[var(--background)] text-xs uppercase tracking-wider font-medium hover:text-[#D4AF37] transition-colors">
                                View All <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <h2 className="font-playfair text-2xl font-medium text-[var(--foreground)]">Memory Gallery</h2>
                        <div className="flex-1 h-px bg-[var(--border-color)]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {OWNED_MEMORIES.map((memory, index) => (
                            <motion.div key={memory.id}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }}
                                className="bg-[var(--editor-bg)] paper-texture border-subtle rounded-xl p-6 shadow-layered group cursor-pointer hover:-translate-y-1 transition-transform duration-300 flex flex-col h-[320px]"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-medium bg-[#D4AF37]/10 px-3 py-1 rounded-full">{memory.category}</span>
                                    <Disc3 className="w-4 h-4 text-[var(--text-muted)] group-hover:rotate-180 transition-transform duration-1000" />
                                </div>

                                {memory.image ? (
                                    <div className="w-full h-32 mb-4 rounded-lg overflow-hidden border border-[var(--border-color)] flex-shrink-0">
                                        <img src={memory.image} alt="Memory" className="w-full h-full object-cover filter contrast-110 saturate-50 group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                ) : (
                                    <div className="flex-1 mb-4 flex items-center">
                                        <p className="font-playfair text-lg text-[var(--foreground)] line-clamp-4 italic opacity-90">"{memory.excerpt}"</p>
                                    </div>
                                )}

                                {memory.image && (
                                    <p className="font-playfair text-sm text-[var(--foreground)] line-clamp-2 italic opacity-90 mb-4 flex-1">"{memory.excerpt}"</p>
                                )}

                                <div className="pt-4 border-t border-[var(--border-color)] mt-auto flex justify-between items-center">
                                    <span className="text-xs text-[var(--text-muted)] tracking-wide">{memory.date}</span>
                                    <span className="text-[10px] text-[var(--text-muted)] tracking-widest uppercase bg-[var(--accent)] px-2 py-0.5 rounded">{memory.id}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}