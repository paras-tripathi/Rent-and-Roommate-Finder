import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Plus, Edit2, Trash2, CheckCircle, Users, LayoutGrid,
  MessageCircle, Eye, IndianRupee, MapPin, Building2, User
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listingsAPI, interestsAPI, profilesAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import { Listing, Interest } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusClass: Record<string, string> = {
  PENDING: 'badge-yellow',
  ACCEPTED: 'badge-green',
  DECLINED: 'badge-red',
};

const listingStatusClass: Record<string, string> = {
  ACTIVE: 'badge-green',
  FILLED: 'badge-blue',
  DELETED: 'badge-red',
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'listings' | 'interests' | 'profile'>('listings');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({ phone: '', address: '', bio: '' });

  useEffect(() => {
    if (user?.ownerProfile) {
      setProfileForm({
        phone: user.ownerProfile.phone || '',
        address: user.ownerProfile.address || '',
        bio: user.ownerProfile.bio || '',
      });
    }
  }, [user]);

  // Listing form
  const [listingForm, setListingForm] = useState({
    title: '',
    location: '',
    rent: '',
    availableFrom: '',
    roomType: 'SINGLE',
    furnishing: 'FURNISHED',
    description: '',
  });
  const [savingListing, setSavingListing] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const promises = filesArray.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      });
      Promise.all(promises).then(base64s => {
        setImages(prev => [...prev, ...base64s]);
      }).catch(() => toast.error('Failed to read image files'));
    }
  };

  const { data: myListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['ownerListings'],
    queryFn: () => listingsAPI.getMy().then(r => r.data),
    enabled: !!user,
  });

  const listings: Listing[] = myListings || [];
  const interests: Interest[] = listings.flatMap(l =>
    (l.interests || []).map((i: any) => ({
      ...i,
      listing: { id: l.id, title: l.title, location: l.location, rent: l.rent }
    }))
  );

  const resetListingForm = () => {
    setListingForm({ title: '', location: '', rent: '', availableFrom: '', roomType: 'SINGLE', furnishing: 'FURNISHED', description: '' });
    setImages([]);
    setEditingListing(null);
    setShowCreateForm(false);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingListing(true);
    try {
      const data = { ...listingForm, rent: Number(listingForm.rent), images };
      if (editingListing) {
        await listingsAPI.update(editingListing.id, data);
        toast.success('Listing updated successfully!');
      } else {
        await listingsAPI.create(data);
        toast.success('Listing created successfully!');
      }
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
      resetListingForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save listing');
    } finally {
      setSavingListing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing deleted');
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleMarkFilled = async (id: string) => {
    try {
      await listingsAPI.markFilled(id);
      toast.success('Listing marked as filled!');
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const handleMarkActive = async (id: string) => {
    try {
      await listingsAPI.markActive(id);
      toast.success('Listing marked as active!');
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const handleDeleteInterest = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this interest request? This will permanently close the chat room and allow the tenant to request again.")) return;
    try {
      await interestsAPI.withdraw(id);
      toast.success('Interest request deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
    } catch {
      toast.error('Failed to delete interest request');
    }
  };

  const handleRespondInterest = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await interestsAPI.respond(id, status);
      toast.success(`Interest request ${status.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
    } catch {
      toast.error('Failed to respond to request');
    }
  };

  const handleEditListing = (listing: Listing) => {
    setListingForm({
      title: listing.title,
      location: listing.location,
      rent: String(listing.rent),
      availableFrom: listing.availableFrom.split('T')[0],
      roomType: listing.roomType,
      furnishing: listing.furnishing,
      description: listing.description,
    });
    setEditingListing(listing);
    setShowCreateForm(true);
  };

  const pendingCount = interests.filter(i => i.status === 'PENDING').length;

  const tabs = [
    { id: 'listings', label: 'My Listings', icon: LayoutGrid, count: listings.length },
    { id: 'interests', label: 'Tenant Requests', icon: Users, count: pendingCount },
    { id: 'profile', label: 'Owner Profile', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950 transition-colors duration-300">
      <Navbar currentView={tab === 'listings' ? 'list' : tab} onNavigate={(view) => setTab(view === 'list' ? 'listings' : (view as any))} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header Banner */}
        <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-r from-purple-650 via-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                Landlord Panel, {user?.name} 🏢
              </h1>
              <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
                Publish rooms, evaluate tenant compatibility details, and connect with ideal flatmates via real-time WebSocket chat.
              </p>
            </div>
            {tab === 'listings' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowCreateForm(true); setEditingListing(null); }}
                className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg shadow-black/10 text-sm whitespace-nowrap align-self-start glow-btn"
                id="create-listing-btn"
              >
                <Plus size={16} /> New Room Listing
              </motion.button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Rooms', value: listings.length, color: 'text-indigo-600 dark:text-indigo-400' },
            { label: 'Active Listings', value: listings.filter(l => l.status === 'ACTIVE').length, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Filled Rooms', value: listings.filter(l => l.status === 'FILLED').length, color: 'text-blue-600 dark:text-blue-450' },
            { label: 'Pending Requests', value: pendingCount, color: 'text-amber-600 dark:text-amber-400' },
          ].map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={stat.label} 
              className="card p-5 text-center border border-dark-200 dark:border-dark-850 shadow-sm"
            >
              <div className={`text-3xl font-extrabold ${stat.color} mb-1.5`}>{stat.value}</div>
              <div className="text-xs text-dark-500 dark:text-dark-400 font-semibold uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-800 p-1.5 rounded-2xl mb-8 overflow-x-auto">
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
                <span className={`text-[10px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center shadow-sm ${
                  t.id === 'interests' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <AnimatePresence mode="wait">
          {tab === 'listings' && (
            <motion.div
              key="listings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {showCreateForm && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-8 border border-dark-200 dark:border-dark-850 shadow-xl bg-white dark:bg-dark-900"
                >
                  <h3 className="font-extrabold text-xl mb-6 pb-2 border-b border-dark-100 dark:border-dark-800">
                    {editingListing ? 'Edit Room Listing' : 'Publish New Room Listing'}
                  </h3>
                  <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                    <div>
                      <label className="label">Listing Title</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Cozy Studio Apt with Balcony"
                        value={listingForm.title}
                        onChange={e => setListingForm(f => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Location</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="e.g. Bandra, Mumbai"
                          value={listingForm.location}
                          onChange={e => setListingForm(f => ({ ...f, location: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Monthly Rent (₹/mo)</label>
                        <input
                          type="number"
                          className="input"
                          placeholder="18000"
                          value={listingForm.rent}
                          onChange={e => setListingForm(f => ({ ...f, rent: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="label">Available From</label>
                        <input
                          type="date"
                          className="input"
                          value={listingForm.availableFrom}
                          onChange={e => setListingForm(f => ({ ...f, availableFrom: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Room Layout</label>
                        <select
                          className="input"
                          value={listingForm.roomType}
                          onChange={e => setListingForm(f => ({ ...f, roomType: e.target.value }))}
                        >
                          {['SINGLE', 'SHARED', 'STUDIO', 'APARTMENT', 'PG'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Furnishing Status</label>
                        <select
                          className="input"
                          value={listingForm.furnishing}
                          onChange={e => setListingForm(f => ({ ...f, furnishing: e.target.value }))}
                        >
                          {['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'].map(t => (
                            <option key={t} value={t}>{t.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Detailed Description</label>
                      <textarea
                        className="input resize-none h-28"
                        placeholder="Provide details about roommates, rules, deposit, utilities..."
                        value={listingForm.description}
                        onChange={e => setListingForm(f => ({ ...f, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Upload Images (Base64 file selector)</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="input py-2"
                        onChange={handleImageChange}
                      />
                      {images.length > 0 && (
                        <div className="flex gap-2.5 mt-4 flex-wrap">
                          {images.map((img, i) => (
                            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group shadow-md">
                              <img src={img} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-dark-100 dark:border-dark-800">
                      <button type="button" onClick={resetListingForm} className="btn-secondary flex-1 border border-dark-200 dark:border-dark-750 text-sm font-semibold">Cancel</button>
                      <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-750 font-bold shadow-lg shadow-indigo-655/10 glow-btn" disabled={savingListing}>
                        {savingListing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {savingListing ? 'Publishing...' : editingListing ? 'Update Room' : 'Publish Room'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {listingsLoading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32" />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20 card border border-dashed border-dark-200 dark:border-dark-800 p-12">
                  <Building2 size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">No rooms listed yet</h3>
                  <p className="text-dark-400 text-sm max-w-sm mx-auto mb-6">Create your first room listing and find interested tenants instantly.</p>
                  <button onClick={() => setShowCreateForm(true)} className="btn-primary bg-indigo-600 hover:bg-indigo-750 flex items-center gap-2 mx-auto">
                    <Plus size={16} /> Add Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map(listing => (
                    <div key={listing.id} className="card p-5 border border-dark-200 dark:border-dark-850 hover:shadow-md transition-shadow bg-white dark:bg-dark-900">
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="w-full md:w-40 h-28 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                          <img
                            src={listing.images?.[0]?.url || `https://picsum.photos/seed/${listing.id}/300/200`}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-start gap-2.5 mb-2">
                              <h3 className="font-bold text-lg text-dark-900 dark:text-dark-50">{listing.title}</h3>
                              <span className={`badge ${listingStatusClass[listing.status]} font-bold text-xs uppercase px-2.5 py-0.5`}>
                                {listing.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-dark-500 dark:text-dark-400 mb-4">
                              <span className="flex items-center gap-1"><MapPin size={13} className="text-dark-400" /> {listing.location}</span>
                              <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400"><IndianRupee size={13} />{listing.rent.toLocaleString()}/mo</span>
                              <span className="flex items-center gap-1"><Users size={13} className="text-dark-400" /> {listing._count?.interests || 0} applications</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-dark-50 dark:border-dark-850">
                            <Link to={`/listings/${listing.id}`} className="btn-ghost py-2 px-4 text-xs font-semibold flex items-center gap-1">
                              <Eye size={13} /> View Page
                            </Link>
                            <button onClick={() => handleEditListing(listing)} className="btn-ghost py-2 px-4 text-xs font-semibold flex items-center gap-1">
                              <Edit2 size={13} /> Edit
                            </button>
                            {listing.status === 'ACTIVE' ? (
                              <button onClick={() => handleMarkFilled(listing.id)} className="btn-ghost py-2 px-4 text-xs font-semibold flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                <CheckCircle size={13} /> Mark as Filled
                              </button>
                            ) : (
                              <button onClick={() => handleMarkActive(listing.id)} className="btn-ghost py-2 px-4 text-xs font-semibold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle size={13} /> Mark as Active
                              </button>
                            )}
                            <button onClick={() => handleDelete(listing.id)} className="btn-ghost py-2 px-4 text-xs font-semibold flex items-center gap-1 text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 ml-auto">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <Users size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">No applications received</h3>
                  <p className="text-dark-400 text-sm max-w-sm mx-auto">Once tenants express interest in your rooms, requests will show up here.</p>
                </div>
              ) : (
                interests.map(interest => (
                  <div key={interest.id} className="card p-6 border border-dark-200 dark:border-dark-850 bg-white dark:bg-dark-900 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/10">
                            <span className="text-white text-sm font-extrabold">
                              {interest.tenant?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-dark-900 dark:text-dark-100">{interest.tenant?.name}</p>
                            <p className="text-xs text-dark-400">{interest.tenant?.email}</p>
                          </div>
                          <span className={`badge ${statusClass[interest.status]} ml-auto sm:ml-4 font-bold text-xs uppercase px-2.5 py-0.5`}>
                            {interest.status}
                          </span>
                        </div>
                        <p className="text-sm text-dark-600 dark:text-dark-300 mb-2">
                          Interested in: <strong className="text-dark-850 dark:text-dark-100">{interest.listing?.title}</strong>
                        </p>
                        {interest.message && (
                          <div className="p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg border border-dark-100 dark:border-dark-850 text-sm text-dark-550 dark:text-dark-300 italic mb-2">
                            "{interest.message}"
                          </div>
                        )}
                        <p className="text-[10px] text-dark-400">
                          Received: {format(new Date(interest.createdAt), 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                      <div className="flex gap-2 sm:flex-col shrink-0 self-start sm:self-center">
                        {interest.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleRespondInterest(interest.id, 'ACCEPTED')}
                              className="btn-primary py-2.5 px-5 text-sm flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/10 glow-btn"
                              id={`accept-interest-${interest.id}`}
                            >
                              <CheckCircle size={14} /> Accept Request
                            </button>
                            <button
                              onClick={() => handleRespondInterest(interest.id, 'DECLINED')}
                              className="btn-danger py-2.5 px-5 text-sm font-semibold shadow-md shadow-red-500/10"
                              id={`decline-interest-${interest.id}`}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {interest.status === 'ACCEPTED' && interest.chatRoom && (
                          <Link
                            to={`/chat/${interest.chatRoom.id}`}
                            className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 bg-indigo-600 hover:bg-indigo-750 shadow-md shadow-indigo-500/10 glow-btn"
                            id={`owner-chat-${interest.chatRoom.id}`}
                          >
                            <MessageCircle size={15} /> Open Live Chat
                          </Link>
                        )}
                        {interest.status !== 'PENDING' && (
                          <button
                            onClick={() => handleDeleteInterest(interest.id)}
                            className="btn-danger py-2.5 px-5 text-sm font-semibold border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-450 rounded-xl transition-all"
                          >
                            Delete Request
                          </button>
                        )}
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
                    <h2 className="font-extrabold text-xl">Landlord Profile</h2>
                    <p className="text-sm text-dark-500 dark:text-dark-400">Manage contact information and bio details</p>
                  </div>
                </div>

                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setSavingProfile(true);
                    try {
                      await profilesAPI.saveOwner(profileForm);
                      toast.success('Profile updated successfully!');
                    } catch {
                      toast.error('Failed to save profile');
                    } finally {
                      setSavingProfile(false);
                    }
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="label">Contact Phone Number</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="+91 9876543210"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Office or Main Address</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Linking Road, Bandra West"
                      value={profileForm.address}
                      onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Owner Bio</label>
                    <textarea
                      className="input resize-none h-32"
                      placeholder="Tell renters about yourself, listings or building policies..."
                      value={profileForm.bio}
                      onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-750 py-3 font-bold shadow-lg shadow-indigo-650/10 glow-btn" disabled={savingProfile}>
                    {savingProfile && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {savingProfile ? 'Saving updates...' : 'Save Landlord Profile'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
