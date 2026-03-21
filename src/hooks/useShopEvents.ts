import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

export interface ShopEvent {
  id: string;
  eventType: string;
  createdAt: string;
}

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

const shopEventsByShopIDQuery = /* GraphQL */ `
  query ShopEventsByShopID($shopID: ID!, $limit: Int, $nextToken: String) {
    shopEventsByShopID(shopID: $shopID, limit: $limit, nextToken: $nextToken, sortDirection: DESC) {
      items { id eventType createdAt }
      nextToken
    }
  }
`;

const listShopEventsQuery = /* GraphQL */ `
  query ListShopEvents($filter: ModelShopEventFilterInput, $limit: Int, $nextToken: String) {
    listShopEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items { id eventType createdAt }
      nextToken
    }
  }
`;

async function fetchEventsForShop(shopID: string): Promise<ShopEvent[]> {
  const client = getClient();

  // Strategy 1: GSI query (fast, indexed)
  try {
    const result = await client.graphql({
      query: shopEventsByShopIDQuery,
      authMode: "apiKey",
      variables: { shopID, limit: 500 },
    });
    const data = (result as any).data?.shopEventsByShopID;
    if (data) {
      console.log(`[useShopEvents] GSI query returned ${data.items?.length ?? 0} event(s)`);
      return data.items ?? [];
    }
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message ?? String(e);
    console.warn(`[useShopEvents] GSI query failed: ${msg}`);

    if (msg.includes("Cannot query field") || msg.includes("shopEventsByShopID")) {
      console.error(
        "[useShopEvents] The ShopEvent model is NOT deployed to AppSync.\n" +
        "Run: amplify push\n" +
        "This will create the ShopEvent DynamoDB table and resolvers."
      );
      return [];
    }
  }

  // Strategy 2: listShopEvents with filter (scan fallback)
  try {
    const result = await client.graphql({
      query: listShopEventsQuery,
      authMode: "apiKey",
      variables: {
        filter: { shopID: { eq: shopID } },
        limit: 500,
      },
    });
    const data = (result as any).data?.listShopEvents;
    if (data) {
      console.log(`[useShopEvents] list+filter returned ${data.items?.length ?? 0} event(s)`);
      return data.items ?? [];
    }
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message ?? String(e);
    console.error(
      `[useShopEvents] Both queries failed for shop=${shopID}.\n` +
      `Error: ${msg}\n` +
      "The ShopEvent model likely hasn't been deployed. Run: amplify push"
    );
  }

  return [];
}

/**
 * Fetches ShopEvents for a shop (apiKey). Auto-refreshes so dashboard
 * stats update after interacting with the public profile.
 */
export const useShopEvents = (shopID?: string) => {
  return useQuery<ShopEvent[]>({
    queryKey: ["shopEvents", shopID],
    enabled: !!shopID,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    refetchInterval: 20_000,
    queryFn: () => fetchEventsForShop(shopID!),
  });
};

/** Call after logging an event to immediately refresh stats. */
export function useInvalidateShopEvents() {
  const qc = useQueryClient();
  return (shopID: string) => {
    qc.invalidateQueries({ queryKey: ["shopEvents", shopID] });
  };
}
