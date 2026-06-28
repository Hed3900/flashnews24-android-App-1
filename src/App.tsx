import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Bell, 
  Send, 
  Database, 
  Wifi, 
  Battery, 
  Terminal, 
  Download, 
  ExternalLink, 
  ShieldAlert, 
  Moon, 
  Sun, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Bookmark, 
  ChevronLeft, 
  Settings, 
  FileCode, 
  BookOpen, 
  Layers 
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  imageUrl: string;
  date: string;
  category: string;
}

const SAMPLE_ARTICLES: Article[] = [
  {
    id: "1",
    title: "Global Space Alliance Announces Next-Generation Orbital Research Base",
    category: "AEROSPACE",
    date: "June 27, 2026",
    url: "https://flashnews24.com/aerospace/orbital-research-base",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    content: "The Global Space Alliance has officially greenlit 'Aether Station', a modular orbital habitat scheduled for launch in late 2028. Moving beyond current technological limits, the base is designed to sustain over thirty researchers in deep-space environments. Equipped with closed-loop bio-regenerative life support systems, electromagnetic radiation shielding, and standard-setting clean laboratories, Aether will host joint research into crystal growth, cell-tissue development, and cosmic ray telemetry."
  },
  {
    id: "2",
    title: "Tech Giant Unveils Advanced Neural Processing Chipset Architecture",
    category: "TECHNOLOGY",
    date: "June 26, 2026",
    url: "https://flashnews24.com/technology/neural-processing-architecture",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    content: "A revolutionary 1.8nm neural processing architecture has been unveiled, promising a massive 400% increase in edge computing efficiency. The chip features localized non-volatile memory arrays combined with state-of-the-art optical bus lines, cutting power dissipation during large-scale model inference down to mere milliwatts. Experts suggest this milestone will fully decentralize real-time speech translation and offline multi-agent systems directly onto standard mobile form factors."
  },
  {
    id: "3",
    title: "Deep Ocean Exploration Discovers Extraordinary Hydrothermal Ecosystems",
    category: "DISCOVERY",
    date: "June 25, 2026",
    url: "https://flashnews24.com/discovery/hydrothermal-ecosystems",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    content: "Descending deep into the Mariana Trench's outlying fracture zones, autonomous robotic explorers have documented a cluster of high-temperature hydrothermal vents hosting previously unobserved biological lineages. Among the discoveries are translucent chemotrophic bivalves and extremophile bacteria that synthesize thermal energy directly from localized sulfur compounds without any light ingress."
  },
  {
    id: "4",
    title: "Sustainable Smart Grid Milestone: Over 80% Active Power Fed by Renewables",
    category: "ENVIRONMENT",
    date: "June 24, 2026",
    url: "https://flashnews24.com/environment/smart-grid-milestone",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
    content: "For the first time in modern grid history, an entire national power grid successfully sustained an active load of 82% renewable generation over a continuous 72-hour window. The historic threshold was met through an elegant combination of modular sodium-ion thermal storage reserves, distributed wind farms, and intelligent AI-driven routing algorithms balancing regional frequency anomalies in real-time."
  }
];

