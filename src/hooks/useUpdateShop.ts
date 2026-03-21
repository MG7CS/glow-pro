import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import type { BizFormData } from "@/types/biz";
import { updateShop, createBusinessHour, deleteBusinessHour } from "@/graphql/mutations";
import { uploadPhoto, uploadGallery } from "@/lib/uploadPhoto";
import { formatAppSyncError } from "@/lib/graphqlErrors";
import { useToast } from "@/hooks/use-toast";

/** Lazy singleton — only call after configureAmplify() (e.g. after auth is verified). */
let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

async function updateShopFn({
  businessId,
  form,
}: {
  businessId: string;
  form: BizFormData;
}): Promise<void> {
  let cognitoUsername: string;
  let cognitoSub: string | undefined;
  try {
    const user = await getCurrentUser();
    cognitoUsername = user.username;
    cognitoSub = user.userId;
    console.log(`[updateShop] identity: sub="${cognitoSub}" username="${cognitoUsername}" businessId="${businessId}"`);
  } catch {
    throw new Error(
      "You must be signed in to save changes. Please sign in and try again."
    );
  }
  try {
    await fetchAuthSession({ forceRefresh: false });
  } catch {
    throw new Error("Your session expired. Please sign in again and retry.");
  }

  // Upload any new blob photos to S3 — existing S3 URLs pass through unchanged
  const [coverPhotoKey, galleryPhotoKeys] = await Promise.all([
    uploadPhoto(form.coverPhoto, `covers/${businessId}`),
    uploadGallery(form.galleryPhotos, businessId),
  ]);

  // Persist locally immediately so the dashboard reflects changes even before
  // the network round-trip completes
  const draftForm: BizFormData = {
    ...form,
    id: businessId,
    coverPhoto: coverPhotoKey ?? form.coverPhoto,
    galleryPhotos: galleryPhotoKeys.length ? galleryPhotoKeys : form.galleryPhotos,
  };
  localStorage.setItem("biz_draft", JSON.stringify(draftForm));
  localStorage.setItem("biz_id", businessId);
  localStorage.setItem("biz_owner", cognitoUsername);

  const client = getClient();
  const expectedOwner = cognitoSub && cognitoUsername
    ? `${cognitoSub}::${cognitoUsername}`
    : cognitoUsername;
  console.log(`[updateShop] expected owner for auth check: "${expectedOwner}"`);

  let updatedShop: any;
  try {
    const result = await client.graphql({
      query: updateShop,
      authMode: "userPool",
      variables: {
        input: {
          id: businessId,
          name: form.businessName,
          category: form.category,
          description: form.description,
          neighborhood: form.neighborhood,
          mapLat: form.mapLat,
          mapLng: form.mapLng,
          whatsapp: form.whatsapp,
          phone: form.phone,
          coverPhotoKey: coverPhotoKey ?? undefined,
          galleryPhotoKeys: galleryPhotoKeys.length ? galleryPhotoKeys : undefined,
          instagram: form.instagram,
          facebook: form.facebook,
          tiktok: form.tiktok,
        },
      },
    });
    updatedShop = (result as any).data?.updateShop;
    console.log(`[updateShop] success, stored owner="${updatedShop?.owner}"`);
  } catch (err: any) {
    // Partial success: mutation wrote to DynamoDB but relation resolvers errored
    if (err?.data?.updateShop) {
      updatedShop = err.data.updateShop;
      console.log(`[updateShop] partial success, stored owner="${updatedShop?.owner}"`);
    } else {
      console.error(`[updateShop] error for businessId="${businessId}", expected owner="${expectedOwner}"`, err);
      throw err;
    }
  }

  // AppSync returns null data when neither owner nor Admins-group auth passed.
  if (!updatedShop) {
    const storedOwner = localStorage.getItem("biz_owner_stored") ?? "unknown";
    console.error(
      `[updateShop] ❌ Unauthorized\n` +
      `  Your identity  : "${expectedOwner}"\n` +
      `  Stored owner   : "${storedOwner}"\n` +
      `  Fix: run this AWS CLI command, then sign out + sign back in:\n` +
      `  aws cognito-idp admin-add-user-to-group --user-pool-id us-east-1_qdM7gNVU7 --username <YOUR_EMAIL> --group-name Admins`
    );
    throw new Error(
      `Owner mismatch — you are not in the Admins group.\n` +
      `Your identity: "${expectedOwner}" but shop owner is "${storedOwner}".\n` +
      `See console for the fix.`
    );
  }

  // ── Sync hours: delete all existing then re-create ──────────────────────
  // Fetch existing hour records from the shop response (included in getShop)
  // We stored them in form._existingHourIds during useMyShop fetch
  const existingIds: string[] = (form as any)._existingHourIds ?? [];
  await Promise.all(
    existingIds.map((id) =>
      client.graphql({
        query: deleteBusinessHour,
        variables: { input: { id } },
        authMode: "userPool",
      }).catch(() => {/* ignore individual delete errors */})
    )
  );

  if (form.hours && form.hours.length > 0) {
    await Promise.all(
      form.hours.map((h) =>
        client.graphql({
          query: createBusinessHour,
          variables: { input: { shopID: businessId, day: h.day, time: h.time } },
          authMode: "userPool",
        }).catch(() => {/* ignore individual create errors */})
      )
    );
  }
}

export const useUpdatebusiness = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateShopFn,
    onSuccess: (_, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: ["shop", businessId] });
      queryClient.invalidateQueries({ queryKey: ["myshop"] });
    },
    onError: (err) => {
      const msg = formatAppSyncError(err);
      console.error("Failed to update shop:", err);
      toast({
        title: "Save failed",
        description: msg,
        variant: "destructive",
      });
    },
  });
};
