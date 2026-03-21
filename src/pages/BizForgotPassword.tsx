import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { bizContinueBtn, bizField } from "@/lib/bizUi";
type Step = "request" | "sent";

const BizForgotPassword = () => {
  const bizBase = window.location.hostname.startsWith("biz.") ? "" : "/biz";
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("request");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Phase 4: replace with Amplify resetPassword
      // const { resetPassword } = await import("aws-amplify/auth");
      // await resetPassword({ username: phone });

      await new Promise((r) => setTimeout(r, 800));
      setStep("sent");
    } catch {
      setError("Could not send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-56px)]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-1 mb-6">
            <span className="text-primary text-2xl font-bold tracking-tight">Glow</span>
            <span className="text-foreground text-2xl font-bold tracking-tight">Pro</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your phone number and we&apos;ll send a reset code.
          </p>
        </div>

        {step === "sent" ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-foreground mb-2">Reset code sent</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We sent a code to <span className="font-medium text-foreground">{phone}</span>
            </p>
            <Link
              to={`${bizBase}/login`}
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 788 000 000"
                required
                className={cn(bizField, "h-12 px-4 text-foreground placeholder:text-muted-foreground/60")}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={cn(bizContinueBtn, "flex h-12 w-full items-center justify-center")}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Loading...
                </span>
              ) : (
                "Send reset code"
              )}
            </button>

            <Link
              to={`${bizBase}/login`}
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default BizForgotPassword;
