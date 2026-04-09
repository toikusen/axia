create table if not exists admin_whitelist (
  email text primary key
);

alter table admin_whitelist enable row level security;

-- Authenticated users can only check their own email
create policy "authenticated read own whitelist entry" on admin_whitelist
  for select to authenticated
  using ((auth.jwt() ->> 'email') = email);

-- Admin email whitelist seed
insert into admin_whitelist (email) values ('tuyucheng0407@gmail.com')
on conflict (email) do nothing;
