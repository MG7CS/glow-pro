import { Link, useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { LayoutDashboard, LogOut } from "lucide-react";
import type { CSSProperties } from "react";

const headerGlassStyle: CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
};

const BizNavbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, signOut } = useAuthState();
  const bizBase = window.location.hostname.startsWith("biz.") ? "" : "/biz";

  const handleSignOut = () => {
    signOut();
    navigate(`${bizBase}/login`);
  };

  return (
    <header className="border-b-0" style={headerGlassStyle}>
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-10">
        {/* Logo + badge */}
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/" className="flex items-center gap-0.5">
            <span className="text-lg font-bold tracking-tight text-primary">Glow</span>
            <span className="text-lg font-bold tracking-tight text-foreground">Pro</span>
          </Link>
          <span className="hidden items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 sm:inline-flex">
            for professionals
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                to={`${bizBase}/dashboard`}
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.04] sm:flex"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to={`${bizBase}/login`}
              className="whitespace-nowrap rounded-full border border-[rgba(0,0,0,0.12)] bg-white/80 px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-white hover:border-[rgba(0,0,0,0.18)]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default BizNavbar;
