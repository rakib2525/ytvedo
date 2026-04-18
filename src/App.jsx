import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Plus, 
  Search, 
  Download, 
  Share2, 
  History, 
  Bug, 
  ChevronRight, 
  CheckCircle2,
  LogOut,
  MessageSquare,
  AlertTriangle,
  Key,
  Send
} from 'lucide-react';

// --- Configuration ---
const INITIAL_API_KEYS = [
  "AIzaSyCCT46NIV0ko9z_12BoGRjLZDk3JcMNvEM",
  "AIzaSyAOt6uR432IX1Ir_j97Jc2U6cClx3W9oDQ",
  "AIzaSyBl34m1skKwCESvABTSqjd7Nemq2ZRB3Tg",
  "AIzaSyA8cteo72P3YK5hkDe4mkcgsVXiGcFo-y4",
  "AIzaSyAZoT9-DgIHNj2-uqZ1TqkwmnE7y_TuC8I"
];

const TELEGRAM_URL = "https://t.me/bug_cash";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // API Management State
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('rkb_history') || '[]');
    const savedUser = JSON.parse(localStorage.getItem('rkb_user'));
    setHistory(savedHistory);
    if (savedUser) setUser(savedUser);
    
    fetchVideos("4K UHD cinematic trailers 2024");
  }, []);

  const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
  };

  const fetchVideos = async (query, keyIndex = 0) => {
    if (keyIndex >= apiKeys.length) {
      setIsQuotaExhausted(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    const activeKey = apiKeys[keyIndex];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${activeKey}`;

    try {
      const res = await fetchWithRetry(url);
      
      if (res.status === 403) {
        const data = await res.json();
        if (data.error?.errors?.[0]?.reason === 'quotaExceeded') {
          console.warn(`Key ${keyIndex + 1} exhausted. Switching...`);
          setCurrentKeyIndex(keyIndex + 1);
          return fetchVideos(query, keyIndex + 1);
        }
      }

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      if (data.items) {
        setVideos(data.items);
        setIsQuotaExhausted(false);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      if (keyIndex < apiKeys.length - 1) {
        return fetchVideos(query, keyIndex + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomApiKey = (e) => {
    e.preventDefault();
    if (tempApiKey.trim()) {
      const newKeys = [tempApiKey, ...apiKeys];
      setApiKeys(newKeys);
      setCurrentKeyIndex(0);
      setIsQuotaExhausted(false);
      fetchVideos(searchQuery || "Trending 2024", 0);
      setTempApiKey("");
    }
  };

  const selectVideo = (video) => {
    const videoId = video.id.videoId || video.id;
    const videoData = {
      id: videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      thumb: video.snippet.thumbnails.high.url
    };
    setCurrentVideo(videoData);
    
    const newHistory = [videoData, ...history.filter(v => v.id !== videoData.id)].slice(0, 12);
    setHistory(newHistory);
    localStorage.setItem('rkb_history', JSON.stringify(newHistory));
    
    const activeKey = apiKeys[currentKeyIndex];
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(videoData.title)}&type=video&key=${activeKey}`)
      .then(r => r.json())
      .then(d => d.items && setRelatedVideos(d.items))
      .catch(() => {});

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-600/30">
      
      {/* Navbar - Brand updated to RKB */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20 group-hover:scale-110 transition">
              <Play size={20} fill="white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">
              RKB<span className="text-red-600">.</span>
            </h1>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchVideos(searchQuery, currentKeyIndex); }} className="flex-1 max-w-2xl relative">
            <input 
              type="text" 
              placeholder="Premium search korun..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 px-12 focus:outline-none focus:ring-2 focus:ring-red-600 transition text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          </form>

          <div className="flex items-center gap-4">
            <a href={TELEGRAM_URL} target="_blank" className="bg-zinc-800 p-2.5 rounded-full hover:bg-zinc-700 transition" title="Contact Telegram">
              <Send size={18} className="text-blue-400" />
            </a>
            {user ? (
              <img src={user.avatar} className="w-9 h-9 rounded-full border border-red-600" />
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="bg-white text-black px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition hover:bg-zinc-200">Login</button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-24 px-4 pb-20">
        
        {/* Warning Box for Quota */}
        {isQuotaExhausted && (
          <div className="mb-12 animate-in zoom-in duration-500">
            <div className="bg-gradient-to-r from-red-900/40 to-zinc-900 border border-red-600/50 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-red-600 p-5 rounded-3xl shadow-lg">
                  <AlertTriangle size={40} className="text-white animate-pulse" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-black tracking-tighter uppercase">RKB API Limit Reached!</h2>
                  <p className="text-zinc-400 text-sm mt-2">Amader default API keys-er limit shesh. Streaming chalu rakhte niche notun API key din.</p>
                </div>
                <form onSubmit={handleCustomApiKey} className="flex gap-2 w-full md:w-auto">
                  <input 
                    type="text" 
                    placeholder="Enter Custom API Key"
                    className="bg-black/50 border border-zinc-700 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-xs w-full md:w-64"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                  />
                  <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-red-700 transition">ACTIVATE</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Player Section */}
        {currentVideo && (
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                  <iframe 
                    src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&vq=hd1080&rel=0`}
                    className="w-full h-full"
                    allowFullScreen
                    title="RKB Premium Player"
                  />
                </div>
                <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{currentVideo.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-red-600 font-bold text-xs uppercase tracking-widest">{currentVideo.channel}</span>
                      <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
                      <span className="text-zinc-500 text-[10px] font-black uppercase">1080P Ultra HD</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => window.open(`https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${currentVideo.id}`)}
                      className="bg-white text-black px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition shadow-lg"
                    >
                      <Download size={18} /> DOWNLOAD
                    </button>
                    <a href={TELEGRAM_URL} target="_blank" className="bg-zinc-800 p-3 rounded-xl hover:bg-zinc-700 transition">
                       <MessageSquare size={20} />
                    </a>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 ml-1">Related Premium Content</h3>
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
                  {relatedVideos.map((v) => (
                    <div key={v.id.videoId} onClick={() => selectVideo(v)} className="flex gap-3 cursor-pointer group">
                      <img src={v.snippet.thumbnails.medium.url} className="w-24 h-14 object-cover rounded-xl bg-zinc-900 border border-white/5" />
                      <h4 className="text-[11px] font-bold line-clamp-2 group-hover:text-red-500 transition leading-tight">{v.snippet.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Discovery Grid */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-red-600 rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Discovery</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {videos.map((v) => (
                <div key={v.id.videoId || v.id} onClick={() => selectVideo(v)} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 shadow-xl">
                    <img src={v.snippet.thumbnails.high.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                      <div className="bg-red-600 p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition duration-300">
                        <Play fill="white" size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-500 transition leading-snug">{v.snippet.title}</h3>
                    <p className="text-[10px] font-black text-zinc-500 mt-2 uppercase tracking-widest">{v.snippet.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer with updated name and Telegram */}
      <footer className="mt-20 border-t border-white/5 py-12 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tighter">RKB<span className="text-red-600">.</span></h1>
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-1">Premium Video Player Experience</p>
          </div>
          <div className="flex items-center gap-6">
             <a href={TELEGRAM_URL} target="_blank" className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-white transition uppercase tracking-widest">
                <Send size={14} className="text-blue-400" /> Telegram Support
             </a>
          </div>
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em]">© 2024 RKB PRO • SERVER: {currentKeyIndex + 1}/{apiKeys.length}</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #E50914; }
      `}} />
    </div>
  );
}