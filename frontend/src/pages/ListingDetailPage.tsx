import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Calendar, Sofa, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { listingsAPI, compatibilityAPI, interestsAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import CompatibilityBadge from '../components/CompatibilityBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const roomTypeLabel: Record<string, string> = { SINGLE: 'Single', SHARED: 'Shared', STUDIO: 'Studio', APARTMENT: 'Apartment', PG: 'PG' };
const furnishingLabel: Record<string, string> = { FURNISHED: 'Furnished', SEMI_FURNISHED: 'Semi-Furnished', UNFURNISHED: 'Unfurnished' };

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [interestMessage, setInterestMessage] = useState('');
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getOne(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: compatibility } = useQuery({
    queryKey: ['compatibility', id],
    queryFn: () => compatibilityAPI.get(id!).then(r => r.data),
    enabled: !!id && !!user && user.role === 'TENANT',
  });

  const handleSendInterest = async () => {
    if (!user) { navigate('/login'); return; }
    setSendingInterest(true);
    try {
      await interestsAPI.send({ listingId: id, message: interestMessage });
      toast.success('Interest sent successfully!');
      setInterestSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to send interest';
      if (msg.includes('Already')) {
        toast.error('You already sent interest for this listing');
        setInterestSent(true);
      } else {
        toast.error(msg);
      }
    } finally { setSendingInterest(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="skeleton h-96 rounded-2xl mb-6" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-1/2" />
          <div className="skeleton h-4 w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!listing) return <div>Listing not found</div>;

  const images = listing.images?.length > 0 ? listing.images : [{ url: `https://picsum.photos/seed/${listing.id}/1200/700`, id: '1' }];

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-2 mb-6"><ChevronLeft size={18} /> Back</button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-80 lg:h-96">
                <img src={images[selectedImage]?.url} alt={listing.title} className="w-full h-full object-cover" />
                {listing.status === 'FILLED' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="badge badge-red text-base px-4 py-2">Room Filled</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4">
                  {images.map((img: any, i: number) => (
                    <button key={img.id} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge badge-purple">{roomTypeLabel[listing.roomType]}</span>
                <span className="badge badge-blue">{furnishingLabel[listing.furnishing]}</span>
                {listing.status === 'ACTIVE' && <span className="badge badge-green">Available</span>}
              </div>
              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
              <div className="flex items-center gap-2 text-dark-500 mb-4"><MapPin size={16} />{listing.location}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3">
                  <p className="text-xs text-dark-400 mb-1">Monthly Rent</p>
                  <p className="font-bold text-primary-600 dark:text-primary-400 flex items-center"><IndianRupee size={14} />{listing.rent.toLocaleString()}</p>
                </div>
                <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3">
                  <p className="text-xs text-dark-400 mb-1">Available From</p>
                  <p className="font-semibold text-sm">{format(new Date(listing.availableFrom), 'dd MMM yyyy')}</p>
                </div>
                <div className="bg-dark-50 dark:bg-dark-800 rounded-xl p-3">
                  <p className="text-xs text-dark-400 mb-1">Posted by</p>
                  <p className="font-semibold text-sm">{listing.owner?.name}</p>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-dark-600 dark:text-dark-400 leading-relaxed">{listing.description}</p>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="space-y-4">
            {/* Compatibility Score */}
            {compatibility && <CompatibilityBadge compatibility={compatibility} />}

            {/* Interest Card */}
            {user?.role === 'TENANT' && listing.status === 'ACTIVE' && (
              <div className="card p-5">
                <h3 className="font-semibold mb-4">Express Interest</h3>
                {interestSent ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                    <CheckCircle size={18} /> Interest sent! Awaiting owner response.
                  </div>
                ) : (
                  <>
                    <textarea id="interest-message" className="input resize-none h-24 mb-3" placeholder="Add a message (optional)..." value={interestMessage} onChange={e => setInterestMessage(e.target.value)} />
                    <button id="send-interest-btn" onClick={handleSendInterest} disabled={sendingInterest} className="btn-primary w-full flex items-center justify-center gap-2">
                      {sendingInterest ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
                      {sendingInterest ? 'Sending...' : 'Send Interest Request'}
                    </button>
                  </>
                )}
              </div>
            )}

            {!user && (
              <div className="card p-5 text-center">
                <p className="text-dark-500 mb-4">Sign in to express interest</p>
                <button onClick={() => navigate('/login')} className="btn-primary w-full">Sign In</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
