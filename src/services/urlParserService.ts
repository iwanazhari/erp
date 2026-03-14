import { privateApi } from './authApi';
import type { ParseMapsUrlRequest, ParseMapsUrlResponse } from '@/shared/types/schedule';

/**
 * Google Maps URL Parser Service
 *
 * Parses Google Maps URLs (including shortened URLs like maps.app.goo.gl)
 * and extracts latitude/longitude coordinates.
 *
 * Backend Endpoint: POST /api/parse-maps-url
 */
export const urlParserService = {
  /**
   * Parse a Google Maps URL to extract coordinates
   *
   * @param url - Google Maps URL (supports shortened and full URLs)
   * @returns Promise with parsed coordinates
   *
   * @example
   * ```typescript
   * const coords = await urlParserService.parseMapsUrl('https://maps.app.goo.gl/abc123');
   * console.log(`Lat: ${coords.latitude}, Lng: ${coords.longitude}`);
   * ```
   */
  parseMapsUrl: async (url: string): Promise<ParseMapsUrlResponse['data']> => {
    try {
      const response = await privateApi.post<ParseMapsUrlResponse>(
        '/parse-maps-url',
        { url } as ParseMapsUrlRequest
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse URL');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        // Handle axios errors
        const axiosError = error as any;
        
        // Check for 404 - endpoint not found
        if (axiosError.response?.status === 404) {
          throw new Error(
            'Endpoint parse URL belum tersedia. Pastikan backend sudah diupdate dengan endpoint POST /api/parse-maps-url'
          );
        }
        
        // Check for 401 - unauthorized
        if (axiosError.response?.status === 401) {
          throw new Error('Session expired. Silakan login ulang.');
        }
        
        // Check for 429 - rate limit
        if (axiosError.response?.status === 429) {
          throw new Error('Terlalu banyak request. Silakan tunggu beberapa saat.');
        }
        
        // Use error from response if available
        if (axiosError.response?.data?.error) {
          throw new Error(axiosError.response.data.error);
        }
        
        throw error;
      }
      throw new Error('Failed to parse Google Maps URL');
    }
  },

  /**
   * Check if a URL is a shortened Google Maps URL
   * 
   * @param url - URL to check
   * @returns true if URL is a shortened Google Maps URL
   */
  isShortenedUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes('maps.app.goo.gl') ||
        urlObj.hostname.includes('goo.gl')
      );
    } catch {
      return false;
    }
  },

  /**
   * Check if a URL is a valid Google Maps URL
   * 
   * @param url - URL to validate
   * @returns true if URL is a valid Google Maps URL
   */
  isValidGoogleMapsUrl: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      const allowedDomains = [
        'google.com',
        'www.google.com',
        'maps.google.com',
        'maps.app.goo.gl',
        'goo.gl',
      ];
      return allowedDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  },
};

export default urlParserService;
