import { useQuery } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import type { BizFormData } from "@/types/biz";
import { resolvePhotoUrl } from "@/lib/uploadPhoto";
import { getShop } from "@/graphql/queries";

const shopsByOwnerQuery = /* GraphQL */ `
  query ShopsByOwner($owner: String!) {
    listShops(filter: { owner: { eq: $owner } }) {
      items {
        id name category description neighborhood
        mapLat mapLng whatsapp phone
        coverPhotoKey galleryPhotoKeys
        instagram facebook tiktok
        ownerName listedSince replyTime verified rating owner
        hours { items { id day time } }
      }
    }
  }
`;

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

function mapShopToForm(b: any, rawHours: { id: string; day: string; time: string }[]): Omit<BizFormData, "coverPhoto" | "galleryPhotos"> & { _existingHourIds?: string[] } {
  return {
    id: b.id,
    businessName: b.name ?? "",
    category: b.category ?? "",
    description: b.description ?? "",
    neighborhood: b.neighborhood ?? "",
    mapLat: b.mapLat ?? null,
    mapLng: b.mapLng ?? null,
    whatsapp: b.whatsapp ?? "",
    phone: b.phone ?? "",
    instagram: b.instagram ?? "",
    facebook: b.facebook ?? "",
    tiktok: b.tiktok ?? "",
    ownerPhone: b.ownerName ?? "",
    hours: rawHours.map(({ day, time }) => ({ day, time })),
    verified: b.verified ?? null,
    ...(rawHours.length > 0 && { _existingHourIds: rawHours.map((h) => h.id) }),
  };
}

async function resolvePhotos(b: any) {
  const coverPhoto = await resolvePhotoUrl(b.coverPhotoKey);
  const galleryPhotos = await Promise.all(
    (b.galleryPhotoKeys ?? []).map((k: string) => resolvePhotoUrl(k))
  );
  return { coverPhoto: coverPhoto || null, galleryPhotos: galleryPhotos.filter(Boolean) };
}

async function fetchMyShop(): Promise<BizFormData | null> {
  // ── Step 1: try userPool list with all possible owner formats ──────────────
  try {
    const { userId, username } = await getCurrentUser();
    const ownerCombo  = userId && username ? `${userId}::${username}` : null;
    const ownerSub    = userId   ?? null;
    const ownerUser   = username ?? null;
    const candidates  = [...new Set([ownerCombo, ownerUser, ownerSub].filter(Boolean))] as string[];

    for (const owner of candidates) {
      const result = await getClient().graphql({
        query: shopsByOwnerQuery,
        variables: { owner },
        authMode: "userPool",
      });
      const items = (result as any).data?.listShops?.items ?? [];
      console.log(`[useMyShop] userPool list owner="${owner}" → ${items.length} shop(s)`);
      if (items.length > 0) {
        const b = items[0];
        console.log(`[useMyShop] ✅ found via owner="${owner}", stored owner="${b.owner}"`);
        const { coverPhoto, galleryPhotos } = await resolvePhotos(b);
        const rawHours = b.hours?.items ?? [];
        const formData = {
          ...mapShopToForm(b, rawHours),
          coverPhoto,
          galleryPhotos,
        } as BizFormData & { _existingHourIds?: string[] };
        localStorage.setItem("biz_id", b.id);
        localStorage.setItem("biz_owner_stored", b.owner ?? "");
        localStorage.setItem("biz_draft", JSON.stringify(formData));
        return formData;
      }
    }
    console.warn(`[useMyShop] userPool list found nothing for sub="${userId}", username="${username}"`);
  } catch (authErr) {
    console.warn("[useMyShop] not signed in or list failed:", authErr);
  }

  // ── Step 2: try getShop(biz_id) with apiKey (public read) ──────────────────
  // If the stored owner doesn't match the current JWT, the list above returns
  // nothing. But the shop IS public-readable, so we can load it to show data
  // and diagnose the mismatch.
  const storedId = localStorage.getItem("biz_id");
  if (storedId) {
    try {
      const result = await getClient().graphql({
        query: getShop,
        variables: { id: storedId },
        authMode: "apiKey",
      });
      const b = (result as any).data?.getShop;
      if (b) {
        console.warn(
          `[useMyShop] ⚠️  Shop loaded via apiKey fallback.\n` +
          `  Stored owner in DynamoDB : "${b.owner}"\n` +
          `  Fix: add yourself to the Cognito "Admins" group, sign out, sign back in, then save.\n` +
          `  AWS CLI: aws cognito-idp admin-add-user-to-group --user-pool-id us-east-1_qdM7gNVU7 --username <YOUR_EMAIL> --group-name Admins`
        );
        localStorage.setItem("biz_owner_stored", b.owner ?? "");
        const { coverPhoto, galleryPhotos } = await resolvePhotos(b);
        const rawHours = b.hours?.items ?? [];
        return {
          ...mapShopToForm(b, rawHours),
          coverPhoto,
          galleryPhotos,
        } as BizFormData & { _existingHourIds?: string[] };
      }
    } catch (e) {
      console.error("[useMyShop] apiKey getShop fallback failed:", e);
    }
  }

  // ── Step 3: localStorage draft ──────────────────────────────────────────────
  const draft = localStorage.getItem("biz_draft");
  if (draft) {
    try { return JSON.parse(draft) as BizFormData; } catch { return null; }
  }

  return null;
}

export const useMybusiness = () =>
  useQuery({
    queryKey: ["myshop"],
    queryFn: fetchMyShop,
    staleTime: 0,
  });
