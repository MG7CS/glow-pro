import type { Business } from "@/types/business";
import shopShoesImg from "@/assets/shop-shoes.jpg";
import shopFashionImg from "@/assets/shop-fashion.jpg";
import shopTailorImg from "@/assets/shop-tailor.jpg";
import shopSalonImg from "@/assets/shop-salon.jpg";
import shopGroceryImg from "@/assets/shop-grocery.jpg";
import shopElectronicsImg from "@/assets/shop-electronics.jpg";

const polishedNails: Business = {
  id: "polished-nails",
  image: shopShoesImg,
  name: "Polished Nails Kigali",
  neighborhood: "Kimironko",
  category: "Nails",
  distance: "0.8 km",
  rating: 4.9,
  verified: true,
  description:
    "Manicures, pedicures, and nail art in Kimironko. Clean studio, friendly technicians, walk-ins welcome.",
  address: "KG 11 Ave, Kimironko Market, Kigali",
  phone: "+250 788 123 457",
  social: {
    whatsapp: "+250788123456",
    instagram: "@polishednailskgl",
    facebook: "Polished Nails Kigali",
  },
  images: [shopShoesImg, shopFashionImg, shopTailorImg],
  hours: [
    { day: "Monday", time: "8:00 AM – 6:00 PM" },
    { day: "Tuesday", time: "8:00 AM – 6:00 PM" },
    { day: "Wednesday", time: "8:00 AM – 6:00 PM" },
    { day: "Thursday", time: "8:00 AM – 6:00 PM", isToday: true },
    { day: "Friday", time: "8:00 AM – 6:00 PM" },
    { day: "Saturday", time: "9:00 AM – 5:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  owner: {
    name: "Gamo K.",
    listedSince: "March 2026",
    replyTime: "Usually replies within 1 hour",
  },
  reviews: [
    {
      name: "Alice M.",
      rating: 5,
      comment: "Perfect gel nails and very friendly. Will book again!",
      date: "2 weeks ago",
    },
    {
      name: "Jean P.",
      rating: 5,
      comment: "Best nail studio in Kimironko. Great attention to detail.",
      date: "1 month ago",
    },
  ],
};

const glamourSalon: Business = {
  id: "glamour-salon",
  image: shopSalonImg,
  name: "Glamour Hair Studio",
  neighborhood: "Remera",
  category: "Hair",
  distance: "1.2 km",
  rating: 4.7,
  verified: true,
  description: "Cuts, colour, and styling in the heart of Remera. Expert stylists, relaxing atmosphere.",
  address: "KN 5 Rd, Remera, Kigali",
  social: { whatsapp: "+250788654321" },
  images: [shopSalonImg, shopFashionImg],
  reviews: [
    { name: "Marie N.", rating: 5, comment: "Best braids in Kigali! Very professional.", date: "3 days ago" },
  ],
};

const remeraSpa: Business = {
  id: "remera-spa",
  image: shopGroceryImg,
  name: "Remera Glow Spa",
  neighborhood: "Kimironko",
  category: "Spa",
  distance: "0.3 km",
  rating: 4.5,
  description: "Facials, massage, and relaxation packages. Open 7 days a week.",
  address: "Kimironko Market, Kigali",
  social: { whatsapp: "+250788111222" },
  images: [shopGroceryImg],
  reviews: [],
};

const urbanBarber: Business = {
  id: "urban-barber",
  image: shopElectronicsImg,
  name: "Urban Barber CBD",
  neighborhood: "City Centre",
  category: "Barber",
  distance: "2.1 km",
  rating: 4.8,
  verified: true,
  description: "Fades, beard trims, and hot towel shaves. Walk-ins and bookings.",
  address: "Kigali Business Centre, CBD",
  social: { whatsapp: "+250788333444", instagram: "@urbanbarberkgl" },
  images: [shopElectronicsImg, shopFashionImg],
  reviews: [
    { name: "David R.", rating: 5, comment: "Best cut in town. Quick and precise!", date: "1 week ago" },
  ],
};

export const allBusinesses: Business[] = [polishedNails, glamourSalon, remeraSpa, urbanBarber];

export const popularBusinesses: Pick<Business, "id" | "image" | "name" | "neighborhood" | "category" | "distance" | "rating">[] =
  [polishedNails, urbanBarber, glamourSalon, remeraSpa];

export const trendingBusinesses: Pick<Business, "id" | "image" | "name" | "neighborhood" | "category" | "distance" | "rating">[] =
  [glamourSalon, polishedNails, remeraSpa, urbanBarber];

export const newlyListed: Pick<Business, "id" | "image" | "name" | "neighborhood" | "category" | "distance" | "rating">[] =
  [remeraSpa, urbanBarber];
