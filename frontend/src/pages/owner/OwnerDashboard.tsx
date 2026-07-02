import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Plus, Edit2, Trash2, CheckCircle, Users, LayoutGrid,
  MessageCircle, Eye, MoreVertical, IndianRupee, MapPin, Calendar,
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

  const { data: ownerProfile } = useQuery({
    queryKey: ['ownerProfile'],
    queryFn: () => profilesAPI.saveOwner({ phone: '', bio: '' }).then(r => r.data).catch(() => null),
    enabled: false,
  });

  const listings: Listing[] = myListings || [];
  const interests: Interest[] = listings.flatMap(l =>
    (l.interests || []).map(i => ({
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
        toast.success('Listing updated!');
      } else {
        await listingsAPI.create(data);
        toast.success('Listing created!');
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

  const handleRespondInterest = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      await interestsAPI.respond(id, status);
      toast.success(`Interest ${status.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ['ownerListings'] });
    } catch {
      toast.error('Failed to respond');
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
    { id: 'interests', label: 'Tenant Interests', icon: Users, count: pendingCount },
    { id: 'profile', label: 'Owner Profile', icon: Home },
  ];

  return (
    <div className="min-h-screen dark:bg-dark-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Owner Dashboard, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mt-1">Manage your listings and tenant applications</p>
          </div>
          {tab === 'listings' && (
            <button
              onClick={() => { setShowCreateForm(true); setEditingListing(null); }}
              className="btn-primary flex items-center gap-2"
              id="create-listing-btn"
            >
              <Plus size={16} /> New Listing
            </button>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Listings', value: listings.length, color: 'text-primary-600 dark:text-primary-400' },
            { label: 'Active', value: listings.filter(l => l.status === 'ACTIVE').length, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Filled', value: listings.filter(l => l.status === 'FILLED').length, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Pending Interests', value: pendingCount, color: 'text-amber-600 dark:text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-dark-500 dark:text-dark-400">{stat.label}</div>
            </div>
          ))}
        </div>

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
                <span className={`text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center ${
                  t.id === 'interests' ? 'bg-amber-500 text-white' : 'bg-primary-500 text-white'
                }`}>
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Listings Tab */}
        {tab === 'listings' && (
          <div>
            {showCreateForm && (
              <div className="card p-6 mb-6">
                <h3 className="font-bold text-lg mb-5">{editingListing ? 'Edit Listing' : 'Create New Listing'}</h3>
                <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                  <div>
                    <label className="label">Title</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Cozy 1BHK near Metro Station"
                      value={listingForm.title}
                      onChange={e => setListingForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Location</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Koramangala, Bangalore"
                        value={listingForm.location}
                        onChange={e => setListingForm(f => ({ ...f, location: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        className="input"
                        placeholder="15000"
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
                      <label className="label">Room Type</label>
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
                      <label className="label">Furnishing</label>
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
                    <label className="label">Description</label>
                    <textarea
                      className="input resize-none h-28"
                      placeholder="Describe your property, amenities, rules..."
                      value={listingForm.description}
                      onChange={e => setListingForm(f => ({ ...f, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Room Images (Upload to Cloudinary)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="input py-2"
                      onChange={handleImageChange}
                    />
                    {images.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={resetListingForm} className="btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={savingListing}>
                      {savingListing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                      {savingListing ? 'Saving...' : editingListing ? 'Update Listing' : 'Create Listing'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {listingsLoading ? (
              <div className="text-center py-20 text-dark-400">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <Home size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No listings yet</h3>
                <p className="text-dark-400 mb-6">Create your first listing to start receiving tenant applications</p>
                <button onClick={() => setShowCreateForm(true)} className="btn-primary flex items-center gap-2 mx-auto">
                  <Plus size={16} /> Create Listing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(listing => (
                  <div key={listing.id} className="card p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={listing.images?.[0]?.url || `https://picsum.photos/seed/${listing.id}/300/200`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <h3 className="font-semibold">{listing.title}</h3>
                          <span className={`badge ${listingStatusClass[listing.status]}`}>{listing.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-dark-500 dark:text-dark-400 mb-3">
                          <span className="flex items-center gap-1"><MapPin size={13} />{listing.location}</span>
                          <span className="flex items-center gap-1"><IndianRupee size={13} />{listing.rent.toLocaleString()}/mo</span>
                          <span className="flex items-center gap-1"><Users size={13} />{listing._count?.interests || 0} interested</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link to={`/listings/${listing.id}`} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
                            <Eye size={13} /> View
                          </Link>
                          <button onClick={() => handleEditListing(listing)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
                            <Edit2 size={13} /> Edit
                          </button>
                          {listing.status === 'ACTIVE' && (
                            <button onClick={() => handleMarkFilled(listing.id)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600">
                              <CheckCircle size={13} /> Mark Filled
                            </button>
                          )}
                          <button onClick={() => handleDelete(listing.id)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interests Tab */}
        {tab === 'interests' && (
          <div className="space-y-4">
            {interests.length === 0 ? (
              <div className="text-center py-20">
                <Users size={48} className="mx-auto text-dark-300 dark:text-dark-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">No interests received yet</h3>
                <p className="text-dark-400">Once tenants express interest in your listings, they'll appear here</p>
              </div>
            ) : (
              interests.map(interest => (
                <div key={interest.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-violet-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">
                            {interest.tenant?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{interest.tenant?.name}</p>
                          <p className="text-xs text-dark-400">{interest.tenant?.email}</p>
                        </div>
                        <span className={`badge ${statusClass[interest.status]} ml-auto sm:ml-0`}>
                          {interest.status}
                        </span>
                      </div>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">
                        Interested in: <strong>{interest.listing?.title}</strong>
                      </p>
                      {interest.message && (
                        <p className="text-sm text-dark-400 italic mt-1">"{interest.message}"</p>
                      )}
                      <p className="text-xs text-dark-400 mt-2">
                        {format(new Date(interest.createdAt), 'dd MMM yyyy, HH:mm')}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      {interest.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleRespondInterest(interest.id, 'ACCEPTED')}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-1"
                            id={`accept-interest-${interest.id}`}
                          >
                            <CheckCircle size={14} /> Accept
                          </button>
                          <button
                            onClick={() => handleRespondInterest(interest.id, 'DECLINED')}
                            className="btn-danger py-2 px-4 text-sm"
                            id={`decline-interest-${interest.id}`}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {interest.status === 'ACCEPTED' && interest.chatRoom && (
                        <Link
                          to={`/chat/${interest.chatRoom.id}`}
                          className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                          id={`owner-chat-${interest.chatRoom.id}`}
                        >
                          <MessageCircle size={14} /> Open Chat
                        </Link>
                      )}
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
                  <Home size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">Owner Profile</h2>
                  <p className="text-sm text-dark-400">Help tenants learn more about you</p>
                </div>
              </div>

              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setSavingProfile(true);
                  try {
                    await profilesAPI.saveOwner(profileForm);
                    toast.success('Profile saved!');
                  } catch {
                    toast.error('Failed to save profile');
                  } finally {
                    setSavingProfile(false);
                  }
                }}
                className="space-y-5"
              >
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+91 9876543210"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your address"
                    value={profileForm.address}
                    onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    className="input resize-none h-28"
                    placeholder="Tell tenants about yourself and your properties..."
                    value={profileForm.bio}
                    onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
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
    </div>
  );
}
