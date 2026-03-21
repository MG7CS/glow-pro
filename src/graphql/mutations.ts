// Reflects the deployed AppSync schema (type Shop @model)
// Mutations: createShop, updateShop, deleteShop, createShopEvent

export const createShop = /* GraphQL */ `
  mutation CreateShop($input: CreateShopInput!) {
    createShop(input: $input) {
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
  }
`;

export const updateShop = /* GraphQL */ `
  mutation UpdateShop($input: UpdateShopInput!) {
    updateShop(input: $input) {
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
      recruitedBy
      owner
      updatedAt
    }
  }
`;

export const deleteShop = /* GraphQL */ `
  mutation DeleteShop($input: DeleteShopInput!) {
    deleteShop(input: $input) {
      id
    }
  }
`;

/**
 * Admin-only mutation: sets only the `verified` field.
 * Requires apiKey auth — needs { allow: public, provider: apiKey, operations: [read, update] }
 * in the AppSync schema. Run `amplify push` after updating schema.graphql.
 */
export const adminSetVerified = /* GraphQL */ `
  mutation AdminSetVerified($id: ID!, $verified: Boolean) {
    updateShop(input: { id: $id, verified: $verified }) {
      id
      name
      verified
    }
  }
`;

export const createReview = /* GraphQL */ `
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      shopID
      reviewerName
      rating
      comment
      date
    }
  }
`;

export const createBusinessHour = /* GraphQL */ `
  mutation CreateBusinessHour($input: CreateBusinessHourInput!) {
    createBusinessHour(input: $input) {
      id
      shopID
      day
      time
    }
  }
`;

export const deleteBusinessHour = /* GraphQL */ `
  mutation DeleteBusinessHour($input: DeleteBusinessHourInput!) {
    deleteBusinessHour(input: $input) {
      id
    }
  }
`;

export const createShopEvent = /* GraphQL */ `
  mutation CreateShopEvent($input: CreateShopEventInput!) {
    createShopEvent(input: $input) {
      id
      shopID
      eventType
      createdAt
    }
  }
`;

// Keep old names as aliases so any remaining import doesn't break at compile time
export const createbusiness = createShop;
export const updatebusiness = updateShop;
export const deletebusiness = deleteShop;
