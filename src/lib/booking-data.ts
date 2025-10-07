import { addDays, format } from "date-fns";

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number; // cents? we'll use number as dollars.
  category: "Cut" | "Shave" | "Color" | "Package";
  includes: string[];
};

export type AddOn = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  recommendedFor: string[];
};

export type ScheduleBlock = {
  start: string; // HH:mm
  end: string; // HH:mm
};

export type ScheduleBreak = {
  start: string;
  end: string;
};

export type StylistScheduleEntry = {
  day: number; // 0-6
  blocks: ScheduleBlock[];
  breaks?: ScheduleBreak[];
};

export type Stylist = {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[]; // service ids
  yearsExperience: number;
  rating: number;
  schedule: StylistScheduleEntry[];
};

export type BookingRecord = {
  id: string;
  serviceId: string;
  stylistId: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  duration: number;
  addOnIds: string[];
  clientName: string;
};

export const services: Service[] = [
  {
    id: "signature-cut",
    name: "Signature Cut",
    description:
      "A precision haircut tailored to your features, completed with a relaxing hot towel finish and premium styling products.",
    duration: 60,
    price: 65,
    category: "Cut",
    includes: ["Consultation", "Precision cut", "Hot towel finish", "Style & product guidance"],
  },
  {
    id: "classic-fade",
    name: "Classic Fade",
    description: "Skin fade or taper expertly blended with detailed line work and styling.",
    duration: 45,
    price: 70,
    category: "Cut",
    includes: ["Clipper & scissor blend", "Neck shave", "Finishing style"],
  },
  {
    id: "traditional-shave",
    name: "Traditional Shave",
    description: "The ultimate straight-razor experience with hot towels, facial massage, and post-shave treatment.",
    duration: 45,
    price: 55,
    category: "Shave",
    includes: ["Skin analysis", "Hot & cold towels", "Straight razor shave", "Facial massage"],
  },
  {
    id: "beard-sculpting",
    name: "Beard Sculpting",
    description: "Detailed beard shaping with steam treatment, razor line-up, and conditioning.",
    duration: 30,
    price: 45,
    category: "Cut",
    includes: ["Precision shaping", "Line-up", "Steam treatment", "Conditioning"],
  },
  {
    id: "grey-blending",
    name: "Grey Blending",
    description: "Subtle colour blending to soften greys while maintaining a natural look.",
    duration: 50,
    price: 85,
    category: "Color",
    includes: ["Consultation", "Custom colour blend", "Toner", "Style finish"],
  },
  {
    id: "executive-package",
    name: "Executive Package",
    description: "Signature cut, traditional shave, and scalp massage for the full Bridge experience.",
    duration: 105,
    price: 195,
    category: "Package",
    includes: ["Signature cut", "Traditional shave", "Scalp massage", "Beverage service"],
  },
];

export const addOns: AddOn[] = [
  {
    id: "scalp-massage",
    name: "Therapeutic Scalp Massage",
    description: "10-minute targeted massage with essential oils to relieve tension.",
    duration: 10,
    price: 20,
    recommendedFor: ["signature-cut", "executive-package"],
  },
  {
    id: "express-facial",
    name: "Express Facial Refresh",
    description: "Deep cleanse, exfoliation, and hydration treatment.",
    duration: 15,
    price: 28,
    recommendedFor: ["traditional-shave", "executive-package"],
  },
  {
    id: "brow-detailing",
    name: "Brow Detailing",
    description: "Sharpened brow line and grooming to frame your face.",
    duration: 10,
    price: 18,
    recommendedFor: ["classic-fade", "signature-cut", "grey-blending"],
  },
  {
    id: "deluxe-wash",
    name: "Deluxe Wash & Style",
    description: "Extended wash, conditioning treatment, and styling tutorial.",
    duration: 15,
    price: 25,
    recommendedFor: ["signature-cut", "classic-fade", "executive-package"],
  },
];

export const stylists: Stylist[] = [
  {
    id: "leon",
    name: "Leon Chambers",
    title: "Master Barber",
    bio: "Fade specialist known for precision detailing and executive grooming experiences.",
    specialties: ["signature-cut", "classic-fade", "executive-package", "beard-sculpting"],
    yearsExperience: 14,
    rating: 4.9,
    schedule: [
      { day: 1, blocks: [{ start: "09:00", end: "17:30" }], breaks: [{ start: "13:00", end: "14:00" }] },
      { day: 2, blocks: [{ start: "11:00", end: "19:00" }], breaks: [{ start: "15:00", end: "15:30" }] },
      { day: 4, blocks: [{ start: "09:00", end: "18:00" }], breaks: [{ start: "12:30", end: "13:00" }] },
      { day: 5, blocks: [{ start: "10:00", end: "16:00" }] },
    ],
  },
  {
    id: "maya",
    name: "Maya Torres",
    title: "Senior Stylist",
    bio: "Colour blending expert bringing modern texture and movement to every cut.",
    specialties: ["signature-cut", "grey-blending", "classic-fade", "executive-package"],
    yearsExperience: 9,
    rating: 4.8,
    schedule: [
      { day: 0, blocks: [{ start: "10:00", end: "16:00" }] },
      { day: 2, blocks: [{ start: "09:30", end: "18:30" }], breaks: [{ start: "13:30", end: "14:00" }] },
      { day: 3, blocks: [{ start: "11:00", end: "20:00" }], breaks: [{ start: "16:00", end: "16:30" }] },
      { day: 6, blocks: [{ start: "09:00", end: "15:00" }] },
    ],
  },
  {
    id: "amir",
    name: "Amir Patel",
    title: "Ritual Shaving Specialist",
    bio: "Meticulous grooming focused on skin health and premium shave rituals.",
    specialties: ["traditional-shave", "beard-sculpting", "executive-package"],
    yearsExperience: 11,
    rating: 4.95,
    schedule: [
      { day: 1, blocks: [{ start: "10:00", end: "18:00" }], breaks: [{ start: "14:00", end: "14:30" }] },
      { day: 3, blocks: [{ start: "09:00", end: "17:30" }], breaks: [{ start: "12:00", end: "12:30" }] },
      { day: 5, blocks: [{ start: "11:00", end: "19:30" }], breaks: [{ start: "16:30", end: "17:00" }] },
    ],
  },
];

const formatter = new Intl.NumberFormat("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const tomorrow = addDays(new Date(), 1);
const inThreeDays = addDays(new Date(), 3);

export const initialBookings: BookingRecord[] = [
  {
    id: "initial-1",
    serviceId: "signature-cut",
    stylistId: "leon",
    date: format(tomorrow, "yyyy-MM-dd"),
    time: "10:00",
    duration: 60,
    addOnIds: ["deluxe-wash"],
    clientName: "Jordan Miles",
  },
  {
    id: "initial-2",
    serviceId: "traditional-shave",
    stylistId: "amir",
    date: format(tomorrow, "yyyy-MM-dd"),
    time: "14:30",
    duration: 45,
    addOnIds: ["express-facial"],
    clientName: "Phillip West",
  },
  {
    id: "initial-3",
    serviceId: "grey-blending",
    stylistId: "maya",
    date: format(inThreeDays, "yyyy-MM-dd"),
    time: "13:30",
    duration: 50,
    addOnIds: [],
    clientName: "Chris Lee",
  },
];

export function formatPrice(amount: number) {
  return `$${formatter.format(amount)}`;
}
