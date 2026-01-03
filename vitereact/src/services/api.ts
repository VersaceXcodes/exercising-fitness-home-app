import { Category, Workout, Exercise, AuthResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_URL}/workout-categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
  createCategory: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await fetch(`${API_URL}/workout-categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },
  updateCategory: async (id: number | string, data: Partial<Category>): Promise<Category> => {
    const response = await fetch(`${API_URL}/workout-categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },
  deleteCategory: async (id: number | string): Promise<void> => {
    const response = await fetch(`${API_URL}/workout-categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },

  // Workouts
  getWorkouts: async (categoryId: number | null = null): Promise<Workout[]> => {
    const url = categoryId ? `${API_URL}/workouts?category_id=${categoryId}` : `${API_URL}/workouts`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch workouts');
    return response.json();
  },
  getWorkout: async (id: number | string): Promise<Workout> => {
    const response = await fetch(`${API_URL}/workouts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch workout');
    return response.json();
  },
  createWorkout: async (data: Omit<Workout, 'id'>): Promise<Workout> => {
    const response = await fetch(`${API_URL}/workouts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create workout');
    return response.json();
  },
  updateWorkout: async (id: number | string, data: Partial<Workout>): Promise<Workout> => {
    const response = await fetch(`${API_URL}/workouts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update workout');
    return response.json();
  },
  deleteWorkout: async (id: number | string): Promise<void> => {
    const response = await fetch(`${API_URL}/workouts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete workout');
    return response.json();
  },

  // Exercises
  getExercises: async (): Promise<Exercise[]> => {
    const response = await fetch(`${API_URL}/exercises`);
    if (!response.ok) throw new Error('Failed to fetch exercises');
    return response.json();
  },
  getExercise: async (id: number | string): Promise<Exercise> => {
    const response = await fetch(`${API_URL}/exercises/${id}`);
    if (!response.ok) throw new Error('Failed to fetch exercise');
    return response.json();
  },
  createExercise: async (data: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const response = await fetch(`${API_URL}/exercises`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create exercise');
    return response.json();
  },
  updateExercise: async (id: number | string, data: Partial<Exercise>): Promise<Exercise> => {
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update exercise');
    return response.json();
  },
  deleteExercise: async (id: number | string): Promise<void> => {
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete exercise');
    return response.json();
  },

  // Admin
  getAdminStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return response.json();
  },
};
