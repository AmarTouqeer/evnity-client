import {
  Bell,
  Check,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  Settings,
  Star,
  Loader2,
} from "lucide-react";
import { useNotifications, formatTime } from "../context/notification-context";

/* ─────────────────────────────────────────────
   Icon + colour map (presentation only)
───────────────────────────────────────────── */
const TYPE_CONFIG = {
  booking_created:          { Icon: Calendar,    color: "bg-blue-100 text-blue-600" },
  booking_accepted:         { Icon: Calendar,    color: "bg-blue-100 text-blue-600" },
  booking_rejected:         { Icon: Calendar,    color: "bg-blue-100 text-blue-600" },
  booking_confirmed:        { Icon: Calendar,    color: "bg-blue-100 text-blue-600" },
  booking_cancelled:        { Icon: Calendar,    color: "bg-blue-100 text-blue-600" },
  booking_completed:        { Icon: Calendar,    color: "bg-blue-100 text-blue-600" },
  payment_received:         { Icon: DollarSign,  color: "bg-green-100 text-green-600" },
  payment_confirmed:        { Icon: DollarSign,  color: "bg-green-100 text-green-600" },
  payment_failed:           { Icon: DollarSign,  color: "bg-red-100 text-red-600" },
  review_received:          { Icon: Star,        color: "bg-yellow-100 text-yellow-600" },
  admin_approval:           { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  admin_rejection:          { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  event_approved:           { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  event_rejected:           { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  resource_approved:        { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  resource_rejected:        { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  service_approved:         { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  service_rejected:         { Icon: Settings,    color: "bg-purple-100 text-purple-600" },
  resource_return_reminder: { Icon: AlertCircle, color: "bg-orange-100 text-orange-600" },
  stripe_connected:         { Icon: DollarSign,  color: "bg-green-100 text-green-600" },
  stripe_disconnected:      { Icon: DollarSign,  color: "bg-red-100 text-red-600" },
  general:                  { Icon: Bell,        color: "bg-gray-100 text-gray-600" },
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const Notifications = () => {
  const {
    filteredNotifications,
    unreadCount,
    loading,
    error,
    currentPage,
    totalPages,
    filter,
    setFilter,
    filters,          // role-specific tab list from context
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
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
        {/* ── Role-specific Filters ── */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {filters.map(({ key, label }) => {
              const count =
                key === "all"
                  ? filteredNotifications.length
                  : key === "unread"
                  ? unreadCount
                  : null;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setFilter(key);
                    fetchNotifications(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === key
                      ? "bg-[#D7490C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  {count !== null ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-[#D7490C] animate-spin" />
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchNotifications(currentPage)}
              className="px-4 py-2 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Notifications List ── */}
        {!loading && !error && (
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
                const { Icon, color } =
                  TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.general;
                const isUnread = !notification.isRead;

                return (
                  <div
                    key={notification._id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                      isUnread ? "border-l-4 border-[#D7490C]" : ""
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg ${color}`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {notification.title}
                            </h3>
                            {isUnread && (
                              <span className="h-3 w-3 bg-[#D7490C] rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>

                          <p className="text-gray-700 mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>

                            <div className="flex gap-2">
                              {isUnread && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  Mark as read
                                </button>
                              )}

                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>

                              {notification.actionUrl && (
                                <a
                                  href={notification.actionUrl}
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

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <button
                  onClick={() => fetchNotifications(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white shadow text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchNotifications(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white shadow text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;