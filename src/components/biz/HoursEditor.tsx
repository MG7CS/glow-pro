import { cn } from "@/lib/utils";
import { bizField } from "@/lib/bizUi";
import type { BizHour } from "@/types/biz";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Props {
  hours: BizHour[];
  onChange: (hours: BizHour[]) => void;
}

const HoursEditor = ({ hours, onChange }: Props) => {
  const getEntry = (day: string) => hours.find((h) => h.day === day);

  const toggle = (day: string) => {
    if (getEntry(day)) {
      onChange(hours.filter((h) => h.day !== day));
    } else {
      onChange([...hours, { day, time: "9:00 AM – 6:00 PM" }]);
    }
  };

  const setTime = (day: string, time: string) => {
    onChange(hours.map((h) => (h.day === day ? { ...h, time } : h)));
  };

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const entry = getEntry(day);
        return (
          <div key={day} className="flex items-center gap-3">
            {/* Toggle day open/closed */}
            <button
              type="button"
              onClick={() => toggle(day)}
              className={`h-8 w-24 shrink-0 rounded-lg border text-xs font-semibold transition-colors ${
                entry
                  ? "border-[#E11D48] bg-[#E11D48] text-white"
                  : "border-[rgba(0,0,0,0.12)] bg-white text-muted-foreground hover:bg-black/[0.02]"
              }`}
            >
              {day.slice(0, 3)}
            </button>

            {entry ? (
              <input
                type="text"
                value={entry.time}
                onChange={(e) => setTime(day, e.target.value)}
                placeholder="e.g. 8:00 AM – 8:00 PM"
                className={cn(bizField, "h-8 flex-1 px-3 text-sm text-foreground placeholder:text-muted-foreground/50")}
              />
            ) : (
              <span className="flex-1 text-xs text-muted-foreground">Closed</span>
            )}
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-1">
        Click a day to toggle it open. Type hours freely, e.g. "8:00 AM – 9:00 PM" or "24 hours".
      </p>
    </div>
  );
};

export default HoursEditor;
