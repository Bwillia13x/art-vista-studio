import { describe, expect, it } from "vitest";

import { generateSlots, formatTimeDisplay } from "../booking-utils";
import type { BookingRecord, StylistScheduleEntry } from "../booking-data";

describe("booking-utils", () => {
  it("generates slots that respect existing bookings and breaks", () => {
    const schedule: StylistScheduleEntry = {
      day: 3,
      blocks: [{ start: "09:00", end: "12:00" }],
      breaks: [{ start: "10:30", end: "11:00" }],
    };

    const bookings: BookingRecord[] = [
      {
        id: "existing",
        serviceId: "signature-cut",
        stylistId: "leon",
        date: "2024-02-07",
        time: "09:30",
        duration: 60,
        addOnIds: [],
        clientName: "Existing Guest",
        clientEmail: "existing@example.com",
        clientPhone: "+1 403-555-0101",
        notes: null,
        marketingConsent: false,
      },
    ];

    const targetDate = new Date("2024-02-07T09:00:00");
    const slots = generateSlots(schedule, targetDate, 30, bookings);

    expect(slots).toMatchInlineSnapshot(`
      [
        "09:00",
        "11:00",
        "11:15",
        "11:30",
      ]
    `);
  });

  it("formats time display consistently", () => {
    const targetDate = new Date("2024-02-07T00:00:00");
    const formatted = formatTimeDisplay(targetDate, "13:45");
    expect(formatted).toBe("1:45 PM");
  });
});
