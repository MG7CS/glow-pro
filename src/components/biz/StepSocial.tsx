import { ArrowLeft, Instagram, Facebook } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepSocial = ({ form, update, onNext, onBack }: Props) => {
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
        Connect your social media
      </h1>
      <p className="text-muted-foreground mb-8">Let clients follow you — totally optional.</p>

      <div className="space-y-5">
        <SocialInput
          icon={<Instagram className="w-5 h-5" />}
          label="Instagram"
          value={form.instagram}
          onChange={(v) => update({ instagram: v })}
          placeholder="@yourbusiness"
        />
        <SocialInput
          icon={<Facebook className="w-5 h-5" />}
          label="Facebook"
          value={form.facebook}
          onChange={(v) => update({ facebook: v })}
          placeholder="Your Facebook page name"
        />
        <SocialInput
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52V6.94a4.85 4.85 0 0 1-1.01-.25z" />
            </svg>
          }
          label="TikTok"
          value={form.tiktok}
          onChange={(v) => update({ tiktok: v })}
          placeholder="@yourbusiness"
        />
      </div>

      <div className="flex items-center justify-between mt-10">
        <button
          onClick={onNext}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
        <button type="button" onClick={onNext} className={cn(bizContinueBtn, "px-8 py-3 text-sm")}>
          Continue
        </button>
      </div>
    </div>
  );
};

const SocialInput = ({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="w-full">
    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        bizField,
        "h-12 w-full px-4 text-foreground placeholder:text-muted-foreground/60",
      )}
    />
  </div>
);

export default StepSocial;
