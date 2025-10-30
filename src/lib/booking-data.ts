import type { Tables } from "@/integrations/supabase/types";

export type ServiceCategory = Tables<"services">["category"];

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: ServiceCategory;
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
  start: string;
  end: string;
};

export type ScheduleBreak = {
  start: string;
  end: string;
};

export type StylistScheduleEntry = {
  day: number;
  blocks: ScheduleBlock[];
  breaks: ScheduleBreak[];
};

export type Stylist = {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  yearsExperience: number;
  rating: number;
  schedule: StylistScheduleEntry[];
};

type RawStylistSchedule = {
  day_of_week: number;
  block_start: string;
  block_end: string;
  breaks?: { break_start: string; break_end: string }[] | null;
};

export type RawStylistRow = Tables<"stylists"> & {
  schedules?: RawStylistSchedule[] | null;
  stylist_specialties?: { service_id: string }[] | null;
};

export type BookingRecord = {
  id: string;
  serviceId: string;
  stylistId: string;
  date: string;
  time: string;
  duration: number;
  addOnIds: string[];
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string | null;
  marketingConsent: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number) {
  return currencyFormatter.format(amount);
}

export function mapService(row: Tables<"services">): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    duration: row.duration,
    price: row.price,
    category: row.category || null,
    includes: [],
  };
}

export function mapAddOn(row: Tables<"add_ons">): AddOn {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    duration: 0,
    price: row.price,
    recommendedFor: [],
  };
}

export function mapStylist(row: RawStylistRow): Stylist {
  const stylistData = row as any; // Type mismatch - using actual DB columns

  // Default schedule (Mon-Sat, 9am-6pm) until migrations are run
  const defaultSchedule = [
    { day: 1, blocks: [{ start: "09:00", end: "18:00" }], breaks: [] }, // Monday
    { day: 2, blocks: [{ start: "09:00", end: "18:00" }], breaks: [] }, // Tuesday
    { day: 3, blocks: [{ start: "09:00", end: "18:00" }], breaks: [] }, // Wednesday
    { day: 4, blocks: [{ start: "09:00", end: "18:00" }], breaks: [] }, // Thursday
    { day: 5, blocks: [{ start: "09:00", end: "18:00" }], breaks: [] }, // Friday
    { day: 6, blocks: [{ start: "09:00", end: "17:00" }], breaks: [] }, // Saturday
  ];

  return {
    id: stylistData.id,
    name: stylistData.name,
    title: stylistData.title || "Master Barber",
    bio: stylistData.bio || "",
    specialties: Array.isArray(stylistData.stylist_specialties)
      ? stylistData.stylist_specialties.map((s: any) => s.service_id)
      : [],
    yearsExperience: stylistData.years_experience || 0,
    rating: stylistData.rating || 5.0,
    schedule: defaultSchedule,
  };
}

export function mapBooking(
  bookingData: any,
  addOnIds: string[] = [],
): BookingRecord {
  return {
    id: bookingData.id || `booking-${Date.now()}`,
    serviceId: bookingData.service_id || "",
    stylistId: bookingData.stylist_id || "",
    date: bookingData.appointment_date || "",
    time: bookingData.start_time?.slice(0, 5) || "",
    duration: bookingData.duration_minutes || 0,
    addOnIds,
    clientName: bookingData.client_name || "",
    clientEmail: bookingData.client_email || "",
    clientPhone: bookingData.client_phone || "",
    notes: bookingData.notes || null,
    marketingConsent: bookingData.marketing_consent || false,
  };
}
