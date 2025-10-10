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
  specialties?: { service_id: string }[] | null;
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
    description: row.description,
    duration: row.duration_minutes,
    price: row.price_cents / 100,
    category: row.category,
    includes: row.includes ?? [],
  };
}

export function mapAddOn(row: Tables<"add_ons">): AddOn {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    duration: row.duration_minutes,
    price: row.price_cents / 100,
    recommendedFor: row.recommended_for ?? [],
  };
}

export function mapBooking(
  row: Tables<"bookings">,
  addOnIds: string[] = [],
): BookingRecord {
  return {
    id: row.id,
    serviceId: row.service_id,
    stylistId: row.stylist_id,
    date: row.appointment_date,
    time: row.start_time.slice(0, 5),
    duration: row.duration_minutes,
    addOnIds,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    notes: row.notes ?? null,
    marketingConsent: row.marketing_consent,
  };
}

export function mapStylist(row: RawStylistRow): Stylist {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    bio: row.bio,
    specialties: row.specialties?.map((item) => item.service_id) ?? [],
    yearsExperience: row.years_experience,
    rating: Number(row.rating),
    schedule:
      row.schedules?.map((schedule) => ({
        day: schedule.day_of_week,
        blocks: [
          {
            start: schedule.block_start.slice(0, 5),
            end: schedule.block_end.slice(0, 5),
          },
        ],
        breaks:
          schedule.breaks?.map((breakPeriod) => ({
            start: breakPeriod.break_start.slice(0, 5),
            end: breakPeriod.break_end.slice(0, 5),
          })) ?? [],
      })) ?? [],
  };
}
