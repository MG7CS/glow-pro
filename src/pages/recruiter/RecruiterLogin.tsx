import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pendingReview, setPendingReview] = useState(false);

  const handleGroups = async (forceRefresh = false): Promise<"recruiter" | "pending" | "unauthorized"> => {
    const session = await fetchAuthSession({ forceRefresh });
    const groups: string[] = (session.tokens?.idToken?.payload["cognito:groups"] as string[]) ?? [];

    if (groups.includes("Recruiters")) return "recruiter";
    if (groups.includes("RecruitersPending")) return "pending";
    return "unauthorized";
  };

  useEffect(() => {
    const check = async () => {
      try {
        await getCurrentUser();
        const status = await handleGroups(false);
        if (status === "recruiter") {
          navigate("/dashboard", { replace: true });
          return;
        }
        if (status === "pending") {
          setPendingReview(true);
        } else {
          await amplifySignOut({ global: false }).catch(() => {});
        }
      } catch {
        // Not signed in, show login form
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await amplifySignIn({ username: identifier.trim(), password });
      const status = await handleGroups(true);

      if (status === "recruiter") {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (status === "pending") {
        setPendingReview(true);
        return;
      }

      await amplifySignOut({ global: false });
      setError("Your account is not authorized as a recruiter. Contact admin@glowpro.rw");
    } catch (err: any) {
      const code = err?.name ?? "";
      if (code === "NotAuthorizedException" || code === "UserNotFoundException") {
        setError("Incorrect email or password.");
      } else {
        setError(err?.message ?? "Sign in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-border p-8">
        <div className="mb-8">
          <span className="text-primary text-xl font-bold tracking-tight">Glow</span>
          <span className="text-foreground text-xl font-bold tracking-tight">Pro</span>
          <h1 className="text-xl font-semibold text-foreground mt-4">Hey there, superstar 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rwanda&apos;s best recruiters start here. Sign in to your portal.
          </p>
        </div>

        {pendingReview ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You&apos;re on the list! ⏳ We&apos;re reviewing your account - you&apos;ll get access very soon. Good
            things take a little time.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="recruiter@example.com"
                autoFocus
                required
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <Link to="/signup" className="block text-sm text-primary font-medium hover:underline">
              New recruiter? Request access →
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecruiterLogin;
