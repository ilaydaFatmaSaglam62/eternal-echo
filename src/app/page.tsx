"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Upload, Disc3, Mic, Sparkles, CheckCircle2, Plus } from "lucide-react";

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  
  // Archiving States
  const [isArchivePopoverOpen, setIsArchivePopoverOpen] = useState(false);
  const [archiveFolders, setArchiveFolders] = useState(["Personal", "Travel", "Love", "Social", "Deep"]);
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [newFolderName, setNewFolderName] = useState("");
  
  // Voice Synthesis States
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isEternalVoiceActive, setIsEternalVoiceActive] = useState(false);
  
  const [isMinting, setIsMinting] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handleRecordingToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasRecorded(true);
      }, 5000);
    } else {
      setIsRecording(false);
      setHasRecorded(true);
    }
  };

  const handleMint = () => {
    setIsMinting(true);
    setTimeout(() => {
      setIsMinting(false);
      setJournalText("");
      setPhotoUrl(null);
      setHasRecorded(false);
      setIsEternalVoiceActive(false);
    }, 4000);
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      setArchiveFolders([...archiveFolders, newFolderName.trim()]);
      setSelectedCategory(newFolderName.trim());
      setNewFolderName("");
      setIsArchivePopoverOpen(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <main className="flex-1 flex justify-center p-6 lg:p-12 font-sans overflow-x-hidden relative">
      {/* Minting Gold Particle Effect Overlay */}
      <AnimatePresence>
        {isMinting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-white/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="absolute w-[800px] h-[800px] bg-gradient-radial from-[#D4AF37]/30 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: -50, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="flex items-center gap-4 text-[#D4AF37] font-playfair text-3xl italic drop-shadow-sm"
            >
              <Sparkles className="w-8 h-8" />
              <span>Sealing into Eternity...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-x-12 gap-y-10 lg:gap-x-16 relative z-10 mt-4 lg:mt-8">
        
        {/* Left Sidebar - Visual & Voice Imprint */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col justify-between h-full"
        >
          {/* Top: Visual Memory */}
          <div className="bg-[var(--accent)] p-3 pb-10 rounded-sm shadow-layered border-subtle w-full max-w-[240px] mx-auto lg:mx-0 transform -rotate-2 transition-transform hover:rotate-0 duration-500 ease-out z-20">
            <div
              className="bg-white/50 w-full aspect-square mb-3 flex items-center justify-center overflow-hidden cursor-pointer border-subtle relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Polaroid Memory" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[var(--text-muted)] flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                  <Upload strokeWidth={1} className="w-6 h-6" />
                  <span className="text-xs font-light tracking-wide">Upload Photo</span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />
            <div className="text-center w-full">
              <span className="font-caveat text-2xl text-[var(--foreground)] tracking-wide opacity-80">
                {currentDate}
              </span>
            </div>
          </div>

          {/* Bottom: Voice Imprint */}
          <div className="flex flex-col gap-3 w-full max-w-[240px] mx-auto lg:mx-0 mt-12 lg:mt-auto">
            {/* Status Indicator Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 self-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2} />
              <span className="text-[9px] uppercase tracking-widest font-medium text-[var(--text-muted)]">
                Voice Profile: Initialized
              </span>
            </div>

            {/* The Voice Pill */}
            <div className="bg-[var(--accent)] rounded-full shadow-layered border-subtle p-2 pr-4 flex items-center gap-3 w-full">
              <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0 bg-white rounded-full border border-[var(--border-color)]">
                <motion.div
                  animate={isRecording ? {
                    scale: [1, 1.1, 1],
                    boxShadow: ["0 0 0 rgba(212,175,55,0)", "0 0 10px rgba(212,175,55,0.3)", "0 0 0 rgba(212,175,55,0)"]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full"
                />
                <Disc3
                  className={`w-5 h-5 text-[var(--foreground)] ${isRecording ? "animate-spin duration-[2000ms] text-[#D4AF37]" : ""}`}
                  strokeWidth={1}
                />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {isRecording ? (
                  <div className="flex items-center gap-1.5">
                    <motion.span animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-[#D4AF37] rounded-full" />
                    <motion.span animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1 bg-[#D4AF37] rounded-full" />
                    <motion.span animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-[#D4AF37] rounded-full" />
                    <span className="text-[10px] font-medium text-[#D4AF37] uppercase tracking-wider ml-1">Recording</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRecordingToggle}
                    className="flex items-center gap-2 text-xs font-medium tracking-wide text-[var(--foreground)] hover:text-[#D4AF37] transition-colors text-left"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    {hasRecorded ? "Retake Imprint" : "Record Voice"}
                  </button>
                )}
              </div>
            </div>

            {/* Eternal Voice Toggle */}
            <AnimatePresence>
              {hasRecorded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--accent)] rounded-full shadow-layered border-subtle py-2 px-4 flex items-center justify-between w-full overflow-hidden"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]">Eternal Voice</span>
                  <button
                    onClick={() => setIsEternalVoiceActive(!isEternalVoiceActive)}
                    className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isEternalVoiceActive ? 'bg-[#D4AF37]' : 'bg-[#E8E5DF]'}`}
                  >
                    <motion.div
                      layout
                      className="w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm"
                      animate={{ left: isEternalVoiceActive ? "18px" : "2px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Center Journal Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`bg-[var(--editor-bg)] paper-texture rounded-2xl p-8 sm:p-12 shadow-layered border-subtle relative transition-all duration-1000 flex flex-col h-full min-h-[500px] ${isMinting ? "border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.2)]" : ""}`}
        >
          {/* Top Header inside Journal */}
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Disc3 className="w-6 h-6 text-[var(--foreground)]" strokeWidth={1} />
                <span className="font-playfair text-lg font-semibold tracking-wide text-[var(--foreground)] opacity-90">
                  Cuvée
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-medium ml-9">
                Archive: {selectedCategory}
              </span>
            </div>
            <span className="font-playfair text-[var(--text-muted)] text-sm italic tracking-wide">
              {currentDate}, {currentTime}
            </span>
          </div>

          {/* Editor Area */}
          <motion.textarea
            animate={isEternalVoiceActive ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
            transition={isEternalVoiceActive ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
            className="w-full flex-1 bg-transparent outline-none resize-none font-playfair text-xl md:text-2xl leading-relaxed text-[var(--foreground)] placeholder:text-[var(--text-muted)] placeholder:italic placeholder:font-light relative z-10"
            placeholder="Record your thoughts, unedited and pure..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            disabled={isMinting}
          />

          {/* Dynamic Archiving Button (+ Button) */}
          <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 z-20 flex flex-col items-end">
            <AnimatePresence>
              {isArchivePopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="mb-4 w-64 bg-white shadow-layered border-subtle rounded-xl p-4 flex flex-col gap-4 origin-bottom-right"
                >
                  <span className="font-playfair text-sm font-semibold text-[var(--foreground)]">Save to Archive</span>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                    {archiveFolders.map((folder) => (
                      <button
                        key={folder}
                        onClick={() => {
                          setSelectedCategory(folder);
                          setIsArchivePopoverOpen(false);
                        }}
                        className="text-left px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--accent)] rounded-md transition-colors flex items-center justify-between group"
                      >
                        {folder}
                        {selectedCategory === folder && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="New folder..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="flex-1 bg-[var(--accent)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-xs text-[var(--foreground)] outline-none focus:border-[#D4AF37]/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                    />
                    <button
                      onClick={handleAddFolder}
                      className="p-1.5 bg-[var(--foreground)] text-[var(--background)] rounded-md hover:bg-black transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsArchivePopoverOpen(!isArchivePopoverOpen)}
              className="w-12 h-12 bg-white shadow-layered border-subtle rounded-full flex items-center justify-center text-[var(--foreground)] hover:text-[#D4AF37] hover:scale-105 transition-all duration-300 relative z-20"
            >
              <Plus className={`w-5 h-5 transition-transform duration-300 ${isArchivePopoverOpen ? "rotate-45" : ""}`} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>

        {/* Time Capsule Feature (Row 2, Col 2) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="lg:col-start-2 flex flex-col gap-6 w-full"
        >
          {/* Timeline Scale */}
          <div className="w-full px-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-medium">
              <span>Genesis</span>
              <span>Time Capsule Timeline</span>
              <span>Eternity</span>
            </div>
            <div className="w-full h-[1px] bg-[var(--border-color)] relative flex items-center">
              <div className="absolute left-0 w-2 h-2 rounded-full bg-[var(--text-muted)]"></div>
              <div className="absolute left-1/2 w-1.5 h-1.5 rounded-full bg-[var(--border-color)]"></div>
              <div className="absolute right-0 w-2 h-2 rounded-full bg-[var(--foreground)] shadow-[0_0_10px_rgba(44,42,40,0.2)]"></div>
              <div className="h-full bg-[var(--foreground)] w-full origin-left opacity-10"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-[var(--foreground)]" strokeWidth={1.5} />
              </div>
              <input
                type="date"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full sm:w-auto pl-12 pr-6 py-3 rounded-full border-subtle shadow-layered bg-[var(--editor-bg)] hover:bg-[var(--accent)] transition-colors duration-300 text-sm font-medium text-[var(--foreground)] tracking-wide outline-none focus:ring-1 focus:ring-[#D4AF37]/50 appearance-none cursor-pointer"
                style={{ colorScheme: "light" }}
              />
            </div>

            <button
              onClick={handleMint}
              disabled={isMinting || (!journalText && !photoUrl)}
              className="w-full sm:w-auto px-10 py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:bg-black disabled:opacity-50 transition-all duration-300 text-sm font-medium tracking-widest uppercase shadow-layered hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
            >
              Mint as Eternal NFT
            </button>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
