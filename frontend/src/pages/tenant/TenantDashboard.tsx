import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Clock, CheckCircle, XCircle,
  User, Home, Zap, Send, IndianRupee, MapPin, Calendar, Sparkles, Filter
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listingsAPI, interestsAPI, profilesAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import ListingCard, { ListingCardSkeleton } from '../../components/ListingCard';
import Pagination from '../../components/Pagination';
import { Listing, Interest } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusIcon: Record<string, React.ReactNode> = {
  PENDING: <Clock size={14} className="text-amber-500" />,
  ACCEPTED: <CheckCircle size={14} className="text-emerald-500" />,
  DECLINED: <XCircle size={14} className="text-red-500" />,
};
const statusClass: Record<string, string> = {
  PENDING: 'badge-yellow',
  ACCEPTED: 'badge-green',
  DECLINED: 'badge-red',
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'browse' | 'interests' | 'profile'>('browse');
  const [filters, setFilters] = useState({ location: '', minBudget: '', maxBudget: '' });
  const [page, setPage] = useState(1);
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState('');
  const [showInterestModal, setShowInterestModal] = useState<Listing | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    preferredLocation: '',
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    bio: '',
    preferences: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['listings', filters, page],
    queryFn: () => listingsAPI.getAll({ ...filters, page, limit: 9 }).then(r => r.data),
  });

  const { data: myProfile } = useQuery({
    queryKey: ['tenantProfile'],
    queryFn: () => profilesAPI.getTenant().then(r => r.data),
    enabled: !!user,
  });

  const { data: myInterests } = useQuery({
    queryKey: ['myInterests'],
    queryFn: () => interestsAPI.getMy().then(r => r.data),
    enabled: !!user,
  });

  useEffect(() => {
    if (myProfile) {
      setProfileForm({
        preferredLocation: myProfile.preferredLocation || '',
        budgetMin: String(myProfile.budgetMin || ''),
        budgetMax: String(myProfile.budgetMax || ''),
        moveInDate: myProfile.moveInDate ? myProfile.moveInDate.split('T')[0] : '',
        bio: myProfile.bio || '',
        preferences: myProfile.preferences || '',
      });
    }
  }, [myProfile]);

  const listings: Listing[] = listingsData?.listings || listingsData || [];
  const totalPages = listingsData?.totalPages || 1;
  const interests: Interest[] = myInterests || [];

  const handleSendInterest = async (listing: Listing) => {
    setSendingInterest(listing.id);
    try {
      await interestsAPI.send({ listingId: listing.id, message: interestMessage });
      toast.success('Interest expressed successfully!');
      queryClient.invalidateQueries({ queryKey: ['myInterests'] });
      setShowInterestModal(null);
      setInterestMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send interest');
    } finally {
      setSendingInterest(null);
    }
  };

  const handleDeleteInterest = async (id: string, status: string) => {
    const isPending = status === 'PENDING';
    const confirmMessage = isPending 
      ? "Are you sure you want to withdraw your interest request?" 
      : "Are you sure you want to delete this request record? This will permanently close the chat room and allow you to express interest in this listing again.";
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await interestsAPI.withdraw(id);
      toast.success(isPending ? 'Interest request withdrawn!' : 'Request record deleted!');
      queryClient.invalidateQueries({ queryKey: ['myInterests'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch {
      toast.error('Failed to update request');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await profilesAPI.saveTenant({
        preferredLocation: profileForm.preferredLocation,
        budgetMin: Number(profileForm.budgetMin),
        budgetMax: Number(profileForm.budgetMax),
        moveInDate: profileForm.moveInDate,
        bio: profileForm.bio,
        preferences: profileForm.preferences,
      });
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['tenantProfile'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const alreadySentInterest = (listingId: string) =>
    interests.some(i => i.listingId === listingId);

  const tabs = [
    { id: 'browse', label: 'Browse Rooms', icon: Home },
    { id: 'interests', label: 'My Interests', icon: Zap, count: interests.filter(i => i.status === 'PENDING').length },
    { id: 'profile', label: 'My Preferences', icon: User },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300">
      <Navbar currentView={tab === 'browse' ? 'list' : tab} onNavigate={(view) => setTab(view === 'list' ? 'browse' : (view as any))} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Block (Premium Mesh Banner) */}
        <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                Find Your Match, {user?.name}! 👋
              </h1>
              <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
                {!myProfile 
                  ? 'Complete your preferences to unlock compatibility matching scores powered by our AI engine.' 
                  : 'Compare rooms with custom compatibility ratings and start chatting instantly.'}
              </p>
            </div>
            {!myProfile && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTab('profile')} 
                className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg shadow-black/10 text-sm whitespace-nowrap align-self-start"
              >
                <Sparkles size={16} className="text-indigo-600 animate-pulse" /> Complete Profile
              </motion.button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-800/80 p-1.5 rounded-2xl mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap relative ${
                tab === t.id
                  ? 'bg-white dark:bg-dark-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-dark-100 dark:border-dark-700'
                  : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
              }`}
            >
              <t.icon size={15} />
              <span>{t.label}</span>
              {t.count ? (
                <span className="bg-pink-500 text-white text-[10px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm">
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Contents with Transitions */}
        <AnimatePresence mode="wait">
          {tab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filter Area */}
              <div className="card p-5 mb-8 border border-dark-200 dark:border-dark-850 shadow-md">
                <div className="flex items-center gap-2 font-bold text-sm text-dark-800 dark:text-dark-200 mb-4">
                  <Filter size={16} className="text-indigo-500" />
                  <span>Filter Options</span>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                  <div className="flex-1 flex items-center gap-2 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                    <MapPin size={16} className="text-dark-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search location (e.g., Mumbai)..."
                      className="w-full bg-transparent border-none outline-none text-sm text-dark-900 dark:text-dark-100 placeholder:text-dark-400 py-1"
                      value={filters.location}
                      onChange={e => { setFilters(f => ({ ...f, location: e.target.value })); setPage(1); }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all w-32">
                      <IndianRupee size={15} className="text-dark-400 shrink-0" />
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full bg-transparent border-none outline-none text-sm text-dark-900 dark:text-dark-100 py-1"
                        value={filters.minBudget}
                        onChange={e => { setFilters(f => ({ ...f, minBudget: e.target.value })); setPage(1); }}
                      />
                    </div>
                    <span className="text-dark-400 font-semibold">—</span>
                    <div className="flex items-center gap-2 bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all w-32">
                      <IndianRupee size={15} className="text-dark-400 shrink-0" />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full bg-transparent border-none outline-none text-sm text-dark-900 dark:text-dark-100 py-1"
                        value={filters.maxBudget}
                        onChange={e => { setFilters(f => ({ ...f, maxBudget: e.target.value })); setPage(1); }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => { setFilters({ location: '', minBudget: '', maxBudget: '' }); setPage(1); }}
                    className="btn-secondary py-2.5 px-5 text-sm font-semibold border border-dark-200 dark:border-dark-750 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* Grid block */}
              {listingsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
                  {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20 card border border-dashed border-dark-200 dark:border-dark-800 p-12">
                  <Home size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">No listings match your search</h3>
                  <p className="text-dark-400 text-sm max-w-sm mx-auto">Try broadening your budget limits or entering a simpler location filter.</p>
                </div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                  {listings.map(listing => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      key={listing.id} 
                      className="relative"
                    >
                      <ListingCard listing={listing} compatibilityScore={listing.compatibilityScore} showScore={!!myProfile} />
                      <div className="absolute bottom-4 right-4 z-10">
                        {!alreadySentInterest(listing.id) ? (
                          <button
                            onClick={e => { e.preventDefault(); e.stopPropagation(); setShowInterestModal(listing); }}
                            className="btn-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-750 shadow-md shadow-indigo-650/20 glow-btn"
                            id={`express-interest-${listing.id}`}
                          >
                            <Send size={11} /> Express Interest
                          </button>
                        ) : (
                          <div className="badge bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-md shadow-emerald-500/10 flex items-center gap-1.5 border-none">
                            <CheckCircle size={12} /> Interest Sent
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </motion.div>
          )}

          {tab === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {interests.length === 0 ? (
                <div className="text-center py-20 card border border-dashed border-dark-200 dark:border-dark-800 p-12">
                  <Zap size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4 animate-pulse" />
                  <h3 className="font-bold text-lg mb-2">No interest requests yet</h3>
                  <p className="text-dark-400 text-sm max-w-sm mx-auto mb-6">Browse room listings and let owners know you're interested.</p>
                  <button onClick={() => setTab('browse')} className="btn-primary bg-indigo-600 hover:bg-indigo-750">Browse Rooms</button>
                </div>
              ) : (
                interests.map(interest => (
                  <div key={interest.id} className="card p-6 border border-dark-200 dark:border-dark-850 bg-white dark:bg-dark-900 shadow-md hover:shadow-lg transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2.5">
                          <h3 className="font-bold text-lg text-dark-900 dark:text-dark-50">{interest.listing?.title || 'Listing'}</h3>
                          <span className={`badge ${statusClass[interest.status]} px-3 py-1 font-bold text-xs`}>
                            {statusIcon[interest.status]} <span className="ml-1 uppercase tracking-wider">{interest.status}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-dark-500 dark:text-dark-400">
                          <span className="flex items-center gap-1"><MapPin size={13} className="text-dark-400" /> {interest.listing?.location}</span>
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400"><IndianRupee size={13} />{interest.listing?.rent?.toLocaleString()}/mo</span>
                          <span className="flex items-center gap-1"><Calendar size={13} className="text-dark-400" /> Sent: {format(new Date(interest.createdAt), 'dd MMM yyyy')}</span>
                        </div>
                        {interest.message && (
                          <div className="mt-3 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg border border-dark-100 dark:border-dark-850 text-sm text-dark-600 dark:text-dark-300 italic">
                            "{interest.message}"
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {interest.status === 'ACCEPTED' && interest.chatRoom && (
                          <Link
                            to={`/chat/${interest.chatRoom.id}`}
                            className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/10 glow-btn"
                            id={`chat-room-${interest.chatRoom.id}`}
                          >
                            <MessageCircle size={15} /> Open Live Chat
                          </Link>
                        )}
                        <Link to={`/listings/${interest.listingId}`} className="btn-secondary py-2.5 px-5 text-sm font-semibold border border-dark-200 dark:border-dark-750">
                          View details
                        </Link>
                        <button
                          onClick={() => handleDeleteInterest(interest.id, interest.status)}
                          className="btn-danger py-2.5 px-5 text-sm font-semibold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-450 rounded-xl transition-all"
                        >
                          {interest.status === 'PENDING' ? 'Withdraw' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto"
            >
              <div className="card p-8 border border-dark-200 dark:border-dark-850 shadow-xl bg-white dark:bg-dark-900">
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-dark-100 dark:border-dark-800">
                  <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <User size={24} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl">Matching Parameters</h2>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Configure your target preferences for AI Compatibility scoring</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label className="label">Preferred Location</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g., Indiranagar, Bangalore"
                      value={profileForm.preferredLocation}
                      onChange={e => setProfileForm(f => ({ ...f, preferredLocation: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Minimum Budget Target (₹/mo)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="5000"
                        value={profileForm.budgetMin}
                        onChange={e => setProfileForm(f => ({ ...f, budgetMin: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Maximum Budget Limit (₹/mo)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="20000"
                        value={profileForm.budgetMax}
                        onChange={e => setProfileForm(f => ({ ...f, budgetMax: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="label">Target Move-in Date</label>
                    <input
                      type="date"
                      className="input"
                      value={profileForm.moveInDate}
                      onChange={e => setProfileForm(f => ({ ...f, moveInDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="label">Bio (Introduce yourself to owners)</label>
                    <textarea
                      className="input resize-none h-28"
                      placeholder="Hi, I am a software dev working in HSR. I like clean environments..."
                      value={profileForm.bio}
                      onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="label">Special Habits & Preferences</label>
                    <textarea
                      className="input resize-none h-28"
                      placeholder="e.g. Vegetarian, non-smoker, quiet environment during work hours."
                      value={profileForm.preferences}
                      onChange={e => setProfileForm(f => ({ ...f, preferences: e.target.value }))}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-primary w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-750 py-3 font-bold shadow-lg shadow-indigo-600/10 glow-btn" 
                    disabled={savingProfile}
                  >
                    {savingProfile && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {savingProfile ? 'Saving updates...' : 'Save and Calculate Compatibility'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal with AnimatePresence */}
      <AnimatePresence>
        {showInterestModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card max-w-md w-full p-6 bg-white dark:bg-dark-900 border border-dark-200 dark:border-dark-800 shadow-2xl relative overflow-hidden"
            >
              <h3 className="font-extrabold text-xl mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-500 animate-pulse" /> Express Interest
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400 mb-4 leading-relaxed">
                Send a quick introduction to the owner of <strong>{showInterestModal.title}</strong>. This initiates a live room.
              </p>
              
              <textarea
                className="input resize-none h-32 mb-5"
                placeholder="Introduce yourself (profession, move-in flexibility, or key details that make you a great flatmate)..."
                value={interestMessage}
                onChange={e => setInterestMessage(e.target.value)}
              />
              
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowInterestModal(null); setInterestMessage(''); }} 
                  className="btn-secondary flex-1 border border-dark-200 dark:border-dark-750 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSendInterest(showInterestModal)}
                  disabled={!!sendingInterest}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-750 text-sm font-bold shadow-lg shadow-indigo-600/10 glow-btn"
                >
                  {sendingInterest ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  {sendingInterest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
