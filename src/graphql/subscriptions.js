/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateReview = /* GraphQL */ `
  subscription OnCreateReview($filter: ModelSubscriptionReviewFilterInput) {
    onCreateReview(filter: $filter) {
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
export const onUpdateReview = /* GraphQL */ `
  subscription OnUpdateReview($filter: ModelSubscriptionReviewFilterInput) {
    onUpdateReview(filter: $filter) {
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
export const onDeleteReview = /* GraphQL */ `
  subscription OnDeleteReview($filter: ModelSubscriptionReviewFilterInput) {
    onDeleteReview(filter: $filter) {
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
export const onCreateShopEvent = /* GraphQL */ `
  subscription OnCreateShopEvent(
    $filter: ModelSubscriptionShopEventFilterInput
  ) {
    onCreateShopEvent(filter: $filter) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateShopEvent = /* GraphQL */ `
  subscription OnUpdateShopEvent(
    $filter: ModelSubscriptionShopEventFilterInput
  ) {
    onUpdateShopEvent(filter: $filter) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteShopEvent = /* GraphQL */ `
  subscription OnDeleteShopEvent(
    $filter: ModelSubscriptionShopEventFilterInput
  ) {
    onDeleteShopEvent(filter: $filter) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateShop = /* GraphQL */ `
  subscription OnCreateShop(
    $filter: ModelSubscriptionShopFilterInput
    $owner: String
  ) {
    onCreateShop(filter: $filter, owner: $owner) {
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
export const onUpdateShop = /* GraphQL */ `
  subscription OnUpdateShop(
    $filter: ModelSubscriptionShopFilterInput
    $owner: String
  ) {
    onUpdateShop(filter: $filter, owner: $owner) {
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
export const onDeleteShop = /* GraphQL */ `
  subscription OnDeleteShop(
    $filter: ModelSubscriptionShopFilterInput
    $owner: String
  ) {
    onDeleteShop(filter: $filter, owner: $owner) {
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
export const onCreateBusinessHour = /* GraphQL */ `
  subscription OnCreateBusinessHour(
    $filter: ModelSubscriptionBusinessHourFilterInput
    $owner: String
  ) {
    onCreateBusinessHour(filter: $filter, owner: $owner) {
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
export const onUpdateBusinessHour = /* GraphQL */ `
  subscription OnUpdateBusinessHour(
    $filter: ModelSubscriptionBusinessHourFilterInput
    $owner: String
  ) {
    onUpdateBusinessHour(filter: $filter, owner: $owner) {
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
export const onDeleteBusinessHour = /* GraphQL */ `
  subscription OnDeleteBusinessHour(
    $filter: ModelSubscriptionBusinessHourFilterInput
    $owner: String
  ) {
    onDeleteBusinessHour(filter: $filter, owner: $owner) {
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
