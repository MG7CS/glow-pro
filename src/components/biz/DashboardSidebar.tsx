import { LayoutDashboard, Pencil, BarChart3, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { cn } from "@/lib/utils";
import type { DashboardTab } from "@/pages/BusinessDashboard";

interface Props {
  tab: DashboardTab;
  setTab: (t: DashboardTab) => void;
  businessName?: string;
  isLive?: boolean;
  className?: string;
}

const navItems: { key: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "edit", label: "Edit listing", icon: <Pencil className="w-4 h-4" /> },
  { key: "stats", label: "Stats", icon: <BarChart3 className="w-4 h-4" /> },
  { key: "account", label: "Account", icon: <Settings className="w-4 h-4" /> },
];

const DashboardSidebar = ({ tab, setTab, businessName, isLive, className = "" }: Props) => {
  const { signOut } = useAuthState();

  return (
    <aside className={cn("w-60 flex flex-col m-3 rounded-2xl bg-slate-100", className)}>
      {/* Logo */}
      <div className="px-6 pt-7 pb-8">
        <Link to="/" className="block">
          <span className="text-primary text-lg font-bold tracking-tight">Glow</span>
          <span className="text-foreground text-lg font-bold tracking-tight">Pro</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">for salons</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                tab === item.key
                  ? "max-md:bg-amber-50 max-md:text-amber-700 max-md:shadow-none md:bg-white md:text-foreground md:shadow-sm"
                  : "text-muted-foreground hover:bg-white/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  tab === item.key && "max-md:text-amber-700 md:text-primary",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Business status + sign out */}
      <div className="px-3 pb-5 pt-4 max-md:border-t max-md:border-gray-200">
        {businessName && (
          <div className="px-4 py-3 mb-3 rounded-xl bg-white/70">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isLive ? "bg-amber-500" : "bg-yellow-400"}`} />
              <span className="text-xs font-semibold text-foreground truncate">{businessName}</span>
            </div>
            <p className="text-[11px] text-muted-foreground pl-4">{isLive ? "Live" : "Incomplete"}</p>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/60 hover:text-foreground transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
