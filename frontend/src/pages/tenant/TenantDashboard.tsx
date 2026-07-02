import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, Clock, CheckCircle, XCircle,
  User, Home, Zap, Send, IndianRupee, MapPin, Calendar,
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
      toast.success('Interest sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['myInterests'] });
      setShowInterestModal(null);
      setInterestMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send interest');
    } finally {
      setSendingInterest(null);
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
      toast.success('Profile saved!');
      queryClient.invalidateQueries({ queryKey: ['tenantProfile'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const alreadySentInterest = (listingId: string) =>
    interests.some(i => i.listingId === listingId);

  const tabs = [
    { id: 'browse', label: 'Browse Listings', icon: Home },
    { id: 'interests', label: 'My Interests', icon: Zap, count: interests.filter(i => i.status === 'PENDING').length },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <div className="min-h-screen dark:bg-dark-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, <span className="gradient-text">{user?.name}</span>! 👋
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            {!myProfile ? 'Complete your profile to get AI-powered compatibility scores.' : 'Browse listings matched to your preferences.'}
          </p>
        </div>

        {/* Profile incomplete banner */}
        {!myProfile && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Complete your profile</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Get AI compatibility scores for all listings</p>
              </div>
            </div>
            <button onClick={() => setTab('profile')} className="btn-primary text-sm py-2 px-4 bg-amber-500 hover:bg-amber-600">
              Set Up Profile
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-100 dark:bg-dark-800 p-1 rounded-xl mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100 shadow-sm'
                  : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {t.count ? (
                <span className="bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {tab === 'browse' && (
          <div>
            {/* Filters */}
            <div className="card p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <MapPin size={16} className="text-dark-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Filter by location..."
                    className="input py-2"
                    value={filters.location}
                    onChange={e => { setFilters(f => ({ ...f, location: e.target.value })); setPage(1); }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee size={16} className="text-dark-400 shrink-0" />
                  <input
                    type="number"
                    placeholder="Min rent"
                    className="input py-2 w-28"
                    value={filters.minBudget}
                    onChange={e => { setFilters(f => ({ ...f, minBudget: e.target.value })); setPage(1); }}
                  />
                  <span className="text-dark-400">-</span>
                  <input
                    type="number"
                    placeholder="Max rent"
                    className="input py-2 w-28"
                    value={filters.maxBudget}
                    onChange={e => { setFilters(f => ({ ...f, maxBudget: e.target.value })); setPage(1); }}
                  />
                </div>
                <button
                  onClick={() => { setFilters({ location: '', minBudget: '', maxBudget: '' }); setPage(1); }}
                  className="btn-secondary py-2 px-4 text-sm whitespace-nowrap"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Listings grid */}
            {listingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <Home size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No listings found</h3>
                <p className="text-dark-400">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {listings.map(listing => (
                  <div key={listing.id} className="relative">
                    <ListingCard listing={listing} compatibilityScore={listing.compatibilityScore} showScore={!!myProfile} />
                    {!alreadySentInterest(listing.id) && (
                      <button
                        onClick={e => { e.preventDefault(); setShowInterestModal(listing); }}
                        className="absolute bottom-4 right-4 btn-primary py-1.5 px-3 text-xs flex items-center gap-1"
                        id={`express-interest-${listing.id}`}
                      >
                        <Send size={12} /> Express Interest
                      </button>
                    )}
                    {alreadySentInterest(listing.id) && (
                      <div className="absolute bottom-4 right-4 badge badge-green">
                        <CheckCircle size={12} /> Sent
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* Interests Tab */}
        {tab === 'interests' && (
          <div className="space-y-4">
            {interests.length === 0 ? (
              <div className="text-center py-20">
                <Zap size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No interests yet</h3>
                <p className="text-dark-400 mb-6">Browse listings and express your interest to owners</p>
                <button onClick={() => setTab('browse')} className="btn-primary">Browse Listings</button>
              </div>
            ) : (
              interests.map(interest => (
                <div key={interest.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{interest.listing?.title || 'Listing'}</h3>
                        <span className={`badge ${statusClass[interest.status]}`}>
                          {statusIcon[interest.status]} {interest.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-dark-500 dark:text-dark-400">
                        <span className="flex items-center gap-1"><MapPin size={13} />{interest.listing?.location}</span>
                        <span className="flex items-center gap-1"><IndianRupee size={13} />{interest.listing?.rent?.toLocaleString()}/mo</span>
                        <span className="flex items-center gap-1"><Calendar size={13} />{format(new Date(interest.createdAt), 'dd MMM yyyy')}</span>
                      </div>
                      {interest.message && (
                        <p className="text-sm text-dark-400 mt-2 italic">"{interest.message}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {interest.status === 'ACCEPTED' && interest.chatRoom && (
                        <Link
                          to={`/chat/${interest.chatRoom.id}`}
                          className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                          id={`chat-room-${interest.chatRoom.id}`}
                        >
                          <MessageCircle size={14} /> Open Chat
                        </Link>
                      )}
                      <Link to={`/listings/${interest.listingId}`} className="btn-secondary py-2 px-4 text-sm">
                        View Listing
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">Tenant Profile</h2>
                  <p className="text-sm text-dark-400">Used for AI compatibility matching</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="label">Preferred Location</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Koramangala, Bangalore"
                    value={profileForm.preferredLocation}
                    onChange={e => setProfileForm(f => ({ ...f, preferredLocation: e.target.value }))}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Minimum Budget (₹/mo)</label>
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
                    <label className="label">Maximum Budget (₹/mo)</label>
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
                  <label className="label">Move-in Date</label>
                  <input
                    type="date"
                    className="input"
                    value={profileForm.moveInDate}
                    onChange={e => setProfileForm(f => ({ ...f, moveInDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Bio (optional)</label>
                  <textarea
                    className="input resize-none h-24"
                    placeholder="Tell owners about yourself..."
                    value={profileForm.bio}
                    onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Preferences (optional)</label>
                  <textarea
                    className="input resize-none h-24"
                    placeholder="Vegetarian, no pets, work from home, etc."
                    value={profileForm.preferences}
                    onChange={e => setProfileForm(f => ({ ...f, preferences: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={savingProfile}>
                  {savingProfile ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6 animate-slide-up">
            <h3 className="font-bold text-lg mb-2">Express Interest</h3>
            <p className="text-sm text-dark-400 mb-4">Send a message to the owner of <strong>{showInterestModal.title}</strong></p>
            <textarea
              className="input resize-none h-28 mb-4"
              placeholder="Introduce yourself and explain why you're interested in this listing..."
              value={interestMessage}
              onChange={e => setInterestMessage(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowInterestModal(null); setInterestMessage(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleSendInterest(showInterestModal)}
                disabled={!!sendingInterest}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {sendingInterest ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                Send Interest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
