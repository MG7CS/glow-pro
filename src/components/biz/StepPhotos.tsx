import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn } from "@/lib/bizUi";
import type { BizFormData } from "@/types/biz";
import PhotoUpload from "./PhotoUpload";

interface Props {
  form: BizFormData;
  update: (patch: Partial<BizFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepPhotos = ({ form, update, onNext, onBack }: Props) => {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Show off your business</h1>
      <p className="text-muted-foreground mb-8">Great photos help customers trust your business.</p>

      <PhotoUpload
        coverPhoto={form.coverPhoto}
        galleryPhotos={form.galleryPhotos}
        onCoverChange={(url) => update({ coverPhoto: url })}
        onGalleryChange={(urls) => update({ galleryPhotos: urls })}
      />

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

export default StepPhotos;
