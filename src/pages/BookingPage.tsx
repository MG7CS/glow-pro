import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { addDays, format, isBefore, isSameDay, startOfDay } from "date-fns";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";

import { useShop } from "@/hooks/useShop";
import { createAppointment } from "@/graphql/mutations";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_SERVICES = [
  "Hair",
  "Braids",
  "Nails",
  "Makeup",
  "Skincare",
  "Lashes",
  "Massage",
  "Other",
];

const BRAND = "bg-[#D97706] hover:bg-[#D97706]/90 text-white border-transparent";

/** Match biz-portal field look (consumer route — same Tailwind tokens). */
const fieldClass =
  "h-11 rounded-xl border border-black/[0.12] bg-white px-3.5 text-sm shadow-none transition-[border-color,box-shadow] focus-visible:border-[#D97706] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D97706]/10";

const textareaClass =
  "min-h-[88px] rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm shadow-none transition-[border-color,box-shadow] focus-visible:border-[#D97706] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D97706]/10 resize-none";

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 19; h++) {
    slots.push(format(new Date(2000, 0, 1, h, 0, 0), "h:mm a"));
  }
  return slots;
}

const TIME_SLOTS = buildTimeSlots();

function formatDatePill(d: Date): string {
  return format(d, "EEE d MMM");
}

function formatDateSummary(d: Date): string {
  return format(d, "EEEE, d MMMM yyyy");
}

/** Display +250 with spaced groups; strips/prefixes for Rwanda-style entry. */
function formatPhoneRwInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let rest = digits;
  if (rest.startsWith("250")) rest = rest.slice(3);
  if (rest.startsWith("0")) rest = rest.slice(1);
  rest = rest.slice(0, 9);
  if (!rest) return "";
  const spaced =
    rest.length > 6
      ? `${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`
      : rest.length > 3
        ? `${rest.slice(0, 3)} ${rest.slice(3)}`
        : rest;
  return `+250 ${spaced}`;
}

function whatsappHref(phone: string | undefined, message: string): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const TOTAL_STEPS = 5;

