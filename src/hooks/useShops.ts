import { useQuery } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { listShops } from "@/graphql/queries";
import { resolvePhotoUrl } from "@/lib/uploadPhoto";

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

export type businessSummary = {
  id: string;
  image: string;
  name: string;
  neighborhood: string;
  category: string;
  distance: string;
  rating: number;
};

async function fetchShops(): Promise<{
  popular: businessSummary[];
  trending: businessSummary[];
  newlyListed: businessSummary[];
}> {
  const empty = { popular: [], trending: [], newlyListed: [] };

  try {
    const result = await getClient().graphql({
      query: listShops,
      // Only surface shops that have been approved (verified === true).
      // New shops land with verified=null (PENDING) and appear after admin approval.
      variables: { limit: 50, filter: { verified: { eq: true } } },
      authMode: "apiKey",
    });

    const items = (result as any).data?.listShops?.items ?? [];
    if (items.length === 0) return empty;

    // Resolve S3 paths → pre-signed URLs in parallel
    const mapped: businessSummary[] = await Promise.all(
      items.map(async (b: any) => ({
        id: b.id,
        image: await resolvePhotoUrl(b.coverPhotoKey),
        name: b.name,
        neighborhood: b.neighborhood ?? "",
        category: b.category ?? "",
        distance: "",
        rating: b.rating ?? 0,
      }))
    );

    return {
      popular: mapped.slice(0, 8),
      trending: mapped.slice(0, 4),
      newlyListed: [...mapped].reverse().slice(0, 4),
    };
  } catch (err) {
    console.error("Failed to fetch shops:", err);
    return empty;
  }
}

export const usebusinesss = () =>
  useQuery({
    queryKey: ["shops"],
    queryFn: fetchShops,
    staleTime: 60 * 1000,
  });
