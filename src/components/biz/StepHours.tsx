import { cn } from "@/lib/utils";
import { bizContinueBtn } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import HoursEditor from "./HoursEditor";

interface Props {
  form: BizFormData;
  onChange: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepHours = ({ form, onChange, onNext, onBack }: Props) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto px-4 py-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">When are you open?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Click a day to mark it open and set your hours. You can skip this and add hours later.
        </p>
      </div>

      <HoursEditor hours={form.hours ?? []} onChange={(hours) => onChange({ hours })} />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-[rgba(0,0,0,0.12)] bg-white py-3 text-sm font-semibold text-foreground transition-colors hover:bg-black/[0.02]"
        >
          Back
        </button>
        <button type="button" onClick={onNext} className={cn(bizContinueBtn, "flex-1 py-3 text-sm")}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepHours;