const BookingPage = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { data: shop, isLoading, isError, error } = useShop(shopId);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const services = useMemo(() => {
    const raw = shop?.services?.filter((s) => s.trim().length > 0);
    if (raw && raw.length > 0) return raw;
    return DEFAULT_SERVICES;
  }, [shop?.services]);

  const datePills = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 30 }, (_, i) => addDays(today, i));
  }, []);

  const progressValue = success ? 100 : (step / TOTAL_STEPS) * 100;

  const canGoNext = useMemo(() => {
    if (step === 1) return !!service;
    if (step === 2) return !!date;
    if (step === 3) return !!time;
    if (step === 4) return fullName.trim().length > 0 && phone.trim().length > 0;
    return true;
  }, [step, service, date, time, fullName, phone]);

  const goBack = () => {
    setSubmitError(null);
    if (step > 1) setStep((s) => s - 1);
  };

  const goNext = () => {
    setSubmitError(null);
    if (step < TOTAL_STEPS && canGoNext) setStep((s) => s + 1);
  };

  const waMessage = useMemo(() => {
    if (!service || !date || !time || !fullName.trim()) return "";
    const datePart = format(date, "EEE d MMM yyyy");
    return `Hi! I'd like to book ${service} on ${datePart} at ${time}. My name is ${fullName.trim()}.`;
  }, [service, date, time, fullName]);

  const waLink = useMemo(() => {
    const num = shop?.social?.whatsapp || shop?.phone;
    return whatsappHref(num, waMessage);
  }, [shop?.social?.whatsapp, shop?.phone, waMessage]);

  const handleConfirm = useCallback(async () => {
    if (!shopId || !shop || !service || !date || !time) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const client = getClient();
      const dateStr = format(date, "yyyy-MM-dd");
      const appointmentInput = {
        shopID: shopId,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        service,
        date: dateStr,
        time,
        status: "pending",
        notes: notes.trim() || undefined,
      };
      const result = await client.graphql({
        query: createAppointment,
        variables: { input: appointmentInput },
        authMode: "apiKey",
      });
      void result;
      setSuccess(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "errors" in e && Array.isArray((e as { errors: { message?: string }[] }).errors)
          ? (e as { errors: { message?: string }[] }).errors[0]?.message
          : e instanceof Error
            ? e.message
            : "Could not send your booking. Please try again or use WhatsApp.";
      setSubmitError(msg ?? "Could not send your booking.");
    } finally {
      setSubmitting(false);
    }
  }, [shopId, shop, service, date, time, fullName, phone, notes]);

  const todayStart = startOfDay(new Date());

  if (isLoading) {
    return (
      <div className="mx-auto min-h-[60vh] max-w-lg">
        <Skeleton className="h-[200px] w-full rounded-none md:rounded-t-2xl" />
        <div className="space-y-3 px-4 pt-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mt-6 px-4">
          <Skeleton className="mb-6 h-2.5 w-full rounded-full" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert variant="destructive">
          <AlertTitle>Could not load salon</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "This profile may not exist or is unavailable."}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  if (shop.bookingEnabled === false) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Alert>
          <AlertTitle>Online booking disabled</AlertTitle>
          <AlertDescription>
            {shop.name} is not accepting online bookings right now. Please contact them directly.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-6">
          <Link to={`/business/${shop.id}`}>View profile</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 md:py-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#D97706]/15 animate-in zoom-in-95 duration-500 motion-reduce:animate-none">
            <CheckCircle2 className="h-16 w-16 text-[#D97706]" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your booking request has been sent!</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="font-bold text-foreground">{shop.name}</span> will confirm shortly.
          </p>
          <Button asChild className={cn("mt-10 w-full max-w-xs", BRAND)}>
            <Link to="/">Back to home</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-3">
            <Link to={`/business/${shop.id}`}>View salon profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const coverSrc = shop.image?.trim() ? shop.image : undefined;

  return (
    <div className="mx-auto max-w-lg pb-16">
      {/* Header: cover + name + category */}
      <div className="relative w-full overflow-hidden bg-muted">
        <div className="h-[200px] w-full">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#D97706]/20 to-muted text-4xl">
              💇
            </div>
          )}
        </div>
        <Link
          to={`/business/${shop.id}`}
          className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/55"
        >
          ← Back
        </Link>
      </div>

      <div className="px-4 pt-4 md:px-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">{shop.name}</h1>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{shop.category}</p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-[#D97706]">Book with {shop.name}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-full rounded-full bg-[#D97706] transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 md:px-6">
        {submitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border/80 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            {step === 1 && (
              <>
                <CardTitle className="text-xl">Select service</CardTitle>
                <CardDescription>What would you like to book?</CardDescription>
              </>
            )}
            {step === 2 && (
              <>
                <CardTitle className="text-xl">Select date</CardTitle>
                <CardDescription>Choose a day in the next 30 days</CardDescription>
              </>
            )}
            {step === 3 && (
              <>
                <CardTitle className="text-xl">Select time</CardTitle>
                <CardDescription>Pick an hour between 8:00 AM and 7:00 PM</CardDescription>
              </>
            )}
            {step === 4 && (
              <>
                <CardTitle className="text-xl">Your details</CardTitle>
                <CardDescription>So the salon can reach you</CardDescription>
              </>
            )}
            {step === 5 && (
              <>
                <CardTitle className="text-xl">Confirm</CardTitle>
                <CardDescription>Review and send your request</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setService(s)}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-center text-sm font-semibold transition-colors",
                      service === s
                        ? "border-[#D97706] bg-[#D97706]/12 text-foreground"
                        : "border-gray-300 bg-white text-foreground hover:border-gray-400",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="flex max-h-[min(50vh,22rem)] flex-wrap gap-2 overflow-y-auto pr-1">
                {datePills.map((d) => {
                  const isPast = isBefore(startOfDay(d), todayStart);
                  const selected = date && format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                  const isToday = isSameDay(d, new Date());
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      disabled={isPast}
                      onClick={() => setDate(d)}
                      className={cn(
                        "shrink-0 rounded-full border-2 px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                        isPast && "cursor-not-allowed opacity-40",
                        selected
                          ? "border-[#D97706] bg-[#D97706] text-white"
                          : isToday
                            ? "border-amber-300 bg-amber-50/90 text-foreground ring-1 ring-[#D97706]/25"
                            : "border-gray-300 bg-white text-foreground hover:border-gray-400",
                      )}
                    >
                      {formatDatePill(d)}
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={cn(
                      "rounded-full border-2 px-2 py-2.5 text-center text-xs font-medium transition-colors sm:text-sm",
                      time === slot
                        ? "border-[#D97706] bg-[#D97706] text-white"
                        : "border-gray-300 bg-white text-foreground hover:border-gray-400",
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book-name" className="text-sm font-medium">
                    Full name
                  </Label>
                  <Input
                    id="book-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-phone" className="text-sm font-medium">
                    Phone number
                  </Label>
                  <Input
                    id="book-phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneRwInput(e.target.value))}
                    placeholder="+250 788 000 000"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    className={fieldClass}
                  />
                  <p className="text-xs text-muted-foreground">Rwanda numbers: country code +250</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="book-notes" className="text-sm font-medium">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="book-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any preferences or questions…"
                    rows={3}
                    className={textareaClass}
                  />
                </div>
              </div>
            )}

            {step === 5 && service && date && time && (
              <div className="space-y-4 rounded-2xl border border-border/60 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <div className="flex items-center gap-3 border-b border-border/80 pb-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-[#D97706]/20">
                    {coverSrc ? (
                      <img src={coverSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">💇</div>
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate font-semibold text-foreground">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">{shop.category}</p>
                  </div>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-medium text-right text-foreground">{service}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Date</dt>
                    <dd className="font-medium text-right text-foreground">{formatDateSummary(date)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Time</dt>
                    <dd className="font-medium text-right text-foreground">{time}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Your name</dt>
                    <dd className="font-medium text-right text-foreground">{fullName.trim()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium text-right text-foreground">{phone.trim()}</dd>
                  </div>
                  {notes.trim() ? (
                    <div className="border-t border-border pt-3">
                      <dt className="text-muted-foreground">Notes</dt>
                      <dd className="mt-1 font-medium text-foreground">{notes.trim()}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            )}

            <div
              className={cn(
                "flex gap-3 pt-2",
                step === TOTAL_STEPS ? "flex-col" : "flex-col sm:flex-row sm:justify-between",
              )}
            >
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  className={cn(step === TOTAL_STEPS ? "w-full sm:w-auto sm:self-start" : "order-2 sm:order-1")}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <span className={step === TOTAL_STEPS ? "hidden" : "order-2 sm:order-1"} />
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  disabled={!canGoNext}
                  onClick={goNext}
                  className={cn("order-1 w-full sm:order-2 sm:ml-auto sm:w-auto", BRAND)}
                >
                  Continue
                </Button>
              ) : (
                <div className="flex w-full flex-col gap-3">
                  <Button
                    type="button"
                    disabled={submitting || !canGoNext}
                    onClick={() => void handleConfirm()}
                    className={cn("w-full", BRAND)}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Confirm booking"
                    )}
                  </Button>
                  {waLink ? (
                    <Button type="button" variant="outline" className="w-full border-gray-300" asChild>
                      <a href={waLink} target="_blank" rel="noopener noreferrer">
                        WhatsApp instead
                      </a>
                    </Button>
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">Add WhatsApp on the salon profile to use WhatsApp.</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
