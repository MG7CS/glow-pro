import { useQuery } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { getShop, reviewsByShopIDAndId } from "@/graphql/queries";

const listReviewsByShopFilter = /* GraphQL */ `
  query ListReviewsByShop($filter: ModelReviewFilterInput!, $limit: Int) {
    listReviews(filter: $filter, limit: $limit) {
      items {
        id
        shopID
        reviewerName
        rating
        comment
        date
      }
    }
  }
`;
import type { Business } from "@/types/business";
import { resolvePhotoUrl } from "@/lib/uploadPhoto";

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

function mapReviewItems(items: any[]): NonNullable<Business["reviews"]> {
  return (items ?? []).map((r: any) => ({
    name: r.reviewerName,
    rating: r.rating,
    comment: r.comment,
    date: r.date,
  }));
}

function mapShopToBusiness(
  b: any,
  coverImage: string,
  galleryImages: string[],
  reviewsOverride?: NonNullable<Business["reviews"]>
): Business {
  const nestedReviews = mapReviewItems(b.reviews?.items ?? []);
  const reviews =
    reviewsOverride && reviewsOverride.length > 0 ? reviewsOverride : nestedReviews;

  const ratingFromReviews =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    id: b.id,
    image: coverImage,
    coverPhotoKey: b.coverPhotoKey ?? null,
    galleryPhotoKeys: Array.isArray(b.galleryPhotoKeys) ? b.galleryPhotoKeys : null,
    name: b.name,
    neighborhood: b.neighborhood ?? "",
    category: b.category ?? "",
    distance: "",
    rating: ratingFromReviews ?? b.rating ?? 0,
    verified: b.verified ?? false,
    description: b.description ?? "",
    mapLat: b.mapLat ?? null,
    mapLng: b.mapLng ?? null,
    phone: b.phone ?? "",
    social: {
      instagram: b.instagram ?? "",
      facebook: b.facebook ?? "",
      tiktok: b.tiktok ?? "",
      whatsapp: b.whatsapp ?? "",
    },
    owner: {
      name: b.ownerName ?? "Owner",
      listedSince: b.listedSince ?? b.createdAt?.split("T")[0] ?? "",
      replyTime: b.replyTime ?? "Usually within a day",
    },
    hours: (b.hours?.items ?? []).map((h: any) => ({ day: h.day, time: h.time })),
    reviews,
    images: galleryImages.filter(Boolean),
    services: Array.isArray(b.services) ? b.services : undefined,
    bookingEnabled: b.bookingEnabled ?? null,
  };
}

async function fetchReviewsForShop(shopId: string): Promise<NonNullable<Business["reviews"]>> {
  const client = getClient();
  let items: any[] = [];
  try {
    const result = await client.graphql({
      query: reviewsByShopIDAndId,
      variables: { shopID: shopId, limit: 50 },
      authMode: "apiKey",
    });
    items = (result as any).data?.reviewsByShopIDAndId?.items ?? [];
  } catch (err: any) {
    items = err?.data?.reviewsByShopIDAndId?.items ?? [];
  }

  // Fallback: filter scan (catches reviews if GSI partition key ever mismatched)
  if (items.length === 0) {
    try {
      const result = await client.graphql({
        query: listReviewsByShopFilter,
        variables: {
          filter: { shopID: { eq: shopId } },
          limit: 50,
        },
        authMode: "apiKey",
      });
      items = (result as any).data?.listReviews?.items ?? [];
    } catch (err: any) {
      items = err?.data?.listReviews?.items ?? [];
    }
  }

  return mapReviewItems(items);
}

async function fetchShop(id: string): Promise<Business | null> {
  let b: any;
  try {
    const result = await getClient().graphql({
      query: getShop,
      variables: { id },
      authMode: "apiKey",
    });
    b = (result as any).data?.getShop;
  } catch (err: any) {
    // Amplify v6 throws when response has any errors[] (e.g. nested reviews/hours resolver).
    // Use partial data so the profile still renders and reviews show if present.
    b = err?.data?.getShop;
    if (!b) {
      console.error("Failed to fetch shop:", err);
      return null;
    }
  }

  if (!b) return null;

  // Resolve S3 paths → pre-signed URLs so img tags display correctly
  const [coverImage, galleryImages, reviewsFromIndex] = await Promise.all([
    resolvePhotoUrl(b.coverPhotoKey),
    Promise.all((b.galleryPhotoKeys ?? []).map((k: string) => resolvePhotoUrl(k))),
    fetchReviewsForShop(b.id),
  ]);

  return mapShopToBusiness(b, coverImage, galleryImages, reviewsFromIndex);
}

export const useBusiness = (id: string | undefined) =>
  useQuery({
    queryKey: ["shop", id],
    queryFn: () => fetchShop(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

/** Alias — same as `useBusiness` (shop details for booking, profile, etc.). */
export const useShop = useBusiness;
