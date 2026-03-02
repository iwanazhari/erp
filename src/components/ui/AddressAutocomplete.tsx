import { useState } from 'react';
import { GeoapifyGeocoderAutocomplete } from '@geoapify/react-geocoder-autocomplete';
import { useToast } from './ToastContext';

type GeoapifyPlace = {
  properties: {
    lat: number;
    lon: number;
    formatted: string;
    address_line1?: string;
    name?: string;
    street?: string;
    suburb?: string;
  };
};

type Props = {
  onLocationSelect: (lat: number, lon: number, address: string, accuracy?: number) => void;
  initialAddress?: string;
};

export default function AddressAutocomplete({ onLocationSelect, initialAddress = '' }: Props) {
  const toast = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<GeoapifyPlace | null>(null);
  const [inputMode, setInputMode] = useState<'autocomplete' | 'gmaps'>('autocomplete');
  const [gmapsLink, setGmapsLink] = useState('');
  const [gmapsError, setGmapsError] = useState('');

  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  // Debug log
  console.log('Geoapify API Key loaded:', apiKey ? '***' + apiKey.slice(-4) : 'NOT FOUND');

  // Parse Google Maps link to extract coordinates
  const parseGoogleMapsLink = (url: string): { lat: number; lng: number } | null => {
    try {
      console.log('🔍 Raw URL:', url);
      
      // Handle various Google Maps URL formats
      // Format 1: https://www.google.com/maps?q=-6.208789012345679,106.8456123456789
      // Format 2: https://www.google.com/maps/place/Name/@-6.208789012345679,106.8456123456789,15z
      // Format 3: https://www.google.com/maps/place/Name/@lat,lng,17z/data=...!3dLAT!4dLNG
      // Format 4: https://www.google.com/maps?ll=-6.208789012345679,106.8456123456789
      // Format 5: https://www.google.com/maps/dir/?api=1&destination=-6.208789012345679,106.8456123456789
      // Note: Shortened links (goo.gl, maps.app.goo.gl) require API to expand

      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      const hash = urlObj.hash; // Get the hash part (#...)

      // Skip shortened URLs - they need to be expanded first
      if (urlObj.hostname.includes('goo.gl') || urlObj.hostname.includes('maps.app.goo.gl')) {
        console.log('⚠️ Shortened URL detected, cannot parse without API');
        return null;
      }

      console.log('🔍 Parsed URL:', {
        hostname: urlObj.hostname,
        pathname,
        search: urlObj.search,
        hash,
        params: Object.fromEntries(searchParams.entries())
      });

      // PRIORITY 1: Try to get coordinates from data parameters in pathname (!3dLAT!4dLNG)
      // Google Maps place URLs store actual place coordinates in pathname after /data=
      // Example: /data=!4m6!3m5!1s0x...!8m2!3d-6.4650068!4d106.7400206
      if (pathname.includes('!3d') && pathname.includes('!4d')) {
        const latMatch = pathname.match(/!3d(-?\d+\.?\d*)/);
        const lngMatch = pathname.match(/!4d(-?\d+\.?\d*)/);
        if (latMatch && lngMatch) {
          const latitude = parseFloat(latMatch[1]);
          const longitude = parseFloat(lngMatch[1]);
          if (!isNaN(latitude) && !isNaN(longitude) &&
              latitude >= -90 && latitude <= 90 &&
              longitude >= -180 && longitude <= 180) {
            console.log('✅ Parsed coordinates from !3d!4d in pathname (HIGHEST ACCURACY - PLACE LOCATION):', { lat: latitude, lng: longitude });
            return { lat: latitude, lng: longitude };
          }
        }
      }

      // PRIORITY 2: Try to get coordinates from query params (?q=lat,lng or ?ll=lat,lng or ?destination=lat,lng)
      const q = searchParams.get('q') || searchParams.get('ll') || searchParams.get('destination');
      if (q) {
        console.log('📍 Found coordinates in query params:', q);
        const coords = q.split(',');
        if (coords.length >= 2) {
          const latitude = parseFloat(coords[0].trim());
          const longitude = parseFloat(coords[1].trim());
          if (!isNaN(latitude) && !isNaN(longitude) && 
              latitude >= -90 && latitude <= 90 && 
              longitude >= -180 && longitude <= 180) {
            console.log('✅ Parsed coordinates from query params (full precision):', { lat: latitude, lng: longitude });
            return { lat: latitude, lng: longitude };
          }
        }
      }

      // PRIORITY 3: Try to get coordinates from path (/maps/place/lat,lng or /maps/@lat,lng)
      // This is viewport center, may not be exact place location
      const pathParts = pathname.split('/');
      for (const part of pathParts) {
        if (part.includes('@')) {
          // Extract coordinates after @ symbol
          const atIndex = part.indexOf('@');
          const coordsPart = part.substring(atIndex + 1);
          const coords = coordsPart.split(',');
          if (coords.length >= 2) {
            const latitude = parseFloat(coords[0]);
            const longitude = parseFloat(coords[1]);
            if (!isNaN(latitude) && !isNaN(longitude) &&
                latitude >= -90 && latitude <= 90 &&
                longitude >= -180 && longitude <= 180) {
              console.log('✅ Parsed coordinates from @ path (viewport center):', { lat: latitude, lng: longitude });
              return { lat: latitude, lng: longitude };
            }
          }
        }
      }

      console.log('❌ No coordinates found in URL');
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

    const coords = parseGoogleMapsLink(gmapsLink);
    if (coords) {
      console.log('✅ Koordinat asli dari Google Maps:', coords);
      
      // Reverse geocode to get address - Try Geoapify first
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${coords.lat}&lon=${coords.lng}&apiKey=${apiKey}&lang=en`
        );
        const data = await response.json();
        console.log('📍 Geoapify reverse geocoding result:', data);
        
        // Get the best address from Geoapify
        const feature = data.features?.[0];
        let address = '';
        
        if (feature?.properties) {
          const props = feature.properties;
          // Build address from components for better accuracy
          const street = props.street || props.road || props.address_line1 || '';
          const suburb = props.suburb || props.neighbourhood || props.city_district || '';
          const city = props.city || props.town || props.village || '';
          const state = props.state || '';
          const postcode = props.postcode || '';
          
          // Combine into full address
          const parts = [street, suburb, city, state, postcode].filter(Boolean);
          address = parts.join(', ') || props.formatted || `${coords.lat}, ${coords.lng}`;
        } else {
          address = `${coords.lat}, ${coords.lng}`;
        }

        console.log('✅ Address hasil reverse geocoding:', address);
        
        // Use ORIGINAL coordinates without any rounding
        onLocationSelect(coords.lat, coords.lng, address);
        setGmapsLink('');
        setInputMode('autocomplete');
        toast.success('Lokasi berhasil diambil dari Google Maps!');
      } catch (error) {
        console.error('❌ Error Geoapify reverse geocoding:', error);
        
        // Fallback to Nominatim (OpenStreetMap) - Free, no API key needed
        try {
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`
          );
          const nominatimData = await nominatimResponse.json();
          console.log('📍 Nominatim fallback result:', nominatimData);
          
          const address = nominatimData.display_name || `${coords.lat}, ${coords.lng}`;
          
          // Use ORIGINAL coordinates without any rounding
          onLocationSelect(coords.lat, coords.lng, address);
          setGmapsLink('');
          setInputMode('autocomplete');
          toast.success('Lokasi berhasil diambil (via OpenStreetMap)!');
        } catch (nominatimError) {
          console.error('❌ Error Nominatim fallback:', nominatimError);
          // Last resort: just use coordinates
          const coordAddress = `Koordinat: ${coords.lat}, ${coords.lng}`;
          
          // Use ORIGINAL coordinates without any rounding
          onLocationSelect(coords.lat, coords.lng, coordAddress);
          setGmapsLink('');
          setInputMode('autocomplete');
        }
      }
    } else {
      // Check if it's a shortened URL
      try {
        const urlObj = new URL(gmapsLink);
        if (urlObj.hostname.includes('goo.gl') || urlObj.hostname.includes('maps.app.goo.gl')) {
          setGmapsError('Link pendek Google Maps tidak dapat diparsing. Silakan gunakan link lengkap dengan koordinat (contoh: https://www.google.com/maps?q=-6.2088,106.8456)');
        } else {
          setGmapsError('Link Google Maps tidak valid. Pastikan link berisi koordinat.');
        }
      } catch (e) {
        setGmapsError('Link Google Maps tidak valid. Pastikan link berisi koordinat.');
      }
    }
  };

  const handlePlaceSelect = (place: GeoapifyPlace | null) => {
    if (!place) {
      return;
    }
    
    setSelectedPlace(place);
    const { lat, lon } = place.properties;
    const address = place.properties.address_line1 || place.properties.name || place.properties.formatted;
    
    onLocationSelect(lat, lon, address, undefined);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung geolocation');
      return;
    }

    setIsGettingLocation(true);

    // Take multiple readings for better accuracy
    let readings: { lat: number; lon: number; accuracy: number }[] = [];
    let watchId: number | null = null;
    let hasReturned = false;

    const finishWithBestReading = () => {
      if (hasReturned) return;
      hasReturned = true;

      if (readings.length === 0) {
        setIsGettingLocation(false);
        alert('Gagal mendapatkan lokasi. Pastikan GPS/location enabled di device Anda.');
        return;
      }

      // Use the most accurate reading
      const mostAccurate = readings.reduce((best, current) => 
        current.accuracy < best.accuracy ? current : best
      , readings[0]);

      const { lat, lon, accuracy } = mostAccurate;

      console.log('Lokasi didapat:', {
        lat,
        lon,
        accuracy: accuracy + ' meter',
        readings: readings.length,
      });

      // Use Geoapify reverse geocoding
      reverseGeocode(lat, lon, accuracy);
    };

    const reverseGeocode = async (lat: number, lon: number, acc: number) => {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}`
        );
        const data = await response.json();
        
        const result = data.features?.[0];
        const fullAddress = result?.properties?.formatted || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        
        onLocationSelect(lat, lon, fullAddress, acc);
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        const coordAddress = `Koordinat: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        onLocationSelect(lat, lon, coordAddress, acc);
      } finally {
        setIsGettingLocation(false);
        if (watchId) navigator.geolocation.clearWatch(watchId);
      }
    };

    // Watch position for better accuracy
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        console.log('GPS Reading:', { lat: latitude, lon: longitude, accuracy: accuracy + 'm' });
        
        // Accept readings with accuracy < 500m (for WiFi/indoor use)
        if (accuracy < 500) {
          readings.push({ lat: latitude, lon: longitude, accuracy });
          
          // If we got a good reading (< 100m), use it immediately
          if (accuracy < 100 && readings.length >= 1) {
            console.log('Good reading found (< 100m), using immediately');
            finishWithBestReading();
          }
          
          // If we have 3 readings, use the best one
          if (readings.length >= 3) {
            console.log('Got 3 readings, using best one');
            finishWithBestReading();
          }
        }
      },
      (error) => {
        if (hasReturned) return;
        hasReturned = true;
        setIsGettingLocation(false);
        
        let errorMessage = 'Gagal mendapatkan lokasi: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Izin lokasi ditolak.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Request timeout.';
            break;
          default:
            errorMessage += 'Kesalahan tidak diketahui.';
        }
        alert(errorMessage);
        if (watchId) navigator.geolocation.clearWatch(watchId);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,  // 10 seconds timeout per reading
        maximumAge: 10000,  // Accept readings up to 10 seconds old
      }
    );

    // Fallback: use best reading after 8 seconds (for WiFi/indoor)
    setTimeout(() => {
      console.log('Timeout reached (8s), using best available reading');
      finishWithBestReading();
    }, 8000);
  };

  if (!apiKey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 font-medium">⚠️ Geoapify API Key Required</p>
        <p className="text-xs text-yellow-600 mt-1">
          Please add VITE_GEOAPIFY_API_KEY to your .env file. 
          Get your free API key at{' '}
          <a 
            href="https://myprojects.geoapify.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline text-yellow-700 hover:text-yellow-900"
          >
            Geoapify
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Input Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode('autocomplete')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputMode === 'autocomplete'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Autocomplete
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

      {/* Autocomplete Mode */}
      {inputMode === 'autocomplete' && (
        <>
          {/* Geoapify Autocomplete */}
          <div className="relative z-40 geoapify-wrapper">
            <GeoapifyGeocoderAutocomplete
              placeholder="Cari alamat di Indonesia (contoh: Jl. Sudirman Jakarta)"
              value={selectedPlace?.properties.formatted || initialAddress}
              placeSelect={handlePlaceSelect}
              lang="en"
              filterByCountryCode={['id']}
              debounceDelay={300}
            />
          </div>

          {/* Use Current Location Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            {isGettingLocation ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mendapatkan lokasi...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gunakan Lokasi Saat Ini
              </>
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-slate-500">
            💡 Powered by Geoapify - 90,000 free requests/month
          </p>
        </>
      )}

      {/* Google Maps Link Mode */}
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
            />
            <button
              type="button"
              onClick={handleGmapsLinkSubmit}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ambil Lokasi
            </button>
          </div>
          {gmapsError && (
            <p className="text-sm text-red-500">{gmapsError}</p>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-medium mb-1">Cara menggunakan:</p>
            <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
              <li>Buka Google Maps di browser (desktop/mobile)</li>
              <li>Klik kanan pada lokasi yang diinginkan</li>
              <li>Klik angka koordinat (contoh: -6.2088, 106.8456)</li>
              <li>URL akan berubah menjadi link dengan koordinat</li>
              <li>Salin URL dari browser (contoh: https://www.google.com/maps?q=-6.2088,106.8456)</li>
              <li>Tempel link di kolom di atas</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2 font-medium">⚠️ Catatan:</p>
            <p className="text-xs text-blue-600">Link pendek (maps.app.goo.gl) tidak didukung. Gunakan link lengkap dari browser.</p>
          </div>
          <p className="text-xs text-slate-500">
            💡 Mendukung link Google Maps lengkap dengan koordinat
          </p>
        </div>
      )}
    </div>
  );
}
