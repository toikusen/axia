-- supabase/migrations/002_rls_policies.sql
-- Run this AFTER 001_initial_schema.sql in Supabase Dashboard

-- 允許所有人讀取公開資料
alter table information enable row level security;
alter table schedule enable row level security;
alter table member enable row level security;
alter table video enable row level security;
alter table discography enable row level security;
alter table goods enable row level security;
alter table static_page enable row level security;
alter table home_settings enable row level security;
alter table contact_submission enable row level security;

-- 公開讀取政策
create policy "public read information" on information for select using (status = 'published');
create policy "public read schedule" on schedule for select using (true);
create policy "public read member" on member for select using (true);
create policy "public read video" on video for select using (true);
create policy "public read discography" on discography for select using (true);
create policy "public read goods" on goods for select using (true);
create policy "public read static_page" on static_page for select using (true);
create policy "public read home_settings" on home_settings for select using (true);

-- contact_submission: 只允許匿名 insert，不允許公開 select
create policy "public insert contact" on contact_submission for insert with check (true);
