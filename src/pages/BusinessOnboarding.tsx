import { useState, useCallback, useLayoutEffect, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { BIZ_PAGE_GRADIENT } from "@/lib/bizUi";
import ProgressBar from "@/components/biz/ProgressBar";
import StepWelcome from "@/components/biz/StepWelcome";
import StepBasics from "@/components/biz/StepBasics";
import StepLocation from "@/components/biz/StepLocation";
import StepContact from "@/components/biz/StepContact";
import StepPhotos from "@/components/biz/StepPhotos";
import StepSocial from "@/components/biz/StepSocial";
import StepHours from "@/components/biz/StepHours";
import StepAuth from "@/components/biz/StepAuth";
import StepReferral from "@/components/biz/StepReferral";
import StepReview from "@/components/biz/StepReview";
import LivePreview from "@/components/biz/LivePreview";
import { useCreatebusiness } from "@/hooks/useCreateShop";
import { normalizePhone } from "@/lib/bizOwnerAuth";
import { RECRUITER_REF_STORAGE_KEY } from "@/lib/recruiterRef";
import type { BizFormData } from "@/types/biz";
import { BIZ_FORM_INITIAL } from "@/types/biz";
// Step 0: business name only (no progress bar shown)
// Biz: 1–6 form, 7 auth, 8 referral, 9 review — max step 9
// Recruiter: 1–6 form, 7 review — max step 7

const BusinessOnboarding = () => {
  const isRecruiter =
    typeof window !== "undefined" && window.location.hostname.startsWith("recruiter.");
  const maxStep = isRecruiter ? 7 : 9;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BizFormData>(BIZ_FORM_INITIAL);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const { mutate: createBusiness, isPending } = useCreatebusiness();

  const update = useCallback(
    (patch: Partial<BizFormData>) => setForm((prev) => ({ ...prev, ...patch })),
    []
  );

  const recruiterPrefillApplied = useRef(false);
  useEffect(() => {
    if (isRecruiter || recruiterPrefillApplied.current) return;
    const recruiterRef = localStorage.getItem(RECRUITER_REF_STORAGE_KEY);
    if (recruiterRef != null && recruiterRef !== "") {
      recruiterPrefillApplied.current = true;
      update({ referralSource: "recruiter", recruiterId: recruiterRef });
    }
  }, [isRecruiter, update]);

  // Stable listing id before account creation — must match Shop id + synthetic owner email at publish
  useLayoutEffect(() => {
    if (!isRecruiter && step === 7 && !form.id) {
      update({ id: crypto.randomUUID() });
    }
  }, [isRecruiter, step, form.id, update]);

  const next = () => setStep((s) => Math.min(s + 1, maxStep));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handlePublish = () => {
    // Business owners: StepAuth created / signed in — mirror session for biz UX
    if (!isRecruiter && form.ownerPhone) {
      localStorage.setItem("biz_session", normalizePhone(form.ownerPhone));
      window.dispatchEvent(new Event("biz_auth_change"));
    }
    // Snapshot so publish always sends the latest cover + gallery (avoids stale closures)
    const payload: BizFormData = {
      ...form,
      galleryPhotos: [...(form.galleryPhotos ?? [])],
    };
    if (isRecruiter) {
      console.log("[BusinessOnboarding] publish payload (recruiter)", {
        coverPhoto: payload.coverPhoto,
        galleryPhotos: payload.galleryPhotos,
      });
    }
    createBusiness(payload);
  };

  const stepComponent = () => {
    switch (step) {
      case 0:
        return <StepWelcome form={form} update={update} onNext={next} />;
      case 1:
        return <StepBasics form={form} update={update} onNext={next} onBack={back} />;
      case 2:
        return <StepLocation form={form} update={update} onNext={next} onBack={back} />;
      case 3:
        return <StepContact form={form} update={update} onNext={next} onBack={back} />;
      case 4:
        return <StepPhotos form={form} update={update} onNext={next} onBack={back} />;
      case 5:
        return <StepSocial form={form} update={update} onNext={next} onBack={back} />;
      case 6:
        return <StepHours form={form} onChange={update} onNext={next} onBack={back} />;
      case 7:
        if (isRecruiter) {
          return (
            <StepReview
              form={form}
              onBack={back}
              onPublish={handlePublish}
              isPublishing={isPending}
            />
          );
        }
        return <StepAuth form={form} update={update} onNext={next} onBack={back} />;
      case 8:
        return <StepReferral form={form} update={update} onNext={next} onBack={back} />;
      case 9:
        return (
          <StepReview
            form={form}
            onBack={back}
            onPublish={handlePublish}
            isPublishing={isPending}
          />
        );
      default:
        return null;
    }
  };

  // Show the live preview panel from step 1 onwards
  const showPreview = step > 0;

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", isRecruiter && "biz-portal min-h-screen")}
      style={isRecruiter ? { background: BIZ_PAGE_GRADIENT } : undefined}
    >
      {step > 0 && <ProgressBar current={step} total={isRecruiter ? 7 : 9} />}

      {showPreview && (
        <div className="flex md:hidden border-b-0">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              mobileTab === "edit"
                ? "border-[#D97706] text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              mobileTab === "preview"
                ? "border-[#D97706] text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Live preview
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden md:gap-8 lg:gap-10">
        {/* Step 0 renders its own full-bleed two-column layout */}
        {step === 0 ? (
          <div className="w-full overflow-y-auto">
            {stepComponent()}
          </div>
        ) : (
        <div
          className={`overflow-y-auto ${
            showPreview
              ? `md:w-[45%] w-full ${mobileTab === "preview" ? "hidden md:block" : ""}`
              : "w-full"
          }`}
        >
          <div className={`mx-auto px-6 py-8 md:py-12 ${showPreview ? "max-w-lg" : ""}`}>
            {stepComponent()}
          </div>
        </div>
        )}

        {showPreview && (
          <div
            className={`w-full overflow-y-auto md:w-[55%] md:pl-2 ${
              mobileTab === "edit" ? "hidden md:block" : ""
            }`}
          >
            <div className="biz-preview-panel m-4 p-6 md:m-6 md:p-10">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Live preview
              </p>
              <LivePreview form={form} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOnboarding;
