import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Zap, MessageCircle, ArrowRight, 
  Star, Users, TrendingUp, CheckCircle, 
  Cpu, Sparkles, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: Cpu,
    title: 'AI Compatibility Engine',
    desc: 'Our advanced matching algorithm scores every listing based on your budget, location, and lifestyle preferences.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'Once an owner accepts your interest, chat instantly with live typing indicators and seen receipts.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    desc: 'All property owners are verified. Browse with confidence knowing every listing is authentic.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Home,
    title: 'Smart Matching',
    desc: 'Stop scrolling through irrelevant listings. Our platform surfaces only the rooms that match YOU.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const stats = [
  { value: '10,000+', label: 'Verified Listings', icon: Home },
  { value: '50,000+', label: 'Happy Tenants', icon: Users },
  { value: '95%', label: 'Match Accuracy', icon: TrendingUp },
  { value: '24/7', label: 'Support', icon: Star },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bangalore',
    text: 'Found my perfect flatmate within 3 days! The AI compatibility score was spot on.',
    avatar: 'P',
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Rahul Gupta',
    role: 'Property Owner, Mumbai',
    text: 'As an owner, I now get only serious, compatible tenants. No more time wasting!',
    avatar: 'R',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Ananya Patel',
    role: 'Student, Delhi',
    text: 'The real-time chat made connecting with owners so easy. Highly recommended!',
    avatar: 'A',
    color: 'from-emerald-500 to-teal-600',
  },
];

const sampleRooms = [
  {
    id: 1,
    title: 'Modern 1BHK near Hitech City',
    location: 'Hyderabad',
    rent: 16000,
    roomType: 'SINGLE',
    furnishing: 'FURNISHED',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    title: 'Cozy Shared Room in Indiranagar',
    location: 'Bangalore',
    rent: 9000,
    roomType: 'SHARED',
    furnishing: 'SEMI_FURNISHED',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: 'Premium Studio in South Ext.',
    location: 'Delhi',
    rent: 22000,
    roomType: 'STUDIO',
    furnishing: 'FURNISHED',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80'
  }
];

