export interface Business {
  id: string;
  image: string;
  /** Raw S3 key or URL from API — use for client-side pre-sign refresh */
  coverPhotoKey?: string | null;
  galleryPhotoKeys?: string[] | null;
  name: string;
  neighborhood: string;
  category: string;
  distance: string;
  rating: number;
  verified?: boolean;
  description?: string;
  address?: string;
  mapLat?: number | null;
  mapLng?: number | null;
  phone?: string;
  email?: string;
  owner?: {
    name: string;
    avatar?: string;
    listedSince: string;
    replyTime: string;
  };
  hours?: { day: string; time: string; isToday?: boolean }[];
  social?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  reviews?: { name: string; rating: number; comment: string; date: string }[];
  images?: string[];
  /** Salon service menu — from Shop.services */
  services?: string[];
  bookingEnabled?: boolean | null;
}
