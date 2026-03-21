/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createReview = /* GraphQL */ `
  mutation CreateReview(
    $input: CreateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    createReview(input: $input, condition: $condition) {
      id
      shopID
      reviewerName
      rating
      comment
      date
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateReview = /* GraphQL */ `
  mutation UpdateReview(
    $input: UpdateReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    updateReview(input: $input, condition: $condition) {
      id
      shopID
      reviewerName
      rating
      comment
      date
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteReview = /* GraphQL */ `
  mutation DeleteReview(
    $input: DeleteReviewInput!
    $condition: ModelReviewConditionInput
  ) {
    deleteReview(input: $input, condition: $condition) {
      id
      shopID
      reviewerName
      rating
      comment
      date
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createShopEvent = /* GraphQL */ `
  mutation CreateShopEvent(
    $input: CreateShopEventInput!
    $condition: ModelShopEventConditionInput
  ) {
    createShopEvent(input: $input, condition: $condition) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const updateShopEvent = /* GraphQL */ `
  mutation UpdateShopEvent(
    $input: UpdateShopEventInput!
    $condition: ModelShopEventConditionInput
  ) {
    updateShopEvent(input: $input, condition: $condition) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const deleteShopEvent = /* GraphQL */ `
  mutation DeleteShopEvent(
    $input: DeleteShopEventInput!
    $condition: ModelShopEventConditionInput
  ) {
    deleteShopEvent(input: $input, condition: $condition) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const createShop = /* GraphQL */ `
  mutation CreateShop(
    $input: CreateShopInput!
    $condition: ModelShopConditionInput
  ) {
    createShop(input: $input, condition: $condition) {
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
      ownerEmail
      referralSource
      recruitedBy
      listedSince
      replyTime
      reviews {
        nextToken
        __typename
      }
      hours {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateShop = /* GraphQL */ `
  mutation UpdateShop(
    $input: UpdateShopInput!
    $condition: ModelShopConditionInput
  ) {
    updateShop(input: $input, condition: $condition) {
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
      ownerEmail
      referralSource
      recruitedBy
      listedSince
      replyTime
      reviews {
        nextToken
        __typename
      }
      hours {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteShop = /* GraphQL */ `
  mutation DeleteShop(
    $input: DeleteShopInput!
    $condition: ModelShopConditionInput
  ) {
    deleteShop(input: $input, condition: $condition) {
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
      ownerEmail
      referralSource
      recruitedBy
      listedSince
      replyTime
      reviews {
        nextToken
        __typename
      }
      hours {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const createBusinessHour = /* GraphQL */ `
  mutation CreateBusinessHour(
    $input: CreateBusinessHourInput!
    $condition: ModelBusinessHourConditionInput
  ) {
    createBusinessHour(input: $input, condition: $condition) {
      id
      shopID
      day
      time
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const updateBusinessHour = /* GraphQL */ `
  mutation UpdateBusinessHour(
    $input: UpdateBusinessHourInput!
    $condition: ModelBusinessHourConditionInput
  ) {
    updateBusinessHour(input: $input, condition: $condition) {
      id
      shopID
      day
      time
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const deleteBusinessHour = /* GraphQL */ `
  mutation DeleteBusinessHour(
    $input: DeleteBusinessHourInput!
    $condition: ModelBusinessHourConditionInput
  ) {
    deleteBusinessHour(input: $input, condition: $condition) {
      id
      shopID
      day
      time
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