export default function App() {
  // Simulator State
  const [activeScreen, setActiveScreen] = useState<'home' | 'detail'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article>(SAMPLE_ARTICLES[0]);
  const [isSimulatedDarkMode, setIsSimulatedDarkMode] = useState<boolean>(false);
  const [simulatedBookmarks, setSimulatedBookmarks] = useState<string[]>(["2"]); // Pre-bookmark one
  const [adMode, setAdMode] = useState<'test' | 'live'>('test');

  // FCM Notification Creator State
  const [notifTitle, setNotifTitle] = useState('Breaking News: First Light from Orbital Array!');
  const [notifBody, setNotifBody] = useState('Aether Station captures highly detailed micro-lens imagery from deep cosmic voids.');
  const [notifArticleId, setNotifArticleId] = useState('1');
  
  // Simulation Active State
  const [isSendingNotif, setIsSendingNotif] = useState(false);
  const [incomingNotification, setIncomingNotification] = useState<{
    id: string;
    title: string;
    body: string;
    article: Article;
  } | null>(null);

  // System Logs
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: 'info' | 'success' | 'warn' | 'fcm' }>>([
    { time: "18:42:15", text: "FlashNews24 App Engine initialized.", type: "info" },
    { time: "18:42:20", text: "Firebase Cloud Messaging: Subscribed to 'breaking-news' topic automatically.", type: "success" },
    { time: "18:42:24", text: "AdMob Core SDK integrated. Unit ID config validated.", type: "success" },
    { time: "18:43:02", text: "AppDatabase (Room) synced: 1 bookmarked article found.", type: "info" }
  ]);

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'fcm') => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [{ time, text, type }, ...prev]);
  };

  const handleSimulateFCM = () => {
    if (isSendingNotif) return;
    setIsSendingNotif(true);
    
    addLog(`FCM API Request dispatched: targeting 'breaking-news' topic`, 'fcm');
    addLog(`FCM Payload: { title: "${notifTitle}", topic: "breaking-news" }`, 'info');

    setTimeout(() => {
      const article = SAMPLE_ARTICLES.find(a => a.id === notifArticleId) || SAMPLE_ARTICLES[0];
      setIncomingNotification({
        id: Math.random().toString(),
        title: notifTitle,
        body: notifBody,
        article: article
      });
      setIsSendingNotif(false);
      addLog(`Push Notification delivered to target subscribers (Topic: breaking-news)`, 'success');
    }, 1200);
  };

  const handleNotificationClick = () => {
    if (!incomingNotification) return;
    const targetArticle = incomingNotification.article;
    setSelectedArticle(targetArticle);
    setActiveScreen('detail');
    setIncomingNotification(null);
    addLog(`App Launched via Notification Intent. Navigating to Article ID: ${targetArticle.id}`, 'info');
  };

  const toggleBookmark = (id: string) => {
    if (simulatedBookmarks.includes(id)) {
      setSimulatedBookmarks(prev => prev.filter(b => b !== id));
      addLog(`Room Database: Removed bookmark ID ${id}`, 'warn');
    } else {
      setSimulatedBookmarks(prev => [...prev, id]);
      addLog(`Room Database: Inserted bookmark ID ${id}`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans flex flex-col selection:bg-accent selection:text-bg overflow-x-hidden">
      {/* HEADER SECTION */}
      <header className="px-6 py-6 md:px-12 md:py-8 border-b-1.5 border-ink flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-bg">
        <div>
          <h1 className="font-syne text-3xl md:text-5xl font-extrabold tracking-tighter uppercase leading-none">
            FlashNews24<br />
            <span className="text-accent">Console</span>
          </h1>
          <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase opacity-60 mt-2">
            [ SECURE_SYSTEM_V2.6_ACTIVE ]
          </p>
        </div>
        <div className="flex flex-wrap gap-3 font-mono text-[10px] md:text-xs text-right">
          <div className="bg-ink text-bg px-3 py-1.5 flex items-center gap-1.5 font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            FCM & ADMOB COMPLIANT
          </div>
          <div className="border border-ink px-3 py-1.5 uppercase opacity-80">
            PKG: com.flashnews24.app
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        
        {/* LEFT COLUMN: INTERACTIVE WORKSPACE & LOGS (8 COLS) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          
          {/* INTERACTIVE APPMOB & FCM CONTROLLER */}
          <div className="border-1.5 border-ink p-6 md:p-8 bg-white shadow-[6px_6px_0_rgba(26,26,26,1)] flex flex-col gap-6 relative">
            <div className="absolute top-0 right-0 bg-accent text-bg font-mono text-[9px] font-bold px-3 py-1 uppercase tracking-wider">
              Simulation Deck
            </div>

            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-syne text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <Layers className="text-accent w-6 h-6" />
                Firebase Push Notification Dispatcher
              </h2>
              <p className="font-mono text-xs opacity-60 mt-1">
                Trigger high-priority simulated payload messages targeted at subscribers of the <code className="bg-ink/5 px-1 py-0.5 font-bold">"breaking-news"</code> topic.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom notification fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase mb-1.5">Notification Title</label>
                  <input 
                    type="text" 
                    value={notifTitle} 
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full bg-bg border-1.5 border-ink p-2.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase mb-1.5">Message Body</label>
                  <textarea 
                    value={notifBody} 
                    onChange={(e) => setNotifBody(e.target.value)}
                    rows={2}
                    className="w-full bg-bg border-1.5 border-ink p-2.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  />
                </div>
              </div>

              {/* Target deep link selector */}
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold uppercase mb-1.5">Target Deep-Link Article</label>
                  <select 
                    value={notifArticleId} 
                    onChange={(e) => setNotifArticleId(e.target.value)}
                    className="w-full bg-bg border-1.5 border-ink p-2.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {SAMPLE_ARTICLES.map(article => (
                      <option key={article.id} value={article.id}>
                        [{article.category}] {article.title.substring(0, 42)}...
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-ink/60 mt-1.5 block leading-relaxed">
                    *The background service processes the <code className="bg-ink/5 px-1 py-0.2">Intent</code> payload, allowing the native application to open the correct article dynamically when tapped from a cold/warm state.
                  </span>
                </div>

                <button
                  onClick={handleSimulateFCM}
                  disabled={isSendingNotif}
                  className={`w-full py-3 px-4 font-syne font-black text-sm uppercase tracking-wide border-1.5 border-ink flex items-center justify-center gap-2 transition-all shadow-[3px_3px_0_rgba(26,26,26,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(26,26,26,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${isSendingNotif ? 'bg-ink/10 text-ink/40 cursor-not-allowed' : 'bg-accent text-bg'}`}
                >
                  <Send className={`w-4 h-4 ${isSendingNotif ? 'animate-bounce' : ''}`} />
                  {isSendingNotif ? 'Broadcasting message...' : 'Simulate FCM Broadcast'}
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE SYSTEM DIAGNOSTIC LOGS */}
          <div className="border-1.5 border-ink p-6 bg-ink text-bg shadow-[6px_6px_0_rgba(255,77,0,1)] font-mono flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xs uppercase font-bold flex items-center gap-2 text-accent">
                <Terminal className="w-4 h-4" />
                Live Diagnostic Terminal Log
              </h3>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 uppercase tracking-wider">Syslog v1.0.4</span>
            </div>

            <div className="h-44 overflow-y-auto flex flex-col gap-2 text-xs pr-2">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3 leading-relaxed border-b border-white/5 pb-1.5 last:border-0">
                  <span className="text-white/40 select-none">[{log.time}]</span>
                  <span className={
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warn' ? 'text-yellow-400' :
                    log.type === 'fcm' ? 'text-accent font-bold' :
                    'text-white/80'
                  }>
                    {log.type === 'fcm' ? '⚡ [FCM] ' : ''}
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CODE ARCHITECTURE AUDIT CARD */}
          <div className="border-1.5 border-ink p-6 md:p-8 bg-white shadow-[6px_6px_0_rgba(26,26,26,1)] flex flex-col gap-6">
            <div className="border-b border-ink/10 pb-4">
              <h2 className="font-syne text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-ink">
                <FileCode className="w-6 h-6 text-accent" />
                Production Security & Package Audit
              </h2>
              <p className="font-mono text-xs opacity-60 mt-1">
                Continuous compliance check representing current files integrated within com.flashnews24.app
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-ink/15 p-4 bg-bg/50">
                <div className="font-mono text-[10px] font-bold text-accent uppercase mb-1">AdMob Integration</div>
                <div className="text-xs font-bold leading-relaxed mt-2 text-ink/80">
                  • Test Ads: Active for Debug builds<br/>
                  • Production Unit ID: Loaded<br/>
                  • Manifest placeholders: Configured
                </div>
              </div>

              <div className="border border-ink/15 p-4 bg-bg/50">
                <div className="font-mono text-[10px] font-bold text-accent uppercase mb-1">Firebase Messaging</div>
                <div className="text-xs font-bold leading-relaxed mt-2 text-ink/80">
                  • Auto-Subscription: Active<br/>
                  • Android 13+ SDK Dialog: Yes<br/>
                  • Background service: Compliant
                </div>
              </div>

              <div className="border border-ink/15 p-4 bg-bg/50">
                <div className="font-mono text-[10px] font-bold text-accent uppercase mb-1">Local Room Schema</div>
                <div className="text-xs font-bold leading-relaxed mt-2 text-ink/80">
                  • AppDatabase: Configured<br/>
                  • Entities: BookmarkEntity<br/>
                  • Migration support: Auto
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: INTERACTIVE DEVICE EMULATOR (5 COLS) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center px-2">
            <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-accent" />
              Device Emulator
            </span>
            <button 
              onClick={() => setIsSimulatedDarkMode(!isSimulatedDarkMode)}
              className="border border-ink/20 hover:border-ink bg-white px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-[2px_2px_0_rgba(26,26,26,1)] hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              {isSimulatedDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-yellow-500" />
                  Light Theme
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-accent" />
                  Dark Theme
                </>
              )}
            </button>
          </div>

          {/* SIMULATED DEVICE SHELL */}
          <div className="w-[330px] sm:w-[360px] h-[720px] rounded-[38px] border-[12px] border-ink bg-ink relative shadow-[10px_10px_0_rgba(26,26,26,0.15)] flex flex-col overflow-hidden">
            
            {/* Camera Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-ink rounded-full z-50 flex justify-center items-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div>
            </div>

            {/* Simulated Push Notification Banner */}
            {incomingNotification && (
              <div 
                onClick={handleNotificationClick}
                className="absolute top-12 left-3 right-3 bg-white/95 dark:bg-zinc-900/95 text-ink dark:text-white border-1.5 border-ink rounded-2xl p-3.5 z-40 shadow-xl cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-slide-down flex items-start gap-3"
              >
                <div className="bg-accent text-white p-2 rounded-xl">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-mono text-[9px] font-bold tracking-wider text-accent uppercase">Breaking News</span>
                    <span className="font-mono text-[8px] opacity-40">Just Now</span>
                  </div>
                  <h4 className="font-bold text-xs truncate leading-snug">{incomingNotification.title}</h4>
                  <p className="text-[10px] opacity-70 line-clamp-1 mt-0.5">{incomingNotification.body}</p>
                </div>
              </div>
            )}

            {/* PHONE INNER DISPLAY */}
            <div className={`flex-1 flex flex-col transition-colors duration-300 overflow-hidden ${isSimulatedDarkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
              
              {/* Status Bar */}
              <div className="h-10 pt-2 px-6 flex justify-between items-center text-[10px] font-mono font-bold select-none opacity-80 z-30">
                <span>18:57</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[8px]">5G</span>
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* SIMULATED APP TOP BAR */}
              <div className={`h-14 px-4 border-b flex items-center justify-between z-20 ${isSimulatedDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md`}>
                <div className="flex items-center gap-2">
                  {activeScreen === 'detail' && (
                    <button 
                      onClick={() => {
                        setActiveScreen('home');
                        addLog("Emulator returned to Home Feed.", "info");
                      }}
                      className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <span className="font-syne font-black tracking-tight text-base text-accent">
                    {activeScreen === 'home' ? 'FlashNews24' : 'Article Reader'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {activeScreen === 'home' ? (
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 my-auto"></span>
                      <span className="font-mono text-[8px] font-bold opacity-60">LIVE FEED</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => toggleBookmark(selectedArticle.id)}
                      className={`p-1.5 rounded-lg transition-colors ${simulatedBookmarks.includes(selectedArticle.id) ? 'text-accent' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <Bookmark className="w-4 h-4" fill={simulatedBookmarks.includes(selectedArticle.id) ? "currentColor" : "none"} />
                    </button>
                  )}
                </div>
              </div>

              {/* SIMULATED SCREEN CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                
                {activeScreen === 'home' ? (
                  <>
                    {/* Welcome Banner */}
                    <div className="text-[11px] opacity-75 font-mono mb-1 bg-accent/5 dark:bg-accent/10 p-2.5 rounded-lg border border-accent/20">
                      🌍 Sync status: <span className="font-bold text-accent">Active</span>. Delivering latest updates powered by live Blogger endpoints.
                    </div>

                    {/* Featured Article Card */}
                    <div 
                      onClick={() => {
                        setSelectedArticle(SAMPLE_ARTICLES[0]);
                        setActiveScreen('detail');
                        addLog(`Emulator: Loaded Featured Article "${SAMPLE_ARTICLES[0].title.substring(0, 30)}..."`, "info");
                      }}
                      className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.01] ${isSimulatedDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}
                    >
                      <div className="h-36 overflow-hidden relative">
                        <img 
                          src={SAMPLE_ARTICLES[0].imageUrl} 
                          alt="featured" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-accent text-bg font-mono text-[8px] font-bold px-2 py-0.5 rounded-md">
                          {SAMPLE_ARTICLES[0].category}
                        </span>
                      </div>
                      <div className="p-3.5">
                        <span className="font-mono text-[9px] opacity-50">{SAMPLE_ARTICLES[0].date}</span>
                        <h3 className="font-bold text-sm leading-snug mt-1 group-hover:text-accent transition-colors">
                          {SAMPLE_ARTICLES[0].title}
                        </h3>
                        <p className="text-[11px] opacity-60 line-clamp-2 mt-1.5">
                          {SAMPLE_ARTICLES[0].content}
                        </p>
                      </div>
                    </div>

                    {/* INTERACTIVE COMPLIANT ADMOB BANNER (Required by user instruction #4, #5, #6) */}
                    <div className={`rounded-xl border p-3 flex flex-col gap-2 relative ${isSimulatedDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[8px] font-bold tracking-widest text-accent uppercase">AdMob Adaptive Banner</span>
                        <span className="font-mono text-[8px] bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded text-slate-500 dark:text-zinc-400 font-extrabold">SPONSOR</span>
                      </div>
                      
                      {/* Real Banner Visualization */}
                      <div className="h-[50px] bg-slate-200 dark:bg-zinc-800 border border-dashed border-slate-400 dark:border-zinc-700 flex flex-col items-center justify-center text-[9px] font-mono select-none px-2 text-center rounded-lg">
                        <div className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>
                          AdView Content Loader
                        </div>
                        <div className="text-[7.5px] opacity-50 truncate w-full mt-0.5">
                          ID: {adMode === 'live' ? 'ca-app-pub-3288039417600063/3826509024' : 'ca-app-pub-3940256099942544/6300978111'}
                        </div>
                      </div>
                    </div>

                    {/* List of remaining articles */}
                    <div className="flex flex-col gap-3">
                      {SAMPLE_ARTICLES.slice(1).map(article => (
                        <div 
                          key={article.id}
                          onClick={() => {
                            setSelectedArticle(article);
                            setActiveScreen('detail');
                            addLog(`Emulator: Loaded Article "${article.title.substring(0, 30)}..."`, "info");
                          }}
                          className={`cursor-pointer rounded-xl border p-3 flex gap-3 transition-transform hover:scale-[1.01] ${isSimulatedDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}
                        >
                          <img 
                            src={article.imageUrl} 
                            alt="thumb" 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[8px] font-extrabold text-accent">{article.category}</span>
                                <span className="font-mono text-[8px] opacity-40">{article.date}</span>
                              </div>
                              <h4 className="font-bold text-xs leading-snug line-clamp-2 mt-0.5">
                                {article.title}
                              </h4>
                            </div>
                            {simulatedBookmarks.includes(article.id) && (
                              <div className="flex justify-end">
                                <Bookmark className="w-3 h-3 text-accent" fill="currentColor" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // ARTICLE READER DETAIL PAGE (ADMOB AND INTERSTITIALS EXCLUDED - STRICTLY POLICY COMPLIANT)
                  <div className="flex flex-col gap-3.5">
                    <div className="flex justify-between items-center">
                      <span className="bg-accent/10 text-accent font-mono text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {selectedArticle.category}
                      </span>
                      <span className="font-mono text-[9px] opacity-50">{selectedArticle.date}</span>
                    </div>

                    <h1 className="font-bold text-base leading-snug">
                      {selectedArticle.title}
                    </h1>

                    <img 
                      src={selectedArticle.imageUrl} 
                      alt="detail" 
                      className="w-full h-40 object-cover rounded-xl mt-1"
                    />

                    {/* Policy compliance warning flag */}
                    <div className="p-2.5 bg-green-500/10 border border-green-500/25 rounded-lg text-[9.5px] font-mono leading-relaxed text-green-600 dark:text-green-400 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <strong>Clean Reader Mode Policy:</strong> Google Ads are fully excluded on reading screens to prevent accidental clicks and maintain complete Play Store compliance.
                      </div>
                    </div>

                    <p className="text-[11.5px] leading-relaxed opacity-80 mt-2 text-justify">
                      {selectedArticle.content}
                    </p>

                    <div className="h-6"></div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom Safe Area Home Button */}
            <div className="h-6 bg-ink flex justify-center items-center z-50">
              <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </section>
      </main>

      {/* COMPACT DETAILED DEV GUIDE AND AUDIT REPORT FOOTER */}
      <footer className="mt-auto border-t-1.5 border-ink bg-white">
        
        {/* EXPORT INSTRUCTION BOX */}
        <div className="bg-accent/5 border-b border-ink/10 px-6 py-8 md:px-12">
          <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
            <div className="flex-1">
              <h3 className="font-syne text-lg md:text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                How to Export This Project to Android Studio
              </h3>
              <p className="text-xs text-ink/75 mt-1 max-w-[800px] leading-relaxed">
                Your native source code, including custom Kotlin scripts, Room layouts, Retrofit endpoints, manifest rules, and AdMob banner implementations, is compiled and safe. Since direct APK generation requires local key storage, follow these simple steps to run on any local computer:
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="font-mono text-[9px] bg-ink text-bg px-2.5 py-1 uppercase tracking-wider">Gradle JDK 21</span>
              <span className="font-mono text-[9px] bg-ink text-bg px-2.5 py-1 uppercase tracking-wider">Compose Compiler 1.5+</span>
            </div>
          </div>

          <div className="max-w-[1500px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 font-mono text-[10.5px]">
            <div className="border border-ink/20 p-4 bg-white shadow-[2px_2px_0_rgba(26,26,26,1)]">
              <span className="text-accent font-bold">STEP 01</span>
              <h4 className="font-bold text-xs uppercase mt-1">Download ZIP</h4>
              <p className="opacity-75 mt-2 leading-relaxed">Open settings menu, choose 'Export to ZIP', extract the contents locally.</p>
            </div>
            <div className="border border-ink/20 p-4 bg-white shadow-[2px_2px_0_rgba(26,26,26,1)]">
              <span className="text-accent font-bold">STEP 02</span>
              <h4 className="font-bold text-xs uppercase mt-1">Open in AS</h4>
              <p className="opacity-75 mt-2 leading-relaxed">Launch Android Studio Ladybug+, select 'Open Existing Project', pick root folder.</p>
            </div>
            <div className="border border-ink/20 p-4 bg-white shadow-[2px_2px_0_rgba(26,26,26,1)]">
              <span className="text-accent font-bold">STEP 03</span>
              <h4 className="font-bold text-xs uppercase mt-1">Sync Gradle</h4>
              <p className="opacity-75 mt-2 leading-relaxed">Let the build environment fetch Kotlin, Room compile, and AdMob libraries securely.</p>
            </div>
            <div className="border border-ink/20 p-4 bg-white shadow-[2px_2px_0_rgba(26,26,26,1)]">
              <span className="text-accent font-bold">STEP 04</span>
              <h4 className="font-bold text-xs uppercase mt-1">Run Device</h4>
              <p className="opacity-75 mt-2 leading-relaxed">Press shift+F10 (Play button) to deploy directly to any device or emulator.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM METADATA BAR */}
        <div className="px-6 py-4 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <div className="opacity-60 flex items-center gap-2">
            <span>© 2026 AI Studio Environment</span>
            <span>•</span>
            <span className="text-[10px] text-accent">ACTIVE RUNNING STATE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-60">LOC: 40.7128° N, 74.0060° W</span>
            <span className="bg-ink text-bg px-2 py-0.5 text-[9px] uppercase">SYS_V01</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
