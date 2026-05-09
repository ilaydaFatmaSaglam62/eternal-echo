'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [status, setStatus] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSpeak = async () => {
    if (!text) return;
    setLoading(true);
    setStatus('Duygu analizi yapılıyor...');
    try {
      const sentimentRes = await fetch('/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const sentimentData = await sentimentRes.json();
      setStatus(`Duygu: ${sentimentData.sentiment} — Seslendirilıyor...`);

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          stability: sentimentData.voiceSettings?.stability,
          similarityBoost: sentimentData.voiceSettings?.similarityBoost,
        }),
      });
      const ttsData = await ttsRes.json();

      if (ttsData.audio) {
        const binaryStr = atob(ttsData.audio);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mp3' });
        setAudioBlob(blob);
        setAudioSrc(URL.createObjectURL(blob));
        setStatus('Ses hazır!');
      }
    } catch (err) {
      console.error(err);
      setStatus('Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadIPFS = async () => {
    if (!audioBlob) return;
    setStatus("IPFS'e yükleniyor...");
    try {
      const audioFormData = new FormData();
      audioFormData.append('file', audioBlob, 'memory.mp3');
      audioFormData.append('name', 'EternalEcho-Audio');

      const audioRes = await fetch('/api/upload-ipfs', {
        method: 'POST',
        body: audioFormData,
      });
      const audioData = await audioRes.json();

      if (!audioData.ipfsUrl) {
        setStatus('Ses IPFS hatası: ' + audioData.error);
        return;
      }

      setIpfsUrl(audioData.ipfsUrl);

      if (image) {
        const imageFormData = new FormData();
        imageFormData.append('file', image, image.name);
        imageFormData.append('name', 'EternalEcho-Image');

        const imageRes = await fetch('/api/upload-ipfs', {
          method: 'POST',
          body: imageFormData,
        });
        const imageData = await imageRes.json();

        if (imageData.ipfsUrl) {
          setImagePreview(imageData.ipfsUrl);
        }
      }

      setStatus("IPFS'e yüklendi!");
    } catch (err) {
      console.error(err);
      setStatus('IPFS yükleme hatası.');
    }
  };

  const handleMintNFT = async () => {
    if (!ipfsUrl || !walletAddress) {
      setStatus('Lütfen cüzdan adresini gir!');
      return;
    }
    setStatus('NFT basılıyor...');
    try {
      const res = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'EternalEcho Memory',
          description: text,
          audioUrl: ipfsUrl,
          imageUrl: imagePreview || '',
          walletAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('✅ NFT başarıyla basıldı!');
      } else {
        setStatus('NFT hatası: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      setStatus('NFT basma hatası.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">🎙️ EternalEcho</h1>
      <p className="text-zinc-400">Anını yaz, sesini duy, sonsuza sakla.</p>

      <div className="w-full max-w-lg">
        <label className="block text-zinc-400 mb-2">📷 Fotoğraf Yükle</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white"
        />
        {imagePreview && (
          <img src={imagePreview} alt="preview" className="mt-4 rounded-xl w-full max-h-48 object-cover" />
        )}
      </div>

      <textarea
        className="w-full max-w-lg h-32 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-purple-500"
        placeholder="Anını buraya yaz..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSpeak}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 px-8 py-3 rounded-full font-semibold transition-colors"
      >
        {loading ? 'İşleniyor...' : '🔊 Seslendir'}
      </button>

      {audioSrc && (
        <div className="w-full max-w-lg flex flex-col gap-4">
          <audio controls autoPlay src={audioSrc} className="w-full" />
          <button
            onClick={handleUploadIPFS}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-full font-semibold transition-colors"
          >
            ☁️ IPFS'e Kaydet
          </button>
        </div>
      )}

      {ipfsUrl && (
        <div className="w-full max-w-lg flex flex-col gap-4">
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-green-400 font-semibold mb-2">✅ IPFS'e Yüklendi!</p>
            <a href={ipfsUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 break-all text-sm">
              {ipfsUrl}
            </a>
          </div>
          <input
            type="text"
            placeholder="Solana cüzdan adresin (NFT buraya gönderilecek)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={handleMintNFT}
            className="bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-full font-semibold text-black transition-colors"
          >
            🪙 NFT Bas
          </button>
        </div>
      )}

      {status && (
        <p className="text-zinc-400 text-sm">{status}</p>
      )}
    </div>
  );
}