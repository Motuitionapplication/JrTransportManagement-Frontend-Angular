// Authentication Models

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string[];
  vehicleNumber?: string;
  dlNumber?: string;
  address?: string;
  age?: string | number;
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface MessageResponse {
  message: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles: string[];
  role?: string;
  avatarUrl?: string;
  driverId?: string;
}

export interface DriverProfileSummary {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
}
