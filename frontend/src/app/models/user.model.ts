export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'guest';
  isActive: boolean;
  theme: Theme;
  avatar?: string;
  guestExpiresAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user' | 'guest';
}

export interface UpdateProfileRequest {
  email?: string;
  fullName?: string;
  theme?: Theme;
  currentPassword?: string;
  newPassword?: string;
}

export type Theme = 'light' | 'dark' | 'sepia' | 'pastel';
