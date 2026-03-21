import { CATEGORIES } from "@/lib/constants";

interface Props {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const CategoryRibbon = ({ selected, onSelect }: Props) => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-10 pb-4">
      {/* Desktop: centered flex-wrap */}
      <div className="hidden md:flex flex-wrap justify-center gap-2">
        <PillButton
          label="All"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {CATEGORIES.map((cat) => (
          <PillButton
            key={cat}
            label={cat}
            active={selected === cat}
            onClick={() => onSelect(selected === cat ? null : cat)}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex overflow-x-auto scrollbar-hide gap-2 -mx-1 px-1">
        <PillButton
          label="All"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {CATEGORIES.map((cat) => (
          <PillButton
            key={cat}
            label={cat}
            active={selected === cat}
            onClick={() => onSelect(selected === cat ? null : cat)}
          />
        ))}
      </div>
    </div>
  );
};

const PillButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
      active
        ? "bg-primary text-white"
        : "border border-gray-300 bg-white/60 text-[#111] backdrop-blur-sm hover:border-primary"
    }`}
  >
    {label}
  </button>
);

export default CategoryRibbon;
