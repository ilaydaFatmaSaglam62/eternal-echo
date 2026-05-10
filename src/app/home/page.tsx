"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Upload, Disc3, Mic, Sparkles, CheckCircle2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [journalText, setJournalText] = useState("");
  const [isArchivePopoverOpen, setIsArchivePopoverOpen] = useState(false);
  const [archiveFolders, setArchiveFolders] = useState(["Personal", "Travel", "Love", "Social", "Deep"]);
  const [selectedCategory, setSelectedCategory] = useState("Personal");
  const [newFolderName, setNewFolderName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isEternalVoiceActive, setIsEternalVoiceActive] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [status, setStatus] = useState("");
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [mintSuccess, setMintSuccess] = useState(false);

  // Recording timer state
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingStartTimeRef = useRef<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();

  // Recording timer — uses Date.now() to avoid any closure/ref issues
  useEffect(() => {
    if (isRecording) {
      recordingStartTimeRef.current = Date.now();
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingSeconds(elapsed);
      }, 500);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  // Convert webm blob to WAV using Web Audio API (no external libraries)
  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get PCM data (mono, 16-bit)
    const numChannels = 1;
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    const length = channelData.length;
    const bytesPerSample = 2; // 16-bit
    const dataSize = length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // WAV Header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    await audioContext.close();
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleRecordingToggle = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Calculate elapsed time from start timestamp
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          console.log('Recording stopped. Elapsed seconds:', elapsed, 'Webm size:', webmBlob.size);

          if (elapsed < 10) {
            setStatus(`⚠️ Recording too short (${elapsed}s). Please record at least 30 seconds for best results.`);
            setHasRecorded(false);
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          setHasRecorded(true);
          setStatus('🔄 Converting audio & cloning your voice...');

          try {
            // Convert webm to WAV for ElevenLabs compatibility
            console.log('Converting webm to WAV...');
            const wavBlob = await convertToWav(webmBlob);
            console.log('WAV conversion done. Size:', wavBlob.size);

            const formData = new FormData();
            formData.append('audio', wavBlob, 'voice.wav');
            formData.append('name', `EternalEcho-${Date.now()}`);

            const res = await fetch('/api/clone-voice', { method: 'POST', body: formData });
            const data = await res.json();
            console.log('Clone voice response:', data);
            if (data.voiceId) {
              setVoiceId(data.voiceId);
              setStatus(`✅ Voice cloned successfully! (${elapsed}s recording)`);
            } else {
              setStatus('⚠️ Voice cloning failed: ' + (data.error || 'Default voice will be used.'));
            }
          } catch (err) {
            console.error('Clone voice error:', err);
            setStatus('⚠️ Error during voice cloning. Default voice will be used.');
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setStatus('🎙️ Recording... Speak for at least 30 seconds.');
      } catch {
        setStatus('❌ Microphone access denied.');
      }
    } else {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      setIsRecording(false);
    }
  };

  const handleMint = async () => {
    if (!journalText && !photoUrl) return;
    if (!walletAddress) {
      setStatus('Please enter your wallet address!');
      return;
    }

    setIsMinting(true);
    setMintSuccess(false);
    setStatus('Analyzing emotion...');

    try {
      const sentimentRes = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: journalText }),
      });
      const sentimentData = await sentimentRes.json();

      console.log('=== MINT: TTS CALL ===');
      console.log('voiceId state:', voiceId);
      console.log('Using voice:', voiceId || 'DEFAULT (no clone)');

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: journalText,
          voiceId: voiceId || undefined,
          stability: sentimentData.voiceSettings?.stability,
          similarityBoost: sentimentData.voiceSettings?.similarityBoost,
        }),
      });
      const ttsData = await ttsRes.json();
      if (!ttsData.audio) throw new Error('TTS failed');

      setStatus('Uploading to IPFS...');
      const binaryStr = atob(ttsData.audio);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      const audioBlob = new Blob([bytes], { type: 'audio/mp3' });

      const audioFormData = new FormData();
      audioFormData.append('file', audioBlob, 'memory.mp3');
      audioFormData.append('name', 'EternalEcho-Audio');
      const audioRes = await fetch('/api/upload-ipfs', { method: 'POST', body: audioFormData });
      const audioData = await audioRes.json();
      if (!audioData.ipfsUrl) throw new Error('IPFS failed');

      let imageIpfsUrl = 'https://placehold.co/500x500/purple/white?text=EternalEcho';
      if (photoFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', photoFile, photoFile.name);
        imageFormData.append('name', 'EternalEcho-Image');
        const imageRes = await fetch('/api/upload-ipfs', { method: 'POST', body: imageFormData });
        const imageData = await imageRes.json();
        if (imageData.ipfsUrl) imageIpfsUrl = imageData.ipfsUrl;
      }

      setStatus('Saving memory...');
      await fetch('/api/save-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: journalText.slice(0, 50),
          text: journalText,
          audioUrl: audioData.ipfsUrl,
          imageUrl: imageIpfsUrl,
          unlockDate: unlockDate || null,
          category: selectedCategory,
          walletAddress,
        }),
      });

      setStatus('Minting NFT...');
      const mintRes = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Echo: ${journalText.slice(0, 25)}`,
          description: journalText,
          audioUrl: audioData.ipfsUrl,
          imageUrl: imageIpfsUrl,
          walletAddress,
        }),
      });
      const mintData = await mintRes.json();

      if (mintData.success) {
        setStatus('✅ Your memory is sealed into eternity.');
        setMintSuccess(true);
      } else {
        setStatus('NFT error: ' + mintData.error);
      }
    } catch (err) {
      console.error(err);
      setStatus('An error occurred.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      setArchiveFolders([...archiveFolders, newFolderName.trim()]);
      setSelectedCategory(newFolderName.trim());
      setNewFolderName("");
      setIsArchivePopoverOpen(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <main className="flex-1 flex justify-center p-6 lg:p-12 font-sans overflow-x-hidden relative">
      <AnimatePresence>
        {isMinting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-white/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="absolute w-[800px] h-[800px] bg-gradient-radial from-[#D4AF37]/30 to-transparent rounded-full blur-3xl"
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: -50, opacity: 1 }} transition={{ duration: 2, ease: "easeOut" }}
              className="flex items-center gap-4 text-[#D4AF37] font-playfair text-3xl italic"
            >
              <Sparkles className="w-8 h-8" />
              <span>Sealing into Eternity...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-x-12 gap-y-10 lg:gap-x-16 relative z-10 mt-4 lg:mt-8">
        <motion.aside
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}
          className="w-full flex flex-col justify-between h-full"
        >
          <div
            className="bg-[var(--accent)] p-3 pb-10 rounded-sm shadow-layered border-subtle w-full max-w-[240px] mx-auto transform -rotate-2 transition-transform hover:rotate-0 duration-500 ease-out cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-white/50 w-full aspect-square mb-3 flex items-center justify-center overflow-hidden border-subtle relative group">
              {photoUrl ? (
                <img src={photoUrl} alt="Memory" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[var(--text-muted)] flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                  <Upload strokeWidth={1} className="w-6 h-6" />
                  <span className="text-xs">Upload Photo</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            <div className="text-center">
              <span className="font-caveat text-2xl text-[var(--foreground)] opacity-80">{currentDate}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-[240px] mx-auto mt-12 lg:mt-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 self-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2} />
              <span className="text-[9px] uppercase tracking-widest font-medium text-[var(--text-muted)]">
                Voice: {voiceId ? 'Cloned ✓' : 'Initialized'}
              </span>
            </div>

            <div className="bg-[var(--accent)] rounded-full shadow-layered border-subtle p-2 pr-4 flex items-center gap-3 w-full">
              <div className="flex items-center justify-center w-10 h-10 flex-shrink-0 bg-white rounded-full border border-[var(--border-color)]">
                <Disc3 className={`w-5 h-5 ${isRecording ? "animate-spin text-[#D4AF37]" : "text-[var(--foreground)]"}`} strokeWidth={1} />
              </div>
              <div className="flex-1">
                {isRecording ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-[#D4AF37] uppercase">Recording...</span>
                      <span className={`text-[11px] font-mono font-bold ${recordingSeconds >= 30 ? 'text-green-600' : 'text-[#D4AF37]'}`}>
                        {formatTime(recordingSeconds)}
                      </span>
                    </div>
                    {recordingSeconds < 30 && (
                      <div className="w-full bg-[var(--border-color)] rounded-full h-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-[#D4AF37] rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${Math.min((recordingSeconds / 30) * 100, 100)}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    {recordingSeconds >= 30 && (
                      <span className="text-[9px] text-green-600 font-medium">✓ Minimum reached</span>
                    )}
                    <button onClick={handleRecordingToggle} className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">Stop</button>
                  </div>
                ) : (
                  <button onClick={handleRecordingToggle} className="flex items-center gap-2 text-xs font-medium text-[var(--foreground)] hover:text-[#D4AF37] transition-colors">
                    <Mic className="w-3.5 h-3.5" />
                    {hasRecorded ? "Retake Imprint" : "Record Voice"}
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {hasRecorded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--accent)] rounded-full shadow-layered border-subtle py-2 px-4 flex items-center justify-between w-full overflow-hidden"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground)]">Make a Memory</span>
                  <button
                    onClick={() => setIsEternalVoiceActive(!isEternalVoiceActive)}
                    className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isEternalVoiceActive ? 'bg-[#D4AF37]' : 'bg-[#E8E5DF]'}`}
                  >
                    <motion.div layout className="w-3 h-3 bg-white rounded-full absolute top-[2px] shadow-sm" animate={{ left: isEternalVoiceActive ? "18px" : "2px" }} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="text"
              placeholder="Solana wallet address..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full text-xs bg-[var(--accent)] border border-[var(--border-color)] rounded-full px-4 py-2 text-[var(--foreground)] outline-none focus:border-[#D4AF37]/50"
            />
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}
          className={`bg-[var(--editor-bg)] paper-texture rounded-2xl p-8 sm:p-12 shadow-layered border-subtle relative flex flex-col h-full min-h-[500px] ${isMinting ? "border-[#D4AF37] shadow-[0_0_50px_rgba(212,175,55,0.2)]" : ""}`}
        >
          <div className="flex justify-between items-start mb-10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <Disc3 className="w-6 h-6 text-[var(--foreground)]" strokeWidth={1} />
                <span className="font-playfair text-lg font-semibold text-[var(--foreground)]">Cuvée</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] ml-9">Archive: {selectedCategory}</span>
            </div>
            <span className="text-[var(--text-muted)] text-sm italic">{currentDate}, {currentTime}</span>
          </div>

          <textarea
            className="w-full flex-1 bg-transparent outline-none resize-none font-playfair text-xl leading-relaxed text-[var(--foreground)] placeholder:text-[var(--text-muted)] placeholder:italic"
            placeholder="Record your thoughts, unedited and pure..."
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            disabled={isMinting}
          />

          <div className="absolute bottom-6 right-6 lg:bottom-12 lg:right-12 z-20 flex flex-col items-end">
            <AnimatePresence>
              {isArchivePopoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="mb-4 w-64 bg-white shadow-layered border-subtle rounded-xl p-4 flex flex-col gap-4"
                >
                  <span className="font-playfair text-sm font-semibold">Save to Archive</span>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                    {archiveFolders.map((folder) => (
                      <button key={folder} onClick={() => { setSelectedCategory(folder); setIsArchivePopoverOpen(false); }}
                        className="text-left px-3 py-2 text-xs font-medium hover:bg-[var(--accent)] rounded-md flex items-center justify-between"
                      >
                        {folder}
                        {selectedCategory === folder && <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                      </button>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
                    <input type="text" placeholder="New folder..." value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="flex-1 bg-[var(--accent)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-xs outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                    />
                    <button onClick={handleAddFolder} className="p-1.5 bg-[var(--foreground)] text-[var(--background)] rounded-md">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setIsArchivePopoverOpen(!isArchivePopoverOpen)}
              className="w-12 h-12 bg-white shadow-layered border-subtle rounded-full flex items-center justify-center hover:text-[#D4AF37]"
            >
              <Plus className={`w-5 h-5 transition-transform ${isArchivePopoverOpen ? "rotate-45" : ""}`} strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
          className="lg:col-start-2 flex flex-col gap-6 w-full"
        >
          <div className="w-full px-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
              <span>Genesis</span><span>Time Capsule Timeline</span><span>Eternity</span>
            </div>
            <div className="w-full h-[1px] bg-[var(--border-color)] relative flex items-center">
              <div className="absolute left-0 w-2 h-2 rounded-full bg-[var(--text-muted)]"></div>
              <div className="absolute left-1/2 w-1.5 h-1.5 rounded-full bg-[var(--border-color)]"></div>
              <div className="absolute right-0 w-2 h-2 rounded-full bg-[var(--foreground)]"></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <Calendar className="w-4 h-4 text-[var(--foreground)]" strokeWidth={1.5} />
              </div>
              <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full sm:w-auto pl-12 pr-6 py-3 rounded-full border-subtle shadow-layered bg-[var(--editor-bg)] text-sm outline-none cursor-pointer"
                style={{ colorScheme: "light" }}
              />
            </div>
            <button onClick={handleMint} disabled={isMinting || (!journalText && !photoUrl)}
              className="w-full sm:w-auto px-10 py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:bg-black disabled:opacity-50 transition-all text-sm font-medium tracking-widest uppercase shadow-layered"
            >
              {isMinting ? 'Sealing...' : 'Mint as Eternal NFT'}
            </button>
          </div>

          {status && <p className="text-sm text-center text-[var(--text-muted)]">{status}</p>}

          {/* Mint Success: Only show "Witness the magic" button — no audio player */}
          <AnimatePresence>
            {mintSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center gap-4 mt-2"
              >
                {unlockDate && new Date(unlockDate) > new Date() && (
                  <p className="text-xs text-center text-[#D4AF37]">
                    🔒 This memory is locked until {new Date(unlockDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  </p>
                )}
                <motion.button
                  onClick={() => router.push("/archive")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-white text-sm font-semibold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4" />
                    Witness the Magic
                    <span className="text-white/80">→</span>
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}