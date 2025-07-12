export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  points: number;
  role: 'user' | 'admin';
  bio?: string;
  location?: string;
  joined_date: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  points: number;
  role: 'user' | 'admin';
  bio?: string;
  location?: string;
  joined_date: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  category_name: string;
  type: string;
  size: string;
  condition: 'Excellent' | 'Very Good' | 'Good' | 'Fair';
  tags: string[];
  images: string[];
  uploader_id: string;
  uploader_name?: string;
  uploader_avatar?: string;
  points_value: number;
  status: 'available' | 'pending' | 'swapped' | 'redeemed';
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  requester_name?: string;
  item_id: string;
  item_title?: string;
  item_images?: string[];
  item_points_value?: number;
  offered_item_ids?: string[];
  item_uploader_id?: string;
  offered_item_id?: string; // for legacy support
  offered_item_title?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
  offered_items?: Array<{
    id: string;
    title: string;
    images: string[];
    points_value: number;
  }>;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned' | 'spent' | 'bonus';
  description: string;
  item_id?: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}