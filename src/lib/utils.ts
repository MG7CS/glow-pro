import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWhatsAppUrl(phone: string): string {
  // WhatsApp "deep link" format; strip anything that's not a digit.
  // Example: "+250 788 123 456" -> "250788123456"
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
