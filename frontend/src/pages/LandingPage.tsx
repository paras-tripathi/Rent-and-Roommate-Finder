import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, MessageCircle, ArrowRight, Star, Users, 
  TrendingUp, Cpu, Sparkles, ShieldCheck, CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

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


export default function LandingPage() {
  const { user } = useAuth();


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
        {/* Ambient Blurry Glows */}
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
              <span>AI-Powered Flatmate Matchmaker</span>
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
              {user ? (
                <Link 
                  to={
                    user.role === 'TENANT' 
                      ? '/dashboard/tenant' 
                      : user.role === 'OWNER' 
                      ? '/dashboard/owner' 
                      : '/dashboard/admin'
                  }
                  className="btn-primary bg-gradient-to-r from-indigo-500 to-pink-650 hover:from-indigo-650 hover:to-pink-700 text-white font-bold text-base px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 glow-btn w-full sm:w-auto text-center justify-center"
                >
                  Access Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="btn-primary bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-bold text-base px-8 py-4 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 glow-btn w-full sm:w-auto text-center justify-center"
                  >
                    Launch App Free <ArrowRight size={18} />
                  </Link>
                  <Link 
                    to="/login" 
                    className="btn-secondary bg-slate-900/60 border border-slate-850 hover:bg-slate-900 text-white font-bold text-base px-8 py-4 rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm text-center justify-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
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
              {user ? (
                <Link 
                  to={
                    user.role === 'TENANT' 
                      ? '/dashboard/tenant' 
                      : user.role === 'OWNER' 
                      ? '/dashboard/owner' 
                      : '/dashboard/admin'
                  }
                  className="bg-white text-slate-950 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition-all inline-flex items-center gap-2 justify-center shadow-lg w-full sm:w-auto text-sm uppercase tracking-wider"
                >
                  Access Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <>
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
                </>
              )}
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
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">© 2026 Rent & Flatmate Finder. All rights reserved.</p>
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
