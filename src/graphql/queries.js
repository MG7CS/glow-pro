/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getReview = /* GraphQL */ `
  query GetReview($id: ID!) {
    getReview(id: $id) {
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
export const listReviews = /* GraphQL */ `
  query ListReviews(
    $filter: ModelReviewFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listReviews(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getShopEvent = /* GraphQL */ `
  query GetShopEvent($id: ID!) {
    getShopEvent(id: $id) {
      id
      shopID
      eventType
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listShopEvents = /* GraphQL */ `
  query ListShopEvents(
    $filter: ModelShopEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShopEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        shopID
        eventType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const reviewsByShopIDAndId = /* GraphQL */ `
  query ReviewsByShopIDAndId(
    $shopID: ID!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelReviewFilterInput
    $limit: Int
    $nextToken: String
  ) {
    reviewsByShopIDAndId(
      shopID: $shopID
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const shopEventsByShopID = /* GraphQL */ `
  query ShopEventsByShopID(
    $shopID: ID!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelShopEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    shopEventsByShopID(
      shopID: $shopID
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        shopID
        eventType
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
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
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBusinessHour = /* GraphQL */ `
  query GetBusinessHour($id: ID!) {
    getBusinessHour(id: $id) {
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
export const listBusinessHours = /* GraphQL */ `
  query ListBusinessHours(
    $filter: ModelBusinessHourFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBusinessHours(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        shopID
        day
        time
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const businessHoursByShopIDAndId = /* GraphQL */ `
  query BusinessHoursByShopIDAndId(
    $shopID: ID!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBusinessHourFilterInput
    $limit: Int
    $nextToken: String
  ) {
    businessHoursByShopIDAndId(
      shopID: $shopID
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        shopID
        day
        time
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAppointment = /* GraphQL */ `
  query GetAppointment($id: ID!) {
    getAppointment(id: $id) {
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
export const listAppointments = /* GraphQL */ `
  query ListAppointments(
    $filter: ModelAppointmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAppointments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const appointmentsByShopIDAndId = /* GraphQL */ `
  query AppointmentsByShopIDAndId(
    $shopID: ID!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelAppointmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    appointmentsByShopIDAndId(
      shopID: $shopID
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const getVouch = /* GraphQL */ `
  query GetVouch($id: ID!) {
    getVouch(id: $id) {
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
export const listVouches = /* GraphQL */ `
  query ListVouches(
    $filter: ModelVouchFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVouches(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      __typename
    }
  }
`;
export const vouchesByShopIDAndId = /* GraphQL */ `
  query VouchesByShopIDAndId(
    $shopID: ID!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelVouchFilterInput
    $limit: Int
    $nextToken: String
  ) {
    vouchesByShopIDAndId(
      shopID: $shopID
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      __typename
    }
  }
`;
