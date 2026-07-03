import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, MessageCircle, ArrowRight, Star, Users, 
  TrendingUp, CheckCircle, Cpu, Sparkles, ShieldCheck, 
  Terminal, Code2, RefreshCw, Compass
} from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: Cpu,
    title: 'Cognitive Match Engine',
    desc: 'Powered by Gemini AI, our engine scans, parses, and scores listings against budget constraints, locations, and house rules.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    borderColor: 'group-hover:border-indigo-500/50',
    glowColor: 'rgba(99, 102, 241, 0.15)'
  },
  {
    icon: MessageCircle,
    title: 'High-Fidelity WebSockets',
    desc: 'Instant, persistent chat rooms established automatically upon owner acceptance, complete with typing statuses and receipts.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    borderColor: 'group-hover:border-pink-500/50',
    glowColor: 'rgba(236, 72, 153, 0.15)'
  },
  {
    icon: ShieldCheck,
    title: 'Decentralized Verification',
    desc: 'Stringent multi-step landlord credential checks and listing validation routines prevent duplicates and fake properties.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    borderColor: 'group-hover:border-violet-500/50',
    glowColor: 'rgba(139, 92, 246, 0.15)'
  },
  {
    icon: Home,
    title: 'Algorithmic Feeds',
    desc: 'Your browsing grid dynamically organizes, sorts, and displays rooms ranked strictly by your unique compatibility percentage.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    borderColor: 'group-hover:border-amber-500/50',
    glowColor: 'rgba(245, 158, 11, 0.15)'
  },
];

const stats = [
  { value: '10,000+', label: 'Verified Listings', icon: Home },
  { value: '50,050+', label: 'Happy Tenants', icon: Users },
  { value: '98%', label: 'Match Accuracy', icon: TrendingUp },
  { value: '24/7', label: 'Support Live', icon: Star },
];

const sampleRooms = [
  {
    title: 'Modern 1BHK near Hitech City',
    location: 'Hyderabad',
    rent: 16000,
    roomType: 'SINGLE',
    furnishing: 'FURNISHED',
    score: 94,
    explanation: 'Rent is inside your ₹18,000 threshold, and location Hyderabad matches your preference. The listing is fully furnished as requested.'
  },
  {
    title: 'Cozy Shared Room in Indiranagar',
    location: 'Bangalore',
    rent: 9000,
    roomType: 'SHARED',
    furnishing: 'SEMI_FURNISHED',
    score: 87,
    explanation: 'Rent fits well under budget (saving ₹6,000). Location matches Bangalore, and furnishing is semi-furnished.'
  },
  {
    title: 'Premium Studio in South Ext.',
    location: 'Delhi',
    rent: 22000,
    roomType: 'STUDIO',
    furnishing: 'FURNISHED',
    score: 68,
    explanation: 'Rent exceeds your preferred budget limit of ₹18,000. Location Delhi matches, and property is fully furnished.'
  }
];

