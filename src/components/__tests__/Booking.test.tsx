import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Booking from "../Booking";

const fromMock = vi.fn();
const rpcMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    rpc: (...args: unknown[]) => rpcMock(...args),
  },
}));

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const servicesRows = [
  {
    id: "signature-cut",
    name: "Signature Cut",
    description: "Precision haircut",
    duration_minutes: 60,
    price_cents: 6500,
    category: "cut",
    includes: ["Consultation"],
    created_at: "2024-01-01T00:00:00Z",
  },
];

const addOnsRows = [
  {
    id: "scalp-massage",
    name: "Scalp Massage",
    description: "Relaxing finish",
    duration_minutes: 15,
    price_cents: 2000,
    recommended_for: ["signature-cut"],
    created_at: "2024-01-01T00:00:00Z",
  },
];

const stylistsRows = [
  {
    id: "leon",
    name: "Leon Chambers",
    title: "Master Barber",
    bio: "Detail-focused",
    years_experience: 12,
    rating: 4.9,
    created_at: "2024-01-01T00:00:00Z",
    schedules: [
      {
        day_of_week: 3,
        block_start: "09:00",
        block_end: "16:00",
        breaks: [{ break_start: "12:00", break_end: "12:30" }],
      },
    ],
    specialties: [{ service_id: "signature-cut" }],
  },
];

const bookingsRows = [
  {
    id: "booking-1",
    service_id: "signature-cut",
    stylist_id: "leon",
    appointment_date: "2024-02-07",
    start_time: "09:30:00",
    duration_minutes: 60,
    client_name: "Jordan",
    client_email: "jordan@example.com",
    client_phone: "+1 403-555-0101",
    notes: null,
    marketing_consent: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    add_ons: [],
  },
];

const insertedBooking = {
  id: "new-booking",
  service_id: "signature-cut",
  stylist_id: "leon",
  appointment_date: "2024-02-07",
  start_time: "11:00:00",
  duration_minutes: 75,
  client_name: "Casey",
  client_email: "casey@example.com",
  client_phone: "+1 587-555-0101",
  notes: null,
  marketing_consent: true,
  created_at: "2024-02-01T00:00:00Z",
  updated_at: "2024-02-01T00:00:00Z",
};

function createServicesQuery() {
  const order = vi.fn().mockResolvedValue({ data: servicesRows, error: null });
  const select = vi.fn(() => ({ order }));
  return { select };
}

function createAddOnsQuery() {
  const order = vi.fn().mockResolvedValue({ data: addOnsRows, error: null });
  const select = vi.fn(() => ({ order }));
  return { select };
}

function createStylistsQuery() {
  const order = vi.fn().mockResolvedValue({ data: stylistsRows, error: null });
  const select = vi.fn(() => ({ order }));
  return { select };
}

function createBookingsQuery() {
  const order = vi.fn().mockResolvedValue({ data: bookingsRows, error: null });
  const secondEq = vi.fn(() => ({ order }));
  const firstEq = vi.fn(() => ({ eq: secondEq }));
  const select = vi.fn(() => ({ eq: firstEq }));
  return { select };
}

const tableHandlers: Record<string, () => unknown> = {
  services: createServicesQuery,
  add_ons: createAddOnsQuery,
  stylists: createStylistsQuery,
  bookings: createBookingsQuery,
};

const renderWithClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Booking />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  vi.useFakeTimers().setSystemTime(new Date("2024-02-05T09:00:00"));
  fromMock.mockImplementation((table: string) => {
    const handler = tableHandlers[table];
    if (!handler) throw new Error(`Unhandled table ${table}`);
    return handler();
  });
  rpcMock.mockResolvedValue({ data: insertedBooking, error: null });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("Booking", () => {
  it("walks through the booking flow and submits a reservation", async () => {
    renderWithClient();

    await screen.findByText("Signature Cut");
    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /signature cut/i }));
    expect(continueButton).toBeEnabled();
    await userEvent.click(continueButton);

    await screen.findByRole("button", { name: /leon chambers/i });
    await userEvent.click(screen.getByRole("button", { name: /leon chambers/i }));

    const dateButton = await screen.findByRole("button", { name: "Wednesday, February 7, 2024" });
    await userEvent.click(dateButton);

    await waitFor(() => expect(screen.getByRole("button", { name: /11:00 am/i })).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /11:00 am/i }));

    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    const confirmButton = screen.getByRole("button", { name: /confirm appointment/i });
    expect(confirmButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/full name/i), "Casey Morgan");
    await userEvent.type(screen.getByLabelText(/email address/i), "casey@example.com");
    await userEvent.type(screen.getByLabelText(/mobile number/i), "4035550199");
    await userEvent.type(screen.getByLabelText(/appointment preferences/i), "Prefer calming playlist");
    await userEvent.click(screen.getByLabelText(/keep me in the loop/i));

    expect(confirmButton).toBeEnabled();
    await userEvent.click(confirmButton);

    await waitFor(() => expect(screen.getByText("You're all set")).toBeInTheDocument());
    expect(rpcMock).toHaveBeenCalledWith(
      "create_booking",
      expect.objectContaining({
        p_service_id: "signature-cut",
        p_client_name: "Casey Morgan",
        p_marketing_consent: true,
      }),
    );
  });
});
