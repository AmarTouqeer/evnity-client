import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Plus, Check, ChevronDown, MapPin } from "lucide-react";
import {
  eventAPI,
  serviceAPI,
  resourceAPI,
  uploadAPI,
  providerStripeAPI,
} from "../services/api";
import { getCityCoordinates, getCityNames, pakistanCities } from "../components/CitiesList";

const AddListing = () => {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState("event");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeStatusLoading, setStripeStatusLoading] = useState(false);
  const [stripeStatusError, setStripeStatusError] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    address: "",
    price: "",
    capacity: "",
    amenities: [],
    experience: "",
    quantity: "",
    minOrder: "",
    priceUnit: "per day",
  });
  const [paymentOptions, setPaymentOptions] = useState({
    stripe: {
      enabled: false,
      currency: "pkr",
    },
    manual: {
      enabled: true,
      methods: [],
    },
  });

  const cities = getCityNames();

  const filteredCities = citySearch
    ? pakistanCities.filter(
      (city) =>
        city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
        city.province.toLowerCase().includes(citySearch.toLowerCase())
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

  useEffect(() => {
    const fetchStripeStatus = async () => {
      try {
        setStripeStatusLoading(true);
        setStripeStatusError(null);
        const response = await providerStripeAPI.getStatus();
        if (response.success) {
          setStripeStatus(response.data);
        } else {
          setStripeStatusError(response.message || "Failed to load Stripe status");
        }
      } catch (error) {
        console.error("Error fetching Stripe status:", error);
        setStripeStatusError(error.message || "Failed to load Stripe status");
      } finally {
        setStripeStatusLoading(false);
      }
    };
    fetchStripeStatus();
  }, []);

  const eventCategories = ["Wedding", "Birthday", "Corporate", "Religious", "Cultural", "Sports", "Music", "Other"];
  const serviceCategories = ["Photography", "Videography", "Catering", "DJ", "Entertainment", "Planning", "Decorator", "Makeup", "Other"];
  const resourceCategories = ["Furniture", "Equipment", "Decoration", "Lighting", "Sound", "Catering", "Tent", "Other"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCitySelect = (cityName) => {
    setFormData((prev) => ({ ...prev, location: cityName }));
    setCitySearch("");
    setShowCityDropdown(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStripeToggle = () => {
    setPaymentOptions((prev) => ({
      ...prev,
      stripe: { ...prev.stripe, enabled: !prev.stripe.enabled },
    }));
  };

  const handleStripeCurrencyChange = (e) => {
    const value = e.target.value.toLowerCase();
    setPaymentOptions((prev) => ({
      ...prev,
      stripe: { ...prev.stripe, currency: value || "pkr" },
    }));
  };

  const handleManualToggle = () => {
    setPaymentOptions((prev) => ({
      ...prev,
      manual: { ...prev.manual, enabled: !prev.manual.enabled },
    }));
  };

  const handleConnectStripe = async () => {
    try {
      setStripeStatusLoading(true);
      const response = await providerStripeAPI.getConnectUrl();

      // ✅ If already connected, just refresh stripe status instead
      if (response?.data?.isConnected) {
        const statusResponse = await providerStripeAPI.getStatus();
        if (statusResponse.success) {
          setStripeStatus(statusResponse.data);
        }
        alert("Your Stripe account is already connected!");
        return;
      }

      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to start Stripe Connect onboarding.");
      }

      const url = response.data?.authUrl;
      if (!url) {
        throw new Error("Stripe Connect URL was not returned by the server.");
      }

      window.location.href = url;
    } catch (error) {
      console.error("Error starting Stripe Connect onboarding:", error);
      alert(error.message || "Failed to start Stripe Connect onboarding.");
    } finally {
      setStripeStatusLoading(false);
    }
  };

  const canUseStripePayments =
    stripeStatus?.isConnected &&
    stripeStatus?.stripeConnectStatus === "active" &&
    stripeStatus?.stripeChargesEnabled;

  const addManualMethod = () => {
    setPaymentOptions((prev) => ({
      ...prev,
      manual: {
        ...prev.manual,
        methods: [
          ...prev.manual.methods,
          {
            type: "easypaisa",
            label: "Easypaisa",
            accountTitle: "",
            accountNumber: "",
            bankName: "",
            iban: "",
            instructions: "",
            isActive: true,
          },
        ],
      },
    }));
  };

  const updateManualMethod = (index, field, value) => {
    setPaymentOptions((prev) => {
      const methods = [...prev.manual.methods];
      methods[index] = { ...methods[index], [field]: value };
      if (field === "type") {
        if (value === "easypaisa") methods[index].label = "Easypaisa";
        if (value === "jazzcash") methods[index].label = "JazzCash Wallet";
        if (value === "bank_transfer") methods[index].label = "Bank Transfer";
        if (value === "cash") methods[index].label = "Cash";
      }
      return { ...prev, manual: { ...prev.manual, methods } };
    });
  };

  const removeManualMethod = (index) => {
    setPaymentOptions((prev) => ({
      ...prev,
      manual: {
        ...prev.manual,
        methods: prev.manual.methods.filter((_, i) => i !== index),
      },
    }));
  };

  // ── Available Dates ──────────────────────────────────────────
  const addAvailableDate = () => {
    setAvailableDates((prev) => [
      ...prev,
      {
        date: "",
        timeSlots: [{ startTime: "08:00", endTime: "22:00", isAvailable: true }],
      },
    ]);
  };

  const removeAvailableDate = (dateIdx) => {
    setAvailableDates((prev) => prev.filter((_, i) => i !== dateIdx));
  };

  const updateAvailableDate = (dateIdx, value) => {
    setAvailableDates((prev) => {
      const updated = [...prev];
      updated[dateIdx] = { ...updated[dateIdx], date: value };
      return updated;
    });
  };

  const addTimeSlot = (dateIdx) => {
    setAvailableDates((prev) => {
      const updated = [...prev];
      updated[dateIdx] = {
        ...updated[dateIdx],
        timeSlots: [
          ...updated[dateIdx].timeSlots,
          { startTime: "08:00", endTime: "22:00", isAvailable: true },
        ],
      };
      return updated;
    });
  };

  const removeTimeSlot = (dateIdx, slotIdx) => {
    setAvailableDates((prev) => {
      const updated = [...prev];
      updated[dateIdx] = {
        ...updated[dateIdx],
        timeSlots: updated[dateIdx].timeSlots.filter((_, i) => i !== slotIdx),
      };
      return updated;
    });
  };

  const updateTimeSlot = (dateIdx, slotIdx, field, value) => {
    setAvailableDates((prev) => {
      const updated = [...prev];
      const slots = [...updated[dateIdx].timeSlots];
      slots[slotIdx] = { ...slots[slotIdx], [field]: value };
      updated[dateIdx] = { ...updated[dateIdx], timeSlots: slots };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    try {
      setLoading(true);

      const formDataImages = new FormData();
      images.forEach((image) => {
        formDataImages.append("images", image.file);
      });

      const uploadResponse = await uploadAPI.uploadMultiple(formDataImages);
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || "Failed to upload images");
      }

      const uploadedImages = uploadResponse.data.images || uploadResponse.data || [];
      if (uploadedImages.length === 0) {
        throw new Error("No images were uploaded");
      }

      const coordinates = getCityCoordinates(formData.location);
      if (!coordinates) {
        throw new Error("Invalid city selected");
      }

      let response;

      if (listingType === "event") {
        const eventData = {
          title: formData.title,
          description: formData.description,
          category: formData.category.toLowerCase(),
          venue: formData.title,
          location: {
            city: formData.location,
            address: formData.address || formData.location,
            geo: {
              type: "Point",
              coordinates: [coordinates.lng, coordinates.lat],
            },
          },
          charges: Number(formData.price),
          capacity: Number(formData.capacity),
          images: uploadedImages.map((img) => ({ url: img.url, publicId: img.publicId })),
          paymentOptions,
          availableDates,
        };
        response = await eventAPI.create(eventData);

      } else if (listingType === "service") {
        const serviceData = {
          title: formData.title,
          description: formData.description,
          category: formData.category.toLowerCase(),
          pricing: {
            basePrice: Number(formData.price),
            pricingType: "package",
          },
          location: {
            city: formData.location,
            address: formData.address || formData.location,
          },
          images: uploadedImages.map((img) => ({ url: img.url, publicId: img.publicId })),
          paymentOptions,  // ✅ included
        };
        response = await serviceAPI.create(serviceData);

      } else if (listingType === "resource") {
        const resourceData = {
          name: formData.title,
          description: formData.description,
          category: formData.category.toLowerCase(),
          rentalPrice: Number(formData.price),
          quantity: Number(formData.quantity),
          availableQuantity: Number(formData.quantity),
          location: {
            city: formData.location,
            address: formData.address || formData.location,
          },
          images: uploadedImages.map((img) => ({ url: img.url, publicId: img.publicId })),
          paymentOptions,  // ✅ included
        };
        response = await resourceAPI.create(resourceData);
      }

      if (response.success) {
        alert(`${listingType.charAt(0).toUpperCase() + listingType.slice(1)} listing submitted for admin approval!`);
        navigate("/provider/dashboard");
      } else {
        throw new Error(response.message || "Failed to create listing");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(error.message || "Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    switch (listingType) {
      case "event": return eventCategories;
      case "service": return serviceCategories;
      case "resource": return resourceCategories;
      default: return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Add New Listing</h1>
          <p className="text-orange-100">Create a new listing to offer your services</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Listing Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Listing Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setListingType("event")}
              className={`p-4 border-2 rounded-lg font-semibold transition-all ${listingType === "event" ? "border-[#D7490C] bg-orange-50 text-[#D7490C]" : "border-gray-300 hover:border-gray-400"
                }`}
            >
              Event Venue
            </button>
            <button
              onClick={() => setListingType("service")}
              className={`p-4 border-2 rounded-lg font-semibold transition-all ${listingType === "service" ? "border-[#D7490C] bg-orange-50 text-[#D7490C]" : "border-gray-300 hover:border-gray-400"
                }`}
            >
              Service
            </button>
            <button
              onClick={() => setListingType("resource")}
              className={`p-4 border-2 rounded-lg font-semibold transition-all ${listingType === "resource" ? "border-[#D7490C] bg-orange-50 text-[#D7490C]" : "border-gray-300 hover:border-gray-400"
                }`}
            >
              Resource
            </button>
          </div>
        </div>

        {/* Listing Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Listing Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {listingType === "event" ? "Venue" : listingType === "service" ? "Service" : "Resource"} Name{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Grand Wedding Hall"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              />
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {getCategories().map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={showCityDropdown ? citySearch : formData.location || ""}
                    onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder="Search city..."
                    required={!formData.location}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {showCityDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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

                {formData.location && !showCityDropdown && (
                  <div className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {formData.location} •{" "}
                      {pakistanCities.find((c) => c.name === formData.location)?.province}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ FIX 1: Full Address — event ONLY */}
            {listingType === "event" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 123 Main Street, Block A, DHA Phase 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>
            )}

            {/* Available Dates — event only */}
            {listingType === "event" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Available Dates &amp; Time Slots
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Add the dates your venue is available for booking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addAvailableDate}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-[#D7490C] text-[#D7490C] hover:bg-orange-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Date
                  </button>
                </div>

                {availableDates.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    No dates added yet. Click <span className="font-semibold">Add Date</span> to get started.
                  </p>
                )}

                {availableDates.map((entry, dateIdx) => (
                  <div
                    key={dateIdx}
                    className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
                  >
                    {/* Date row */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={entry.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => updateAvailableDate(dateIdx, e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAvailableDate(dateIdx)}
                        className="mt-5 p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Time slots */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">Time Slots</p>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(dateIdx)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Slot
                        </button>
                      </div>

                      {entry.timeSlots.map((slot, slotIdx) => (
                        <div
                          key={slotIdx}
                          className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                        >
                          {/* Start time */}
                          <div className="flex items-center gap-1">
                            <label className="text-[11px] text-gray-500">From</label>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateTimeSlot(dateIdx, slotIdx, "startTime", e.target.value)
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#D7490C] focus:border-transparent"
                            />
                          </div>

                          {/* End time */}
                          <div className="flex items-center gap-1">
                            <label className="text-[11px] text-gray-500">To</label>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateTimeSlot(dateIdx, slotIdx, "endTime", e.target.value)
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#D7490C] focus:border-transparent"
                            />
                          </div>

                          {/* Available toggle */}
                          <button
                            type="button"
                            onClick={() =>
                              updateTimeSlot(dateIdx, slotIdx, "isAvailable", !slot.isAvailable)
                            }
                            className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${slot.isAvailable
                                ? "border-green-500 text-green-700 bg-green-50"
                                : "border-gray-300 text-gray-500 bg-gray-50"
                              }`}
                          >
                            {slot.isAvailable ? "Available" : "Unavailable"}
                          </button>

                          {/* Remove slot */}
                          {entry.timeSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(dateIdx, slotIdx)}
                              className="ml-auto p-1 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="5"
                placeholder="Describe your offering in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="e.g., 150000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                />
              </div>

              {listingType === "event" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (guests) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="e.g., 500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>
              )}

              {listingType === "service" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>
              )}

              {listingType === "resource" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="e.g., 500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Resource: Price Unit & Min Order */}
            {listingType === "resource" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Unit</label>
                  <select
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  >
                    <option value="per day">per day</option>
                    <option value="per unit">per unit</option>
                    <option value="per event">per event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="e.g., 50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* ✅ FIX 2: Payment Options — ALL listing types */}
            {(listingType === "event" || listingType === "service" || listingType === "resource") && (
              <div className="mt-8 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Payment Options</h3>

                {/* Stripe (Connect) */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Stripe (Card Payments via Connect)</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {canUseStripePayments ? (
                          <>Your Stripe account is connected. Enable card payments for this listing.</>
                        ) : (
                          <>Connect your Stripe account to accept card payments on this listing.</>
                        )}
                      </p>
                      {stripeStatusError && (
                        <p className="text-xs text-red-600 mt-1">{stripeStatusError}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleStripeToggle}
                      disabled={!canUseStripePayments}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!canUseStripePayments
                          ? "bg-gray-300 opacity-50 cursor-not-allowed"
                          : paymentOptions.stripe.enabled
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${paymentOptions.stripe.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={paymentOptions.stripe.currency.toUpperCase()}
                        onChange={handleStripeCurrencyChange}
                        disabled={!canUseStripePayments}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent ${!canUseStripePayments ? "bg-gray-100" : ""
                          }`}
                        placeholder="USD"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">
                        Use standard 3-letter currency code. Default is PKR.
                      </p>
                    </div>
                    <div className="flex flex-col justify-center text-[11px] text-gray-600">
                      {stripeStatusLoading ? (
                        <span>Checking Stripe connection...</span>
                      ) : canUseStripePayments ? (
                        <span>Stripe Connect is active. Customers will be redirected to Stripe Checkout to pay.</span>
                      ) : (
                        <>
                          <span className="mb-2">
                            Stripe card payments are disabled until you connect your Stripe account.
                          </span>
                          <button
                            type="button"
                            onClick={handleConnectStripe}
                            disabled={stripeStatusLoading}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-[#D7490C] text-[#D7490C] text-xs font-semibold hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {stripeStatusLoading ? "Opening Stripe..." : "Connect Stripe Account"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Pakistani methods */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Manual Pakistani Payments</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Add Easypaisa, JazzCash, bank transfer, or cash instructions.{" "}
                        <span className="font-semibold">TEST PAYMENT ONLY – no real money moves.</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleManualToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${paymentOptions.manual.enabled ? "bg-green-500" : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${paymentOptions.manual.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                      />
                    </button>
                  </div>

                  {paymentOptions.manual.enabled && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-800">Manual Methods</p>
                        <button
                          type="button"
                          onClick={addManualMethod}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-[#D7490C] text-[#D7490C] hover:bg-orange-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add Method
                        </button>
                      </div>

                      {paymentOptions.manual.methods.length === 0 && (
                        <p className="text-xs text-gray-500">
                          No manual methods added yet. Click <span className="font-semibold">Add Method</span> to configure.
                        </p>
                      )}

                      {paymentOptions.manual.methods.map((method, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-white">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Method Type</label>
                                <select
                                  value={method.type}
                                  onChange={(e) => updateManualMethod(index, "type", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                                >
                                  <option value="easypaisa">Easypaisa</option>
                                  <option value="jazzcash">JazzCash</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                  <option value="cash">Cash</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Label (shown to customers)</label>
                                <input
                                  type="text"
                                  value={method.label || ""}
                                  onChange={(e) => updateManualMethod(index, "label", e.target.value)}
                                  placeholder="e.g., Easypaisa Wallet"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <button
                                type="button"
                                onClick={() => updateManualMethod(index, "isActive", !method.isActive)}
                                className={`text-xs px-3 py-1 rounded-full border ${method.isActive
                                    ? "border-green-500 text-green-700 bg-green-50"
                                    : "border-gray-300 text-gray-600 bg-gray-50"
                                  }`}
                              >
                                {method.isActive ? "Active" : "Inactive"}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeManualMethod(index)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {method.type !== "cash" && (
                              <>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Title</label>
                                  <input
                                    type="text"
                                    value={method.accountTitle || ""}
                                    onChange={(e) => updateManualMethod(index, "accountTitle", e.target.value)}
                                    placeholder="Provider Name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Account / Wallet Number</label>
                                  <input
                                    type="text"
                                    value={method.accountNumber || ""}
                                    onChange={(e) => updateManualMethod(index, "accountNumber", e.target.value)}
                                    placeholder="e.g., 03XXXXXXXXX"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
                                  <input
                                    type="text"
                                    value={method.bankName || ""}
                                    onChange={(e) => updateManualMethod(index, "bankName", e.target.value)}
                                    placeholder="e.g., HBL, Meezan"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">IBAN (optional)</label>
                                  <input
                                    type="text"
                                    value={method.iban || ""}
                                    onChange={(e) => updateManualMethod(index, "iban", e.target.value)}
                                    placeholder="PK00XXXX...."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                                  />
                                </div>
                              </>
                            )}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Instructions for Customer</label>
                              <textarea
                                value={method.instructions || ""}
                                onChange={(e) => updateManualMethod(index, "instructions", e.target.value)}
                                rows={3}
                                placeholder="Explain how to pay and what transaction details to share."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Max 5 images)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#D7490C] transition-colors">
                      <Plus className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Image</span>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">Upload clear, high-quality images. First image will be the cover photo.</p>
            </div>

            {/* Submission Note */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Before submitting:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure all information is accurate and complete</li>
                    <li>Upload clear, professional images</li>
                    <li>Admin will review your listing within 24-48 hours</li>
                    <li>You'll be notified once approved</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Submit for Approval
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/provider/dashboard")}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddListing;