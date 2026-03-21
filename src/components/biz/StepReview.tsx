import { useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn } from "@/lib/bizUi";
import LivePreview from "./LivePreview";
import type { BizFormData } from "@/types/biz";

interface Props {
  form: BizFormData;
  onBack: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

const StepReview = ({ form, onBack, onPublish, isPublishing = false }: Props) => {
  const [error, setError] = useState("");

  const noCoverPhoto = !form.coverPhoto;

  const handlePublish = () => {
    if (noCoverPhoto) {
      setError("Please add a cover photo before publishing. Listings without a photo get far fewer views.");
      return;
    }
    setError("");
    onPublish?.();
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

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Looking good! Ready to publish?
      </h1>
      <p className="text-muted-foreground mb-8">
        Review your profile below. You can always edit it later.
      </p>

      <div className="space-y-2 mb-6">
        <CheckItem label="Your name or salon name" done={!!form.businessName} />
        <CheckItem label="Category" done={!!form.category} />
        <CheckItem label="Neighborhood" done={!!form.neighborhood} />
        <CheckItem label="WhatsApp number" done={!!(form.whatsapp || form.phone)} />
        <CheckItem label="Cover photo" done={!!form.coverPhoto} required />
      </div>

      {/* Cover photo warning */}
      {noCoverPhoto && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/90 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Cover photo required</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Go back and add a photo so clients can recognise your work at a glance.
            </p>
          </div>
        </div>
      )}

      {/* General error */}
      {error && !noCoverPhoto && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/15 bg-destructive/10 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="biz-preview-panel mb-8 p-4 md:hidden">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Live preview
        </p>
        <LivePreview form={form} />
      </div>

      <button
        type="button"
        onClick={handlePublish}
        disabled={isPublishing || noCoverPhoto}
        className={cn(bizContinueBtn, "w-full py-3.5 text-base disabled:opacity-50")}
      >
        {isPublishing ? "Publishing..." : "Publish your profile"}
      </button>

      {noCoverPhoto && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Add a cover photo to unlock publishing
        </p>
      )}
    </div>
  );
};

const CheckItem = ({
  label,
  done,
  required,
}: {
  label: string;
  done: boolean;
  required?: boolean;
}) => (
  <div className="flex items-center gap-2.5">
    <CheckCircle2
      className={`w-5 h-5 shrink-0 ${
        done ? "text-primary" : required ? "text-amber-400" : "text-muted-foreground/35"
      }`}
      strokeWidth={done ? 2 : 1.5}
    />
    <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
      {required && !done && (
        <span className="ml-1.5 text-xs font-semibold text-amber-600">required</span>
      )}
    </span>
  </div>
);

export default StepReview;
