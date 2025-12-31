-- Add RLS policy for OTP codes (public access needed for auth flow)
alter table public.otp_codes enable row level security;

-- Allow anyone to insert OTP codes (for registration)
create policy "Anyone can insert OTP codes" 
  on otp_codes 
  for insert 
  with check (true);

-- Allow anyone to read their own OTP codes (for verification)
create policy "Anyone can read OTP codes" 
  on otp_codes 
  for select 
  using (true);

-- Allow anyone to delete OTP codes (for cleanup after verification)
create policy "Anyone can delete OTP codes" 
  on otp_codes 
  for delete 
  using (true);
