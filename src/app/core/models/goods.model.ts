export interface Goods {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  purchase_url: string | null;
  is_sold_out: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
