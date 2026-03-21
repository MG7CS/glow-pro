import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

interface PhotoUploadProps {
  coverPhoto: string | null;
  galleryPhotos: string[];
  onCoverChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
  compact?: boolean;
}

const PhotoUpload = ({
  coverPhoto,
  galleryPhotos,
  onCoverChange,
  onGalleryChange,
  compact = false,
}: PhotoUploadProps) => {
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCoverChange(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 4 - galleryPhotos.length)
      .map((f) => URL.createObjectURL(f));
    onGalleryChange([...galleryPhotos, ...urls].slice(0, 4));
    e.target.value = "";
  };

  const removeGallery = (idx: number) =>
    onGalleryChange(galleryPhotos.filter((_, i) => i !== idx));

  const coverHeight = compact ? "h-40" : "h-48";

  return (
    <div className="space-y-6">
      {/* Cover photo */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Cover photo</label>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
        {coverPhoto ? (
          <div className={`relative w-full ${coverHeight} rounded-lg overflow-hidden group`}>
            <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            <button
              onClick={() => onCoverChange(null)}
              className="absolute top-2 right-2 p-1 rounded-full bg-foreground/60 text-background hover:bg-foreground/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => coverRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/20 transition-colors text-transparent group-hover:text-background font-medium text-sm"
            >
              Change photo
            </button>
          </div>
        ) : (
          <button
            onClick={() => coverRef.current?.click()}
            className={`flex w-full ${coverHeight} flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(0,0,0,0.12)] bg-white/80 transition-colors hover:border-[rgba(16,185,129,0.35)]`}
          >
            <ImagePlus className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Drag & drop or click to upload</span>
            <span className="text-xs text-muted-foreground/60">JPG, PNG up to 10MB</span>
          </button>
        )}
      </div>

      {/* Gallery */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Gallery photos
          <span className="text-xs text-muted-foreground font-normal ml-1">(up to 4, optional)</span>
        </label>
        <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
        <div className="grid grid-cols-2 gap-2">
          {galleryPhotos.map((url, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeGallery(i)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-foreground/60 text-background hover:bg-foreground/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {galleryPhotos.length < 4 && (
            <button
              onClick={() => galleryRef.current?.click()}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[rgba(0,0,0,0.12)] bg-white/80 transition-colors hover:border-[rgba(16,185,129,0.35)]"
            >
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
