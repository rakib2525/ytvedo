import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Download, 
  Send, 
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Smartphone
} from 'lucide-react';

// --- Configuration ---
// API Keys list - একটি শেষ হলে অন্যটি কাজ করবে
const API_KEYS = [
  "AIzaSyCCT46NIV0ko9z_12BoGRjLZDk3JcMNvEM",
  "AIzaSyAOt6uR432IX1Ir_j97Jc2U6cClx3W9oDQ",
  "AIzaSyBl34m1skKwCESvABTSqjd7Nemq2ZRB3Tg",
  "AIzaSyA8cteo72P3YK5hkDe4mkcgsVXiGcFo-y4",
  "AIzaSyAZoT9-DgIHNj2-uqZ1TqkwmnE7y_TuC8I"
];

const TELEGRAM_URL = "https://t.me/bug_cash";
const APK_DOWNLOAD_URL = "https://t.me/ytvedo/2";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [error, setError] = useState(null);

  // Initial load
  useEffect(() => {
    fetchVideos("Newest Music Mix 2024 Trending");
  }, []);

  const fetchVideos = async (query, keyIndex = 0) => {
    if (keyIndex >= API_KEYS.length) {
        setError("All API keys exhausted. Add more keys.");
        setLoading(false);
        return;
    }

    setLoading(true);
    const activeKey = API_KEYS[keyIndex];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&type=video&key=${activeKey}`;

    try {
        const res = await fetch(url);
        if (res.status === 403) {
            return fetchVideos(query, keyIndex + 1);
        }
        const data = await res.json();
        if (data.items) {
            setVideos(data.items);
            setCurrentKeyIndex(keyIndex);
            setError(null);
        }
    } catch (err) {
        if (keyIndex < API_KEYS.length - 1) return fetchVideos(query, keyIndex + 1);
    } finally {
        setLoading(false);
    }
  };

  const selectVideo = (video) => {
    const videoId = video.id.videoId || video.id;
    setCurrentVideo({
      id: videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20">
              <Play size={20} fill="white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter hidden sm:block">RKB<span className="text-red-600">.</span></h1>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchVideos(searchQuery); }} className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Search music..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2.5 px-10 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          </form>

          <div className="flex items-center gap-2">
            <a href={APK_DOWNLOAD_URL} className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition">
              <Smartphone size={14} /> <span className="hidden md:inline">Download App</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-24 px-4 pb-20 text-left">
        
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600/30 p-4 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {currentVideo && (
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <iframe 
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="text-left">
                <h2 className="text-xl font-bold">{currentVideo.title}</h2>
                <p className="text-red-600 text-xs font-bold uppercase mt-1">{currentVideo.channel}</p>
              </div>
              <button 
                onClick={() => window.open(`https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${currentVideo.id}`)}
                className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition"
              >
                <Download size={16} /> DOWNLOAD VIDEO
              </button>
            </div>
          </section>
        )}

        <div className="flex items-center gap-2 mb-8">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          <h2 className="text-lg font-black uppercase tracking-tighter">Recommended for you</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-video bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {videos.map((v) => (
              <div key={v.id.videoId} onClick={() => selectVideo(v)} className="group cursor-pointer text-left">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900">
                  <img src={v.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Play size={20} fill="white" />
                  </div>
                </div>
                <h3 className="mt-2 text-[11px] font-bold line-clamp-2 leading-snug group-hover:text-red-500 transition">{v.snippet.title}</h3>
                <p className="text-[9px] text-zinc-500 mt-1 uppercase font-medium">{v.snippet.channelTitle}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-10 text-center">
        <h1 className="text-xl font-black">RKB<span className="text-red-600">.</span></h1>
        <div className="flex justify-center gap-4 mt-4">
          <a href={TELEGRAM_URL} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest">Telegram Support</a>
          <span className="text-zinc-800">|</span>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Server {currentKeyIndex + 1} Active</p>
        </div>
      </footer>
    </div>
  );
}
