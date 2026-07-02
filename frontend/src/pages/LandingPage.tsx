import { Link } from 'react-router-dom';
import { Home, Zap, MessageCircle, Shield, ArrowRight, MapPin, IndianRupee, Search, Star, Users, TrendingUp, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: Zap,
    title: 'AI Compatibility Engine',
    desc: 'Our GPT-4 powered engine scores every listing based on your budget, location, and lifestyle preferences.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'Once an owner accepts your interest, chat instantly with live typing indicators and seen receipts.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Verified Listings',
    desc: 'All property owners are verified. Browse with confidence knowing every listing is authentic.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
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

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-violet-50 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
              <Zap size={14} /> AI-Powered Flatmate Finding
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6">
              Find Your Perfect
              <span className="block gradient-text">Home & Flatmate</span>
            </h1>
            <p className="text-lg lg:text-xl text-dark-600 dark:text-dark-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              India's most intelligent rent and flatmate platform. AI-powered compatibility scores, real-time chat, and thousands of verified listings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" id="hero-register-btn" className="btn-primary text-base px-8 py-3 flex items-center gap-2 justify-center">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3 flex items-center justify-center">
                Sign In
              </Link>
            </div>
          </div>

          {/* Quick search bar */}
          <div className="mt-16 max-w-2xl mx-auto animate-slide-up">
            <div className="card p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-1">
                <MapPin size={18} className="text-dark-400 shrink-0" />
                <span className="text-dark-400 text-sm">Mumbai, Bangalore, Delhi...</span>
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 py-1 sm:border-l border-dark-200 dark:border-dark-700">
                <IndianRupee size={18} className="text-dark-400 shrink-0" />
                <span className="text-dark-400 text-sm">Budget range</span>
              </div>
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2">
                <Search size={16} /> Search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-dark-100 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
                <div className="text-dark-500 dark:text-dark-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              From AI compatibility matching to real-time messaging, we've built the complete platform for modern renters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="card p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={22} className={f.color} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-dark-50 dark:bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-dark-500 dark:text-dark-400">Get started in minutes, find your perfect match today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Tell us your preferences, budget, and desired location for a personalized experience.' },
              { step: '02', title: 'Browse & Match', desc: 'Our AI analyses hundreds of listings and shows you only the most compatible ones.' },
              { step: '03', title: 'Connect & Move In', desc: 'Express interest, chat with owners, and move into your perfect home.' },
            ].map(item => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Loved by Thousands</h2>
            <p className="text-dark-500 dark:text-dark-400">Real stories from real users across India.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-600 dark:text-dark-400 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-dark-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative overflow-hidden rounded-3xl p-12 bg-gradient-to-br from-primary-600 to-violet-700">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Find Your Place?</h2>
              <p className="text-primary-100 mb-8 text-lg">Join thousands of tenants and owners on India's smartest rental platform.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" id="cta-register-btn" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors inline-flex items-center gap-2 justify-center">
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors inline-flex items-center justify-center">
                  Sign In
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6">
                {['No credit card required', 'Free forever', 'Cancel anytime'].map(text => (
                  <div key={text} className="flex items-center gap-1.5 text-primary-100 text-sm">
                    <CheckCircle size={14} /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-200 dark:border-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-violet-600 rounded-md flex items-center justify-center">
              <Home size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">Rent & Flatmate Finder</span>
          </div>
          <p className="text-dark-400 text-sm">© 2024 Rent & Flatmate Finder. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-dark-400 hover:text-dark-600 text-sm transition-colors">Privacy</a>
            <a href="#" className="text-dark-400 hover:text-dark-600 text-sm transition-colors">Terms</a>
            <a href="#" className="text-dark-400 hover:text-dark-600 text-sm transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
