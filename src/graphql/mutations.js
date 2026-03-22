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
export const createAppointment = /* GraphQL */ `
  mutation CreateAppointment(
    $input: CreateAppointmentInput!
    $condition: ModelAppointmentConditionInput
  ) {
    createAppointment(input: $input, condition: $condition) {
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
export const updateAppointment = /* GraphQL */ `
  mutation UpdateAppointment(
    $input: UpdateAppointmentInput!
    $condition: ModelAppointmentConditionInput
  ) {
    updateAppointment(input: $input, condition: $condition) {
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
export const deleteAppointment = /* GraphQL */ `
  mutation DeleteAppointment(
    $input: DeleteAppointmentInput!
    $condition: ModelAppointmentConditionInput
  ) {
    deleteAppointment(input: $input, condition: $condition) {
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
export const createVouch = /* GraphQL */ `
  mutation CreateVouch(
    $input: CreateVouchInput!
    $condition: ModelVouchConditionInput
  ) {
    createVouch(input: $input, condition: $condition) {
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
export const updateVouch = /* GraphQL */ `
  mutation UpdateVouch(
    $input: UpdateVouchInput!
    $condition: ModelVouchConditionInput
  ) {
    updateVouch(input: $input, condition: $condition) {
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
export const deleteVouch = /* GraphQL */ `
  mutation DeleteVouch(
    $input: DeleteVouchInput!
    $condition: ModelVouchConditionInput
  ) {
    deleteVouch(input: $input, condition: $condition) {
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
