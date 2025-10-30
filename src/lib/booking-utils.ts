import { format, isAfter, isSameDay, setHours, setMinutes } from "date-fns";

import type { BookingRecord, Stylist, StylistScheduleEntry } from "@/lib/booking-data";

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number) {
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}`;
}

export function formatTimeDisplay(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return format(setMinutes(setHours(date, hours), minutes), "h:mm a");
}

export function stylistWorksOnDate(stylist: Stylist, date: Date) {
  return stylist.schedule.some((slot) => slot.day === date.getDay());
}

export function getScheduleForDate(stylist: Stylist, date: Date): StylistScheduleEntry | undefined {
  return stylist.schedule.find((slot) => slot.day === date.getDay());
}

export function generateSlots(
  schedule: StylistScheduleEntry,
  date: Date,
  duration: number,
  existing: BookingRecord[],
) {
  const slots: string[] = [];
  const now = new Date();
  const dayIsToday = isSameDay(date, now);

  const blockedIntervals = [
    ...(schedule.breaks?.map((breakTime) => [toMinutes(breakTime.start), toMinutes(breakTime.end)]) ?? []),
    ...existing.map((booking) => [toMinutes(booking.time), toMinutes(booking.time) + booking.duration]),
  ];

  schedule.blocks.forEach((block) => {
    let current = toMinutes(block.start);
    const blockEnd = toMinutes(block.end);

    while (current + duration <= blockEnd) {
      const slotEnd = current + duration;
      const overlaps = blockedIntervals.some(([start, end]) => current < end && slotEnd > start);
      const slotDate = setMinutes(setHours(date, Math.floor(current / 60)), current % 60);

      if (!overlaps && (!dayIsToday || isAfter(slotDate, now))) {
        slots.push(minutesToTime(current));
      }

      current += 15;
    }
  });

  return slots;
}
