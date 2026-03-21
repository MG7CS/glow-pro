import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import businessProfileMockup from "@/assets/business-profile-mockup.png";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
}

const StepWelcome = ({ form, update, onNext }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && form.businessName.trim().length > 0) onNext();
  };

  return (
    <div className="min-h-full flex flex-col md:flex-row">
      {/* ── LEFT: question panel ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-14 md:py-0">
        <div className="max-w-md w-full mx-auto md:mx-0">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Join Rwanda&apos;s growing beauty directory
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            What&apos;s your salon called?
          </h1>
          <p className="text-muted-foreground text-base mb-10">You can always change this later.</p>

          <input
            ref={inputRef}
            type="text"
            value={form.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            onKeyDown={handleKey}
            placeholder="e.g. Mama Grace's Salon"
            className={cn(
              bizField,
              "h-14 px-5 text-lg text-foreground placeholder:text-muted-foreground/40",
            )}
          />

          <button
            type="button"
            onClick={onNext}
            disabled={form.businessName.trim().length === 0}
            className={cn(
              bizContinueBtn,
              "mt-4 h-14 w-full gap-2 text-base active:scale-[0.99]",
            )}
          >
            Continue
            <span className="text-lg">→</span>
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">Free • Takes about 5 minutes</p>

          {/* Feature chips — visible on mobile only */}
          <div className="flex flex-wrap gap-2 mt-8 md:hidden justify-center">
            {["✓ Free forever", "✓ Works offline", "✓ WhatsApp ready"].map((f) => (
              <span key={f} className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: mock business profile (desktop only) ── */}
      <div className="hidden w-[50%] items-center justify-center overflow-y-auto py-8 px-5 md:flex lg:w-[52%] lg:px-8">
        <MockbusinessProfile />
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────
   Mock business profile card
────────────────────────────────────────── */
const MockbusinessProfile = () => (
  <div className="w-full overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white/90 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)]">
    <img
      src={businessProfileMockup}
      alt="Sample salon listing"
      className="block w-full"
    />
    <div className="flex items-center gap-2 border-t border-[rgba(0,0,0,0.05)] bg-rose-50/80 px-4 py-2.5">
      <span>✨</span>
      <p className="text-[11px] font-semibold text-primary">This is what your listing will look like</p>
    </div>
  </div>
);

export default StepWelcome;
