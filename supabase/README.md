# Supabase Migrations

## Setup Instructions

1. Go to [Supabase Dashboard](https://supabase.com) → Your Project → SQL Editor
2. Run `001_initial_schema.sql` first (creates all tables + seed data)
3. Run `002_rls_policies.sql` second (enables RLS + public read policies)

## Tables

| Table | Description |
|-------|-------------|
| information | News/announcements |
| schedule | Live events and appearances |
| member | Group members (dynamic) |
| video | YouTube video links |
| discography | Singles, EPs, albums |
| goods | Merchandise items |
| static_page | RULES pages (fan-rules, privacy, etc.) |
| home_settings | Homepage hero image + SNS links |
| contact_submission | Contact form submissions |
