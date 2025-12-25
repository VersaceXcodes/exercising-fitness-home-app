import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:3000';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error_code?: string;
  [key: string]: any;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password_hash: string;
    name: string;
    phone_number: string;
    role: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request('/api/auth/verify');
  }

  // Profile
  async getProfile() {
    return this.request('/api/auth/me');
  }

  async updateProfile(profileData: { name: string }) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserStats() {
    return this.request('/api/user/stats');
  }

  // Properties
  async getProperties(params?: {
    location?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    price_min?: number;
    price_max?: number;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/api/properties?${queryParams.toString()}`);
  }

  async getProperty(propertyId: string) {
    return this.request(`/api/properties/${propertyId}`);
  }

  async getPropertyPhotos(propertyId: string) {
    return this.request(`/api/properties/${propertyId}/photos`);
  }

  async getPropertyAvailability(propertyId: string, startDate?: string, endDate?: string) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    
    return this.request(`/api/properties/${propertyId}/availability?${queryParams.toString()}`);
  }

  // Users
  async getUser(userId: string) {
    return this.request(`/api/users/${userId}`);
  }

  async getUserListings(userId: string) {
    return this.request(`/api/users/${userId}/listings`);
  }

  async getUserBookings(userId: string, status?: string) {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    
    return this.request(`/api/users/${userId}/bookings?${queryParams.toString()}`);
  }

  // Bookings
  async createBooking(bookingData: {
    property_id: string;
    check_in: string;
    check_out: string;
    guest_count: number;
    total_price: number;
    service_fee: number;
    special_requests?: string;
  }) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBooking(bookingId: string) {
    return this.request(`/api/bookings/${bookingId}`);
  }

  async updateBooking(bookingId: string, updates: any) {
    return this.request(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Reviews
  async getPropertyReviews(propertyId: string) {
    return this.request(`/api/properties/${propertyId}/reviews`);
  }

  async createReview(bookingId: string, reviewData: {
    cleanliness_rating: number;
    accuracy_rating: number;
    communication_rating: number;
    location_rating: number;
    check_in_rating: number;
    value_rating: number;
    overall_rating: number;
    comment: string;
  }) {
    return this.request(`/api/bookings/${bookingId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Conversations
  async getConversations() {
    return this.request('/api/conversations');
  }

  async getConversation(conversationId: string) {
    return this.request(`/api/conversations/${conversationId}`);
  }

  async getMessages(conversationId: string, limit = 20, offset = 0) {
    return this.request(`/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Notifications
  async getNotifications(limit = 10, offset = 0, isRead?: boolean) {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    if (isRead !== undefined) {
      queryParams.append('is_read', isRead.toString());
    }
    
    return this.request(`/api/notifications?${queryParams.toString()}`);
  }

  async updateNotification(notificationId: string, updates: any) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Favorites
  async getFavorites() {
    return this.request('/api/favorites');
  }

  async addFavorite(workoutId: number) {
    return this.request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ workout_id: workoutId }),
    });
  }

  async removeFavorite(workoutId: number) {
    return this.request(`/api/favorites/${workoutId}`, {
      method: 'DELETE',
    });
  }

  // Workouts
  async getWorkoutCategories() {
    const response = await this.request('/api/workout-categories');
    this.saveToCache('workout_categories', response);
    return response;
  }


  async getWorkouts(params?: number | { categoryId?: number; search?: string; difficulty?: string }) {
    const queryParams = new URLSearchParams();
    
    if (typeof params === 'number') {
      queryParams.append('category_id', params.toString());
    } else if (params) {
      if (params.categoryId) queryParams.append('category_id', params.categoryId.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    }
    
    const response = await this.request(`/api/workouts?${queryParams.toString()}`);
    
    // Create a cache key based on params
    const cacheKey = `workouts_${JSON.stringify(params || 'all')}`;
    this.saveToCache(cacheKey, response);
    
    return response;
  }

  async getWorkout(workoutId: number | string) {
    return this.request(`/api/workouts/${workoutId}`);
  }

  async getWorkoutExercises(workoutId: number) {
    return this.request(`/api/workouts/${workoutId}/exercises`);
  }

  async logWorkout(logData: {
    workout_id: number;
    duration_seconds: number;
    exercises: any[];
    user_id?: number;
  }) {
    return this.request('/api/workout-logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
  }

  async getWorkoutLogs() {
    return this.request('/api/workout-logs');
  }

  // Caching
  async saveToCache(key: string, data: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get from cache:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();