export default function LandingPage() {
  // Antigravity Terminal Simulation States
  const [targetBudget, setTargetBudget] = useState<number>(18000);
  const [targetLocation, setTargetLocation] = useState<string>('Bangalore');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState<number>(1);
  const [consoleStatus, setConsoleStatus] = useState<'idle' | 'running' | 'success'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [showResultCard, setShowResultCard] = useState<boolean>(false);

  const startSimulation = () => {
    setConsoleStatus('running');
    setConsoleLogs([]);
    setShowResultCard(false);

    const logs = [
      `[system] Initializing Antigravity Match Agent v2.5...`,
      `[criteria] Loading user inputs (Budget Target: ₹${targetBudget.toLocaleString()}, Location: ${targetLocation})...`,
      `[mongodb] Querying active clusters for properties matching criteria...`,
      `[mongodb] Found 3 properties in active namespace.`,
      `[agent] invoker.gemini.computeCompatibility() - Requesting Gemini-1.5-Pro...`,
      `[ai-agent] Computing cross-features (budget margin, distance vectors, furnishing indexes)...`,
      `[agent] Gemini model returned evaluation: score=${sampleRooms[selectedRoomIdx].score}%, validation=SUCCESS.`,
      `[system] Compatibility score verified. Initializing visual render...`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setConsoleLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setConsoleStatus('success');
        setShowResultCard(true);
      }
    }, 450);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <Navbar />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Antigravity Blurry Glows */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-pink-500/10 rounded-full blur-[130px] animate-pulse pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Header Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-indigo-400 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-8 shadow-2xl backdrop-blur-md"
            >
              <Sparkles size={14} className="text-pink-500 animate-pulse" />
              <span>Google Antigravity Premium Template</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-8"
            >
              Build the new way.<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-450 via-purple-400 to-pink-500">
                Rent & Flatmate
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              An intelligent, agentic co-living platform. Computes precise AI compatibility scores, matches preferences instantly, and handles real-time handshakes.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                to="/register" 
                className="btn-primary bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-bold text-base px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 glow-btn w-full sm:w-auto"
              >
                Launch App Free <ArrowRight size={18} />
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary bg-slate-900/60 border border-slate-850 hover:bg-slate-900 text-white font-bold text-base px-8 py-4 rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
              >
                Access Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Agentic Simulator (Antigravity IDE Replica Widget) */}
      <section className="py-20 border-y border-slate-900 bg-slate-950/50 relative">
        {/* Decorative Grid Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">Interactive Agent Workspace</h2>
            <p className="text-slate-450 text-sm sm:text-base max-w-2xl mx-auto">
              Simulate how our AI Agent runs a live match calculation. Tweak parameters on the left and run the execution stack.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Control Panel */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-md">
              <div>
                <h3 className="font-extrabold text-indigo-400 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                  <Compass size={16} /> Parameters Input
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      <span>Max Budget Range</span>
                      <span className="text-indigo-400">₹{targetBudget.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min={5000} 
                      max={30000} 
                      step={1000}
                      value={targetBudget}
                      onChange={(e) => {
                        setTargetBudget(Number(e.target.value));
                        setConsoleStatus('idle');
                      }}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                      <span>₹5,000</span>
                      <span>₹30,000</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Preferred Hub</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mumbai', 'Bangalore', 'Delhi'].map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setTargetLocation(loc);
                            setConsoleStatus('idle');
                          }}
                          className={`py-2 px-3 text-xs rounded-lg font-bold uppercase tracking-wider border transition-all ${
                            targetLocation === loc 
                              ? 'bg-indigo-650 border-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                              : 'bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 border-slate-850'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Comparison Asset</label>
                    <div className="space-y-2">
                      {sampleRooms.map((room, index) => (
                        <button
                          key={room.title}
                          onClick={() => {
                            setSelectedRoomIdx(index);
                            setConsoleStatus('idle');
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            selectedRoomIdx === index
                              ? 'border-indigo-500/60 bg-indigo-500/5'
                              : 'border-slate-850 bg-slate-950/20 hover:bg-slate-900/40'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                            {room.roomType.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs truncate text-slate-200">{room.title}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{room.location} • ₹{room.rent.toLocaleString()}/mo</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={startSimulation}
                disabled={consoleStatus === 'running'}
                className="w-full btn-primary bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/20 transition-all uppercase tracking-wider text-xs border border-indigo-400/20 mt-6"
              >
                {consoleStatus === 'running' ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-white" />
                    Executing Workspace...
                  </>
                ) : (
                  <>
                    <Terminal size={14} /> Run Match Simulation
                  </>
                )}
              </button>
            </div>

            {/* Antigravity Console logs panel */}
            <div className="lg:col-span-7 flex flex-col bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Terminal Header */}
              <div className="bg-slate-900 px-4 py-3 border-b border-slate-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-2">antigravity-agent-console</span>
                </div>
                <Code2 size={13} className="text-slate-600" />
              </div>

              {/* Console logs */}
              <div className="flex-1 p-6 font-mono text-[11px] text-slate-300 space-y-2 overflow-y-auto min-h-[220px]">
                {consoleStatus === 'idle' && (
                  <div className="text-slate-500 italic flex items-center justify-center h-full flex-col gap-2 py-10">
                    <Terminal size={24} className="text-slate-700 animate-pulse" />
                    <span>Workspace idle. Click "Run Match Simulation" to compile parameters.</span>
                  </div>
                )}
                {consoleLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-600 shrink-0">{(index + 1).toString().padStart(2, '0')}</span>
                    <span className={
                      log.includes('[system]') ? 'text-indigo-400' :
                      log.includes('[criteria]') ? 'text-slate-400' :
                      log.includes('[mongodb]') ? 'text-violet-400' :
                      log.includes('[agent]') ? 'text-emerald-400' : 'text-pink-400'
                    }>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              {/* Final Animation Render Container */}
              <AnimatePresence>
                {showResultCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="p-6 bg-slate-900 border-t border-slate-950 flex flex-col md:flex-row items-center gap-6"
                  >
                    {/* Ring score */}
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          stroke="#6366f1" 
                          strokeWidth="8" 
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * sampleRooms[selectedRoomIdx].score) / 100}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-black">{sampleRooms[selectedRoomIdx].score}%</span>
                        <span className="text-[7px] uppercase tracking-wider text-indigo-300 font-bold">Match</span>
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                        <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Agent Validation Completed
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-100">{sampleRooms[selectedRoomIdx].title}</h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        {sampleRooms[selectedRoomIdx].explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">Core Architecture</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              A breakdown of the micro-services driving matches on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="group p-8 rounded-2xl bg-slate-900/30 border border-slate-900 hover:bg-slate-900/50 hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-6`}>
                    <f.icon size={22} className={f.color} />
                  </div>
                  <h3 className="text-lg font-extrabold mb-3 text-slate-100">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-900 bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 mb-1.5">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-indigo-900/50 via-slate-900 to-pink-900/20 border border-slate-900 relative shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Ready to find your match?
            </h2>
            <p className="text-slate-350 mb-10 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Create an account in less than two minutes. Let the AI Agent run the searches so you don't have to.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="bg-white text-slate-950 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-all inline-flex items-center gap-2 justify-center shadow-lg w-full sm:w-auto text-sm uppercase tracking-wider"
              >
                Get Started Now <ArrowRight size={16} />
              </Link>
              <Link 
                to="/login" 
                className="border border-slate-800 text-white hover:bg-slate-900/50 font-bold px-8 py-4 rounded-xl transition-all inline-flex items-center justify-center w-full sm:w-auto text-sm uppercase tracking-wider"
              >
                Sign In
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {['No Credit Card Required', 'Free for Students', 'Algorithmic Guardrails'].map(text => (
                <div key={text} className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle size={14} className="text-indigo-400" /> {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <Home size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">
              Rent & Flatmate Finder
            </span>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">© 2026 Rent & Flatmate Finder. Built with Google Antigravity.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-indigo-400 text-xs font-semibold uppercase tracking-wider transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 text-xs font-semibold uppercase tracking-wider transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 text-xs font-semibold uppercase tracking-wider transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
