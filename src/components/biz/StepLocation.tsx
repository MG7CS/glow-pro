import { ArrowLeft, MapPin, Loader2, Navigation } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import { NEIGHBORHOODS } from "@/lib/constants";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepLocation = ({ form, update, onNext, onBack }: Props) => {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const canContinue = form.neighborhood.length > 0;

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update({
          mapLat: parseFloat(pos.coords.latitude.toFixed(6)),
          mapLng: parseFloat(pos.coords.longitude.toFixed(6)),
        });
        setGeoLoading(false);
      },
      () => {
        setGeoError("Could not get your location. Please enter coordinates manually.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Where can people find you?
      </h1>
      <p className="text-muted-foreground mb-8">
        Help customers discover your business in their neighborhood.
      </p>

      <div className="space-y-6">
        {/* Neighborhood select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Neighborhood</label>
          <select
            value={form.neighborhood}
            onChange={(e) => update({ neighborhood: e.target.value })}
            className={cn(bizField, "h-12 appearance-none px-4 text-foreground")}
          >
            <option value="">Select your neighborhood</option>
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Geolocation */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Pin your location <span className="text-muted-foreground font-normal">(optional)</span>
          </label>

          <button
            type="button"
            onClick={handleGeolocate}
            disabled={geoLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(0,0,0,0.12)] bg-white text-sm font-medium text-foreground transition-colors hover:bg-black/[0.02] disabled:opacity-60"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
            Use my current location
          </button>

          {geoError && <p className="text-xs text-destructive mt-2">{geoError}</p>}

          {/* Manual lat/lng inputs */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.mapLat ?? ""}
                onChange={(e) => update({ mapLat: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="-1.9403"
                className={cn(bizField, "h-10 px-3 text-sm text-foreground placeholder:text-muted-foreground/50")}
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.mapLng ?? ""}
                onChange={(e) => update({ mapLng: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="29.8739"
                className={cn(bizField, "h-10 px-3 text-sm text-foreground placeholder:text-muted-foreground/50")}
              />
            </div>
          </div>

          {form.mapLat !== null && form.mapLng !== null && (
            <div className="flex items-center gap-1.5 text-sm text-primary mt-2">
              <MapPin className="w-4 h-4" />
              {form.mapLat.toFixed(4)}, {form.mapLng.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className={cn(bizContinueBtn, "px-8 py-3 text-sm")}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
