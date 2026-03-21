import { Heart, Star, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface BusinessCardProps {
  id: string;
  image: string;
  name: string;
  neighborhood: string;
  category: string;
  distance: string;
  rating: number;
}

const BusinessCard = ({ id, image, name, neighborhood, category, distance, rating }: BusinessCardProps) => {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:bg-white/90 transition-all duration-300 group w-[240px] min-w-[240px] flex-shrink-0 cursor-pointer overflow-hidden"
      onClick={() => navigate(`/business/${id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-muted">
            <span className="text-3xl">🏪</span>
            <span className="text-xs font-medium text-[#666]">{name}</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
        >
          <Heart
            className={`w-5 h-5 drop-shadow-md transition-colors ${
              saved ? "fill-red-500 stroke-red-500" : "fill-black/20 stroke-white"
            }`}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="mt-2.5">
        <div className="flex justify-between items-start gap-1">
          <h3 className="text-sm font-semibold leading-tight text-[#111] line-clamp-1">{name}</h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3 h-3 fill-[#111] text-[#111]" />
            <span className="text-xs font-medium text-[#111]">{rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-[#666]">
          {category} · {neighborhood}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#666]">{distance} away</span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
