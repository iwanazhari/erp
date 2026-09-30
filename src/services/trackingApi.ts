import { privateApi } from './authApi';

export interface ActiveSession {
  userId: string;
  name: string;
  lastLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  clockIn: string;
  totalPoints: number;
}

export interface TrackingPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
  bearing?: number;
  altitude?: number;
}

export interface UserTrackingData {
  userId: string;
  userName: string;
  date: string;
  totalPoints: number;
  totalDistance: number;
  locations: TrackingPoint[];
}

export const trackingApi = {
  getActiveSessions: async (): Promise<ActiveSession[]> => {
    const response = await privateApi.get('/admin/tracking/active');
    return response.data.data;
  },

  getUserTracking: async (userId: string, date?: string): Promise<UserTrackingData> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const response = await privateApi.get(`/admin/tracking/${userId}?${params}`);
    return response.data.data;
  },
};
