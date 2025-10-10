-- Create foundational extensions
create extension if not exists "pgcrypto";

-- Service categories enum
create type service_category as enum ('cut', 'shave', 'color', 'package');

-- Core reference tables
create table services (
  id text primary key,
  name text not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  category service_category not null,
  includes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table add_ons (
  id text primary key,
  name text not null,
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  recommended_for text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table stylists (
  id text primary key,
  name text not null,
  title text not null,
  bio text not null,
  years_experience integer not null check (years_experience >= 0),
  rating numeric(3,2) not null check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now()
);

create table stylist_specialties (
  id bigserial primary key,
  stylist_id text not null references stylists(id) on delete cascade,
  service_id text not null references services(id) on delete cascade,
  unique (stylist_id, service_id)
);

create table stylist_schedules (
  id bigserial primary key,
  stylist_id text not null references stylists(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  block_start time not null,
  block_end time not null,
  check (block_end > block_start)
);

create table stylist_schedule_breaks (
  id bigserial primary key,
  schedule_id bigint not null references stylist_schedules(id) on delete cascade,
  break_start time not null,
  break_end time not null,
  check (break_end > break_start)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references services(id) on delete restrict,
  stylist_id text not null references stylists(id) on delete restrict,
  appointment_date date not null,
  start_time time not null,
  duration_minutes integer not null check (duration_minutes > 0),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  notes text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table booking_add_ons (
  id bigserial primary key,
  booking_id uuid not null references bookings(id) on delete cascade,
  add_on_id text not null references add_ons(id) on delete restrict,
  unique (booking_id, add_on_id)
);

-- Helpful indexes
create index services_category_idx on services (category);
create index add_ons_recommended_for_idx on add_ons using gin (recommended_for);
create index stylist_specialties_stylist_idx on stylist_specialties (stylist_id);
create index stylist_schedules_stylist_idx on stylist_schedules (stylist_id, day_of_week);
create index stylist_schedule_breaks_schedule_idx on stylist_schedule_breaks (schedule_id);
create index bookings_lookup_idx on bookings (stylist_id, appointment_date, start_time);

-- Triggers
create function set_bookings_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_bookings_updated_at
  before update on bookings
  for each row
  execute procedure set_bookings_updated_at();

-- Enable row level security and policies
alter table services enable row level security;
alter table add_ons enable row level security;
alter table stylists enable row level security;
alter table stylist_specialties enable row level security;
alter table stylist_schedules enable row level security;
alter table stylist_schedule_breaks enable row level security;
alter table bookings enable row level security;
alter table booking_add_ons enable row level security;

create policy "Services are public" on services for select using (true);
create policy "Add-ons are public" on add_ons for select using (true);
create policy "Stylists are public" on stylists for select using (true);
create policy "Stylist specialties are public" on stylist_specialties for select using (true);
create policy "Stylist schedules are public" on stylist_schedules for select using (true);
create policy "Stylist breaks are public" on stylist_schedule_breaks for select using (true);

create policy "Read bookings" on bookings for select using (true);
create policy "Create bookings" on bookings for insert with check (true);

create policy "Read booking add-ons" on booking_add_ons for select using (true);
create policy "Insert booking add-ons" on booking_add_ons for insert with check (true);

-- Transactional RPC to create bookings with add-ons
create or replace function public.create_booking(
  p_service_id text,
  p_stylist_id text,
  p_appointment_date date,
  p_start_time time,
  p_duration_minutes integer,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_notes text,
  p_marketing_consent boolean,
  p_add_on_ids text[]
) returns bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking bookings;
begin
  insert into bookings (
    service_id,
    stylist_id,
    appointment_date,
    start_time,
    duration_minutes,
    client_name,
    client_email,
    client_phone,
    notes,
    marketing_consent
  ) values (
    p_service_id,
    p_stylist_id,
    p_appointment_date,
    p_start_time,
    p_duration_minutes,
    p_client_name,
    p_client_email,
    p_client_phone,
    p_notes,
    coalesce(p_marketing_consent, false)
  )
  returning * into new_booking;

  if p_add_on_ids is not null then
    insert into booking_add_ons (booking_id, add_on_id)
    select new_booking.id, unnest(p_add_on_ids);
  end if;

  return new_booking;
exception when others then
  if new_booking.id is not null then
    delete from bookings where id = new_booking.id;
  end if;
  raise;
end;
$$;

revoke all on function public.create_booking(text, text, date, time, integer, text, text, text, text, boolean, text[]) from public;
grant execute on function public.create_booking(text, text, date, time, integer, text, text, text, text, boolean, text[]) to anon;
