import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Calendar, Sofa } from 'lucide-react';
import { Listing } from '../types';
import { format } from 'date-fns';

interface Props {
  listing: Listing;
  compatibilityScore?: number;
  showScore?: boolean;
}

const roomTypeLabel: Record<string, string> = {
  SINGLE: 'Single',
  SHARED: 'Shared',
  STUDIO: 'Studio',
  APARTMENT: 'Apartment',
  PG: 'PG',
};

const furnishingLabel: Record<string, string> = {
  FURNISHED: 'Furnished',
  SEMI_FURNISHED: 'Semi-Furnished',
  UNFURNISHED: 'Unfurnished',
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
  return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
};

export default function ListingCard({ listing, compatibilityScore, showScore }: Props) {
  const image = listing.images?.[0]?.url || `https://picsum.photos/seed/${listing.id}/800/500`;

  return (
    <Link to={`/listings/${listing.id}`}>
      <div className="card-hover overflow-hidden group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${listing.id}/800/500`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {showScore && compatibilityScore !== undefined && (
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor(compatibilityScore)}`}>
              {Math.round(compatibilityScore)}% Match
            </div>
          )}
          <div className="absolute bottom-3 left-3">
            <span className="badge badge-purple">{roomTypeLabel[listing.roomType]}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-dark-900 dark:text-dark-50 line-clamp-1 mb-1">{listing.title}</h3>
          <div className="flex items-center gap-1 text-dark-500 dark:text-dark-400 text-sm mb-3">
            <MapPin size={14} /> {listing.location}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 text-primary-600 dark:text-primary-400 font-bold text-lg">
              <IndianRupee size={16} />{listing.rent.toLocaleString()}
              <span className="text-xs font-normal text-dark-400">/mo</span>
            </div>
            <span className="text-xs text-dark-400 flex items-center gap-1">
              <Sofa size={12} />{furnishingLabel[listing.furnishing]}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between">
            <span className="text-xs text-dark-400 flex items-center gap-1">
              <Calendar size={12} />
              Available {format(new Date(listing.availableFrom), 'dd MMM yyyy')}
            </span>
            <span className="text-xs text-dark-400">{listing.owner?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-48" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex justify-between">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