export default function LandingPage() {
  // Demo Interactive States
  const [demoBudget, setDemoBudget] = useState<number>(15000);
  const [demoLocation, setDemoLocation] = useState<string>('Bangalore');
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(1);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [demoExplanation, setDemoExplanation] = useState<string>('');

  const runDemoCalculation = () => {
    setIsCalculating(true);
    setCalculatedScore(null);
    
    setTimeout(() => {
      const room = sampleRooms[selectedRoomIndex];
      let score = 0;
      let reasons: string[] = [];

      // Budget Match (Max 50 points)
      if (room.rent <= demoBudget) {
        score += 50;
        reasons.push('Rent fits comfortably within your budget.');
      } else if (room.rent <= demoBudget * 1.15) {
        score += 35;
        reasons.push('Rent is slightly over your budget but manageable.');
      } else {
        score += 15;
        reasons.push('Rent is higher than your target budget.');
      }

      // Location Match (Max 50 points)
      if (room.location.toLowerCase() === demoLocation.toLowerCase()) {
        score += 50;
        reasons.push('Located in your preferred city.');
      } else {
        score += 10;
        reasons.push(`Located in ${room.location} rather than your preferred city (${demoLocation}).`);
      }

      // Add small randomness to simulate live AI precision
      score = Math.min(100, Math.max(10, score + Math.floor(Math.random() * 5)));
      
      setCalculatedScore(score);
      setDemoExplanation(reasons.join(' '));
      setIsCalculating(false);
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-28 bg-grid-pattern">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-8 shadow-sm"
            >
              <Sparkles size={14} className="animate-spin-slow text-indigo-500" />
              <span>Next-Gen Roommate Matching</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
            >
              Find Your Perfect <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Home & Flatmate
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg lg:text-xl text-dark-600 dark:text-dark-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              India's first compatibility-driven rental platform. Skip the endless scrolling and connect with individuals who match your budget, location, and lifestyle.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link 
                to="/register" 
                id="hero-register-btn" 
                className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 justify-center glow-btn w-full sm:w-auto shadow-indigo-500/20 shadow-lg"
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary text-base px-8 py-3.5 flex items-center justify-center w-full sm:w-auto border border-dark-200 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-900 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-dark-100 dark:border-dark-900 bg-dark-50/30 dark:bg-dark-950/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 mb-1">{stat.value}</div>
                <div className="text-dark-500 dark:text-dark-400 text-xs sm:text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Tool (Recruiter Hook!) */}
      <section className="py-20 bg-dark-50/50 dark:bg-dark-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">See how the AI Matching works</h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Try our interactive simulation tool to calculate compatibility scores in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Control Panel */}
            <div className="lg:col-span-5 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 p-6 rounded-2xl shadow-xl">
              <h3 className="font-bold text-lg mb-4 text-indigo-600 dark:text-indigo-400">1. Setup Your Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-sm font-semibold mb-2">
                    <span>Monthly Budget Target</span>
                    <span className="text-indigo-500">₹{demoBudget.toLocaleString()}</span>
                  </label>
                  <input 
                    type="range" 
                    min={5000} 
                    max={30000} 
                    step={1000}
                    value={demoBudget}
                    onChange={(e) => setDemoBudget(Number(e.target.value))}
                    className="w-full h-2 bg-dark-200 dark:bg-dark-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-dark-400 mt-1">
                    <span>₹5K</span>
                    <span>₹30K</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Preferred Location</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Mumbai', 'Bangalore', 'Delhi'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setDemoLocation(loc)}
                        className={`py-2 px-3 text-sm rounded-lg font-medium border transition-all ${
                          demoLocation === loc 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                            : 'bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-800 dark:text-dark-200 border-dark-200 dark:border-dark-750'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Select a Room to Compare</label>
                  <div className="space-y-2">
                    {sampleRooms.map((room, index) => (
                      <button
                        key={room.id}
                        onClick={() => {
                          setSelectedRoomIndex(index);
                          setCalculatedScore(null);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                          selectedRoomIndex === index
                            ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                            : 'border-dark-200 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-900'
                        }`}
                      >
                        <img src={room.image} alt={room.title} className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{room.title}</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">{room.location} • ₹{room.rent.toLocaleString()}/mo</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runDemoCalculation}
                  disabled={isCalculating}
                  className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-600/20"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Computing Match...
                    </>
                  ) : (
                    <>
                      <Zap size={16} /> Run Compatibility Engine
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Screen */}
            <div className="lg:col-span-7 flex flex-col justify-center h-full min-h-[300px]">
              <AnimatePresence mode="wait">
                {calculatedScore === null ? (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-2 border-dashed border-dark-200 dark:border-dark-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full"
                  >
                    <div className="w-16 h-16 bg-dark-100 dark:bg-dark-900 rounded-full flex items-center justify-center mb-4 text-dark-400">
                      <Cpu size={28} className="animate-pulse" />
                    </div>
                    <h4 className="font-bold text-lg mb-1">Ready for Analysis</h4>
                    <p className="text-dark-500 dark:text-dark-400 text-sm max-w-sm">
                      Set your budget and preferred location on the left, then click the button to see the compatibility scoring engine run.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="bg-gradient-to-br from-dark-900 to-indigo-950 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Circle Gauge */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            cx="50" cy="50" r="40" 
                            stroke="rgba(255,255,255,0.1)" 
                            strokeWidth="8" 
                            fill="transparent" 
                          />
                          <motion.circle 
                            cx="50" cy="50" r="40" 
                            stroke="#6366f1" 
                            strokeWidth="8" 
                            fill="transparent"
                            strokeDasharray={251.2}
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 251.2 - (251.2 * calculatedScore) / 100 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-extrabold">{calculatedScore}%</span>
                          <span className="text-[10px] uppercase tracking-wider text-indigo-300">Match</span>
                        </div>
                      </div>

                      {/* Score description */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full">
                            Report Generated
                          </span>
                        </div>
                        <h4 className="text-xl font-bold mb-3">{sampleRooms[selectedRoomIndex].title}</h4>
                        <p className="text-sm text-dark-300 leading-relaxed mb-4">
                          {demoExplanation}
                        </p>
                        <div className="text-xs text-indigo-200 border-t border-white/10 pt-3 flex items-center justify-center md:justify-start gap-1.5">
                          <CheckCircle size={12} className="text-emerald-400" /> Powered by the Compatibility Engine
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything You Need</h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto text-lg">
              From advanced algorithmic matchmaking to secure real-time communications, we have streamlined the entire process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="card p-8 border border-dark-200 dark:border-dark-850 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-350 bg-white dark:bg-dark-900"
              >
                <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  <f.icon size={26} className={f.color} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 bg-dark-50/50 dark:bg-dark-900/20 border-y border-dark-100 dark:border-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Simple 3-Step Flow</h2>
            <p className="text-dark-500 dark:text-dark-400 text-lg">Find a compatible home and roommate without the usual headache.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              { step: '01', title: 'Setup Your Profile', desc: 'Define your budget boundaries, ideal locales, and personal habits.' },
              { step: '02', title: 'Compare Compatibility', desc: 'Browse apartments instantly sorted by a customized compatibility percentage.' },
              { step: '03', title: 'Chat & Move In', desc: 'Unlock high-fidelity real-time chat with landlords and future housemates.' },
            ].map((item, idx) => (
              <motion.div 
                key={item.step} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                  <span className="text-white font-extrabold text-xl">{item.step}</span>
                </div>
                <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Loved by Renters</h2>
            <p className="text-dark-500 dark:text-dark-400 text-lg">Hear from some of our verified members.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div 
                key={t.name} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="card p-8 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-850 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-600 dark:text-dark-400 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-extrabold text-sm">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-dark-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-12 lg:p-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                Ready to Find Your Dream Space?
              </h2>
              <p className="text-indigo-100 mb-10 text-lg lg:text-xl max-w-2xl mx-auto">
                Join thousands of users today. Sign up in under 2 minutes and start matching immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/register" 
                  id="cta-register-btn" 
                  className="bg-white text-indigo-750 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all inline-flex items-center gap-2 justify-center shadow-lg shadow-black/10 w-full sm:w-auto text-base"
                >
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link 
                  to="/login" 
                  className="border border-white/40 text-white hover:border-white hover:bg-white/10 font-bold px-8 py-4 rounded-xl transition-all inline-flex items-center justify-center w-full sm:w-auto text-base"
                >
                  Sign In
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {['No credit card required', 'Free forever', 'Instant matching'].map(text => (
                  <div key={text} className="flex items-center gap-2 text-indigo-100 text-xs sm:text-sm">
                    <CheckCircle size={15} className="text-emerald-400" /> {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-200 dark:border-dark-900 py-12 bg-white dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
              <Home size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-450">
              Rent & Flatmate Finder
            </span>
          </div>
          <p className="text-dark-400 text-sm">© 2026 Rent & Flatmate Finder. Designed for Excellence.</p>
          <div className="flex gap-6">
            <a href="#" className="text-dark-400 hover:text-indigo-500 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-dark-400 hover:text-indigo-500 text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-dark-400 hover:text-indigo-500 text-sm transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
