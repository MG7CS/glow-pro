import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Instagram,
  Facebook,
  MapPin,
  MessageCircle,
  Phone,
  Check,
  Loader2,
  Navigation,
} from "lucide-react";
import type { BizFormData } from "@/types/biz";
import { CATEGORIES, NEIGHBORHOODS } from "@/lib/constants";
import PhotoUpload from "./PhotoUpload";
import HoursEditor from "./HoursEditor";
import { useUpdatebusiness } from "@/hooks/useUpdateShop";
import { useToast } from "@/hooks/use-toast";

interface Props {
  business: BizFormData;
  setbusiness: (s: BizFormData) => void;
}

const DashboardEditListing = ({ business, setbusiness }: Props) => {
  const update = (patch: Partial<BizFormData>) => setbusiness({ ...business, ...patch });
  const [openSection, setOpenSection] = useState<string>("Profile basics");
  const { mutate: updateBusiness, isPending } = useUpdatebusiness();
  const { toast } = useToast();
  const [geoLoading, setGeoLoading] = useState(false);

  const handleToggle = (title: string) => {
    setOpenSection((prev) => (prev === title ? "" : title));
  };

  const handleSave = () => {
    const businessId = business.id ?? localStorage.getItem("biz_id") ?? "draft";
    updateBusiness(
      { businessId, form: business },
      {
        onSuccess: () => {
          toast({ title: "Saved", description: "Your listing has been updated." });
        },
      }
    );
  };

  return (
    <div className="space-y-0">
      <EditSection
        title="Profile basics"
        isOpen={openSection === "Profile basics"}
        onToggle={() => handleToggle("Profile basics")}
        onSave={handleSave}
        isSaving={isPending}
      >
        <div className="space-y-4">
          <Field label="Your name or salon name">
            <input
              type="text"
              value={business.businessName}
              onChange={(e) => update({ businessName: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </Field>
          <Field label="Category">
            <select
              value={business.category}
              onChange={(e) => update({ category: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <textarea
              value={business.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
            />
          </Field>
        </div>
      </EditSection>

      <EditSection
        title="Location"
        isOpen={openSection === "Location"}
        onToggle={() => handleToggle("Location")}
        onSave={handleSave}
        isSaving={isPending}
      >
        <div className="space-y-4">
          <Field label="Neighborhood">
            <select
              value={business.neighborhood}
              onChange={(e) => update({ neighborhood: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none"
            >
              <option value="">Select neighborhood</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>
          {business.neighborhood && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {business.neighborhood}, Kigali
            </div>
          )}

          <Field label="Pin location">
            <button
              onClick={() => {
                if (!navigator.geolocation) return;
                setGeoLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    update({
                      mapLat: parseFloat(pos.coords.latitude.toFixed(6)),
                      mapLng: parseFloat(pos.coords.longitude.toFixed(6)),
                    });
                    setGeoLoading(false);
                  },
                  () => setGeoLoading(false),
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              disabled={geoLoading}
              type="button"
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm disabled:opacity-60"
            >
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-primary" />}
              Use my current location
            </button>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input
                type="number"
                step="any"
                value={business.mapLat ?? ""}
                onChange={(e) => update({ mapLat: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Latitude"
                className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <input
                type="number"
                step="any"
                value={business.mapLng ?? ""}
                onChange={(e) => update({ mapLng: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Longitude"
                className="h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </Field>
        </div>
      </EditSection>

      <EditSection
        title="Contact"
        isOpen={openSection === "Contact"}
        onToggle={() => handleToggle("Contact")}
        onSave={handleSave}
        isSaving={isPending}
      >
        <div className="space-y-4">
          <Field label="WhatsApp number">
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={business.whatsapp}
                onChange={(e) => update({ whatsapp: e.target.value })}
                placeholder="+250 788 000 000"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </Field>
          <Field label="Phone number (optional)">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={business.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+250 788 000 000"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </Field>
        </div>
      </EditSection>

      <EditSection
        title="Photos"
        isOpen={openSection === "Photos"}
        onToggle={() => handleToggle("Photos")}
        onSave={handleSave}
        isSaving={isPending}
      >
        <PhotoUpload
          coverPhoto={business.coverPhoto}
          galleryPhotos={business.galleryPhotos}
          onCoverChange={(url) => update({ coverPhoto: url })}
          onGalleryChange={(urls) => update({ galleryPhotos: urls })}
          compact
        />
      </EditSection>

      <EditSection
        title="Hours"
        isOpen={openSection === "Hours"}
        onToggle={() => handleToggle("Hours")}
        onSave={handleSave}
        isSaving={isPending}
      >
        <HoursEditor
          hours={business.hours ?? []}
          onChange={(hours) => update({ hours })}
        />
      </EditSection>

      <EditSection
        title="Social media"
        isOpen={openSection === "Social media"}
        onToggle={() => handleToggle("Social media")}
        onSave={handleSave}
        isSaving={isPending}
      >
        <div className="space-y-4">
          <Field label="Instagram">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={business.instagram}
                onChange={(e) => update({ instagram: e.target.value })}
                placeholder="@yourbusiness"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </Field>
          <Field label="Facebook">
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={business.facebook}
                onChange={(e) => update({ facebook: e.target.value })}
                placeholder="Your page name"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </Field>
          <Field label="TikTok">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52V6.94a4.85 4.85 0 0 1-1.01-.25z" />
                </svg>
              </span>
              <input
                type="text"
                value={business.tiktok}
                onChange={(e) => update({ tiktok: e.target.value })}
                placeholder="@yourbusiness"
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </Field>
        </div>
      </EditSection>
    </div>
  );
};

const EditSection = ({
  title,
  isOpen,
  onToggle,
  onSave,
  isSaving,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onSave: () => void;
  isSaving: boolean;
  children: React.ReactNode;
}) => (
  <div className="border-b border-border">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 text-left"
    >
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {isOpen ? (
        <ChevronUp className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
    {isOpen && (
      <div className="pb-6">
        {children}
        <div className="flex justify-end mt-4">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        </div>
      </div>
    )}
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

export default DashboardEditListing;
