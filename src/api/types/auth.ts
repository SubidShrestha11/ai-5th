export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  display_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: ApiUser;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface ApiUser {
  id: string | number;
  username: string;
  display_name: string;
  email: string;
  bio: string | null;
  profile_image: string | null;
  date_joined: string;
  movies_watched?: number;
}

export interface UpdateProfileRequest {
  bio?: string | null;
  profile_image?: string | null;
  display_name?: string;
}
