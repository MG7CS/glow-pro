import {
  BadgeCheck,
  Bookmark,
  MapPin,
  MessageCircle,
  Navigation,
  Share2,
  Star,
  User,
} from "lucide-react";
import type { BizFormData } from "@/types/biz";

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-border/60 rounded animate-pulse ${className}`} />
);

const LivePreview = ({ form }: { form: BizFormData }) => {
  const hasName = form.businessName.trim().length > 0;
  const hasCover = !!form.coverPhoto;

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
      {/* Photo area */}
      <div className="aspect-[16/9] relative overflow-hidden">
        {hasCover ? (
          <img src={form.coverPhoto!} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Cover photo</span>
          </div>
        )}
        {form.galleryPhotos.length > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {form.galleryPhotos.slice(0, 2).map((url, i) => (
              <div key={i} className="w-10 h-10 rounded border-2 border-background overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          {hasName ? (
            <h3 className="text-lg font-bold text-foreground">{form.businessName}</h3>
          ) : (
            <Skeleton className="h-5 w-40" />
          )}
          {hasName && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        <div className="mt-1">
          {form.category || form.neighborhood ? (
            <p className="text-xs text-muted-foreground">
              {[form.category, form.neighborhood].filter(Boolean).join(" · ")}
            </p>
          ) : (
            <Skeleton className="h-3 w-32 mt-1" />
          )}
        </div>

        <div className="flex items-center gap-0.5 mt-1.5">
          <Star className="w-3 h-3 fill-border text-border" />
          <span className="text-xs text-muted-foreground">New listing</span>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          <MiniPill icon={<MessageCircle className="w-3 h-3" />} label="WhatsApp" primary />
          <MiniPill icon={<Bookmark className="w-3 h-3" />} label="Save" />
          <MiniPill icon={<Navigation className="w-3 h-3" />} label="Directions" />
          <MiniPill icon={<Share2 className="w-3 h-3" />} label="Share" />
        </div>

        <div className="mt-4 border-t border-[rgba(0,0,0,0.05)] pt-3">
          {form.description ? (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {form.description}
            </p>
          ) : (
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-full" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          )}
        </div>

        {form.neighborhood && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            {form.neighborhood}, Kigali
          </div>
        )}

        {(form.whatsapp || form.phone) && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <MessageCircle className="w-3 h-3 shrink-0" />
            {form.whatsapp || form.phone}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 border-t border-[rgba(0,0,0,0.05)] pt-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <Skeleton className="h-3 w-20" />
            <p className="text-[10px] text-muted-foreground mt-0.5">business owner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniPill = ({
  icon,
  label,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) => (
  <div
    className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${
      primary ? "bg-[#10B981] text-white" : "border border-[rgba(0,0,0,0.1)] text-foreground"
    }`}
  >
    {icon}
    {label}
  </div>
);

export default LivePreview;
