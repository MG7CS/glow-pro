import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import { RECRUITER_REF_STORAGE_KEY } from "@/lib/recruiterRef";

export type ReferralSourceValue = "google" | "social" | "friend" | "recruiter" | "other";

const OPTIONS: { id: ReferralSourceValue; label: string }[] = [
  { id: "google", label: "Google / Search engine" },
  { id: "social", label: "Social media (Instagram, TikTok, Facebook)" },
  { id: "friend", label: "Friend or family recommendation" },
  { id: "recruiter", label: "ConnectKigali Recruiter" },
  { id: "other", label: "Other" },
];

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepReferral = ({ form, update, onNext, onBack }: Props) => {
  const selected = (form.referralSource ?? "") as ReferralSourceValue | "";
  const recruiterId = form.recruiterId ?? "";

  const setSource = (id: ReferralSourceValue) => {
    if (id !== "recruiter") {
      localStorage.removeItem(RECRUITER_REF_STORAGE_KEY);
    }
    update({
      referralSource: id,
      ...(id !== "recruiter" ? { recruiterId: "" } : {}),
    });
  };

  const handleSkip = () => {
    localStorage.removeItem(RECRUITER_REF_STORAGE_KEY);
    update({ referralSource: "", recruiterId: "" });
    onNext();
  };

  const handleContinue = () => {
    if (!selected) {
      return;
    }
    onNext();
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">How did you hear about us?</h1>
      <p className="mb-8 text-muted-foreground">This helps us grow our community</p>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSource(opt.id)}
            className={cn(
              "w-full rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-colors",
              selected === opt.id
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            <span className="mr-2 inline-block w-4 text-muted-foreground">{selected === opt.id ? "■" : "□"}</span>
            {opt.label}
          </button>
        ))}
      </div>

      {selected === "recruiter" && (
        <div className="mt-6 space-y-1.5">
          <label className="block text-sm font-medium text-foreground">Recruiter ID</label>
          <input
            type="text"
            value={recruiterId}
            onChange={(e) => update({ recruiterId: e.target.value })}
            placeholder="e.g. CK-1234"
            className={cn(bizField, "h-12 w-full px-4 text-foreground placeholder:text-muted-foreground/60")}
          />
          <p className="text-xs text-muted-foreground">Ask your recruiter for their ID</p>
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className={cn(bizContinueBtn, "px-8 py-3 text-sm disabled:opacity-40")}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepReferral;
