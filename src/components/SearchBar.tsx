import { Search } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { NEIGHBORHOODS } from "@/lib/constants";

interface SearchBarProps {
  what: string;
  where: string;
  onSearch: (what: string, where: string) => void;
}

const SearchBar = ({ what, where, onSearch }: SearchBarProps) => {
  const [whatValue, setWhatValue] = useState(what);
  const [whereValue, setWhereValue] = useState(where);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const whereRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWhatValue(what);
  }, [what]);

  useEffect(() => {
    setWhereValue(where);
  }, [where]);

  const suggestions = whereValue.trim()
    ? NEIGHBORHOODS.filter((n) =>
        n.toLowerCase().includes(whereValue.toLowerCase())
      )
    : [];

  const handleSubmit = useCallback(() => {
    onSearch(whatValue.trim(), whereValue.trim());
    setShowSuggestions(false);
  }, [whatValue, whereValue, onSearch]);

  const selectSuggestion = useCallback(
    (name: string) => {
      setWhereValue(name);
      setShowSuggestions(false);
      setActiveIndex(-1);
      onSearch(whatValue.trim(), name);
    },
    [whatValue, onSearch]
  );

  const handleWhereKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") handleSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        whereRef.current &&
        !whereRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="relative w-full max-w-[640px]">
        <div className="flex w-full flex-col rounded-2xl border border-[rgba(0,0,0,0.08)] bg-transparent md:flex-row md:items-center md:rounded-full">
          {/* What input */}
          <div className="w-full md:flex-1 px-4 py-2.5 md:px-6 md:py-3">
            <label className="block text-xs font-semibold text-[#111]">What</label>
            <input
              type="text"
              value={whatValue}
              onChange={(e) => {
                setWhatValue(e.target.value);
                onSearch(e.target.value.trim(), whereValue.trim());
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-transparent text-sm text-[#111] outline-none placeholder:text-[#666]"
              placeholder="What are you looking for?"
            />
          </div>

          <div className="hidden h-8 w-px shrink-0 self-center bg-gray-300/80 md:block" aria-hidden />

          {/* Where + search: stacked under "What" on mobile; split by divider on md+ */}
          <div className="flex w-full min-w-0 flex-row items-center gap-2 border-t border-[rgba(0,0,0,0.08)] px-4 py-2.5 md:contents md:border-0 md:border-t-0 md:px-0 md:py-0">
            {/* Where input */}
            <div className="relative min-w-0 flex-1 md:flex-1 px-0 md:px-6 py-0 md:py-3">
              <label className="block text-xs font-semibold text-[#111]">Where</label>
              <input
                ref={whereRef}
                type="text"
                value={whereValue}
                onChange={(e) => {
                  setWhereValue(e.target.value);
                  setShowSuggestions(true);
                  setActiveIndex(-1);
                  if (!e.target.value.trim()) {
                    onSearch(whatValue.trim(), "");
                  }
                }}
                onFocus={() => whereValue.trim() && setShowSuggestions(true)}
                onKeyDown={handleWhereKeyDown}
                className="w-full bg-transparent text-sm text-[#111] outline-none placeholder:text-[#666]"
                placeholder="Which neighborhood?"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 md:mr-2 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="glass-panel absolute left-0 right-0 top-full z-50 mt-1 max-h-60 !rounded-xl overflow-y-auto md:left-1/2"
          >
            {suggestions.map((name, i) => (
              <button
                key={name}
                onMouseDown={() => selectSuggestion(name)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  i === activeIndex
                    ? "bg-primary/15 text-[#111]"
                    : "text-[#111] hover:bg-white/50"
                } ${i === 0 ? "rounded-t-xl" : ""} ${
                  i === suggestions.length - 1 ? "rounded-b-xl" : ""
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
