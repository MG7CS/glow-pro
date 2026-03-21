import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Instagram,
  Facebook,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Mail,
  Share2,
  Star,
  Grid3X3,
  User,
} from "lucide-react";
import { generateClient } from "aws-amplify/api";
import { createReview } from "@/graphql/mutations";
import { useQueryClient } from "@tanstack/react-query";
import BusinessSection from "@/components/BusinessSection";
import { logShopEvent } from "@/hooks/useContactEvent";
import { useBusiness } from "@/hooks/useShop";
import { usebusinesss } from "@/hooks/useShops";
import type { Business } from "@/types/business";
import { getWhatsAppUrl } from "@/lib/utils";
import { resolvePhotoUrl } from "@/lib/uploadPhoto";

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

type Tab = "overview" | "social" | "reviews";

const BusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── ALL hooks must be at the top, before any early returns ──────────────
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data: business, isLoading } = useBusiness(id);
  const { data: allData } = usebusinesss();
  const [coverUrl, setCoverUrl] = useState("");
  const [resolvedGalleryUrls, setResolvedGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    if (id) logShopEvent(id, "view").catch(() => {});
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!business) {
      setCoverUrl("");
      setResolvedGalleryUrls([]);
      return;
    }

    const run = async () => {
      const coverSource = business.coverPhotoKey ?? business.image;
      if (coverSource) {
        const url = await resolvePhotoUrl(coverSource);
        if (!cancelled) setCoverUrl(url);
      } else if (!cancelled) {
        setCoverUrl("");
      }

      const rawGalleryKeys =
        business.galleryPhotoKeys && business.galleryPhotoKeys.length > 0
          ? business.galleryPhotoKeys
          : (business.images ?? []);

      if (rawGalleryKeys.length > 0) {
        const urls = await Promise.all(rawGalleryKeys.map((key) => resolvePhotoUrl(key)));
        if (!cancelled) setResolvedGalleryUrls(urls.filter(Boolean));
      } else if (!cancelled) {
        setResolvedGalleryUrls([]);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [business]);

  const sharePage = async (name: string) => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out ${name} on ConnectKigali`,
          url,
        });
      } catch {
        // User cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const openDirections = (lat: number | null | undefined, lng: number | null | undefined) => {
    if (lat && lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else {
      window.open("https://www.google.com/maps", "_blank", "noopener,noreferrer");
    }
  };

  // ── Conditional returns AFTER all hooks ─────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Business not found</h1>
          <p className="text-muted-foreground mb-6">This business doesn't exist or has been removed.</p>
          <button onClick={() => navigate("/")} className="text-primary font-medium hover:underline">
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const images =
    resolvedGalleryUrls.length > 0
      ? resolvedGalleryUrls
      : [coverUrl || business.image].filter(Boolean);
  const todayHours = business.hours?.find((h) => h.isToday);
  const isOpen = todayHours?.time !== "Closed";

  const nearbyBusinesses = (allData?.popular ?? [])
    .filter((b) => b.id !== business.id)
    .slice(0, 6);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "social", label: "Social" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div className="bg-background pb-24 md:pb-8">

      {/* Back button */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Photo grid — max 500px height */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden max-h-[500px]">
          <div className="md:col-span-2 md:row-span-2 relative bg-muted">
            {images[0] ? (
              <img
                src={images[0]}
                alt={business.name}
                className="w-full h-56 md:h-full object-cover"
                style={{ maxHeight: "500px" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-56 md:h-full flex flex-col items-center justify-center gap-2 bg-muted min-h-[200px]">
                <span className="text-5xl">🏪</span>
                <span className="text-sm text-muted-foreground font-medium">{business.name}</span>
              </div>
            )}
          </div>
          <div className="hidden md:block md:col-span-2">
            <img
              src={images[1] || images[0]}
              alt={`${business.name} photo 2`}
              className="w-full object-cover mb-2"
              style={{ height: "calc(250px - 4px)" }}
            />
            <div className="relative">
              <img
                src={images[2] || images[0]}
                alt={`${business.name} photo 3`}
                className="w-full object-cover"
                style={{ height: "calc(250px - 4px)" }}
              />
              <button className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-background transition-colors flex items-center gap-1.5">
                <Grid3X3 className="w-3.5 h-3.5" />
                See all photos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Business header + action buttons */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-10 mt-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{business.name}</h1>
          {business.verified && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          {business.category} · {business.neighborhood} · {business.distance} away
        </p>

        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-4 h-4 fill-foreground text-foreground" />
          <span className="text-sm font-semibold text-foreground">{business.rating.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">({business.reviews?.length || 0} reviews)</span>
        </div>

        {/* Action buttons row — no raw contact info shown, events logged */}
        <div className="flex gap-3 mt-5 overflow-x-auto scrollbar-hide pb-1">
          {business.social?.whatsapp && (
            <ActionPill
              icon={<MessageCircle className="w-4 h-4" />}
              label="WhatsApp"
              primary
              href={getWhatsAppUrl(business.social.whatsapp)}
              onClick={() => {
                void logShopEvent(business.id, "whatsapp").catch(() => {});
              }}
            />
          )}
          {business.phone && (
            <ActionPill
              icon={<Phone className="w-4 h-4" />}
              label="Call"
              href={`tel:${business.phone}`}
              beforeNavigate={() => logShopEvent(business.id, "call")}
            />
          )}
          {business.email && (
            <ActionPill
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              href={`mailto:${business.email}`}
              beforeNavigate={() => logShopEvent(business.id, "email")}
            />
          )}
          <ActionPill
            icon={<Bookmark className={`w-4 h-4 ${saved ? "fill-foreground" : ""}`} />}
            label={saved ? "Saved" : "Save"}
            onClick={() => setSaved(!saved)}
          />
          <ActionPill
            icon={<Navigation className="w-4 h-4" />}
            label="Directions"
            onClick={() => openDirections(business.mapLat, business.mapLng)}
          />
          <ActionPill
            icon={<Share2 className="w-4 h-4" />}
            label={copied ? "Copied!" : "Share"}
            onClick={() => sharePage(business.name)}
          />
        </div>

        <div className="border-b border-border mt-6" />

        <div className="flex gap-8 mt-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="border-b border-border" />

        <div className="mt-6 pb-4">
          {activeTab === "overview" && (
            <OverviewTab business={business} isOpen={isOpen} todayHours={todayHours} hoursExpanded={hoursExpanded} setHoursExpanded={setHoursExpanded} />
          )}
          {activeTab === "social" && (
            <SocialTab
              business={business}
              galleryPreviewUrls={
                resolvedGalleryUrls.length > 0 ? resolvedGalleryUrls : business.images
              }
            />
          )}
          {activeTab === "reviews" && <ReviewsTab business={business} />}
        </div>
      </div>

      {/* More businesses nearby */}
      <div className="mt-12 border-t border-border pt-6">
        <BusinessSection title={`More businesses in ${business.neighborhood}`} businesses={nearbyBusinesses} />
      </div>

      {/* Sticky bottom bar — mobile contact */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex items-center justify-between md:hidden z-50">
        <div>
          <p className="text-sm font-semibold text-foreground">{business.name}</p>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-foreground text-foreground" />
            <span className="text-xs text-muted-foreground">{business.rating.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              onClick={async (e) => {
                e.preventDefault();
                await logShopEvent(business.id, "call").catch(() => {});
                window.location.href = `tel:${business.phone}`;
              }}
              className="border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-muted transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
          {business.social?.whatsapp && (
            <a
              href={getWhatsAppUrl(business.social.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void logShopEvent(business.id, "whatsapp").catch(() => {});
              }}
              className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/* ───── Action Pill Button ───── */
const ActionPill = ({
  icon,
  label,
  primary,
  onClick,
  href,
  beforeNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
  href?: string;
  /** Run before opening href so analytics requests finish (avoids cancelled GraphQL). */
  beforeNavigate?: () => Promise<void>;
}) => {
  const cls = `flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
    primary
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border text-foreground hover:bg-muted"
  }`;
  if (href && beforeNavigate) {
    return (
      <a
        href={href}
        className={cls}
        onClick={async (e) => {
          e.preventDefault();
          await beforeNavigate().catch(() => {});
          if (href.startsWith("http")) {
            window.open(href, "_blank", "noopener noreferrer");
          } else {
            window.location.href = href;
          }
        }}
      >
        {icon}
        {label}
      </a>
    );
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  );
};

/* ───── Overview Tab ───── */
const OverviewTab = ({
  business,
  isOpen,
  todayHours,
  hoursExpanded,
  setHoursExpanded,
}: {
  business: Business;
  isOpen: boolean;
  todayHours?: { day: string; time: string };
  hoursExpanded: boolean;
  setHoursExpanded: (v: boolean) => void;
}) => (
  <div className="space-y-8 max-w-2xl">
    <div>
      <h3 className="text-base font-semibold text-foreground mb-2">About</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{business.description}</p>
    </div>

    {business.hours && (
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">Hours</h3>
        <button
          onClick={() => setHoursExpanded(!hoursExpanded)}
          className="flex items-center gap-2 text-sm"
        >
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-medium ${isOpen ? "text-primary" : "text-destructive"}`}>
            {isOpen ? "Open now" : "Closed"}
          </span>
          {todayHours && <span className="text-muted-foreground">· {todayHours.time}</span>}
          {hoursExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {hoursExpanded && (
          <div className="mt-3 space-y-1.5 pl-6">
            {business.hours.map((h) => (
              <div key={h.day} className={`flex justify-between text-sm ${h.isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                <span>{h.day}</span>
                <span>{h.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {business.address && (
      <div>
        <h3 className="text-base font-semibold text-foreground mb-2">Location</h3>
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <span className="text-sm text-muted-foreground">{business.address}</span>
        </div>
      </div>
    )}

    {business.owner && (
      <div className="border border-border rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{business.owner.name}</p>
            <p className="text-xs text-muted-foreground">Listed since {business.owner.listedSince}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          {business.owner.replyTime}
        </p>
      </div>
    )}
  </div>
);

/* ───── Social Tab ───── */
const SocialTab = ({
  business,
  galleryPreviewUrls,
}: {
  business: Business;
  galleryPreviewUrls?: string[] | undefined;
}) => {
  const preview =
    galleryPreviewUrls && galleryPreviewUrls.length > 0 ? galleryPreviewUrls : business.images;
  return (
    <div className="space-y-4 max-w-md">
      {business.social?.instagram && (
        <SocialLink icon={<Instagram className="w-5 h-5" />} label="Instagram" handle={business.social.instagram} />
      )}
      {business.social?.facebook && (
        <SocialLink icon={<Facebook className="w-5 h-5" />} label="Facebook" handle={business.social.facebook} />
      )}
      {business.social?.tiktok && (
        <SocialLink
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52V6.94a4.85 4.85 0 0 1-1.01-.25z" />
            </svg>
          }
          label="TikTok"
          handle={business.social.tiktok}
        />
      )}

      {business.social?.instagram && preview && preview.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent on Instagram</h3>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
            {preview.slice(0, 3).map((img, i) => (
              <img key={i} src={img} alt="" className="aspect-square object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SocialLink = ({ icon, label, handle }: { icon: React.ReactNode; label: string; handle: string }) => (
  <a
    href="#"
    className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted transition-colors"
  >
    <span className="text-foreground">{icon}</span>
    <div className="flex-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{handle}</p>
    </div>
    <ExternalLink className="w-4 h-4 text-muted-foreground" />
  </a>
);

/* ───── Reviews Tab ───── */
const ReviewsTab = ({ business }: { business: Business }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rating || !comment.trim()) {
      setError("Please fill in all fields and select a star rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const input = {
        shopID: business.id,
        reviewerName: name.trim(),
        rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      };
      try {
        await getClient().graphql({
          query: createReview,
          variables: { input },
          authMode: "apiKey",
        });
      } catch (err: any) {
        // Partial success — review written but resolver errored on related fields
        if (!err?.data?.createReview) throw err;
      }
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["shop", business.id] });
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Rating summary */}
      {(business.reviews?.length ?? 0) > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold text-foreground">{business.rating.toFixed(1)}</span>
          <div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(business.rating) ? "fill-foreground text-foreground" : "text-border"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{business.reviews?.length} review{business.reviews?.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {/* Existing reviews */}
      {(business.reviews?.length ?? 0) > 0 ? (
        <div className="space-y-5">
          {business.reviews?.map((review, i) => (
            <div key={i} className="border-b border-border pb-5 last:border-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-foreground text-foreground" : "text-border"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No reviews yet — be the first to leave one!</p>
      )}

      {/* Submit form */}
      <div className="border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Leave a review</h3>
        {submitted ? (
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <Star className="w-4 h-4 fill-primary" />
            Thank you for your review!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 transition-colors ${s <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="What did you like? What could be better?"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
