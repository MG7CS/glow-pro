import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import BusinessCard from "./BusinessCard";
import { cn } from "@/lib/utils";

interface BusinessSummary {
  id: string;
  image: string;
  name: string;
  neighborhood: string;
  category: string;
  distance: string;
  rating: number;
}

interface BusinessSectionProps {
  title: string;
  businesses: BusinessSummary[];
  /** Initial number of cards to show. "Show more" reveals the rest. */
  initialLimit?: number;
  /** Small uppercase label shown above the section title */
  eyebrow?: string;
  /** When true, strip outer padding for use inside a parent card */
  embedded?: boolean;
}

const BusinessSection = ({
  title,
  businesses,
  initialLimit = 8,
  eyebrow,
  embedded = false,
}: BusinessSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [limit, setLimit] = useState(initialLimit);
  const visible = businesses.slice(0, limit);
  const hasMore = businesses.length > limit;

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className={cn(embedded ? "py-0" : "py-6")}>
      <div className={cn("max-w-[1200px] mx-auto", embedded ? "px-0" : "px-6 md:px-10")}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-400">{eyebrow}</p>
        ) : null}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#111]">{title}</h2>
            <ArrowRight className="w-4 h-4 text-[#666]" />
          </div>
          <div className="flex items-center gap-3">
            {hasMore && (
              <button
                onClick={() => setLimit((l) => l + 8)}
                className="hidden md:inline text-sm text-primary font-medium hover:underline"
              >
                Show more
              </button>
            )}
            <div className="hidden md:flex gap-1.5">
              <button
                onClick={() => scroll("left")}
                className="p-1 rounded-full text-[#666] transition-colors hover:text-[#111]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1 rounded-full text-[#666] transition-colors hover:text-[#111]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        >
          {visible.map((business) => (
            <BusinessCard key={business.id} {...business} />
          ))}
        </div>

        {/* Mobile "Show more" */}
        {hasMore && (
          <button
            onClick={() => setLimit((l) => l + 8)}
            className="md:hidden mt-3 w-full text-sm text-primary font-medium py-2 border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
          >
            Show more
          </button>
        )}
      </div>
    </section>
  );
};

export default BusinessSection;
