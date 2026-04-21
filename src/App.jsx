import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Download, 
  Send, 
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Smartphone,
  Maximize
} from 'lucide-react';

// --- Configuration ---
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
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [error, setError] = useState(null);

  // Initial load - Simplified for faster start
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
    // reduced maxResults to speed up desktop load
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=18&q=${encodeURIComponent(query)}&type=video&key=${activeKey}`;

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

  const handleDownload = (id) => {
    // 9xbuddy er bodole y2mate use kora hocche direct link er jonno
    window.open(`https://www.y2mate.com/youtube/${id}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-600/30 overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.location.reload()}>
            <div className="bg-red-600 p-1.5 rounded-lg shadow-lg shadow-red-600/20">
              <Play size={18} fill="white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">RKB<span className="text-red-600">.</span></h1>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchVideos(searchQuery); }} className="flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 transition appearance-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          </form>

          <div className="flex items-center shrink-0">
            <a href={APK_DOWNLOAD_URL} className="bg-white text-black p-2 md:px-4 md:py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition shadow-lg">
              <Smartphone size={14} /> <span className="hidden md:inline font-black uppercase tracking-tighter tracking-tight">APK Download</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-20 px-0 md:px-4 pb-20 text-left">
        
        {error && (
          <div className="mx-4 mb-6 bg-red-900/20 border border-red-600/30 p-4 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {currentVideo ? (
          <section className="mb-8 animate-in fade-in duration-500">
            {/* Player Container - Optimized for Desktop & Mobile Speed */}
            <div className="relative w-full aspect-video bg-black md:rounded-2xl overflow-hidden border-b md:border border-white/5 shadow-2xl">
              <iframe 
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&rel=0&modestbranding=1&vq=hd720`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Video Player"
                loading="eager"
              />
            </div>
            
            <div className="mt-4 px-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-black leading-tight tracking-tight uppercase italic">{currentVideo.title}</h2>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                  {currentVideo.channel}
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleDownload(currentVideo.id)}
                  className="flex-1 md:flex-none bg-zinc-900 hover:bg-zinc-800 border border-white/10 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download size={14} /> Download Music
                </button>
              </div>
            </div>
          </section>
        ) : (
           <div className="hidden md:block py-10"></div>
        )}

        <div className="flex items-center gap-2 mb-6 px-4">
          <div className="w-1 h-5 bg-red-600 rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Trending Playlist</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 px-2 md:px-0">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-video bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 md:gap-x-4 gap-y-6 px-2 md:px-0">
            {videos.map((v) => (
              <div 
                key={v.id.videoId} 
                onClick={() => selectVideo(v)} 
                className="group cursor-pointer text-left"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/5">
                  <img 
                    src={v.snippet.thumbnails.medium.url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700 grayscale-[0.2] group-hover:grayscale-0" 
                    alt=""
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                       <Play size={16} fill="white" />
                    </div>
                  </div>
                </div>
                <div className="mt-2 px-1">
                  <h3 className="text-[10px] md:text-[11px] font-black line-clamp-2 leading-tight group-hover:text-red-500 transition uppercase italic tracking-tighter">
                    {v.snippet.title}
                  </h3>
                  <p className="text-[8px] text-zinc-600 mt-1 uppercase font-bold tracking-widest truncate">{v.snippet.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 text-center bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
          <h1 className="text-2xl font-black tracking-tighter italic">RKB<span className="text-red-600">.</span></h1>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
              <Send size={12} className="text-blue-500" /> Support
            </a>
            <span className="hidden md:block text-zinc-800">|</span>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Server: <span className="text-red-600">{currentKeyIndex + 1}</span> / {API_KEYS.length}
            </p>
          </div>
          <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.5em]">© 2024 RKB PRO PLAYER</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        body { -webkit-tap-highlight-color: transparent; overflow-x: hidden; scroll-behavior: smooth; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dc2626; }
        
        iframe { background: black; }
      `}} />
    </div>
  );
}
