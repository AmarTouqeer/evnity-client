import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Filter,
  Grid,
  List,
  Loader2,
  Navigation,
  ChevronDown,
  X,
} from "lucide-react";
import { eventAPI } from "../services/api";
import { pakistanCities } from "../components/CitiesList";

const EVENT_CATEGORIES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Religious",
  "Cultural",
  "Sports",
  "Music",
  "Other",
];

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  startDate: "",
  endDate: "",
  minGuests: "",
  lat: "",
  lng: "",
  radius: "",
};

const Events = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("-createdAt");
  const [gettingLocation, setGettingLocation] = useState(false);

  // ── City searchable dropdown ──
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

  const filteredCities = citySearch
    ? pakistanCities.filter(
        (c) =>
          c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
          c.province.toLowerCase().includes(citySearch.toLowerCase())
      )
    : pakistanCities;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = (cityName) => {
    setFilters((prev) => ({ ...prev, city: cityName }));
    setCitySearch("");
    setShowCityDropdown(false);
    setPage(1);
  };

  const clearCity = () => {
    setFilters((prev) => ({ ...prev, city: "" }));
    setCitySearch("");
    setPage(1);
  };

  // ── Debounce search input so we don't fetch on every keystroke ──
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [filters.search]);

  // ── Build a stable dependency key from the primitive filter values ──
  // This avoids the "object ref changes every render" infinite-loop bug.
  const fetchKey = useMemo(
    () =>
      JSON.stringify({
        search: debouncedSearch,
        category: filters.category,
        city: filters.city,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        startDate: filters.startDate,
        endDate: filters.endDate,
        minGuests: filters.minGuests,
        lat: filters.lat,
        lng: filters.lng,
        radius: filters.radius,
        page,
        sortBy,
      }),
    [
      debouncedSearch,
      filters.category,
      filters.city,
      filters.minPrice,
      filters.maxPrice,
      filters.startDate,
      filters.endDate,
      filters.minGuests,
      filters.lat,
      filters.lng,
      filters.radius,
      page,
      sortBy,
    ]
  );

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 12, sort: sortBy };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.category) params.category = filters.category.toLowerCase();
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minGuests) params.minGuests = filters.minGuests;
      if (filters.lat) params.lat = filters.lat;
      if (filters.lng) params.lng = filters.lng;
      if (filters.radius) params.radius = filters.radius;

      const response = await eventAPI.getAll(params);

      if (response.success) {
        setEvents(response.data.events || response.data || []);
        setTotalPages(response.data.totalPages || response.pages || 1);
      } else {
        setError(response.message || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Only reset page for non-search fields; search has its own debounce effect
    if (name !== "search") setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters((prev) => ({
          ...prev,
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
          radius: prev.radius || "10",
        }));
        setGettingLocation(false);
        setPage(1);
      },
      (err) => {
        console.error("Error getting location:", err);
        alert("Unable to get your location. Please enter manually.");
        setGettingLocation(false);
      }
    );
  };

  const clearGeoFilters = () => {
    setFilters((prev) => ({ ...prev, lat: "", lng: "", radius: "" }));
    setPage(1);
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch("");
    setCitySearch("");
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== "" && key !== "search"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Events</h1>
        <p className="text-lg text-gray-600">
          Find the perfect venue and package for your special occasion
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search events, venues, packages..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Category */}
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
            >
              <option value="">All Categories</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>

            {/* City searchable dropdown */}
            <div className="relative" ref={cityDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  value={showCityDropdown ? citySearch : filters.city || ""}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  placeholder="All Cities"
                  className="w-48 px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
                {filters.city && !showCityDropdown ? (
                  <button
                    type="button"
                    onClick={clearCity}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
                    aria-label="Clear city"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                ) : (
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                )}
              </div>

              {showCityDropdown && (
                <div className="absolute z-20 w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleCitySelect("")}
                    className="w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-[#D7490C] transition-colors border-b border-gray-100 font-medium"
                  >
                    All Cities
                  </button>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleCitySelect(city.name)}
                        className="w-full px-4 py-2 text-left hover:bg-orange-50 hover:text-[#D7490C] transition-colors flex items-start gap-2 border-b border-gray-100 last:border-b-0"
                      >
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium">{city.name}</div>
                          <div className="text-xs text-gray-500">{city.province}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No cities found matching "{citySearch}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              More Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#D7490C] text-white text-xs rounded-full px-2 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-[#D7490C] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-[#D7490C] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date From
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date To
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  min={filters.startDate || new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Guests
                </label>
                <input
                  type="number"
                  name="minGuests"
                  value={filters.minGuests}
                  onChange={handleFilterChange}
                  placeholder="e.g. 100"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Budget (PKR)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min price"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Budget (PKR)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max price"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radius (km)
                </label>
                <input
                  type="number"
                  name="radius"
                  value={filters.radius}
                  onChange={handleFilterChange}
                  placeholder="e.g. 10"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Location helper buttons */}
            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={getUserLocation}
                disabled={gettingLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {gettingLocation ? "Getting Location..." : "Use My Location"}
              </button>

              {(filters.lat || filters.lng || filters.radius) && (
                <button
                  onClick={clearGeoFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Location
                </button>
              )}

              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {filters.lat && filters.lng && filters.radius && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📍 Location Search Active:</strong> Showing events within{" "}
                  {filters.radius}km of ({filters.lat}, {filters.lng})
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing <span className="font-semibold">{events.length}</span> events
              {filters.city && (
                <>
                  {" "}
                  in <span className="font-semibold">{filters.city}</span>
                </>
              )}
            </>
          )}
        </p>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
        >
          <option value="-createdAt">Most Recent</option>
          <option value="charges">Price: Low to High</option>
          <option value="-charges">Price: High to Low</option>
          <option value="-averageRating">Rating: High to Low</option>
          <option value="-totalBookings">Most Popular</option>
        </select>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-[#D7490C]" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-20">
          <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search criteria
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="px-5 py-2 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }
          >
            {events.map((event) => (
              <EventCard key={event._id} event={event} viewMode={viewMode} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    page === i + 1
                      ? "bg-[#D7490C] text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// EventCard unchanged — keeping exactly what you had
const EventCard = ({ event, viewMode }) => {
  const providerName = event.provider?.name || "Unknown Provider";
  const eventImage =
    event.images && event.images.length > 0
      ? event.images[0].url
      : "https://via.placeholder.com/400x300?text=Event+Image";
  const isApproved = event.adminApprovalStatus === "approved";
  const price = event.charges || 0;
  const city = event.location?.city || "N/A";
  const rating = event.averageRating || 0;
  const reviewCount = event.totalReviews || 0;

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 h-48 md:h-auto bg-gray-200 relative">
            <img
              src={eventImage}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/400x300?text=Event+Image";
              }}
            />
            {isApproved && (
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-600">by {providerName}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#D7490C]">
                  PKR {price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per event</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {city}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Capacity: {event.capacity} guests
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)} ({reviewCount} reviews)
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/events/${event._id}`}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all text-center"
              >
                View Details
              </Link>
              <Link
                to={`/events/${event._id}`}
                className="px-4 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={eventImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=Event+Image";
          }}
        />
        {isApproved && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            ✓ Verified
          </span>
        )}
        <span className="absolute top-2 right-2 bg-white text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
          {event.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-3">by {providerName}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-[#D7490C]" />
            {city}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-[#D7490C]" />
            Capacity: {event.capacity} guests
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
            {rating.toFixed(1)} ({reviewCount} reviews)
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-600">Starting from</div>
            <div className="text-xl font-bold text-[#D7490C]">
              PKR {price.toLocaleString()}
            </div>
          </div>
          <Link
            to={`/events/${event._id}`}
            className="px-4 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Events;