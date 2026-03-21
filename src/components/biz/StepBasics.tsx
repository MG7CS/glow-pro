import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import { CATEGORIES } from "@/lib/constants";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepBasics = ({ form, update, onNext, onBack }: Props) => {
  const canContinue = form.category.length > 0;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
        Great, {form.businessName}!
      </h1>
      <p className="text-muted-foreground mb-8">Now tell us a bit more about your business.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => update({ category: e.target.value })}
            className={cn(bizField, "h-12 appearance-none px-4 text-foreground")}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Short description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="What makes your business special? (optional)"
            rows={3}
            className={cn(
              bizField,
              "resize-none px-4 py-3 text-foreground placeholder:text-muted-foreground/60",
            )}
          />
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

export default StepBasics;
