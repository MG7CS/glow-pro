export interface BizHour {
  day: string;
  time: string;
}

export interface BizFormData {
  id?: string;
  businessName: string;
  category: string;
  description: string;
  neighborhood: string;
  mapLat: number | null;
  mapLng: number | null;
  whatsapp: string;
  phone: string;
  coverPhoto: string | null;
  galleryPhotos: string[];
  instagram: string;
  facebook: string;
  tiktok: string;
  ownerPhone: string;
  /** Biz onboarding: how they heard about us — google | social | friend | recruiter | other */
  referralSource?: string;
  /** Optional recruiter ID when referralSource === "recruiter" — saved to Shop.recruitedBy */
  recruiterId?: string;
  hours?: BizHour[];
  /** null = PENDING review, true = APPROVED/live, false = REJECTED */
  verified?: boolean | null;
}

export const BIZ_FORM_INITIAL: BizFormData = {
  businessName: "",
  category: "",
  description: "",
  neighborhood: "",
  mapLat: null,
  mapLng: null,
  whatsapp: "",
  phone: "",
  coverPhoto: null,
  galleryPhotos: [],
  instagram: "",
  facebook: "",
  tiktok: "",
  ownerPhone: "",
  referralSource: "",
  recruiterId: "",
  hours: [],
};
