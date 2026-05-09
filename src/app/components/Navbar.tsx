import Link from "next/link";
import { Disc3, Wallet } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-[#E8E5DF] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <Disc3 className="w-6 h-6 text-[var(--foreground)] transition-transform group-hover:rotate-180 duration-1000 ease-in-out" strokeWidth={1} />
            <span className="font-playfair text-xl tracking-wide text-[var(--foreground)] font-semibold">Cuvée</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-inter text-sm tracking-wide ml-4">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Write</Link>
            <Link href="/archive" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Archive</Link>
            <Link href="/shared" className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors">Shared Vault</Link>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--border-color)] bg-white shadow-sm hover:shadow-md transition-all duration-300 text-xs font-inter font-medium tracking-wide text-[var(--foreground)] group">
          <Wallet className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#D4AF37] transition-colors" strokeWidth={1.5} />
          <span>Connect Wallet</span>
        </button>
      </div>
    </nav>
  );
}
