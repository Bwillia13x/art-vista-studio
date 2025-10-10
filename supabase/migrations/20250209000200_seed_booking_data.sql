insert into services (id, name, description, duration_minutes, price_cents, category, includes) values
  ('signature-cut', 'Signature Cut', 'A precision haircut tailored to your features, completed with a relaxing hot towel finish and premium styling products.', 60, 6500, 'cut', ARRAY['Consultation', 'Precision cut', 'Hot towel finish', 'Style & product guidance']),
  ('classic-fade', 'Classic Fade', 'Skin fade or taper expertly blended with detailed line work and styling.', 45, 7000, 'cut', ARRAY['Clipper & scissor blend', 'Neck shave', 'Finishing style']),
  ('traditional-shave', 'Traditional Shave', 'The ultimate straight-razor experience with hot towels, facial massage, and post-shave treatment.', 45, 5500, 'shave', ARRAY['Skin analysis', 'Hot & cold towels', 'Straight razor shave', 'Facial massage']),
  ('beard-sculpting', 'Beard Sculpting', 'Detailed beard shaping with steam treatment, razor line-up, and conditioning.', 30, 4500, 'cut', ARRAY['Precision shaping', 'Line-up', 'Steam treatment', 'Conditioning']),
  ('grey-blending', 'Grey Blending', 'Subtle colour blending to soften greys while maintaining a natural look.', 50, 8500, 'color', ARRAY['Consultation', 'Custom colour blend', 'Toner', 'Style finish']),
  ('executive-package', 'Executive Package', 'Signature cut, traditional shave, and scalp massage for the full Bridge experience.', 105, 19500, 'package', ARRAY['Signature cut', 'Traditional shave', 'Scalp massage', 'Beverage service']);

insert into add_ons (id, name, description, duration_minutes, price_cents, recommended_for) values
  ('scalp-massage', 'Therapeutic Scalp Massage', '10-minute targeted massage with essential oils to relieve tension.', 10, 2000, ARRAY['signature-cut', 'executive-package']),
  ('express-facial', 'Express Facial Refresh', 'Deep cleanse, exfoliation, and hydration treatment.', 15, 2800, ARRAY['traditional-shave', 'executive-package']),
  ('brow-detailing', 'Brow Detailing', 'Sharpened brow line and grooming to frame your face.', 10, 1800, ARRAY['classic-fade', 'signature-cut', 'grey-blending']),
  ('deluxe-wash', 'Deluxe Wash & Style', 'Extended wash, conditioning treatment, and styling tutorial.', 15, 2500, ARRAY['signature-cut', 'classic-fade', 'executive-package']);

insert into stylists (id, name, title, bio, years_experience, rating) values
  ('leon', 'Leon Chambers', 'Master Barber', 'Fade specialist known for precision detailing and executive grooming experiences.', 14, 4.90),
  ('maya', 'Maya Torres', 'Senior Stylist', 'Colour blending expert bringing modern texture and movement to every cut.', 9, 4.80),
  ('amir', 'Amir Patel', 'Ritual Shaving Specialist', 'Meticulous grooming focused on skin health and premium shave rituals.', 11, 4.95);

insert into stylist_specialties (stylist_id, service_id) values
  ('leon', 'signature-cut'),
  ('leon', 'classic-fade'),
  ('leon', 'executive-package'),
  ('leon', 'beard-sculpting'),
  ('maya', 'signature-cut'),
  ('maya', 'grey-blending'),
  ('maya', 'classic-fade'),
  ('maya', 'executive-package'),
  ('amir', 'traditional-shave'),
  ('amir', 'beard-sculpting'),
  ('amir', 'executive-package');

-- Schedules and breaks
with leon_monday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('leon', 1, '09:00', '17:30') returning id
),
leon_tuesday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('leon', 2, '11:00', '19:00') returning id
),
leon_thursday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('leon', 4, '09:00', '18:00') returning id
),
leon_friday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('leon', 5, '10:00', '16:00') returning id
),
maya_sunday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('maya', 0, '10:00', '16:00') returning id
),
maya_tuesday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('maya', 2, '09:30', '18:30') returning id
),
maya_wednesday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('maya', 3, '11:00', '20:00') returning id
),
maya_saturday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('maya', 6, '09:00', '15:00') returning id
),
amir_monday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('amir', 1, '10:00', '18:00') returning id
),
amir_wednesday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('amir', 3, '09:00', '17:30') returning id
),
amir_friday as (
  insert into stylist_schedules (stylist_id, day_of_week, block_start, block_end)
  values ('amir', 5, '11:00', '19:30') returning id
)
insert into stylist_schedule_breaks (schedule_id, break_start, break_end)
select id, '13:00', '14:00' from leon_monday
union all
select id, '15:00', '15:30' from leon_tuesday
union all
select id, '12:30', '13:00' from leon_thursday
union all
select id, '14:00', '14:30' from amir_monday
union all
select id, '12:00', '12:30' from amir_wednesday
union all
select id, '16:30', '17:00' from amir_friday
union all
select id, '13:30', '14:00' from maya_tuesday
union all
select id, '16:00', '16:30' from maya_wednesday;

-- Seed a handful of upcoming bookings to power availability scenarios
with initial_bookings as (
  select
    jsonb_build_object(
      'service_id', 'signature-cut',
      'stylist_id', 'leon',
      'duration_minutes', 60,
      'add_on_ids', array['deluxe-wash']::text[],
      'client_name', 'Jordan Miles',
      'client_email', 'jordan.miles@example.com',
      'client_phone', '+1 (403) 555-0101',
      'notes', 'Prefers quiet chair',
      'marketing_consent', false
    ) as payload,
    (current_date + interval '1 day')::date as appointment_date,
    '10:00'::time as start_time
  union all
  select
    jsonb_build_object(
      'service_id', 'traditional-shave',
      'stylist_id', 'amir',
      'duration_minutes', 45,
      'add_on_ids', array['express-facial']::text[],
      'client_name', 'Phillip West',
      'client_email', 'phillip.west@example.com',
      'client_phone', '+1 (587) 555-0102',
      'notes', 'Wants product recommendations',
      'marketing_consent', true
    ),
    (current_date + interval '1 day')::date,
    '14:30'::time
  union all
  select
    jsonb_build_object(
      'service_id', 'grey-blending',
      'stylist_id', 'maya',
      'duration_minutes', 50,
      'add_on_ids', array[]::text[],
      'client_name', 'Chris Lee',
      'client_email', 'chris.lee@example.com',
      'client_phone', '+1 (825) 555-0103',
      'notes', null,
      'marketing_consent', false
    ),
    (current_date + interval '3 day')::date,
    '13:30'::time
)
select
  create_booking(
    (payload->>'service_id'),
    (payload->>'stylist_id'),
    appointment_date,
    start_time,
    (payload->>'duration_minutes')::integer,
    (payload->>'client_name'),
    (payload->>'client_email'),
    (payload->>'client_phone'),
    payload->>'notes',
    coalesce((payload->>'marketing_consent')::boolean, false),
    array(select jsonb_array_elements_text(payload->'add_on_ids'))
  )
from initial_bookings;
