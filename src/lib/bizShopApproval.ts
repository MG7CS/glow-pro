import { generateClient } from "aws-amplify/api";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";

/**
 * Resolves listing approval for biz portal using verified (and optional status string).
 * Mirrors Admin getStatus + RecruiterDashboard toStatus.
 */
export type BizShopGateOutcome = "approved" | "pending" | "rejected";

type ShopRow = {
  id: string;
  verified?: boolean | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  recruitedBy?: string | null;
  owner?: string | null;
  status?: string | null;
};

const listShopsForGate = /* GraphQL */ `
  query ListShopsForBizGate($filter: ModelShopFilterInput, $limit: Int) {
    listShops(filter: $filter, limit: $limit) {
      items {
        id
        verified
        ownerName
        ownerEmail
        recruitedBy
        owner
      }
    }
  }
`;

let _client: ReturnType<typeof generateClient> | null = null;
const getClient = () => (_client ??= generateClient());

const resolveStatus = (shop: ShopRow): BizShopGateOutcome => {
  const s = shop.status?.toLowerCase();
  if (s === "approved" || s === "pending" || s === "rejected") {
    return s;
  }
  if (shop.verified === true) return "approved";
  if (shop.verified === false) return "rejected";
  return "pending";
};

function dedupeById(items: ShopRow[]): ShopRow[] {
  const map = new Map<string, ShopRow>();
  for (const s of items) {
    if (s?.id && !map.has(s.id)) map.set(s.id, s);
  }
  return [...map.values()];
}

/** Prefer a row whose `owner` matches Cognito owner candidates. */
function pickShop(shops: ShopRow[], ownerCandidates: string[]): ShopRow | null {
  if (shops.length === 0) return null;
  const linked = shops.find((s) => ownerCandidates.some((c) => s.owner === c));
  return linked ?? shops[0];
}

/**
 * After Cognito sign-in on biz.* — find the owner's shop and return approval outcome.
 * Not found → pending (same gate as not approved yet).
 */
export async function checkBizOwnerShopAccess(): Promise<BizShopGateOutcome> {
  const { userId, username } = await getCurrentUser();
  const attrs = await fetchUserAttributes();
  const emailRaw = (attrs.email ?? "").trim();
  const email = emailRaw.toLowerCase();

  const ownerCombo = userId && username ? `${userId}::${username}` : null;
  const ownerCandidates = [...new Set([ownerCombo, userId, username].filter(Boolean))] as string[];

  const collected: ShopRow[] = [];

  // Primary: listing saved with ownerEmail = Cognito sign-in (phone or email)
  const ownerEmailKeys = [username?.trim(), emailRaw && emailRaw !== username?.trim() ? emailRaw : null].filter(
    Boolean,
  ) as string[];
  for (const key of ownerEmailKeys) {
    const result = await getClient().graphql({
      query: listShopsForGate,
      variables: { filter: { ownerEmail: { eq: key } }, limit: 25 },
      authMode: "userPool",
    });
    const items = ((result as { data?: { listShops?: { items?: ShopRow[] } } }).data?.listShops?.items ??
      []) as ShopRow[];
    collected.push(...items.filter(Boolean));
  }

  let shops = dedupeById(collected);

  for (const owner of ownerCandidates) {
    const result = await getClient().graphql({
      query: listShopsForGate,
      variables: { filter: { owner: { eq: owner } }, limit: 25 },
      authMode: "userPool",
    });
    const items = ((result as { data?: { listShops?: { items?: ShopRow[] } } }).data?.listShops?.items ??
      []) as ShopRow[];
    collected.push(...items.filter(Boolean));
  }

  shops = dedupeById(collected);

  if (shops.length === 0) {
    const orClauses: { ownerName?: { eq: string }; recruitedBy?: { eq: string } }[] = [];
    if (email) {
      orClauses.push({ ownerName: { eq: email } }, { recruitedBy: { eq: email } });
    }
    if (username) {
      orClauses.push({ ownerName: { eq: username } }, { recruitedBy: { eq: username } });
    }
    if (orClauses.length > 0) {
      const result = await getClient().graphql({
        query: listShopsForGate,
        variables: { filter: { or: orClauses }, limit: 25 },
        authMode: "userPool",
      });
      const items = ((result as { data?: { listShops?: { items?: ShopRow[] } } }).data?.listShops?.items ??
        []) as ShopRow[];
      shops = dedupeById(items.filter(Boolean));
    }
  }

  const shop = pickShop(shops, ownerCandidates);
  if (!shop) return "pending";

  return resolveStatus(shop);
}
