export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  college_id: string;
  department: string;
  year?: string;
  role: UserRole;
  profile_image?: string;
  is_flagged: boolean;
  false_claims_count: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  slug: string;
  description?: string;
}

export interface CampusLocation {
  id: number;
  name: string;
  description: string;
  building: string;
  zone: string;
  map_x: number; // percentage 0-100 for campus map layout
  map_y: number; // percentage 0-100
}

export type ItemType = 'lost' | 'found';

export type ItemStatus =
  | 'lost'
  | 'found'
  | 'possible_match'
  | 'claim_pending'
  | 'verified'
  | 'returned'
  | 'closed';

export interface Item {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_role?: UserRole;
  type: ItemType;
  title: string;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  description: string;
  brand?: string;
  color?: string;
  model?: string;
  location_id: number;
  location_name?: string;
  date: string;
  approximate_time?: string;
  image_url?: string;
  status: ItemStatus;
  private_details?: string; // Hidden from public if found item
  reward?: string;
  storage_location?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export type ClaimStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'completed';

export interface Claim {
  id: number;
  item_id: number;
  item_title?: string;
  item_type?: ItemType;
  item_image?: string;
  claimant_id: number;
  claimant_name?: string;
  claimant_email?: string;
  claimant_college_id?: string;
  item_owner_id?: number;
  verification_answers: {
    contents_or_unique_marks?: string;
    colors_or_accents?: string;
    serial_or_identifying_code?: string;
    additional_proof?: string;
  };
  status: ClaimStatus;
  reviewed_by?: number;
  reviewer_name?: string;
  admin_notes?: string;
  private_details?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name?: string;
  receiver_id: number;
  receiver_name?: string;
  item_id?: number;
  item_title?: string;
  message: string;
  created_at: string;
  read_status: boolean;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'match' | 'claim' | 'claim_status' | 'message' | 'returned' | 'admin';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: number;
  reported_by: number;
  reporter_name?: string;
  item_id: number;
  item_title?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export interface MatchScore {
  lostItem: Item;
  foundItem: Item;
  score: number; // 0 - 100 percentage
  breakdown: {
    categoryMatch: boolean;
    categoryScore: number;
    keywordScore: number;
    locationMatch: boolean;
    locationScore: number;
    colorMatch: boolean;
    colorScore: number;
    brandMatch: boolean;
    brandScore: number;
    dateScore: number;
  };
}

export interface SystemStats {
  totalUsers: number;
  totalLost: number;
  totalFound: number;
  activeClaims: number;
  returnedItems: number;
  pendingReports: number;
  recoveryRatePercent: number;
  itemsByCategory: { name: string; count: number }[];
  itemsByLocation: { name: string; count: number }[];
  recentActivity: {
    type: 'lost' | 'found' | 'claim' | 'returned';
    title: string;
    date: string;
  }[];
}
