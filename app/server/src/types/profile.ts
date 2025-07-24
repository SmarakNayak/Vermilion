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