import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Download, 
  Send, 
  AlertTriangle,
  Smartphone,
  Loader2,
  Maximize2
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
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos("Newest Music Mix 2024 Trending");
  }, []);

  const fetchVideos = async (query, keyIndex = 0) => {
    if (keyIndex >= API_KEYS.length) {
        setError("All API keys exhausted.");
        setLoading(false);
        return;
    }

    setLoading(true);
    const activeKey = API_KEYS[keyIndex];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${activeKey}`;

    try {
        const res = await fetch(url);
        if (res.status === 403) return fetchVideos(query, keyIndex + 1);
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
    setVideoLoading(true);
    setCurrentVideo({
      id: videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Full Screen Toggle function for better mobile rotation
  const toggleFullScreen = () => {
    const iframe = document.getElementById('player-frame');
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    }
  };

  const handleDownload = (id, type = 'y2mate') => {
    if(type === 'y2mate') {
      window.open(`https://www.y2mate.com/youtube/${id}`, '_blank');
    } else {
      window.open(`https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${id}`, '_blank');
    }
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
            <h1 className="text-xl font-black tracking-tighter uppercase italic">RKB<span className="text-red-600">.</span></h1>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchVideos(searchQuery); }} className="flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder="Search music..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 px-10 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          </form>

          <div className="flex items-center shrink-0">
            <a href={APK_DOWNLOAD_URL} className="bg-white text-black p-2 md:px-4 md:py-2 rounded-full text-[10px] font-black flex items-center gap-2 hover:bg-red-600 hover:text-white transition uppercase tracking-tight">
              <Smartphone size={14} /> <span className="hidden md:inline">APK Download</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-20 px-0 md:px-4 pb-20 text-left">
        
        {currentVideo ? (
          <section className="mb-8 animate-in fade-in duration-500">
            <div className="relative w-full aspect-video bg-black md:rounded-2xl overflow-hidden shadow-2xl">
              {videoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Fast Loading...</p>
                </div>
              )}
              {/* Added playsinline and picture-in-picture for background attempt */}
              <iframe 
                id="player-frame"
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1&showinfo=0&vq=hd720&playsinline=1`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title="RKB Player"
                onLoad={() => setVideoLoading(false)}
              />
              
              {/* FullScreen Button for Mobile Rotation Fix */}
              <button 
                onClick={toggleFullScreen}
                className="absolute bottom-4 right-4 z-20 bg-black/60 p-2 rounded-full border border-white/20 md:hidden"
              >
                <Maximize2 size={16} />
              </button>
            </div>
            
            <div className="mt-4 px-4 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-black leading-tight tracking-tight uppercase italic">{currentVideo.title}</h2>
                <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                  {currentVideo.channel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleDownload(currentVideo.id, 'y2mate')}
                  className="flex-1 md:flex-none bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download size={14} /> Download Music
                </button>
              </div>
            </div>
          </section>
        ) : (
           <div className="hidden md:block py-6"></div>
        )}

        <div className="flex items-center gap-2 mb-6 px-4">
          <div className="w-1 h-5 bg-red-600 rounded-full" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Discover Tracks</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-zinc-900 md:rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          /* Mobile: 1 Column, Tablet: 2, Desktop: 3 for massive thumbnails */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 md:gap-x-6">
            {videos.map((v) => (
              <div 
                key={v.id.videoId} 
                onClick={() => selectVideo(v)} 
                className="group cursor-pointer text-left"
              >
                <div className="relative aspect-video md:rounded-2xl overflow-hidden bg-zinc-900 border-y md:border border-white/5 shadow-lg">
                  <img 
                    src={v.snippet.thumbnails.high ? v.snippet.thumbnails.high.url : v.snippet.thumbnails.medium.url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 grayscale-[0.1] group-hover:grayscale-0" 
                    alt=""
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
                       <Play size={20} fill="white" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-4 md:px-1">
                  <h3 className="text-sm md:text-base font-black line-clamp-2 leading-tight group-hover:text-red-500 transition uppercase italic tracking-tighter">
                    {v.snippet.title}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest truncate">{v.snippet.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 text-center bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
          <h1 className="text-2xl font-black tracking-tighter italic">RKB<span className="text-red-600">.</span></h1>
          <div className="flex justify-center gap-4">
            <a href={TELEGRAM_URL} target="_blank" className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
              <Send size={12} className="text-blue-500" /> Telegram
            </a>
          </div>
          <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-[0.5em]">© 2024 RKB PRO EXPERIENCE</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        body { -webkit-tap-highlight-color: transparent; overflow-x: hidden; scroll-behavior: smooth; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        iframe { background: black; }
      `}} />
    </div>
  );
}
