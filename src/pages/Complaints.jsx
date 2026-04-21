import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  AlertCircle,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";

const Complaints = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking");

  const [activeTab, setActiveTab] = useState(
    bookingId ? "new" : "my-complaints"
  );
  const [formData, setFormData] = useState({
    bookingId: bookingId || "",
    complaintType: "",
    subject: "",
    description: "",
    priority: "Medium",
  });

  // Sample existing complaints
  const myComplaints = [
    {
      id: 1,
      bookingId: "#B001",
      complaintType: "Event",
      subject: "Venue locked on event day",
      description:
        "The venue was locked when we arrived at 6 PM as scheduled. We tried contacting the provider but got no response for 2 hours.",
      status: "Under Investigation",
      priority: "High",
      submittedDate: "2025-11-02",
      providerName: "Elite Events",
      responses: [
        {
          id: 1,
          from: "Admin",
          message:
            "We are investigating this issue. The provider has been contacted.",
          timestamp: "2025-11-02 10:30 AM",
        },
        {
          id: 2,
          from: "Provider",
          message:
            "Sincere apologies. There was a miscommunication with our staff. We will provide full refund.",
          timestamp: "2025-11-02 2:15 PM",
        },
      ],
    },
    {
      id: 2,
      bookingId: "#B004",
      complaintType: "Service",
      subject: "Photographer didn't show up",
      description:
        "The photographer we booked didn't arrive at the venue. We had to hire someone else last minute at a higher cost.",
      status: "Resolved",
      priority: "High",
      submittedDate: "2025-10-22",
      resolvedDate: "2025-10-25",
      providerName: "Photo Studio Pro",
      resolution: "Full refund issued. Provider has been warned and penalized.",
      responses: [
        {
          id: 1,
          from: "Admin",
          message:
            "This is unacceptable behavior. We will investigate immediately.",
          timestamp: "2025-10-22 9:00 AM",
        },
        {
          id: 2,
          from: "Admin",
          message:
            "After investigation, we found the provider at fault. Full refund has been processed.",
          timestamp: "2025-10-25 11:00 AM",
        },
      ],
    },
    {
      id: 3,
      bookingId: "#B007",
      complaintType: "Resource",
      subject: "Damaged chairs delivered",
      description:
        "Out of 200 chairs ordered, about 30 were broken or damaged. This caused issues during the event.",
      status: "Open",
      priority: "Medium",
      submittedDate: "2025-11-03",
      providerName: "Event Rentals Pro",
      responses: [],
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitComplaint = (e) => {
    e.preventDefault();
    alert(
      "Complaint submitted successfully! Our team will investigate and respond within 24-48 hours."
    );
    setFormData({
      bookingId: "",
      complaintType: "",
      subject: "",
      description: "",
      priority: "Medium",
    });
    setActiveTab("my-complaints");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-orange-100 text-orange-700";
      case "Under Investigation":
        return "bg-blue-100 text-blue-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Complaints & Disputes</h1>
          <p className="text-orange-100">
            Report issues and track complaint resolution
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("my-complaints")}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === "my-complaints"
                    ? "border-[#D7490C] text-[#D7490C]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                My Complaints
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === "new"
                    ? "border-[#D7490C] text-[#D7490C]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                File New Complaint
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* My Complaints Tab */}
            {activeTab === "my-complaints" && (
              <div className="space-y-6">
                {myComplaints.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No complaints filed
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You haven't filed any complaints yet.
                    </p>
                    <button
                      onClick={() => setActiveTab("new")}
                      className="px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all"
                    >
                      File a Complaint
                    </button>
                  </div>
                ) : (
                  myComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      {/* Complaint Header */}
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-orange-100 text-[#D7490C] rounded-full font-medium">
                              {complaint.complaintType}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                                complaint.status
                              )}`}
                            >
                              {complaint.status}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                                complaint.priority
                              )}`}
                            >
                              {complaint.priority} Priority
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {complaint.subject}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Booking ID: {complaint.bookingId}</div>
                            <div>Provider: {complaint.providerName}</div>
                            <div>
                              Submitted:{" "}
                              {new Date(
                                complaint.submittedDate
                              ).toLocaleDateString()}
                            </div>
                            {complaint.resolvedDate && (
                              <div>
                                Resolved:{" "}
                                {new Date(
                                  complaint.resolvedDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Complaint Description */}
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">{complaint.description}</p>
                      </div>

                      {/* Resolution (if resolved) */}
                      {complaint.resolution && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Resolution</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {complaint.resolution}
                          </p>
                        </div>
                      )}

                      {/* Responses */}
                      {complaint.responses.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Responses
                          </h4>
                          <div className="space-y-3">
                            {complaint.responses.map((response) => (
                              <div
                                key={response.id}
                                className={`p-3 rounded-lg ${
                                  response.from === "Admin"
                                    ? "bg-blue-50 border border-blue-200"
                                    : "bg-purple-50 border border-purple-200"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {response.from}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {response.timestamp}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {response.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Response (if open or under investigation) */}
                      {(complaint.status === "Open" ||
                        complaint.status === "Under Investigation") && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a response..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                          />
                          <button className="flex items-center gap-2 px-4 py-2 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors">
                            <Send className="w-4 h-4" />
                            Send
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* New Complaint Tab */}
            {activeTab === "new" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  File a New Complaint
                </h2>

                <form onSubmit={handleSubmitComplaint} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Booking ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="bookingId"
                        value={formData.bookingId}
                        onChange={handleInputChange}
                        placeholder="e.g., #B001"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Find your booking ID in "My Bookings" page
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complaint Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="complaintType"
                        value={formData.complaintType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="Event">Event</option>
                        <option value="Service">Service</option>
                        <option value="Resource">Resource</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    >
                      <option value="Low">Low - Minor inconvenience</option>
                      <option value="Medium">Medium - Significant issue</option>
                      <option value="High">High - Critical problem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief summary of the issue"
                      required
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about the issue..."
                      required
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Include dates, times, and any relevant details
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">
                          Before filing a complaint:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Try contacting the provider directly first</li>
                          <li>Provide accurate and complete information</li>
                          <li>Our team will investigate within 24-48 hours</li>
                          <li>
                            False complaints may result in account penalties
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all"
                    >
                      Submit Complaint
                    </button>
                    <Link
                      to="/bookings"
                      className="px-8 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;
