import { useState } from "react";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepContact = ({ form, update, onNext, onBack }: Props) => {
  const [phoneError, setPhoneError] = useState("");

  const handleNext = () => {
    if (!form.phone?.trim()) {
      setPhoneError("Phone number is required.");
      return;
    }
    setPhoneError("");
    onNext();
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        How should customers reach you?
      </h1>
      <p className="text-muted-foreground mb-8">
        WhatsApp is the #1 way customers connect with salons in Rwanda.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" />
              Phone number (required)
            </span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => {
              update({ phone: e.target.value });
              if (phoneError) setPhoneError("");
            }}
            placeholder="+250 788 000 000"
            className={cn(
              bizField,
              "h-12 px-4 text-foreground placeholder:text-muted-foreground/60",
              phoneError && "biz-field--error",
            )}
          />
          {phoneError && <p className="text-sm text-destructive mt-1.5">{phoneError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              WhatsApp number (optional)
            </span>
          </label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => update({ whatsapp: e.target.value })}
            placeholder="+250 788 000 000"
            className={cn(bizField, "h-12 px-4 text-foreground placeholder:text-muted-foreground/60")}
          />
          <p className="text-xs text-muted-foreground mt-1.5">Leave blank if same as phone number</p>
        </div>
      </div>

      <div className="flex justify-end mt-10">
        <button type="button" onClick={handleNext} className={cn(bizContinueBtn, "px-8 py-3 text-sm")}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepContact;
