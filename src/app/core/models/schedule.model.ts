export interface Schedule {
  id: string;
  event_name: string;
  event_date: string;
  venue: string;
  ticket_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
