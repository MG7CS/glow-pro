import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { signIn, signOut } from "aws-amplify/auth";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
import { checkBizOwnerShopAccess } from "@/lib/bizShopApproval";

/** Phone → E.164 (+250…); email unchanged (trimmed). */
const normalizePhone = (input: string) => {
  const t = input.trim();
  if (t.includes("@")) return t;
  const digits = t.replace(/\D/g, "");
  if (digits.startsWith("250")) return "+" + digits;
  if (digits.startsWith("0")) return "+250" + digits.slice(1);
  return "+" + digits;
};

const WHATSAPP_HREF = "https://wa.me/250788000000";

const BizLogin = () => {
  const isBizSubdomain = window.location.hostname.startsWith("biz.");
  const bizBase = isBizSubdomain ? "" : "/biz";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [gate, setGate] = useState<"form" | "checking" | "pending" | "rejected">("form");

  const handleSignOutFromGate = async () => {
    try {
      await signOut({ global: false });
    } catch {
      // ignore
    }
    localStorage.removeItem("biz_session");
    window.dispatchEvent(new Event("biz_auth_change"));
    setGate("form");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const username = normalizePhone(identifier);
      await signIn({ username, password });

      if (!isBizSubdomain) {
        localStorage.setItem("biz_session", identifier);
        window.dispatchEvent(new Event("biz_auth_change"));
        window.location.href = "https://biz.glowpro.rw/dashboard";
        return;
      }

      setGate("checking");
      let outcome: Awaited<ReturnType<typeof checkBizOwnerShopAccess>>;
      try {
        outcome = await checkBizOwnerShopAccess();
      } catch {
        setGate("form");
        setError("Couldn't verify your listing. Please try again.");
        return;
      }

      if (outcome === "approved") {
        localStorage.setItem("biz_session", identifier);
        window.dispatchEvent(new Event("biz_auth_change"));
        window.location.href = "https://biz.glowpro.rw/dashboard";
        return;
      }

      if (outcome === "rejected") {
        setGate("rejected");
        return;
      }

      setGate("pending");
    } catch (err: any) {
      if (err?.name === "NotAuthorizedException") {
        setError("Incorrect details. Check your phone/email and password and try again.");
      } else if (err?.name === "UserNotFoundException") {
        setError("No account found. Have you listed your salon yet?");
      } else if (err?.name === "UserNotConfirmedException") {
        setError("Your account isn't verified yet. Please complete onboarding first.");
      } else {
        setError(err?.message ?? "Sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (gate === "checking") {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-56px)]">
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Checking your listing…</p>
        </div>
      </div>
    );
  }

  if (gate === "pending") {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-56px)]">
        <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card/95 backdrop-blur-sm shadow-lg px-6 py-10 text-center">
          <div className="text-4xl mb-4" aria-hidden>
            🕐
          </div>
          <h1 className="text-xl font-bold text-foreground">Your listing is pending approval</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Our team is reviewing your salon. You&apos;ll be notified once it&apos;s approved and live on
            GlowPro.
          </p>
          <p className="text-xs text-muted-foreground mt-6">
            Questions?{" "}
            <a href={WHATSAPP_HREF} className="text-primary font-medium hover:underline" target="_blank" rel="noreferrer">
              Contact us on WhatsApp
            </a>
          </p>
          <button
            type="button"
            onClick={handleSignOutFromGate}
            className={cn(bizContinueBtn, "mt-8 flex h-12 w-full items-center justify-center gap-2")}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (gate === "rejected") {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-56px)]">
        <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card/95 backdrop-blur-sm shadow-lg px-6 py-10 text-center">
          <div className="text-4xl mb-4" aria-hidden>
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-foreground">Your listing was not approved</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Unfortunately your salon listing didn&apos;t meet our requirements. Please contact us for more
            information.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <a
              href={WHATSAPP_HREF}
              className={cn(bizContinueBtn, "flex h-12 w-full items-center justify-center gap-2 no-underline")}
              target="_blank"
              rel="noreferrer"
            >
              Contact support
            </a>
            <button
              type="button"
              onClick={handleSignOutFromGate}
              className="flex h-12 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-56px)]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-1 mb-6">
            <span className="text-primary text-2xl font-bold tracking-tight">Glow</span>
            <span className="text-foreground text-2xl font-bold tracking-tight">Pro</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage your salon listing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone number or email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="+250 7XX XXX XXX or email@example.com"
              required
              className={cn(bizField, "h-12 px-4 text-foreground placeholder:text-muted-foreground/50")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <Link to={`${bizBase}/forgot-password`} className="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 px-4 pr-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/15 bg-destructive/10 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(bizContinueBtn, "flex h-12 w-full items-center justify-center gap-2")}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link to={bizBase || "/"} className="text-primary font-medium hover:underline">
            List your salon
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BizLogin;
