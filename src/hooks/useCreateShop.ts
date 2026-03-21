import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import type { BizFormData } from "@/types/biz";
import { generateOwnerEmail, normalizePhone } from "@/lib/bizOwnerAuth";
import { createShop, createBusinessHour } from "@/graphql/mutations";
import { uploadPhoto, uploadGallery } from "@/lib/uploadPhoto";
import { formatAppSyncError } from "@/lib/graphqlErrors";
import { useToast } from "@/hooks/use-toast";
import { RECRUITER_REF_STORAGE_KEY } from "@/lib/recruiterRef";

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

/** Prefer S3 object key (e.g. public/covers/…) for DynamoDB; strip bucket URL prefix if present. */
function toStorageKeyForDb(value: string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  if (trimmed.includes(".amazonaws.com/")) {
    const m = trimmed.match(/\.amazonaws\.com\/([^?#]+)/);
    if (m?.[1]) return m[1];
  }
  return trimmed;
}

async function createShopFn(form: BizFormData): Promise<string> {
  const { username: cognitoUsername } = await getCurrentUser().catch(() => {
    throw new Error("You must be signed in to create a listing.");
  });
  const isRecruiter = window.location.hostname.startsWith("recruiter.");
  try {
    await fetchAuthSession({ forceRefresh: false });
  } catch {
    throw new Error("Your session expired. Please sign in again.");
  }

  const shopId = form.id ?? crypto.randomUUID();

  console.log("[createShop] form photo fields (incoming)", {
    coverPhoto: form.coverPhoto,
    galleryPhotosLength: form.galleryPhotos?.length ?? 0,
    galleryPhotos: form.galleryPhotos,
  });

  // Upload photos to S3 before saving to DynamoDB
  const [uploadedCover, uploadedGallery] = await Promise.all([
    uploadPhoto(form.coverPhoto, `covers/${shopId}`),
    uploadGallery(form.galleryPhotos ?? [], shopId),
  ]);

  const coverKeyRaw = uploadedCover ?? form.coverPhoto;
  const coverPhotoKeyForDb = toStorageKeyForDb(coverKeyRaw);
  const galleryPhotoKeysForDb = (uploadedGallery ?? [])
    .map((k) => toStorageKeyForDb(k))
    .filter((k): k is string => Boolean(k));

  console.log("[createShop] after upload", {
    uploadedCover,
    uploadedGallery,
    coverPhotoKeyForDb,
    galleryPhotoKeysForDb,
  });

  const normalizedOwnerPhone =
    !isRecruiter && form.ownerPhone?.trim() ? normalizePhone(form.ownerPhone) : "";

  const mutationInput: Record<string, unknown> = {
    id: shopId,
    name: form.businessName,
    category: form.category || "Other",
    description: form.description,
    neighborhood: form.neighborhood || "Kigali",
    mapLat: form.mapLat,
    mapLng: form.mapLng,
    whatsapp: form.whatsapp?.trim() || form.phone?.trim() || "",
    phone: form.phone,
    instagram: form.instagram,
    facebook: form.facebook,
    tiktok: form.tiktok,
    ownerName: isRecruiter
      ? form.ownerPhone || form.whatsapp || ""
      : normalizedOwnerPhone || form.whatsapp || "",
    listedSince: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    replyTime: "Usually replies within 1 hour",
  };

  if (!isRecruiter) {
    mutationInput.ownerEmail = generateOwnerEmail(form.businessName, shopId);
  }

  if (isRecruiter) {
    mutationInput.recruitedBy = cognitoUsername;
  } else {
    if (form.referralSource?.trim()) {
      mutationInput.referralSource = form.referralSource.trim();
    }
    // Join link / ?ref= value: keep localStorage string as-is (no trim)
    const storedRaw =
      typeof window !== "undefined" ? localStorage.getItem(RECRUITER_REF_STORAGE_KEY) : null;
    const storedRecruiterRef = storedRaw != null ? storedRaw : "";
    const fromForm =
      form.referralSource === "recruiter" && form.recruiterId != null && String(form.recruiterId).length > 0
        ? String(form.recruiterId)
        : "";
    const recruitedByBiz = fromForm || storedRecruiterRef;
    if (recruitedByBiz) {
      mutationInput.recruitedBy = recruitedByBiz;
    }
  }

  if (coverPhotoKeyForDb) {
    mutationInput.coverPhotoKey = coverPhotoKeyForDb;
  }
  if (galleryPhotoKeysForDb.length > 0) {
    mutationInput.galleryPhotoKeys = galleryPhotoKeysForDb;
  }

  console.log("[createShop] createShop mutation input", mutationInput);

  const client = getClient();

  let responseData: any;
  try {
    const result = await client.graphql({
      query: createShop,
      authMode: "userPool",
      variables: {
        input: mutationInput,
      },
    });
    responseData = (result as any).data;
  } catch (err: any) {
    // Amplify throws when the response contains *any* errors array entry, even if
    // the mutation itself succeeded (e.g. non-fatal relation-resolver errors on
    // the freshly-created record's `reviews` / `hours` fields).
    // If the shop record was written we treat it as success.
    if (err?.data?.createShop) {
      responseData = err.data;
    } else {
      throw err; // genuine failure — re-throw so onError fires
    }
  }

  const id = responseData?.createShop?.id ?? shopId;

  const coverPhotoKey = coverPhotoKeyForDb ?? null;
  const galleryPhotoKeys = galleryPhotoKeysForDb;

  // Save business hours to their own table
  if (form.hours && form.hours.length > 0) {
    await Promise.all(
      form.hours.map(async (h) => {
        try {
          await getClient().graphql({
            query: createBusinessHour,
            variables: { input: { shopID: id, day: h.day, time: h.time } },
            authMode: "userPool",
          });
        } catch {
          /* non-fatal — hours can be added later */
        }
      })
    );
  }

  // Persist so the dashboard can load immediately
  const draftForm: BizFormData = {
    ...form,
    id,
    coverPhoto: coverPhotoKey ?? form.coverPhoto,
    galleryPhotos: galleryPhotoKeys.length ? galleryPhotoKeys : form.galleryPhotos,
  };
  if (!isRecruiter) {
    localStorage.setItem("biz_id", id);
    localStorage.setItem("biz_owner", cognitoUsername);
    localStorage.setItem("biz_draft", JSON.stringify(draftForm));
    localStorage.removeItem(RECRUITER_REF_STORAGE_KEY);
  }

  return id;
}

export const useCreatebusiness = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (form: BizFormData) => createShopFn(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      queryClient.invalidateQueries({ queryKey: ["myshop"] });
      const recruiterHost = window.location.hostname.startsWith("recruiter.");
      window.location.href = recruiterHost
        ? `${window.location.origin}/dashboard`
        : "https://biz.connectkigali.com/dashboard";
    },
    onError: (err) => {
      console.error("Failed to create shop:", err);
      toast({
        title: "Could not create listing",
        description: formatAppSyncError(err),
        variant: "destructive",
      });
    },
  });
};
