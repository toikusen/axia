-- supabase/migrations/001_initial_schema.sql

-- 啟用 UUID 擴充
create extension if not exists "pgcrypto";

-- 消息
create table information (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_rich_text text not null default '',
  cover_image_url text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 行程
create table schedule (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_date timestamptz not null,
  venue text not null,
  ticket_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 成員
create table member (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text,
  bio text not null default '',
  color_hex text not null default '#c8a882',
  sns_links jsonb not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 影片
create table video (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text not null,
  thumbnail_url text,
  description text,
  is_featured boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 作品
create table discography (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_image_url text,
  release_date date not null,
  type text not null check (type in ('single', 'ep', 'album')),
  streaming_links jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 商品
create table goods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  description text,
  purchase_url text,
  is_sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 靜態頁面（Rules 多頁、Contact）
create table static_page (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content_rich_text text not null default '',
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 首頁設定
create table home_settings (
  id uuid primary key default gen_random_uuid(),
  hero_image_url text,
  sns_links jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- 聯絡表單提交紀錄
create table contact_submission (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  submitted_at timestamptz not null default now()
);

-- 初始資料
insert into home_settings (hero_image_url, sns_links) values (
  null,
  '{"instagram": "", "twitter": "", "youtube": "", "tiktok": ""}'
);

insert into static_page (slug, title, content_rich_text, sort_order) values
  ('fan-rules', '粉絲守則', '<p>請在此編輯粉絲守則內容。</p>', 1),
  ('privacy', '隱私權政策', '<p>請在此編輯隱私政策內容。</p>', 2);

-- Seed 測試資料（方便開發）
insert into member (name, bio, color_hex, sort_order) values
  ('成員一', '個人簡介', '#c8a882', 1),
  ('成員二', '個人簡介', '#9ab0c8', 2),
  ('成員三', '個人簡介', '#a8c89a', 3),
  ('成員四', '個人簡介', '#c8a09a', 4);

insert into information (title, content_rich_text, status, published_at) values
  ('AXIA 官方網站開幕', '<p>感謝各位的支持！</p>', 'published', now());

insert into schedule (event_name, event_date, venue) values
  ('AXIA 首次見面會', now() + interval '30 days', '台北');
