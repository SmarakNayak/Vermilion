// Profile API Types
export interface CreateProfileRequest {
  user_handle: string;
  user_name: string;
  user_picture?: string;
  user_bio?: string;
  user_twitter?: string;
  user_discord?: string;
  user_website?: string;
}

export interface UpdateProfileRequest {
  user_id: string;
  user_handle?: string;
  user_name?: string;
  user_picture?: string;
  user_bio?: string;
  user_twitter?: string;
  user_discord?: string;
  user_website?: string;
}

export interface ProfileResponse {
  user_id: string;
  user_handle: string;
  user_name: string;
  user_picture?: string;
  user_bio?: string;
  user_twitter?: string;
  user_discord?: string;
  user_website?: string;
  user_created_at: string;
  user_updated_at: string;
  user_addresses?: string[];
}

export interface ProfileErrorResponse {
  error: string;
}

// Database types
export interface ProfileRow {
  user_id: string;
  user_handle: string;
  user_name: string;
  user_picture?: string;
  user_bio?: string;
  user_twitter?: string;
  user_discord?: string;
  user_website?: string;
  user_created_at: Date;
  user_updated_at: Date;
}

export interface ProfileAddressRow {
  user_id: string;
  user_address: string;
  created_at: Date;
}