export interface Category {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

export interface Workout {
  id: number;
  category_id: number;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  difficulty_level: string | null;
  image_url: string | null;
}

export interface Exercise {
  id: number;
  name: string;
  description: string | null;
  target_muscle_group: string | null;
  video_url: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
