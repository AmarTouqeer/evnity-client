import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";

// Fix Leaflet's default icon paths (Vite/Webpack break them)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/[email protected]/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/[email protected]/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/[email protected]/dist/images/marker-shadow.png",
});

// Center of Pakistan as initial map view
const PAKISTAN_CENTER = [30.3753, 69.3451];
const DEFAULT_ZOOM = 6;

// Re-centers the map programmatically when position changes
const MapRecenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
};

// Captures map clicks
const ClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

/**
 * Map-based venue location picker.
 *
 * Provider can:
 *   1. Search address text (Nominatim forward-geocoding)
 *   2. Click anywhere on the map (Nominatim reverse-geocoding)
 *   3. Use device GPS
 *
 * Always returns REAL coordinates for the selected point — never city-center fallback.
 *
 * @param {Object}   value     { lat, lng, address, city }
 * @param {Function} onChange  ({ lat, lng, address, city }) => void
 */
const VenueLocationPicker = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const position = value?.lat && value?.lng ? [value.lat, value.lng] : null;

  // ── Forward geocode (search query → coordinates) ──
  const searchAddress = async (q) => {
    if (!q || q.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const url =
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(q)}&countrycodes=pk&limit=6&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (err) {
      console.error("Geocoding error:", err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // ── Reverse geocode (coordinates → address) ──
  const reverseGeocode = async (lat, lng) => {
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      return await res.json();
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      return null;
    }
  };

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(searchQuery);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract a sensible city name from Nominatim's address breakdown
  const extractCity = (addr) =>
    addr?.city ||
    addr?.town ||
    addr?.village ||
    addr?.municipality ||
    addr?.county ||
    addr?.state_district ||
    "";

  // ── User picked a search result ──
  const selectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange({
      lat,
      lng,
      address: result.display_name,
      city: extractCity(result.address),
    });
    setSearchQuery("");
    setShowResults(false);
    setSearchResults([]);
  };

  // ── User clicked on the map ──
  const handleMapClick = async ([lat, lng]) => {
    const result = await reverseGeocode(lat, lng);
    onChange({
      lat,
      lng,
      address: result?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: extractCity(result?.address),
    });
  };

  // ── User pressed "Use my current location" ──
  const useDeviceLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => handleMapClick([pos.coords.latitude, pos.coords.longitude]),
      () => alert("Unable to get your location. Please pin manually on the map.")
    );
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search venue address (e.g. The Smart School Sahiwal)"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0 flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-[#D7490C]" />
                <div className="text-sm text-gray-800">{r.display_name}</div>
              </button>
            ))}
          </div>
        )}

        {showResults && !searching && searchQuery.length >= 3 && searchResults.length === 0 && (
          <div className="absolute z-[1000] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm text-gray-500 text-center">
            No matches. Try a different search or click on the map.
          </div>
        )}
      </div>

      {/* Helper buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={useDeviceLocation}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
        >
          <Navigation className="w-4 h-4" />
          Use my current location
        </button>
        {position && (
          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded font-mono">
            📍 {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
        )}
      </div>

      {/* Map */}
      <div className="h-80 rounded-lg overflow-hidden border border-gray-300 relative z-0">
        <MapContainer
          center={position || PAKISTAN_CENTER}
          zoom={position ? 15 : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleMapClick} />
          {position && <Marker position={position} />}
          {position && <MapRecenter position={position} />}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        💡 Search above, click on the map, or use your current location to pin the exact venue spot.
      </p>
    </div>
  );
};

export default VenueLocationPicker;