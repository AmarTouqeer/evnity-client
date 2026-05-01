import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, X, Loader2, Plus, Trash2, ChevronDown, MapPin } from "lucide-react";
import {
  eventAPI,
  serviceAPI,
  resourceAPI,
  uploadAPI,
  providerStripeAPI,
} from "../services/api";
import {
  getCityCoordinates,
  getCityNames,
  pakistanCities,
} from "../components/CitiesList";

const EditListing = () => {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    venue: "",
    location: "",   // city name
    address: "",
    price: "",
    capacity: "",
    quantity: "",
  });

  const [availableDates, setAvailableDates] = useState([]);

  const [paymentOptions, setPaymentOptions] = useState({
    stripe: { enabled: false, currency: "pkr" },
    manual: { enabled: true, methods: [] },
  });

  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeStatusLoading, setStripeStatusLoading] = useState(false);
  const [stripeStatusError, setStripeStatusError] = useState(null);

  // ── City dropdown state (matches AddListing) ────────────────────────────
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef(null);

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

  const handleCitySelect = (cityName) => {
    setFormData((prev) => ({ ...prev, location: cityName }));
    setCitySearch("");
    setShowCityDropdown(false);
  };

  // ── Categories ──────────────────────────────────────────────────────────
  const eventCategories = [
    "Wedding", "Birthday", "Corporate", "Religious",
    "Cultural", "Sports", "Music", "Other",
  ];
  const serviceCategories = [
    "Photography", "Videography", "Catering", "DJ",
    "Entertainment", "Planning", "Decorator", "Makeup", "Other",
  ];
  const resourceCategories = [
    "Furniture", "Equipment", "Decoration", "Lighting",
    "Sound", "Catering", "Tent", "Other",
  ];

  // ── Fetch listing data ──────────────────────────────────────────────────
  useEffect(() => {
    fetchListingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  useEffect(() => {
    const fetchStripeStatus = async () => {
      try {
        setStripeStatusLoading(true);
        setStripeStatusError(null);
        const response = await providerStripeAPI.getStatus();
        if (response.success) setStripeStatus(response.data);
        else setStripeStatusError(response.message || "Failed to load Stripe status");
      } catch (error) {
        setStripeStatusError(error.message || "Failed to load Stripe status");
      } finally {
        setStripeStatusLoading(false);
      }
    };
    fetchStripeStatus();
  }, []);

  const fetchListingData = async () => {
    try {
      setFetchLoading(true);
      let response;

      if (type === "event")         response = await eventAPI.getById(id);
      else if (type === "service")  response = await serviceAPI.getById(id);
      else if (type === "resource") response = await resourceAPI.getById(id);

      if (response.success) {
        const data =
          response.data.event ||
          response.data.service ||
          response.data.resource;

        const po = data.paymentOptions || {};

        if (type === "event") {
          setFormData({
            title:       data.title || "",
            description: data.description || "",
            category:    data.category || "",
            venue:       data.venue || "",
            location:    data.location?.city || "",
            address:     data.location?.address || "",
            price:       data.charges || "",
            capacity:    data.capacity || "",
            quantity:    "",
          });
          if (data.availableDates?.length) {
            setAvailableDates(
              data.availableDates.map((d) => ({
                date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
                startTime: d.startTime || "",
                endTime:   d.endTime   || "",
                isBooked:  d.isBooked  || false,
              }))
            );
          }
        } else if (type === "service") {
          setFormData({
            title:       data.title || "",
            description: data.description || "",
            category:    data.category || "",
            venue:       "",
            location:    data.location?.city || "",
            address:     data.location?.address || "",
            price:       data.pricing?.basePrice || "",
            capacity:    "",
            quantity:    "",
          });
        } else if (type === "resource") {
          setFormData({
            title:       data.name || "",
            description: data.description || "",
            category:    data.category || "",
            venue:       "",
            location:    data.location?.city || "",
            address:     data.location?.address || "",
            price:       data.rentalPrice || "",
            capacity:    "",
            quantity:    data.quantity || "",
          });
        }

        setPaymentOptions({
          stripe: {
            enabled:  po.stripe?.enabled ?? false,
            currency: po.stripe?.currency || "pkr",
          },
          manual: {
            enabled: po.manual?.enabled ?? true,
            methods: po.manual?.methods  || [],
          },
        });

        if (data.images?.length) setExistingImages(data.images);
      } else {
        alert("Failed to fetch listing data");
        navigate("/provider/dashboard");
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      alert("Failed to load listing data");
      navigate("/provider/dashboard");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Available dates helpers ─────────────────────────────────────────────
  const addDate = () => {
    setAvailableDates((prev) => [
      ...prev,
      { date: "", startTime: "", endTime: "", isBooked: false },
    ]);
  };

  const updateDate = (index, field, value) => {
    setAvailableDates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeDate = (index) => {
    setAvailableDates((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Image helpers ───────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 5));
  };

  const removeImage         = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const removeExistingImage = (index) => setExistingImages((prev) => prev.filter((_, i) => i !== index));

  // ── Payment helpers ─────────────────────────────────────────────────────
  const handleStripeToggle = () =>
    setPaymentOptions((prev) => ({
      ...prev,
      stripe: { ...prev.stripe, enabled: !prev.stripe.enabled },
    }));

  const handleStripeCurrencyChange = (e) =>
    setPaymentOptions((prev) => ({
      ...prev,
      stripe: { ...prev.stripe, currency: e.target.value.toLowerCase() || "pkr" },
    }));

  const handleManualToggle = () =>
    setPaymentOptions((prev) => ({
      ...prev,
      manual: { ...prev.manual, enabled: !prev.manual.enabled },
    }));

  const handleConnectStripe = async () => {
    try {
      setStripeStatusLoading(true);
      const response = await providerStripeAPI.getConnectUrl();
      if (response?.data?.isConnected) {
        const statusResponse = await providerStripeAPI.getStatus();
        if (statusResponse.success) setStripeStatus(statusResponse.data);
        alert("Your Stripe account is already connected!");
        return;
      }
      if (!response || response.success === false)
        throw new Error(response?.message || "Failed to start Stripe Connect onboarding.");
      const url = response.data?.authUrl;
      if (!url) throw new Error("Stripe Connect URL was not returned by the server.");
      window.location.href = url;
    } catch (error) {
      alert(error.message || "Failed to start Stripe Connect onboarding.");
    } finally {
      setStripeStatusLoading(false);
    }
  };

  const canUseStripePayments =
    stripeStatus?.isConnected &&
    stripeStatus?.stripeConnectStatus === "active" &&
    stripeStatus?.stripeChargesEnabled;

  const addManualMethod = () =>
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

  const updateManualMethod = (index, field, value) => {
    setPaymentOptions((prev) => {
      const methods = [...prev.manual.methods];
      methods[index] = { ...methods[index], [field]: value };
      if (field === "type") {
        if (value === "easypaisa")     methods[index].label = "Easypaisa";
        if (value === "jazzcash")      methods[index].label = "JazzCash Wallet";
        if (value === "bank_transfer") methods[index].label = "Bank Transfer";
        if (value === "cash")          methods[index].label = "Cash";
      }
      return { ...prev, manual: { ...prev.manual, methods } };
    });
  };

  const removeManualMethod = (index) =>
    setPaymentOptions((prev) => ({
      ...prev,
      manual: { ...prev.manual, methods: prev.manual.methods.filter((_, i) => i !== index) },
    }));

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && images.length === 0) {
      alert("Please keep at least one image");
      return;
    }

    // ✅ FIX: resolve coordinates from city just like AddListing
    const coordinates = getCityCoordinates(formData.location);
    if (!coordinates) {
      alert("Please select a valid city from the list.");
      return;
    }

    try {
      setLoading(true);

      // Upload new images if any
      let uploadedImages = [...existingImages];
      if (images.length > 0) {
        const formDataImages = new FormData();
        images.forEach((image) => formDataImages.append("images", image.file));

        const uploadResponse = await uploadAPI.uploadMultiple(formDataImages);
        if (!uploadResponse.success)
          throw new Error(uploadResponse.message || "Failed to upload images");

        const newUploaded = uploadResponse.data.images || uploadResponse.data || [];
        uploadedImages = [
          ...existingImages,
          ...newUploaded.map((img) => ({ url: img.url, publicId: img.publicId })),
        ];
      }

      let response;

      if (type === "event") {
        const eventData = {
          title:       formData.title,
          description: formData.description,
          category:    formData.category.toLowerCase(),
          venue:       formData.venue,
          location: {
            city:    formData.location,
            address: formData.address || formData.location,
            geo: {                                            // ✅ FIX
              type: "Point",
              coordinates: [coordinates.lng, coordinates.lat],
            },
          },
          charges:  Number(formData.price),
          capacity: Number(formData.capacity),
          availableDates: availableDates
            .filter((d) => d.date)
            .map((d) => ({
              date:      new Date(d.date),
              startTime: d.startTime,
              endTime:   d.endTime,
              isBooked:  d.isBooked,
            })),
          images: uploadedImages,
          paymentOptions,
        };
        response = await eventAPI.update(id, eventData);
      } else if (type === "service") {
        const serviceData = {
          title:       formData.title,
          description: formData.description,
          category:    formData.category.toLowerCase(),
          pricing: {
            basePrice:   Number(formData.price),
            pricingType: "package",
          },
          location: {
            city:    formData.location,
            address: formData.address || formData.location,
            geo: {                                            // ✅ FIX (send for consistency)
              type: "Point",
              coordinates: [coordinates.lng, coordinates.lat],
            },
          },
          images: uploadedImages,
          paymentOptions,
        };
        response = await serviceAPI.update(id, serviceData);
      } else if (type === "resource") {
        const resourceData = {
          name:              formData.title,
          description:       formData.description,
          category:          formData.category.toLowerCase(),
          rentalPrice:       Number(formData.price),
          quantity:          Number(formData.quantity),
          availableQuantity: Number(formData.quantity),
          location: {
            city:    formData.location,
            address: formData.address || formData.location,
            geo: {                                            // ✅ FIX (send for consistency)
              type: "Point",
              coordinates: [coordinates.lng, coordinates.lat],
            },
          },
          images: uploadedImages,
          paymentOptions,
        };
        response = await resourceAPI.update(id, resourceData);
      }

      if (response.success) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`);
        navigate("/provider/dashboard");
      } else {
        alert(response.message || "Failed to update listing");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      alert(error.message || "Failed to update listing");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D7490C] mx-auto mb-4" />
          <p className="text-gray-600">Loading listing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Edit {type.charAt(0).toUpperCase() + type.slice(1)}
          </h1>
          <p className="text-lg text-gray-600">Update your listing information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Information ── */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  placeholder="Enter listing title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  placeholder="Describe your listing..."
                />
              </div>

              {/* Venue — events only */}
              {type === "event" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    placeholder="e.g., Grand Ballroom, Rooftop Garden"
                  />
                </div>
              )}

              {/* Category + City (searchable dropdown like AddListing) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {(type === "event"
                      ? eventCategories
                      : type === "service"
                      ? serviceCategories
                      : resourceCategories
                    ).map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ FIX: searchable city dropdown (identical behavior to AddListing) */}
                <div className="relative" ref={cityDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={showCityDropdown ? citySearch : formData.location || ""}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Search city..."
                      required={!formData.location}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
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

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  placeholder="Street address, area, landmark..."
                />
              </div>

              {/* Price + Capacity / Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (PKR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    placeholder="Enter price"
                  />
                </div>

                {type === "event" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                      placeholder="Number of guests"
                    />
                  </div>
                )}

                {type === "resource" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                      placeholder="Available quantity"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Available Dates — events only (unchanged) ── */}
          {type === "event" && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Available Dates</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add the dates this event is available for booking
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDate}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Date
                </button>
              </div>

              {availableDates.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500 text-sm">
                    No available dates added. Click "Add Date" to add one.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableDates.map((d, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                        <input
                          type="date"
                          value={d.date}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => updateDate(index, "date", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={d.startTime}
                          onChange={(e) => updateDate(index, "startTime", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={d.endTime}
                          onChange={(e) => updateDate(index, "endTime", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            d.isBooked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {d.isBooked ? "Booked" : "Available"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDate(index)}
                          className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Payment Options (unchanged from your version) ── */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Options</h2>

            {/* Stripe */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Stripe (Card Payments via Connect)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {canUseStripePayments
                      ? "Your Stripe account is connected. Enable or disable card payments for this listing."
                      : "Connect your Stripe account to accept card payments."}
                  </p>
                  {stripeStatusError && (
                    <p className="text-xs text-red-600 mt-1">{stripeStatusError}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStripeToggle}
                  disabled={!canUseStripePayments}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !canUseStripePayments
                      ? "bg-gray-300 opacity-50 cursor-not-allowed"
                      : paymentOptions.stripe.enabled
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      paymentOptions.stripe.enabled ? "translate-x-6" : "translate-x-1"
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
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent ${
                      !canUseStripePayments ? "bg-gray-100" : ""
                    }`}
                    placeholder="PKR"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Use standard 3-letter currency code. Default is PKR.
                  </p>
                </div>
                <div className="flex flex-col justify-center text-[11px] text-gray-600">
                  {stripeStatusLoading ? (
                    <span>Checking Stripe connection...</span>
                  ) : canUseStripePayments ? (
                    <span>Stripe Connect is active. Customers will be redirected to Stripe Checkout.</span>
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
                    Configure Easypaisa, JazzCash, bank transfer, or cash. Customers pay outside the app and upload a receipt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleManualToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    paymentOptions.manual.enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      paymentOptions.manual.enabled ? "translate-x-6" : "translate-x-1"
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
                      No manual methods added yet. Click <span className="font-semibold">Add Method</span> to configure one.
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
                            className={`text-xs px-3 py-1 rounded-full border ${
                              method.isActive
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
                                placeholder="e.g., 03XXXXXXXXX or IBAN"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name (for transfers)</label>
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
                            placeholder="Explain how to pay and what details to share after payment."
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

          {/* ── Images (unchanged) ── */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Images</h2>

            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img.url} alt={`Existing ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {images.length + existingImages.length < 5 && (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#D7490C] transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload Image</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Total: {images.length + existingImages.length}/5 (
                {5 - images.length - existingImages.length} more allowed)
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Listing"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/provider/dashboard")}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;