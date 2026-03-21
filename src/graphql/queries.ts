// Reflects the deployed AppSync schema (type Shop @model)
// Queries: getShop, listShops

export const getShop = /* GraphQL */ `
  query GetShop($id: ID!) {
    getShop(id: $id) {
      id
      name
      category
      description
      neighborhood
      mapLat
      mapLng
      whatsapp
      phone
      coverPhotoKey
      galleryPhotoKeys
      instagram
      facebook
      tiktok
      verified
      rating
      ownerName
      listedSince
      replyTime
      reviews(limit: 50) {
        items {
          id
          reviewerName
          rating
          comment
          date
        }
      }
      hours {
        items {
          id
          day
          time
        }
      }
      recruitedBy
      owner
      createdAt
      updatedAt
    }
  }
`;

/** Load reviews for a shop — use this instead of nested getShop.reviews (more reliable). */
export const reviewsByShopIDAndId = /* GraphQL */ `
  query ReviewsByShopIDAndId($shopID: ID!, $limit: Int) {
    reviewsByShopIDAndId(shopID: $shopID, limit: $limit, sortDirection: DESC) {
      items {
        id
        shopID
        reviewerName
        rating
        comment
        date
      }
      nextToken
    }
  }
`;

export const listShops = /* GraphQL */ `
  query ListShops(
    $filter: ModelShopFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShops(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        neighborhood
        whatsapp
        coverPhotoKey
        rating
        verified
        recruitedBy
        owner
        createdAt
      }
      nextToken
    }
  }
`;

export const shopsByOwner = /* GraphQL */ `
  query ShopsByOwner($owner: String!) {
    listShops(filter: { owner: { eq: $owner } }) {
      items {
        id
        name
        category
        description
        neighborhood
        mapLat
        mapLng
        whatsapp
        phone
        coverPhotoKey
        galleryPhotoKeys
        instagram
        facebook
        tiktok
        ownerName
        listedSince
        replyTime
        verified
        rating
        hours {
          items {
            id
            day
            time
          }
        }
      }
    }
  }
`;

/** Admin: fetches ALL shops regardless of verified status */
export const adminListShops = /* GraphQL */ `
  query AdminListShops($limit: Int, $nextToken: String) {
    listShops(limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        neighborhood
        coverPhotoKey
        verified
        owner
        createdAt
      }
      nextToken
    }
  }
`;

export const shopEventsByShopID = /* GraphQL */ `
  query ShopEventsByShopID($shopID: ID!, $limit: Int, $nextToken: String) {
    shopEventsByShopID(shopID: $shopID, limit: $limit, nextToken: $nextToken, sortDirection: DESC) {
      items {
        id
        eventType
        createdAt
      }
      nextToken
    }
  }
`;

/** Fallback if GSI query name differs on older stacks */
export const listShopEventsByShop = /* GraphQL */ `
  query ListShopEventsByShop($shopID: ID!, $limit: Int, $nextToken: String) {
    listShopEvents(
      filter: { shopID: { eq: $shopID } }
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        eventType
        createdAt
      }
      nextToken
    }
  }
`;

// Keep old names as aliases so any remaining imports don't break
export const getbusiness = getShop;
export const listbusinesss = listShops;
export const businesssByOwner = shopsByOwner;
