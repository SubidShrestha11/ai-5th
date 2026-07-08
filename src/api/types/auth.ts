export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
}

/** JWT auth response — tokens may sit alongside a nested or flat user profile. */
export interface AuthResponse extends Partial<UserProfile> {
  user?: UserProfile;
  access?: string;
  refresh?: string;
}

/** Matches OpenAPI UserProfile */
export interface UserProfile {
  id: string;
  email: string;
  bio: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  profile_image?: File | null;
}

/** @deprecated Use UserProfile */
export type ApiUser = UserProfile;
