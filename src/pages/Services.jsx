import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Filter,
  Camera,
  Music,
  Utensils,
  Palette,
  Users,
  Sparkles,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { serviceAPI } from "../services/api";
import { pakistanCities } from "../components/CitiesList";

// Match the categories providers actually submit (from AddListing.jsx)
const SERVICE_CATEGORIES = [
  { label: "All Services", value: "",            icon: null },
  { label: "Photography",  value: "photography", icon: Camera },
  { label: "Videography",  value: "videography", icon: Camera },
  { label: "Catering",     value: "catering",    icon: Utensils },
  { label: "DJ",           value: "dj",          icon: Music },
  { label: "Entertainment",value: "entertainment",icon: Music },
  { label: "Planning",     value: "planning",    icon: Users },
  { label: "Decorator",    value: "decorator",   icon: Palette },
  { label: "Makeup",       value: "makeup",      icon: Sparkles },
  { label: "Other",        value: "other",       icon: Sparkles },
];

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
};

const Services = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("-createdAt");

  // City searchable dropdown
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

  // Debounce search
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [filters.search]);

  // Stable dependency key for fetching
  const fetchKey = useMemo(
    () =>
      JSON.stringify({
        search: debouncedSearch,
        category: filters.category,
        city: filters.city,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        page,
        sortBy,
      }),
    [
      debouncedSearch,
      filters.category,
      filters.city,
      filters.minPrice,
      filters.maxPrice,
      filters.minRating,
      page,
      sortBy,
    ]
  );

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12, sort: sortBy };

      if (debouncedSearch)    params.search    = debouncedSearch;
      if (filters.category)   params.category  = filters.category;
      if (filters.city)       params.city      = filters.city;
      if (filters.minPrice)   params.minPrice  = filters.minPrice;
      if (filters.maxPrice)   params.maxPrice  = filters.maxPrice;
      if (filters.minRating)  params.minRating = filters.minRating;

      const response = await serviceAPI.getAll(params);

      if (response.success) {
        setServices(response.data.services || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      } else {
        setError(response.message || "Failed to load services");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name !== "search") setPage(1);
  };

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

  const handleCategoryClick = (categoryValue) => {
    setFilters((prev) => ({ ...prev, category: categoryValue }));
    setPage(1);
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch("");
    setCitySearch("");
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== "" && key !== "search" && key !== "category"
  ).length;

  // Transform API services for display
  const transformedServices = services.map((service) => ({
    id: service._id,
    name: service.title,
    provider: service.provider?.name || "Provider",
    category: service.category,
    location: service.location?.city || service.location?.address || "Location TBA",
    price: service.pricing?.basePrice || 0,
    priceUnit: service.pricing?.pricingType || "per event",
    rating: service.averageRating || 0,
    reviews: service.totalReviews || service.reviewCount || 0,
    icon: getCategoryIcon(service.category),
    image: service.images?.[0]?.url || "https://via.placeholder.com/400x300?text=Service",
    verified: service.adminApprovalStatus === "approved",
    experience: service.provider?.providerInfo?.experience || "N/A",
    description: service.description,
  }));

  function getCategoryIcon(category) {
    const c = (category || "").toLowerCase();
    if (c.includes("photo") || c.includes("video")) return Camera;
    if (c.includes("cater")) return Utensils;
    if (c.includes("music") || c.includes("dj") || c.includes("entertain")) return Music;
    if (c.includes("decor")) return Palette;
    if (c.includes("makeup") || c.includes("beauty")) return Sparkles;
    if (c.includes("plan")) return Users;
    return Sparkles;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Services</h1>
        <p className="text-lg text-gray-600">Find trusted professionals for your event</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-3 pb-2">
          {SERVICE_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = filters.category === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + City + More Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search services, providers..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
            />
          </div>

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

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (PKR)
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
                  Max Price (PKR)
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
                  Minimum Rating
                </label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex">
                <button
                  onClick={resetAllFilters}
                  className="ml-auto px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count + sort */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <p className="text-gray-600">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing <span className="font-semibold">{transformedServices.length}</span>{" "}
              of <span className="font-semibold">{total}</span> services
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
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
        >
          <option value="-createdAt">Most Recent</option>
          <option value="pricing.basePrice">Price: Low to High</option>
          <option value="-pricing.basePrice">Price: High to Low</option>
          <option value="-averageRating">Rating: High to Low</option>
          <option value="-totalBookings">Most Popular</option>
        </select>
      </div>

      {/* Loading / error / empty */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-[#D7490C]" />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && !error && transformedServices.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search criteria
          </p>
          {(activeFilterCount > 0 || filters.category || filters.search) && (
            <button
              onClick={resetAllFilters}
              className="px-5 py-2 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Services grid */}
      {!loading && !error && transformedServices.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Real pagination */}
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

const ServiceCard = ({ service }) => {
  const IconComponent = service.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=Service";
          }}
        />
        {service.verified && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            ✓ Verified
          </span>
        )}
        <div className="absolute top-2 right-2 bg-white p-2 rounded-full">
          <IconComponent className="h-5 w-5 text-[#D7490C]" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
              {service.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">by {service.provider}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-gray-900">{service.rating.toFixed(1)}</span>
          <span className="text-sm text-gray-600">({service.reviews} reviews)</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-[#D7490C]" />
            {service.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Category:</span>
            <span className="capitalize">{service.category}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-gray-600">Starting from</div>
              <div className="text-xl font-bold text-[#D7490C]">
                PKR {service.price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">{service.priceUnit}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/services/${service.id}`}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all text-center text-sm font-medium"
            >
              View Profile
            </Link>
            <Link
              to={`/services/${service.id}`}
              className="px-4 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
            >
              Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;