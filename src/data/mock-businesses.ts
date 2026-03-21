import type { Business } from "@/types/business";
import shopShoesImg from "@/assets/shop-shoes.jpg";
import shopFashionImg from "@/assets/shop-fashion.jpg";
import shopTailorImg from "@/assets/shop-tailor.jpg";
import shopSalonImg from "@/assets/shop-salon.jpg";
import shopGroceryImg from "@/assets/shop-grocery.jpg";
import shopElectronicsImg from "@/assets/shop-electronics.jpg";

const kigaliKicks: Business = {
  id: "kigalikicks",
  image: shopShoesImg,
  name: "KigaliKicks",
  neighborhood: "Kimironko",
  category: "Shoes",
  distance: "0.8 km",
  rating: 4.9,
  verified: true,
  description:
    "Your go-to sneaker destination in Kimironko. We carry the latest styles from top brands alongside locally crafted leather shoes.",
  address: "KG 11 Ave, Kimironko Market, Kigali",
  phone: "+250 788 123 457",
  social: {
    whatsapp: "+250788123456",
    instagram: "@kigalikicks",
    facebook: "KigaliKicks",
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
      comment: "Amazing quality and very friendly staff! Will definitely come back.",
      date: "2 weeks ago",
    },
    {
      name: "Jean P.",
      rating: 5,
      comment: "Best shoe store in Kimironko. Great selection of both local and international brands.",
      date: "1 month ago",
    },
  ],
};

const glamourSalon: Business = {
  id: "glamour-salon",
  image: shopSalonImg,
  name: "Glamour Salon",
  neighborhood: "Remera",
  category: "Salons",
  distance: "1.2 km",
  rating: 4.7,
  verified: true,
  description: "Premium hair and beauty services in the heart of Remera. Expert stylists, relaxing atmosphere.",
  address: "KN 5 Rd, Remera, Kigali",
  social: { whatsapp: "+250788654321" },
  images: [shopSalonImg, shopFashionImg],
  reviews: [
    { name: "Marie N.", rating: 5, comment: "Best braids in Kigali! Very professional.", date: "3 days ago" },
  ],
};

const freshMart: Business = {
  id: "fresh-mart",
  image: shopGroceryImg,
  name: "FreshMart Kimironko",
  neighborhood: "Kimironko",
  category: "Groceries",
  distance: "0.3 km",
  rating: 4.5,
  description: "Fresh produce, imported goods and everyday essentials. Open 7 days a week.",
  address: "Kimironko Market, Kigali",
  social: { whatsapp: "+250788111222" },
  images: [shopGroceryImg],
  reviews: [],
};

const techHubKigali: Business = {
  id: "tech-hub-kigali",
  image: shopElectronicsImg,
  name: "TechHub Kigali",
  neighborhood: "City Centre",
  category: "Electronics",
  distance: "2.1 km",
  rating: 4.8,
  verified: true,
  description: "Your one-stop shop for smartphones, laptops, accessories and repairs.",
  address: "Kigali Business Centre, CBD",
  social: { whatsapp: "+250788333444", instagram: "@techkigali" },
  images: [shopElectronicsImg, shopFashionImg],
  reviews: [
    { name: "David R.", rating: 5, comment: "Fixed my phone in 30 minutes. Great service!", date: "1 week ago" },
  ],
};

export const allBusinesses: Business[] = [kigaliKicks, glamourSalon, freshMart, techHubKigali];

export const popularBusinesses: Pick<Business, "id" | "image" | "name" | "neighborhood" | "category" | "distance" | "rating">[] =
  [kigaliKicks, techHubKigali, glamourSalon, freshMart];

export const trendingBusinesses: Pick<Business, "id" | "image" | "name" | "neighborhood" | "category" | "distance" | "rating">[] =
  [glamourSalon, kigaliKicks, freshMart, techHubKigali];

export const newlyListed: Pick<Business, "id" | "image" | "name" | "neighborhood" | "category" | "distance" | "rating">[] =
  [freshMart, techHubKigali];
