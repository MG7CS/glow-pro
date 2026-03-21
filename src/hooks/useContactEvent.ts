import { generateClient } from "aws-amplify/api";

export type ContactEventType = "whatsapp" | "call" | "email" | "view";

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

const createShopEventMutation = /* GraphQL */ `
  mutation CreateShopEvent($input: CreateShopEventInput!) {
    createShopEvent(input: $input) {
      id
      shopID
      eventType
      createdAt
    }
  }
`;

/**
 * Log a shop event to AppSync. Await before navigating away so the
 * browser doesn't cancel the request.
 */
export async function logShopEvent(
  businessId: string,
  eventType: ContactEventType
): Promise<void> {
  try {
    const result = await getClient().graphql({
      query: createShopEventMutation,
      authMode: "apiKey",
      variables: { input: { shopID: businessId, eventType } },
    });
    console.log(`[ShopEvent] ✅ ${eventType} logged for shop=${businessId}`, (result as any).data);
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message ?? String(e);
    console.error(
      `[ShopEvent] ❌ Failed to log "${eventType}" for shop=${businessId}.\n` +
      `Error: ${msg}\n` +
      (msg.includes("Cannot") || msg.includes("createShopEvent")
        ? "→ ShopEvent model is NOT deployed. Run: amplify push"
        : "→ Check your API key and network connection.")
    );
  }
}

export const useContactEvent = () => {
  const logEvent = (businessId: string, eventType: ContactEventType) => {
    logShopEvent(businessId, eventType);
  };

  return { logEvent, logEventAsync: logShopEvent };
};
