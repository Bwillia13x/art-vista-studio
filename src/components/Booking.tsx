import { useEffect, useMemo, useState } from "react";
import { format, startOfDay, startOfToday } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  formatPrice,
  mapAddOn,
  mapBooking,
  mapStylist,
  mapService,
  type AddOn,
  type BookingRecord,
  type RawStylistRow,
  type Service,
  type Stylist,
} from "@/lib/booking-data";
import {
  formatTimeDisplay,
  generateSlots,
  getScheduleForDate,
  stylistWorksOnDate,
} from "@/lib/booking-utils";
import { trackBookingEvent } from "@/lib/analytics";

const steps = ["Select service", "Reserve time", "Your details"];

const customerSchema = z.object({
  name: z.string().min(2, "Please share your full name."),
  email: z.string().email("Please provide a valid email address."),
  phone: z
    .string()
    .min(7, "Phone number is required for confirmations.")
    .regex(/^[+()0-9\s-]+$/, "Use numbers and symbols like +, -, or ()."),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer.")
    .optional(),
  marketing: z.boolean(),
});

type CustomerDetails = z.infer<typeof customerSchema>;

const INITIAL_CUSTOMER: CustomerDetails = {
  name: "",
  email: "",
  phone: "",
  notes: "",
  marketing: false,
};

type ConfirmationState = {
  booking: BookingRecord;
  service: Service;
  stylist: Stylist;
  addOnSelections: AddOn[];
  totalPrice: number;
  confirmationCode: string;
  customer: CustomerDetails;
};

type BookingRowWithAddOns = Tables<"bookings"> & {
  add_ons: { add_on_id: string }[] | null;
};

