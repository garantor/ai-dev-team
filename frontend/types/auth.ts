export interface User {
  id: string;
  email: string;
  name: string;
  university: string;
  fitnessGoals?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  university: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  fitnessGoals?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
}
