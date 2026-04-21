import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  DollarSign,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

const Notifications = () => {
  const [filter, setFilter] = useState("all");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "booking",
      icon: Calendar,
      title: "Booking Confirmed",
      message:
        "Your booking for Grand Wedding Hall has been confirmed by the provider.",
      time: "2 hours ago",
      unread: true,
      link: "/bookings",
    },
    {
      id: 2,
      type: "payment",
      icon: DollarSign,
      title: "Payment Verified",
      message:
        "Your payment receipt has been verified by admin. Booking is now active.",
      time: "5 hours ago",
      unread: true,
      link: "/bookings",
    },
    {
      id: 3,
      type: "message",
      icon: MessageCircle,
      title: "New Message from Provider",
      message: "Elite Events sent you a message regarding your upcoming event.",
      time: "1 day ago",
      unread: false,
      link: "/messages",
    },
    {
      id: 4,
      type: "booking",
      icon: Calendar,
      title: "Booking Request Pending",
      message:
        "Your booking request for Professional Photography is awaiting provider approval.",
      time: "1 day ago",
      unread: false,
      link: "/bookings",
    },
    {
      id: 5,
      type: "complaint",
      icon: AlertCircle,
      title: "Complaint Update",
      message:
        "Admin has responded to your complaint #C001. View the response.",
      time: "2 days ago",
      unread: false,
      link: "/complaints",
    },
    {
      id: 6,
      type: "payment",
      icon: DollarSign,
      title: "Receipt Upload Reminder",
      message: "Don't forget to upload your payment receipt for booking #B002.",
      time: "3 days ago",
      unread: false,
      link: "/bookings/2/upload-receipt",
    },
  ]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return notification.unread;
    return notification.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getTypeColor = (type) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-600";
      case "payment":
        return "bg-green-100 text-green-600";
      case "message":
        return "bg-purple-100 text-purple-600";
      case "complaint":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications</h1>
              <p className="text-orange-100">
                You have {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white text-[#D7490C] rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#D7490C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "unread"
                  ? "bg-[#D7490C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("booking")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "booking"
                  ? "bg-[#D7490C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Bookings
            </button>
            <button
              onClick={() => setFilter("payment")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "payment"
                  ? "bg-[#D7490C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setFilter("message")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "message"
                  ? "bg-[#D7490C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setFilter("complaint")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "complaint"
                  ? "bg-[#D7490C] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Complaints
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                    notification.unread ? "border-l-4 border-[#D7490C]" : ""
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`p-3 rounded-lg ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <span className="h-3 w-3 bg-[#D7490C] rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {notification.time}
                          </span>
                          <div className="flex gap-2">
                            {notification.unread && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                            {notification.link && (
                              <a
                                href={notification.link}
                                className="px-3 py-1 text-sm bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
