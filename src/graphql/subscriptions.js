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
      professionalType
      isIndependent
      services
      priceRange
      bookingEnabled
      depositRequired
      depositAmount
      yearsExperience
      specialties
      languages
      portfolioPhotos
      servesAtHome
      servesInSalon
      reviews {
        nextToken
        __typename
      }
      hours {
        nextToken
        __typename
      }
      appointments {
        nextToken
        __typename
      }
      vouches {
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
      professionalType
      isIndependent
      services
      priceRange
      bookingEnabled
      depositRequired
      depositAmount
      yearsExperience
      specialties
      languages
      portfolioPhotos
      servesAtHome
      servesInSalon
      reviews {
        nextToken
        __typename
      }
      hours {
        nextToken
        __typename
      }
      appointments {
        nextToken
        __typename
      }
      vouches {
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
      professionalType
      isIndependent
      services
      priceRange
      bookingEnabled
      depositRequired
      depositAmount
      yearsExperience
      specialties
      languages
      portfolioPhotos
      servesAtHome
      servesInSalon
      reviews {
        nextToken
        __typename
      }
      hours {
        nextToken
        __typename
      }
      appointments {
        nextToken
        __typename
      }
      vouches {
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
export const onCreateAppointment = /* GraphQL */ `
  subscription OnCreateAppointment(
    $filter: ModelSubscriptionAppointmentFilterInput
    $owner: String
  ) {
    onCreateAppointment(filter: $filter, owner: $owner) {
      id
      shopID
      customerName
      customerPhone
      service
      date
      time
      status
      notes
      depositPaid
      totalPrice
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateAppointment = /* GraphQL */ `
  subscription OnUpdateAppointment(
    $filter: ModelSubscriptionAppointmentFilterInput
    $owner: String
  ) {
    onUpdateAppointment(filter: $filter, owner: $owner) {
      id
      shopID
      customerName
      customerPhone
      service
      date
      time
      status
      notes
      depositPaid
      totalPrice
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteAppointment = /* GraphQL */ `
  subscription OnDeleteAppointment(
    $filter: ModelSubscriptionAppointmentFilterInput
    $owner: String
  ) {
    onDeleteAppointment(filter: $filter, owner: $owner) {
      id
      shopID
      customerName
      customerPhone
      service
      date
      time
      status
      notes
      depositPaid
      totalPrice
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateVouch = /* GraphQL */ `
  subscription OnCreateVouch(
    $filter: ModelSubscriptionVouchFilterInput
    $owner: String
  ) {
    onCreateVouch(filter: $filter, owner: $owner) {
      id
      shopID
      authorName
      authorPhone
      rating
      comment
      category
      verified
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateVouch = /* GraphQL */ `
  subscription OnUpdateVouch(
    $filter: ModelSubscriptionVouchFilterInput
    $owner: String
  ) {
    onUpdateVouch(filter: $filter, owner: $owner) {
      id
      shopID
      authorName
      authorPhone
      rating
      comment
      category
      verified
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteVouch = /* GraphQL */ `
  subscription OnDeleteVouch(
    $filter: ModelSubscriptionVouchFilterInput
    $owner: String
  ) {
    onDeleteVouch(filter: $filter, owner: $owner) {
      id
      shopID
      authorName
      authorPhone
      rating
      comment
      category
      verified
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
