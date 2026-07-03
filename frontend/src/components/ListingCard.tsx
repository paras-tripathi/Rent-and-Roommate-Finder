import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, IndianRupee, Calendar, Sofa, Sparkles } from 'lucide-react';
import { Listing } from '../types';
import { format } from 'date-fns';

interface Props {
  listing: Listing;
  compatibilityScore?: number;
  showScore?: boolean;
}

const roomTypeLabel: Record<string, string> = {
  SINGLE: 'Single Room',
  SHARED: 'Shared Room',
  STUDIO: 'Studio Flat',
  APARTMENT: 'Entire Apartment',
  PG: 'Paying Guest',
};

const furnishingLabel: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED: 'Unfurnished',
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50';
  if (score >= 60) return 'text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50';
  return 'text-red-700 dark:text-red-400 bg-red-100/80 dark:bg-red-950/40 border-red-200 dark:border-red-900/50';
};

export default function ListingCard({ listing, compatibilityScore, showScore }: Props) {
  const image = listing.images?.[0]?.url || `https://picsum.photos/seed/${listing.id}/800/500`;

  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <motion.div 
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="card overflow-hidden group border border-dark-200 dark:border-dark-850 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 bg-white dark:bg-dark-900"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/800/500`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {showScore && compatibilityScore !== undefined && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center gap-1 shadow-md ${scoreColor(compatibilityScore)}`}>
              <Sparkles size={12} className="text-current animate-pulse" />
              {Math.round(compatibilityScore)}% Match
            </div>
          )}

          <div className="absolute bottom-3 left-3">
            <span className="badge bg-indigo-600 text-white border-none shadow-md shadow-indigo-600/20 px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider">
              {roomTypeLabel[listing.roomType] || listing.roomType}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-dark-900 dark:text-dark-50 line-clamp-1 mb-1.5 transition-colors group-hover:text-indigo-500">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1.5 text-dark-500 dark:text-dark-400 text-sm mb-4">
            <MapPin size={14} className="text-dark-400" /> 
            <span className="truncate">{listing.location}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xl">
              <IndianRupee size={16} />
              <span>{listing.rent.toLocaleString()}</span>
              <span className="text-xs font-medium text-dark-400 ml-1">/ mo</span>
            </div>
            <span className="text-xs text-dark-500 dark:text-dark-400 flex items-center gap-1 bg-dark-50 dark:bg-dark-800/50 px-2.5 py-1 rounded-lg border border-dark-100 dark:border-dark-800">
              <Sofa size={12} className="text-indigo-500" />
              {furnishingLabel[listing.furnishing]}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-800/50 flex items-center justify-between text-xs text-dark-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar size={13} className="text-dark-400" />
              Avail. {format(new Date(listing.availableFrom), 'dd MMM yyyy')}
            </span>
            <span className="font-semibold text-dark-600 dark:text-dark-300 bg-dark-50 dark:bg-dark-800/50 px-2 py-0.5 rounded">
              {listing.owner?.name}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden border border-dark-200 dark:border-dark-850">
      <div className="skeleton h-48 rounded-none" />
      <div className="p-5 space-y-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-5 w-20 animate-pulse" />
        </div>
        <div className="pt-4 border-t border-dark-100 dark:border-dark-850 flex justify-between">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
