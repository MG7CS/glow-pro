/** Synthetic email for Cognito + Shop.ownerEmail (must match signUp email attribute). */
export function generateOwnerEmail(shopName: string, shopId: string): string {
  const slugRaw = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
  const slug = slugRaw || "shop";
  const suffix = shopId.slice(0, 4);
  return `${slug}_${suffix}@connectkigali.rw`;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("250")) return "+" + digits;
  if (digits.startsWith("0")) return "+250" + digits.slice(1);
  if (!phone.startsWith("+")) return "+250" + digits;
  return phone.trim();
}

/** Rwanda mobile: +2507XXXXXXXX (9 digits after country code 250). */
export function isValidRwandanMobile(phone: string): boolean {
  const n = normalizePhone(phone);
  return /^\+2507[0-9]{8}$/.test(n);
}
