import { useState, useEffect } from 'react';
import { urlParserService } from '@/services/urlParserService';

type Props = {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number, address: string) => void;
  onAddressSelect?: (address: string, lat: number, lng: number) => void;
};

// Default center: Jakarta
const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  onAddressSelect,
}: Props) {
  const [lat, setLat] = useState(latitude || DEFAULT_LAT);
  const [lng, setLng] = useState(longitude || DEFAULT_LNG);
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>>([]);
  const [inputMode, setInputMode] = useState<'manual' | 'gmaps'>('manual');
  const [gmapsLink, setGmapsLink] = useState('');
  const [gmapsError, setGmapsError] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    if (latitude !== undefined) setLat(latitude);
    if (longitude !== undefined) setLng(longitude);
  }, [latitude, longitude]);

  // Notify parent of changes
  useEffect(() => {
    onChange(lat, lng, address);
  }, [lat, lng, address, onChange]);

  // Parse Google Maps link to extract coordinates
  const parseGoogleMapsLink = async (url: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      console.log('🔍 Raw URL:', url);

      // Check if it's a shortened URL - use backend parser
      if (urlParserService.isShortenedUrl(url)) {
        console.log('📎 Shortened URL detected, using backend parser');
        try {
          const result = await urlParserService.parseMapsUrl(url);
          console.log('✅ Backend parser result:', result);
          return { lat: result.latitude, lng: result.longitude };
        } catch (error) {
          console.error('❌ Backend parser error:', error);
          throw error;
        }
      }

      // For full URLs, parse locally
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      // Try to get coordinates from query params (?q=lat,lng or ?ll=lat,lng)
      const q = searchParams.get('q') || searchParams.get('ll');
      if (q) {
        const coords = q.split(',');
        if (coords.length >= 2) {
          const latitude = parseFloat(coords[0].trim());
          const longitude = parseFloat(coords[1].trim());
          if (!isNaN(latitude) && !isNaN(longitude)) {
            return { lat: latitude, lng: longitude };
          }
        }
      }

      // Try to get coordinates from path (/maps/place/lat,lng or /maps/@lat,lng)
      const pathParts = pathname.split('/');
      for (const part of pathParts) {
        if (part.includes('@') || part.includes('place')) {
          const coordsMatch = part.match(/@?(-?\d+\.?\d*),(-?\d+\.?\d*)/);
          if (coordsMatch) {
            const latitude = parseFloat(coordsMatch[1]);
            const longitude = parseFloat(coordsMatch[2]);
            if (!isNaN(latitude) && !isNaN(longitude)) {
              return { lat: latitude, lng: longitude };
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error parsing Google Maps link:', error);
      return null;
    }
  };

  const handleGmapsLinkSubmit = async () => {
    setGmapsError('');

    if (!gmapsLink.trim()) {
      setGmapsError('Masukkan link Google Maps');
      return;
    }

    // Validate URL first
    if (!urlParserService.isValidGoogleMapsUrl(gmapsLink)) {
      setGmapsError('Link Google Maps tidak valid. Hanya link dari google.com dan maps.app.goo.gl yang didukung.');
      return;
    }

    setIsParsingUrl(true);

    try {
      const coords = await parseGoogleMapsLink(gmapsLink);
      
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
        setGmapsLink('');
        setInputMode('manual');
        // Get address from coordinates
        await getAddressFromCoords(coords.lat, coords.lng);
      } else {
        setGmapsError('Tidak dapat mengekstrak koordinat dari link. Pastikan link mengarah ke lokasi spesifik di Google Maps.');
      }
    } catch (error) {
      console.error('❌ Error parsing Google Maps link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses link Google Maps';
      setGmapsError(errorMessage);
    } finally {
      setIsParsingUrl(false);
    }
  };

  // Search address using Nominatim (OpenStreetMap)
  const searchAddress = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      const formattedAddress = data.display_name || '';
      setAddress(formattedAddress);
      return formattedAddress;
    } catch (error) {
      console.error('Error getting address:', error);
      return '';
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate lat/lng from click position
    // This is a simplified calculation - in production, use a proper map library
    const lngRange = 0.1; // Adjust based on desired zoom level
    const latRange = 0.1;
    
    const newLng = DEFAULT_LNG + (x / rect.width - 0.5) * lngRange;
    const newLat = DEFAULT_LAT - (y / rect.height - 0.5) * latRange;
    
    setLat(newLat);
    setLng(newLng);
    getAddressFromCoords(newLat, newLng);
  };

  const handleSearchSelect = (result: typeof searchResults[0]) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    
    setLat(newLat);
    setLng(newLng);
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery('');
    
    onAddressSelect?.(result.display_name, newLat, newLng);
  };

  return (
    <div className="space-y-3">
      {/* Input Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Input Manual
        </button>
        <button
          type="button"
          onClick={() => setInputMode('gmaps')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'gmaps'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Link Google Maps
        </button>
      </div>

      {/* Manual Input Mode */}
      {inputMode === 'manual' && (
        <>
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchAddress(e.target.value);
              }}
              placeholder="Cari alamat..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(result)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Google Maps Link Input Mode */}
      {inputMode === 'gmaps' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={gmapsLink}
              onChange={(e) => setGmapsLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGmapsLinkSubmit()}
              placeholder="Tempel link Google Maps (contoh: https://maps.app.goo.gl/xxx)"
              className={`flex-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                gmapsError ? 'border-red-500' : 'border-slate-300'
              }`}
              disabled={isParsingUrl}
            />
            <button
              type="button"
              onClick={handleGmapsLinkSubmit}
              disabled={isParsingUrl || !gmapsLink.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isParsingUrl ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                'Ambil Lokasi'
              )}
            </button>
          </div>
          {gmapsError && (
            <p className="text-sm text-red-500">{gmapsError}</p>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-medium mb-1">Cara menggunakan:</p>
            <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
              <li>Buka Google Maps di browser</li>
              <li>Klik kanan pada lokasi yang diinginkan</li>
              <li>Klik "Bagikan" atau "Share"</li>
              <li>Salin link (bisa link pendek atau link lengkap)</li>
              <li>Tempel link di kolom di atas</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2 font-medium">✅ Mendukung:</p>
            <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
              <li>Link pendek: maps.app.goo.gl/xxx, goo.gl/maps/xxx</li>
              <li>Link lengkap: google.com/maps/place/...</li>
            </ul>
          </div>
        </div>
      )}

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            value={lat.toFixed(6)}
            onChange={(e) => setLat(parseFloat(e.target.value) || DEFAULT_LAT)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            value={lng.toFixed(6)}
            onChange={(e) => setLng(parseFloat(e.target.value) || DEFAULT_LNG)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Address Display */}
      {address && (
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Alamat:</p>
          <p className="text-sm text-slate-700">{address}</p>
        </div>
      )}

      {/* Simple Map Visualization */}
      <div
        onClick={handleMapClick}
        className="relative w-full h-48 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer overflow-hidden"
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full h-px bg-blue-400"
              style={{ top: `${i * 10}%` }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full w-px bg-blue-400"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>

        {/* Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-200"
          style={{
            left: `${((lng - DEFAULT_LNG) / 0.1 + 0.5) * 100}%`,
            top: `${((DEFAULT_LAT - lat) / 0.1 + 0.5) * 100}%`,
          }}
        >
          <svg className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>

        {/* Click instruction */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-xs text-slate-600">
          Klik untuk pilih lokasi
        </div>
      </div>

      {/* Current Location Button */}
      {navigator.geolocation && (
        <button
          type="button"
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const newLat = position.coords.latitude;
                const newLng = position.coords.longitude;
                setLat(newLat);
                setLng(newLng);
                getAddressFromCoords(newLat, newLng);
              },
              (error) => {
                console.error('Error getting location:', error);
                alert('Tidak dapat mengakses lokasi Anda. Pastikan GPS aktif.');
              }
            );
          }}
          className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Gunakan Lokasi Saya
        </button>
      )}
    </div>
  );
}
