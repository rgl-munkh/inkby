-- Artists table (linked to auth.users)
create table public.artists (
  id uuid references auth.users(id) on delete cascade primary key,
  slug text unique not null,
  display_name text,
  instagram_username text,
  deposit_amount numeric(12, 2),
  studio_location text,
  studio_lat double precision,
  studio_lng double precision,
  avatar_url text,
  bio text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Booking requests from users
create table public.booking_requests (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references public.artists(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  idea_description text not null,
  tattoo_size text not null,
  placement text not null,
  status text default 'pending' check (status in ('pending', 'scheduled', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reference photos for booking requests
create table public.booking_request_photos (
  id uuid default gen_random_uuid() primary key,
  booking_request_id uuid references public.booking_requests(id) on delete cascade not null,
  photo_url text not null,
  created_at timestamptz default now()
);

-- Artist's schedule proposals for a booking request
create table public.booking_schedules (
  id uuid default gen_random_uuid() primary key,
  booking_request_id uuid references public.booking_requests(id) on delete cascade not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  duration_minutes integer not null,
  suggested_datetime timestamptz not null,
  low_amount numeric(12, 2) not null,
  high_amount numeric(12, 2) not null,
  message text,
  private_note text,
  created_at timestamptz default now()
);

-- Confirmed appointments
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  booking_request_id uuid references public.booking_requests(id) on delete cascade not null,
  schedule_id uuid references public.booking_schedules(id) on delete cascade not null,
  artist_id uuid references public.artists(id) on delete cascade not null,
  chosen_datetime timestamptz not null,
  status text default 'pending_payment' check (status in ('pending_payment', 'paid', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flash deals
create table public.flash_deals (
  id uuid default gen_random_uuid() primary key,
  artist_id uuid references public.artists(id) on delete cascade not null,
  photo_url text not null,
  title text,
  description text,
  is_repeatable boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Flash deal size options
create table public.flash_deal_sizes (
  id uuid default gen_random_uuid() primary key,
  flash_deal_id uuid references public.flash_deals(id) on delete cascade not null,
  size_label text not null,
  estimated_amount numeric(12, 2) not null
);

-- Payments
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  qpay_invoice_id text,
  amount numeric(12, 2) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index idx_artists_slug on public.artists(slug);
create index idx_booking_requests_artist on public.booking_requests(artist_id);
create index idx_booking_requests_status on public.booking_requests(status);
create index idx_booking_schedules_request on public.booking_schedules(booking_request_id);
create index idx_appointments_artist on public.appointments(artist_id);
create index idx_appointments_datetime on public.appointments(chosen_datetime);
create index idx_flash_deals_artist on public.flash_deals(artist_id);
create index idx_payments_appointment on public.payments(appointment_id);

-- RLS
alter table public.artists enable row level security;
alter table public.booking_requests enable row level security;
alter table public.booking_request_photos enable row level security;
alter table public.booking_schedules enable row level security;
alter table public.appointments enable row level security;
alter table public.flash_deals enable row level security;
alter table public.flash_deal_sizes enable row level security;
alter table public.payments enable row level security;

-- Artists: public read, owner write
create policy "Artists are publicly readable"
  on public.artists for select using (true);

create policy "Artists can update own profile"
  on public.artists for update using (auth.uid() = id);

create policy "Artists can insert own profile"
  on public.artists for insert with check (auth.uid() = id);

-- Booking requests: anyone can insert, owning artist can read/update
create policy "Anyone can create a booking request"
  on public.booking_requests for insert with check (true);

create policy "Artists can read their booking requests"
  on public.booking_requests for select using (auth.uid() = artist_id);

create policy "Artists can update their booking requests"
  on public.booking_requests for update using (auth.uid() = artist_id);

-- Anon can read their own request by ID (for confirmation flow)
create policy "Anyone can read booking request by id"
  on public.booking_requests for select using (true);

-- Booking request photos: anyone can insert, owning artist can read
create policy "Anyone can upload booking photos"
  on public.booking_request_photos for insert with check (true);

create policy "Booking photos are readable"
  on public.booking_request_photos for select using (true);

-- Booking schedules: artist can CRUD, public can read (for confirmation)
create policy "Artists can create schedules"
  on public.booking_schedules for insert with check (auth.uid() = artist_id);

create policy "Artists can update schedules"
  on public.booking_schedules for update using (auth.uid() = artist_id);

create policy "Schedules are readable"
  on public.booking_schedules for select using (true);

-- Appointments: artist read, public insert (via confirmation)
create policy "Anyone can create an appointment"
  on public.appointments for insert with check (true);

create policy "Appointments are readable"
  on public.appointments for select using (true);

create policy "Artists can update their appointments"
  on public.appointments for update using (auth.uid() = artist_id);

-- Flash deals: artist CRUD, public read
create policy "Flash deals are publicly readable"
  on public.flash_deals for select using (true);

create policy "Artists can create flash deals"
  on public.flash_deals for insert with check (auth.uid() = artist_id);

create policy "Artists can update flash deals"
  on public.flash_deals for update using (auth.uid() = artist_id);

create policy "Artists can delete flash deals"
  on public.flash_deals for delete using (auth.uid() = artist_id);

-- Flash deal sizes: public read, artist write via cascade
create policy "Flash deal sizes are publicly readable"
  on public.flash_deal_sizes for select using (true);

create policy "Artists can manage flash deal sizes"
  on public.flash_deal_sizes for insert with check (
    exists (
      select 1 from public.flash_deals
      where flash_deals.id = flash_deal_id and flash_deals.artist_id = auth.uid()
    )
  );

create policy "Artists can update flash deal sizes"
  on public.flash_deal_sizes for update using (
    exists (
      select 1 from public.flash_deals
      where flash_deals.id = flash_deal_id and flash_deals.artist_id = auth.uid()
    )
  );

create policy "Artists can delete flash deal sizes"
  on public.flash_deal_sizes for delete using (
    exists (
      select 1 from public.flash_deals
      where flash_deals.id = flash_deal_id and flash_deals.artist_id = auth.uid()
    )
  );

-- Payments: readable, service role insert/update only (handled server-side)
create policy "Payments are readable"
  on public.payments for select using (true);

create policy "Service can manage payments"
  on public.payments for insert with check (true);

create policy "Service can update payments"
  on public.payments for update using (true);

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_artists_updated_at
  before update on public.artists
  for each row execute function public.set_updated_at();

create trigger set_booking_requests_updated_at
  before update on public.booking_requests
  for each row execute function public.set_updated_at();

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create trigger set_flash_deals_updated_at
  before update on public.flash_deals
  for each row execute function public.set_updated_at();

-- Storage buckets
insert into storage.buckets (id, name, public) values ('reference-photos', 'reference-photos', true);
insert into storage.buckets (id, name, public) values ('flash-deal-photos', 'flash-deal-photos', true);
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies
create policy "Anyone can upload reference photos"
  on storage.objects for insert with check (bucket_id = 'reference-photos');

create policy "Reference photos are publicly readable"
  on storage.objects for select using (bucket_id = 'reference-photos');

create policy "Artists can upload flash deal photos"
  on storage.objects for insert with check (bucket_id = 'flash-deal-photos');

create policy "Flash deal photos are publicly readable"
  on storage.objects for select using (bucket_id = 'flash-deal-photos');

create policy "Artists can upload avatars"
  on storage.objects for insert with check (bucket_id = 'avatars');

create policy "Avatars are publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');