export default function Booking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [selectedStylistId, setSelectedStylistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset: resetCustomer,
    watch,
    formState: { errors },
  } = useForm<CustomerDetails>({
    resolver: zodResolver(customerSchema),
    defaultValues: INITIAL_CUSTOMER,
    mode: "onChange",
  });

  const customer = watch();

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name", { ascending: true });
      if (error) throw error;
      return data.map(mapService);
    },
  });

  const addOnsQuery = useQuery({
    queryKey: ["add-ons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("add_ons").select("*").order("name", { ascending: true });
      if (error) throw error;
      return data.map(mapAddOn);
    },
  });

  const stylistsQuery = useQuery({
    queryKey: ["stylists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stylists")
        .select(
          "id, name, title, bio, years_experience, rating, schedules:stylist_schedules(day_of_week, block_start, block_end, breaks:stylist_schedule_breaks(break_start, break_end)), specialties:stylist_specialties(service_id)",
        )
        .order("name", { ascending: true });
      if (error) throw error;
      return (data as RawStylistRow[]).map((row) => {
        const mapped = mapStylist(row);
        return {
          ...mapped,
          schedule: [...mapped.schedule].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            const aStart = a.blocks[0]?.start ?? "00:00";
            const bStart = b.blocks[0]?.start ?? "00:00";
            return aStart.localeCompare(bStart);
          }),
        } satisfies Stylist;
      });
    },
  });

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const addOns = useMemo(() => addOnsQuery.data ?? [], [addOnsQuery.data]);
  const stylists = useMemo(() => stylistsQuery.data ?? [], [stylistsQuery.data]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [services, selectedServiceId],
  );

  const selectedStylist = useMemo(
    () => stylists.find((stylist) => stylist.id === selectedStylistId) ?? null,
    [stylists, selectedStylistId],
  );

  const addOnSelections = useMemo(
    () => addOns.filter((addOn) => selectedAddOnIds.includes(addOn.id)),
    [addOns, selectedAddOnIds],
  );

  const totalDuration = useMemo(() => {
    if (!selectedService) return 0;
    const addOnDuration = addOnSelections.reduce((total, addOn) => total + addOn.duration, 0);
    return selectedService.duration + addOnDuration;
  }, [selectedService, addOnSelections]);

  const totalPrice = useMemo(() => {
    if (!selectedService) return 0;
    const addOnPrice = addOnSelections.reduce((total, addOn) => total + addOn.price, 0);
    return selectedService.price + addOnPrice;
  }, [selectedService, addOnSelections]);

  const availableStylists = useMemo(() => {
    if (!selectedService) return stylists;
    return stylists.filter((stylist) => stylist.specialties.includes(selectedService.id));
  }, [stylists, selectedService]);

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;

  const bookingsQuery = useQuery({
    queryKey: ["bookings", selectedStylistId, selectedDateKey],
    enabled: Boolean(selectedStylistId && selectedDateKey),
    staleTime: 1000 * 30,
    queryFn: async () => {
      if (!selectedStylistId || !selectedDateKey) return [] as BookingRecord[];
      const { data, error } = await supabase
        .from("bookings")
        .select("*, add_ons:booking_add_ons(add_on_id)")
        .eq("stylist_id", selectedStylistId)
        .eq("appointment_date", selectedDateKey)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data as BookingRowWithAddOns[]).map((row) =>
        mapBooking(row, row.add_ons?.map((addOn) => addOn.add_on_id) ?? []),
      );
    },
  });

  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data]);

  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedStylist || !selectedDate || totalDuration === 0) return [];
    const schedule = getScheduleForDate(selectedStylist, selectedDate);
    if (!schedule) return [];
    return generateSlots(schedule, selectedDate, totalDuration, bookings);
  }, [bookings, selectedDate, selectedService, selectedStylist, totalDuration]);

  useEffect(() => {
    if (selectedTime && !availableSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [availableSlots, selectedTime]);

  const recommendedAddOns = useMemo(() => {
    if (!selectedService) return [] as AddOn[];
    return addOns.filter((addOn) => addOn.recommendedFor.includes(selectedService.id));
  }, [addOns, selectedService]);

  const canAdvanceFromService = Boolean(selectedServiceId);
  const canAdvanceFromSchedule = Boolean(selectedStylistId && selectedDate && selectedTime);
  const detailsValid = useMemo(() => customerSchema.safeParse(customer).success, [customer]);

  const resetFlow = () => {
    setSelectedServiceId(null);
    setSelectedAddOnIds([]);
    setSelectedStylistId(null);
    setSelectedDate(undefined);
    setSelectedTime("");
    resetCustomer(INITIAL_CUSTOMER);
    setCurrentStep(0);
  };

  const bookingMutation = useMutation({
    mutationFn: async (submission: {
      service: Service;
      stylist: Stylist;
      date: string;
      time: string;
      duration: number;
      addOnIds: string[];
      customer: CustomerDetails;
      addOnSelections: AddOn[];
      totalPrice: number;
      confirmationCode: string;
    }) => {
      const { service, stylist, date, time, duration, addOnIds, customer } = submission;
      const { data, error } = await supabase.rpc("create_booking", {
        p_service_id: service.id,
        p_stylist_id: stylist.id,
        p_appointment_date: date,
        p_start_time: time,
        p_duration_minutes: duration,
        p_client_name: customer.name,
        p_client_email: customer.email,
        p_client_phone: customer.phone,
        p_notes: customer.notes ? customer.notes : null,
        p_marketing_consent: customer.marketing,
        p_add_on_ids: addOnIds.length > 0 ? addOnIds : null,
      });
      if (error) throw error;
      return {
        booking: mapBooking(data as Tables<"bookings">, addOnIds),
        submission,
      };
    },
    onMutate: async (variables) => {
      const queryKey = ["bookings", variables.stylist.id, variables.date];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<BookingRecord[]>(queryKey);
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticBooking: BookingRecord = {
        id: optimisticId,
        serviceId: variables.service.id,
        stylistId: variables.stylist.id,
        date: variables.date,
        time: variables.time,
        duration: variables.duration,
        addOnIds: variables.addOnIds,
        clientName: variables.customer.name,
        clientEmail: variables.customer.email,
        clientPhone: variables.customer.phone,
        notes: variables.customer.notes ?? null,
        marketingConsent: variables.customer.marketing,
      };
      queryClient.setQueryData<BookingRecord[]>(queryKey, (current = []) => [...current, optimisticBooking]);
      trackBookingEvent("booking_attempt", {
        serviceId: variables.service.id,
        stylistId: variables.stylist.id,
        appointmentDate: variables.date,
        time: variables.time,
      });
      return { previous, queryKey, optimisticId };
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      trackBookingEvent("booking_failure", {
        message: error.message,
        serviceId: variables.service.id,
        stylistId: variables.stylist.id,
      });
      toast({
        variant: "destructive",
        title: "Unable to confirm booking",
        description: error.message,
      });
    },
    onSuccess: ({ booking, submission }, _variables, context) => {
      const queryKey = context?.queryKey ?? ["bookings", submission.stylist.id, submission.date];
      queryClient.setQueryData<BookingRecord[]>(queryKey, (current = []) => {
        let replaced = false;
        const next = current.map((existing) => {
          if (existing.id === context?.optimisticId) {
            replaced = true;
            return booking;
          }
          return existing;
        });
        return replaced ? next : [...next, booking];
      });
      trackBookingEvent("booking_success", {
        bookingId: booking.id,
        stylistId: booking.stylistId,
      });
      setConfirmation({
        booking,
        service: submission.service,
        stylist: submission.stylist,
        addOnSelections: submission.addOnSelections,
        totalPrice: submission.totalPrice,
        confirmationCode: submission.confirmationCode,
        customer: {
          ...submission.customer,
          notes: submission.customer.notes ?? "",
        },
      });
      toast({
        title: "Booking confirmed",
        description: `${submission.service.name} on ${format(new Date(submission.date), "EEEE, MMMM do")} at ${formatTimeDisplay(
          new Date(submission.date),
          submission.time,
        )} with ${submission.stylist.name}.`,
      });
      resetFlow();
    },
    onSettled: (_data, _error, variables, context) => {
      const stylistId = variables?.stylist.id ?? context?.queryKey?.[1];
      const appointmentDate = variables?.date ?? (context?.queryKey?.[2] as string | undefined);
      if (stylistId && appointmentDate) {
        queryClient.invalidateQueries({ queryKey: ["bookings", stylistId, appointmentDate] });
      }
    },
  });

  const isSubmitting = bookingMutation.isPending;

  const handleConfirmBooking = handleSubmit((values) => {
    if (!selectedService || !selectedStylist || !selectedDate || !selectedTime) {
      return;
    }

    const bookingDate = format(selectedDate, "yyyy-MM-dd");
    const confirmationCode = `BRG-${Math.random().toString(36).slice(-6).toUpperCase()}`;

    bookingMutation.mutate({
      service: selectedService,
      stylist: selectedStylist,
      date: bookingDate,
      time: selectedTime,
      duration: totalDuration,
      addOnIds: selectedAddOnIds,
      customer: { ...values, notes: values.notes?.trim() },
      addOnSelections,
      totalPrice,
      confirmationCode,
    });
  });

  const isReferenceLoading = servicesQuery.isLoading || addOnsQuery.isLoading || stylistsQuery.isLoading;
  const referenceError = servicesQuery.error || addOnsQuery.error || stylistsQuery.error;
  const bookingsLoading = bookingsQuery.isLoading;
  const bookingsError = bookingsQuery.error;
  const referenceErrorMessage =
    referenceError && typeof (referenceError as { message?: unknown }).message === "string"
      ? (referenceError as { message: string }).message
      : "Please refresh and try again.";

  const renderServiceStep = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-primary mb-4">Choose your service</h3>
        <p className="text-muted-foreground max-w-2xl">
          Select from our signature services crafted for Calgary professionals. Pricing includes premium finishing products and a
          personalised consultation.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isReferenceLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-60 rounded-xl" />
            ))
          : services.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedServiceId(service.id);
                    setSelectedAddOnIds([]);
                    setSelectedStylistId(null);
                    setSelectedDate(undefined);
                    setSelectedTime("");
                  }}
                  className={`text-left rounded-xl border transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                      : "border-primary/10 hover:border-primary/30"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={isSelected ? "default" : "outline"}>{service.category}</Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {service.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                    </div>
                    <ul className="text-sm text-muted-foreground grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <span className="text-lg font-semibold text-primary">{formatPrice(service.price)}</span>
                      {isSelected && (
                        <span className="text-xs uppercase tracking-wide text-primary font-semibold">Selected</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
      </div>

      {selectedService && (
        <div className="rounded-2xl border border-primary/20 bg-accent/30 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-primary flex items-center gap-2">
                Enhancements
                <Badge variant="secondary">Optional</Badge>
              </h4>
              <p className="text-muted-foreground text-sm">
                Upgrade your experience with curated treatments designed to complement the {selectedService.name.toLowerCase()}.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">{addOnSelections.length} selected</div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {recommendedAddOns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recommended add-ons for this service.</p>
            ) : (
              recommendedAddOns.map((addOn) => {
                const checked = selectedAddOnIds.includes(addOn.id);
                return (
                  <label
                    key={addOn.id}
                    className={`group flex h-full cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                      checked
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const isChecked = Boolean(value);
                              setSelectedAddOnIds((previous) => {
                                if (isChecked) {
                                  return previous.includes(addOn.id)
                                    ? previous
                                    : [...previous, addOn.id];
                                }
                                return previous.filter((id) => id !== addOn.id);
                              });
                            }}
                          />
                          <span className="font-medium text-primary">{addOn.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {addOn.duration} min
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{addOn.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-primary">{formatPrice(addOn.price)}</span>
                      <Badge variant="outline">Curated for you</Badge>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold text-primary">Reserve your appointment</h3>
        <p className="text-muted-foreground max-w-2xl">
          Select a team member and time that suits you. Availability updates in real-time as bookings are confirmed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {isReferenceLoading
              ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)
              : availableStylists.map((stylist) => {
                  const isSelected = stylist.id === selectedStylistId;
                  return (
                    <button
                      key={stylist.id}
                      type="button"
                      onClick={() => {
                        setSelectedStylistId(stylist.id);
                        if (selectedStylistId !== stylist.id) {
                          setSelectedDate(undefined);
                          setSelectedTime("");
                        }
                      }}
                      className={`rounded-xl border p-5 text-left transition-all duration-300 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-primary">{stylist.name}</p>
                          <p className="text-sm text-muted-foreground">{stylist.title}</p>
                        </div>
                        <Badge variant={isSelected ? "default" : "outline"}>Rating {stylist.rating.toFixed(2)}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{stylist.bio}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {stylist.specialties.slice(0, 3).map((serviceId) => {
                          const service = services.find((item) => item.id === serviceId);
                          return service ? <Badge key={serviceId}>{service.name}</Badge> : null;
                        })}
                      </div>
                      {isSelected && (
                        <p className="mt-4 text-xs uppercase tracking-wide text-primary font-semibold">Selected stylist</p>
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        <div>
          <Card className="border-primary/20 bg-accent/30">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-primary">
                <CalendarDays className="h-5 w-5" /> Select a date
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedStylist
                  ? `Showing availability for ${selectedStylist.name}.`
                  : "Choose a stylist to view their availability."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date ?? undefined);
                  setSelectedTime("");
                }}
                disabled={[
                  { before: startOfToday() },
                  (date) => (selectedStylist ? !stylistWorksOnDate(selectedStylist, date) : false),
                ]}
                className="rounded-xl border border-primary/10"
              />
              <div>
                <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Available time slots
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedStylist && selectedDate ? (
                    bookingsError ? (
                      <p className="col-span-full text-sm text-destructive">
                        We couldn’t load availability. Please try another date or refresh.
                      </p>
                    ) : bookingsLoading ? (
                      Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-10 rounded-md" />
                      ))
                    ) : availableSlots.length > 0 ? (
                      availableSlots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <Button
                            key={slot}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={`justify-center ${isSelected ? "bg-primary" : "bg-background"}`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {formatTimeDisplay(selectedDate, slot)}
                          </Button>
                        );
                      })
                    ) : (
                      <p className="col-span-full text-sm text-muted-foreground">
                        No availability for this day. Choose another date.
                      </p>
                    )
                  ) : (
                    <p className="col-span-full text-sm text-muted-foreground">
                      Select a stylist and date to reveal availability.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <form onSubmit={handleConfirmBooking} className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-primary">Guest information</h3>
        <p className="text-muted-foreground max-w-2xl">
          We'll send your confirmation and appointment reminders to the details below.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name *</Label>
          <Input
            id="name"
            placeholder="Jordan Miles"
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(403) 555-0123"
            aria-invalid={errors.phone ? "true" : "false"}
            {...register("phone")}
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
        <Controller
          name="marketing"
          control={control}
          render={({ field }) => (
            <div className="flex items-start gap-3 pt-6">
              <Checkbox
                id="marketing"
                checked={field.value}
                onCheckedChange={(value) => field.onChange(Boolean(value))}
              />
              <div className="text-sm text-muted-foreground">
                <Label htmlFor="marketing" className="font-medium text-primary">
                  Keep me in the loop
                </Label>
                <p>Receive occasional updates on new releases and limited appointments.</p>
              </div>
            </div>
          )}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Appointment preferences</Label>
        <Textarea
          id="notes"
          placeholder="Tell us about your goals, sensitivities, or anything else you'd like us to know."
          rows={4}
          {...register("notes")}
        />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border/70">
        <Button
          type="button"
          variant="ghost"
          className="sm:order-1 text-primary"
          onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
        >
          Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:order-3 text-sm text-muted-foreground">
          <span className="font-medium text-primary">Review</span>
          <span>
            {selectedService?.name ?? "Select a service"} · {selectedDate ? format(selectedDate, "MMM d") : "--"} ·{' '}
            {selectedDate && selectedTime ? formatTimeDisplay(selectedDate, selectedTime) : "--"}
          </span>
        </div>
        <Button
          type="submit"
          size="lg"
          className="sm:order-2"
          disabled={!detailsValid || isSubmitting}
        >
          {isSubmitting ? "Confirming..." : "Confirm appointment"}
        </Button>
      </div>
    </form>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderServiceStep();
      case 1:
        return renderScheduleStep();
      case 2:
        return renderDetailsStep();
      default:
        return null;
    }
  };

  const stepControls = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/60 pt-4">
      <Button
        type="button"
        variant="ghost"
        className="text-primary"
        onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
        disabled={currentStep === 0}
      >
        Back
      </Button>
      <div className="flex gap-2">
        {currentStep < steps.length - 1 && (
          <Button
            type="button"
            onClick={() => setCurrentStep((step) => Math.min(step + 1, steps.length - 1))}
            disabled={(currentStep === 0 && !canAdvanceFromService) || (currentStep === 1 && !canAdvanceFromSchedule)}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderConfirmation = () => {
    if (!confirmation) return null;
    const confirmationDate = startOfDay(new Date(`${confirmation.booking.date}T00:00:00`));
    return (
      <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/10">
        <CardHeader className="space-y-2 text-center">
          <BadgeCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-serif text-primary">You're all set</CardTitle>
          <p className="text-muted-foreground">
            Confirmation <span className="font-semibold text-primary">{confirmation.confirmationCode}</span> has been emailed to
            {" "}
            {confirmation.customer.email}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-primary/20 bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Service</p>
                <p className="text-lg font-semibold text-primary">{confirmation.service.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Scheduled for</p>
                <p className="text-lg font-semibold text-primary">
                  {format(confirmationDate, "EEE, MMM d")} at {formatTimeDisplay(confirmationDate, confirmation.booking.time)}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <p className="uppercase tracking-wide text-xs text-primary font-semibold">Stylist</p>
                <p>{confirmation.stylist.name}</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-xs text-primary font-semibold">Duration</p>
                <p>{confirmation.booking.duration} minutes</p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-xs text-primary font-semibold">Enhancements</p>
                <p>
                  {confirmation.addOnSelections.length > 0
                    ? confirmation.addOnSelections.map((item) => item.name).join(", ")
                    : "None"}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wide text-xs text-primary font-semibold">Total</p>
                <p className="font-semibold text-primary">{formatPrice(confirmation.totalPrice)}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Need to adjust your booking? Reply to the confirmation email or call us at (403) 555-0123.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmation(null);
                resetCustomer(INITIAL_CUSTOMER);
              }}
            >
              Book another appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SummaryCard = (
    <Card className="border-primary/20 bg-accent/30">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Booking overview</CardTitle>
        <p className="text-sm text-muted-foreground">Your selections update automatically as you move through the steps.</p>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Service</p>
          {selectedService ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-primary">{selectedService.name}</p>
                <Badge>{selectedService.category}</Badge>
              </div>
              <p className="text-muted-foreground">{selectedService.description}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a service to begin building your reservation.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Enhancements</p>
          {addOnSelections.length > 0 ? (
            <ul className="space-y-1">
              {addOnSelections.map((addOn) => (
                <li key={addOn.id} className="flex items-center justify-between">
                  <span>{addOn.name}</span>
                  <span className="text-muted-foreground">{formatPrice(addOn.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No add-ons selected.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Stylist & timing</p>
          <p className="text-muted-foreground">
            {selectedStylist ? selectedStylist.name : "Choose a stylist"}
            {selectedDate && selectedTime && (
              <>
                {" "}
                • {format(selectedDate, "MMM d")} at {formatTimeDisplay(selectedDate, selectedTime)}
              </>
            )}
          </p>
          <p className="text-muted-foreground">Total duration: {totalDuration || "-"} minutes</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Investment</p>
          <div className="flex items-center justify-between text-base font-semibold text-primary">
            <span>Total</span>
            <span>{totalPrice ? formatPrice(totalPrice) : "--"}</span>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Need to know</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-primary mt-0.5" />
              Complimentary beverage service and valet parking for every reservation.
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              Running late? We hold appointments for 10 minutes before rescheduling.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5" />
              Add-ons can be adjusted in-studio subject to timing.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="bg-background px-6 py-24 md:py-32" id="booking">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary tracking-tight">
            Reserve your Bridge experience
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            A refined, guided booking journey for signature cuts, grooming rituals, and modern colour work. Choose your service,
            stylist, and timing in seconds.
          </p>
        </div>

        {referenceError && (
          <Alert variant="destructive">
            <AlertTitle>We hit a snag loading availability</AlertTitle>
            <AlertDescription>{referenceErrorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex items-center justify-center gap-4">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isComplete = index < currentStep;
                    return (
                      <div key={step} className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
                            isActive
                              ? "border-primary bg-primary text-primary-foreground"
                              : isComplete
                                ? "border-primary bg-primary/20 text-primary"
                                : "border-border/80 text-muted-foreground"
                          }`}
                        >
                          {isComplete ? <Check className="h-5 w-5" /> : index + 1}
                        </div>
                        <div className="hidden text-left sm:block">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
                          <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && <div className="hidden h-px w-12 bg-border sm:block" />}
                      </div>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!confirmation && renderStep()}
                {!confirmation && currentStep < steps.length - 1 && stepControls}
                {confirmation && renderConfirmation()}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {SummaryCard}
            <Card className="border-primary/20 bg-background">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Visit the studio</p>
                    <p className="text-sm text-muted-foreground">
                      123 Bridge Street, Bridgeland, Calgary AB T2E 2K8
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Guest services</p>
                    <p className="text-sm text-muted-foreground">(403) 555-0123</p>
                    <p className="text-sm text-muted-foreground">concierge@thebridgeyyc.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
