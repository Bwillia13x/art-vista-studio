export type BookingEventName = "booking_attempt" | "booking_success" | "booking_failure";

type AnalyticsPayload = Record<string, unknown>;

export function trackBookingEvent(event: BookingEventName, payload: AnalyticsPayload) {
  const message = `[analytics] ${event}`;
  if (typeof window !== "undefined" && window.console) {
    window.console.info(message, payload);
  } else {
    console.info(message, payload);
  }
}
