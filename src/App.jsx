import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Download, 
  Send, 
  AlertTriangle,
  ExternalLink,
  ChevronDown
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
  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  // API Management
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  useEffect(() => {
    fetchVideos("Newest Music Mix 2024 Trending");
  }, []);

  const fetchVideos = async (query, keyIndex = 0) => {
    if (keyIndex >= apiKeys.length) {
        setIsQuotaExhausted(true);
        setLoading(false);
        return;
    }
    setLoading(true);
    const activeKey = apiKeys[keyIndex];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&type=video&key=${activeKey}`;

    try {
        const res = await fetch(url);
        if (res.status === 403) {
            const data = await res.json();
            if (data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                setCurrentKeyIndex(keyIndex + 1);
                return fetchVideos(query, keyIndex + 1);
            }
        }
        const data = await res.json();
        if (data.items) {
            setVideos(data.items);
            setIsQuotaExhausted(false);
        }
    } catch (err) {
        if (keyIndex < apiKeys.length - 1) return fetchVideos(query, keyIndex + 1);
    } finally {
        setLoading(false);
    }
  };

  const selectVideo = (video) => {
    const videoId = video.id.videoId || video.id;
    const videoData = {
      id: videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle
    };
    setCurrentVideo(videoData);
    setShowDownloadMenu(false);

    // Random related suggestions logic
    const randomKeywords = ["music", "official", "trending", "4k"];
    const randomQuery = `${videoData.title.split(' ')[0]} ${randomKeywords[Math.floor(Math.random() * randomKeywords.length)]}`;
    
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(randomQuery)}&type=video&key=${apiKeys[currentKeyIndex]}`)
      .then(r => r.json())
      .then(d => d.items && setRelatedVideos(d.items))
      .catch(() => {});

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-red-600/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/20">
                <Play size={20} fill="white" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">RKB<span className="text-red-600">.</span></h1>
            </div>
            <a href={TELEGRAM_URL} target="_blank" className="md:hidden bg-zinc-800 p-2.5 rounded-full">
              <Send size={18} className="text-blue-400" />
            </a>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); fetchVideos(searchQuery); }} className="w-full max-w-2xl relative flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search premium music..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-red-600 transition text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            </div>
            <button className="bg-red-600 px-6 rounded-xl font-bold hover:bg-red-700 transition flex items-center justify-center">
               <span className="hidden sm:inline">Search</span>
               <Search className="sm:hidden" size={20} />
            </button>
          </form>

          <a href={TELEGRAM_URL} target="_blank" className="hidden md:flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-700 transition">
             <Send size={18} className="text-blue-400" />
             <span className="text-xs font-bold">Support</span>
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-40 md:pt-28 px-4 pb-20">
        
        {isQuotaExhausted && (
          <div className="mb-10 bg-red-900/20 border border-red-600/50 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-4 animate-pulse">
            <AlertTriangle size={32} className="text-red-600" />
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-bold">API Limit Reached!</h2>
              <p className="text-xs text-zinc-400">Notun API key diye activate korun streaming chalu rakhte.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="text" 
                className="bg-black border border-zinc-700 px-4 py-2 rounded-lg text-xs flex-1"
                placeholder="Paste API Key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <button 
                onClick={() => { setApiKeys([tempApiKey, ...apiKeys]); setIsQuotaExhausted(false); fetchVideos("Trending"); }}
                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold"
              >
                ACTIVATE
              </button>
            </div>
          </div>
        )}

        {currentVideo && (
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                  <iframe 
                    src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&vq=hd1080`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
                <div className="mt-6 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold leading-tight">{currentVideo.title}</h2>
                    <p className="text-red-600 font-bold text-sm mt-1 flex items-center gap-2">
                       {currentVideo.channel}
                       <span className="bg-zinc-800 text-[10px] px-2 py-0.5 rounded text-zinc-400">1080P HD</span>
                    </p>
                  </div>
                  
                  <div className="relative w-full md:w-auto">
                    <button 
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="w-full md:w-auto bg-white text-black px-8 py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
                    >
                      <Download size={20} /> DOWNLOAD <ChevronDown size={16} />
                    </button>
                    
                    {showDownloadMenu && (
                      <div className="absolute right-0 bottom-full mb-2 w-full md:w-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50">
                        <p className="text-[10px] font-bold text-zinc-500 p-2 uppercase tracking-widest">Select Server</p>
                        <button onClick={() => window.open(`https://9xbuddy.com/process?url=https://www.youtube.com/watch?v=${currentVideo.id}`)} className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 rounded-xl transition text-sm">
                           Server 1 (High Speed) <ExternalLink size={14} />
                        </button>
                        <button onClick={() => window.open(`https://en.savefrom.net/1-youtube-video-downloader-360.html?url=https://www.youtube.com/watch?v=${currentVideo.id}`)} className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 rounded-xl transition text-sm">
                           Server 2 (HD Quality) <ExternalLink size={14} />
                        </button>
                        <button onClick={() => window.open(`https://y2mate.is/en98/youtube/${currentVideo.id}`)} className="w-full flex items-center justify-between p-3 hover:bg-zinc-800 rounded-xl transition text-sm">
                           Server 3 (MP3/Video) <ExternalLink size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <h3 className="text-xs font-bold uppercase text-zinc-500 mb-4 px-1">Discover Random Mix</h3>
                <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                  {relatedVideos.map((v) => (
                    <div key={v.id.videoId} onClick={() => selectVideo(v)} className="flex gap-3 cursor-pointer group">
                      <div className="relative flex-shrink-0">
                        <img src={v.snippet.thumbnails.medium.url} className="w-28 h-16 object-cover rounded-xl bg-zinc-900 border border-white/5" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl">
                           <Play size={16} fill="white" />
                        </div>
                      </div>
                      <h4 className="text-[11px] font-bold line-clamp-2 leading-tight group-hover:text-red-500 transition">{v.snippet.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-red-600 rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Trending Now</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="animate-pulse bg-zinc-900 rounded-3xl aspect-video" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {videos.map((v) => (
                <div key={v.id.videoId || v.id} onClick={() => selectVideo(v)} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900">
                    <img src={v.snippet.thumbnails.high.url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <div className="bg-red-600 p-4 rounded-full scale-75 group-hover:scale-100 transition">
                           <Play fill="white" size={24} />
                        </div>
                    </div>
                  </div>
                  <div className="mt-4 px-2">
                    <h3 className="font-bold text-sm line-clamp-2 group-hover:text-red-500 transition leading-snug">{v.snippet.title}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-widest">{v.snippet.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tighter">RKB<span className="text-red-600">.</span></h1>
            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-1">Next-Gen Streaming Platform</p>
          </div>
          <div className="flex gap-4">
             <a href={TELEGRAM_URL} target="_blank" className="bg-zinc-900 px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-zinc-800 transition border border-white/5">
                <Send size={18} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Join Telegram</span>
             </a>
          </div>
          <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-[0.4em]">© 2024 RKB PRO • API NODES: {apiKeys.length}</p>
        </div>
      </footer>
    </div>
  );
}
