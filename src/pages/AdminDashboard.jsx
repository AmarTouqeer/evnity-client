import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Check,
  X,
  LogOut,
  Star,
  Trash2,
  ShieldOff,
} from "lucide-react";
import { paymentAPI } from "../services/api";
import DataTable from "../components/DataTable";

/* ─────────────────────────── helpers ─────────────────────────────────────── */
const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authFetch = async (path, method = "GET", body = null) => {
  const token = localStorage.getItem("token");
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const res = await fetch(`${api}${path}`, opts);
  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
  return res.json();
};

const authGet = (path) => authFetch(path, "GET");
const authPost = (path, body) => authFetch(path, "POST", body ?? {});
const authPut = (path, body) => authFetch(path, "PUT", body ?? {});
const authDel = (path) => authFetch(path, "DELETE");

const money = (n, d = 0) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

/* ── status badge ── */
const STATUS_CFG = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  published: "bg-sky-100 text-sky-700",
  blocked: "bg-red-100 text-red-700",
};
const Badge = ({ status }) => (
  <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CFG[status] ?? "bg-gray-100 text-gray-500"}`}>
    {status ?? "—"}
  </span>
);

/* ── role badge ── */
const RoleBadge = ({ role }) => (
  <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${role === "provider" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
    {role}
  </span>
);

/* ── star display ── */
const Stars = ({ rating }) => (
  <span className="text-yellow-500 text-xs">
    {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    <span className="text-gray-500 ml-1">{rating}/5</span>
  </span>
);

/* ── sub-filter strip ── */
const SubFilter = ({ value, onChange, counts }) => {
  const opts = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
      {opts.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${value === key ? "bg-white shadow text-[#D7490C]" : "text-gray-500 hover:text-gray-800"
            }`}
        >
          {label}
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${value === key ? "bg-orange-100 text-[#D7490C]" : "bg-gray-200 text-gray-500"
            }`}>
            {counts[key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
};

/* ── stat card ── */
const StatCard = ({ icon, iconBg, title, total, pending }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
    </div>
    {pending > 0 && (
      <span className="shrink-0 text-[11px] font-semibold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
        {pending} pending
      </span>
    )}
  </div>
);

/* ── reject modal ── */
const RejectModal = ({ title, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-gray-500">This reason will be visible to the user / provider.</p>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#D7490C]/25 focus:border-[#D7490C] transition"
            rows={4}
            placeholder="Enter rejection reason (min 10 characters)…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            autoFocus
          />
          <p className="text-right text-[11px] text-gray-400">{reason.length}/500</p>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || reason.trim().length < 10}
            className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? "Rejecting…" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  AdminDashboard                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  /* sub-filters */
  const [userFilter, setUserFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");

  /* reject modal */
  const [rejectTarget, setRejectTarget] = useState(null);

  /* data */
  const [allUsers, setAllUsers] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [allReviews, setAllReviews] = useState([]);

  const [stats, setStats] = useState({
    totalUsers: 0, pendingUsers: 0,
    totalEvents: 0, pendingEvents: 0,
    totalServices: 0, pendingServices: 0,
    totalResources: 0, pendingResources: 0,
    totalBookings: 0, totalRevenue: 0,
    grossRevenue: 0, providerPayouts: 0,
  });

  /* ── auth guard ── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "admin") { navigate("/admin/login"); return; }
    load();
  }, []);

  /* ── data loader ── */
  const load = async () => {
    setIsLoading(true);
    setError("");

    const safe = async (fn) => { try { return await fn(); } catch { return null; } };

    /* users */
    const [userStats, pend, appr, rej] = await Promise.all([
      safe(() => authGet("/admin/user-stats")),
      safe(() => authGet("/admin/pending-users?limit=500")),
      safe(() => authGet("/admin/approved-users?limit=500")),
      safe(() => authGet("/admin/rejected-users?limit=500")),
    ]);

    if (userStats?.data?.overall) {
      const o = userStats.data.overall;
      setStats((s) => ({ ...s, totalUsers: o.total, pendingUsers: o.pending }));
    }

    setAllUsers([
      ...(pend?.data?.users ?? []).map((u) => ({ ...u, _status: "pending" })),
      ...(appr?.data?.users ?? []).map((u) => ({ ...u, _status: "approved" })),
      ...(rej?.data?.users ?? []).map((u) => ({ ...u, _status: "rejected" })),
    ]);

    /* events */
    const [pendEv, apprEv, rejEv] = await Promise.all([
      safe(() => authGet("/events?adminApprovalStatus=pending&limit=500")),
      safe(() => authGet("/events?adminApprovalStatus=approved&limit=500")),
      safe(() => authGet("/events?adminApprovalStatus=rejected&limit=500")),
    ]);
    const evArr = [
      ...(pendEv?.data?.events ?? []),
      ...(apprEv?.data?.events ?? []),
      ...(rejEv?.data?.events ?? []),
    ];
    setAllEvents(evArr);
    setStats((s) => ({ ...s, totalEvents: evArr.length, pendingEvents: (pendEv?.data?.events ?? []).length }));

    /* services */
    const [pendSv, apprSv, rejSv] = await Promise.all([
      safe(() => authGet("/services?adminApprovalStatus=pending&limit=500")),
      safe(() => authGet("/services?adminApprovalStatus=approved&limit=500")),
      safe(() => authGet("/services?adminApprovalStatus=rejected&limit=500")),
    ]);
    const svArr = [
      ...(pendSv?.data?.services ?? []),
      ...(apprSv?.data?.services ?? []),
      ...(rejSv?.data?.services ?? []),
    ];
    setAllServices(svArr);
    setStats((s) => ({ ...s, totalServices: svArr.length, pendingServices: (pendSv?.data?.services ?? []).length }));

    /* resources */
    const [pendRs, apprRs, rejRs] = await Promise.all([
      safe(() => authGet("/resources?adminApprovalStatus=pending&limit=500")),
      safe(() => authGet("/resources?adminApprovalStatus=approved&limit=500")),
      safe(() => authGet("/resources?adminApprovalStatus=rejected&limit=500")),
    ]);
    const rsArr = [
      ...(pendRs?.data?.resources ?? []),
      ...(apprRs?.data?.resources ?? []),
      ...(rejRs?.data?.resources ?? []),
    ];
    setAllResources(rsArr);
    setStats((s) => ({ ...s, totalResources: rsArr.length, pendingResources: (pendRs?.data?.resources ?? []).length }));

    /* reviews */
    const revRes = await safe(() => authGet("/admin/reviews?limit=500"));
    setAllReviews(revRes?.data?.reviews ?? []);

    setIsLoading(false);

    /* revenue — non-blocking */
    try {
      const fees = await paymentAPI.getAdminDeductedFees();
      const t = fees.data?.totals ?? {};
      setStats((s) => ({
        ...s,
        totalRevenue: t.totalDeductedFees ?? 0,
        totalBookings: t.totalBookings ?? 0,
        grossRevenue: t.totalGrossRevenue ?? 0,
        providerPayouts: t.totalPaidToProviders ?? 0,
      }));
    } catch { /* ignore */ }
  };

  /* ── approve / reject listings & users ── */
  const approve = async (type, row) => {
    if (!confirm(`Approve this ${type}?`)) return;
    setBusyId(row._id);
    try {
      const ep = {
        user: `/admin/approve-user/${row._id}`,
        event: `/admin/approve-event/${row._id}`,
        service: `/admin/approve-service/${row._id}`,
        resource: `/admin/approve-resource/${row._id}`,
      }[type];
      const res = await authPost(ep);
      if (res.success ?? true) await load();
      else alert(res.message ?? "Failed to approve");
    } catch (e) { alert(e.message); }
    setBusyId(null);
  };

  const reject = async (reason) => {
    if (!rejectTarget) return;
    const { type, row } = rejectTarget;
    setBusyId(row._id);
    try {
      const ep = {
        user: `/admin/reject-user/${row._id}`,
        event: `/admin/reject-event/${row._id}`,
        service: `/admin/reject-service/${row._id}`,
        resource: `/admin/reject-resource/${row._id}`,
      }[type];
      const res = await authPost(ep, { reason });
      if (res.success ?? true) { setRejectTarget(null); await load(); }
      else alert(res.message ?? "Failed to reject");
    } catch (e) { alert(e.message); }
    setBusyId(null);
  };

  /* ── review actions ── */
  const deleteReview = async (reviewId) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setBusyId(reviewId);
    try {
      await authDel(`/admin/reviews/${reviewId}`);
      await load();
    } catch (e) { alert(e.message ?? "Failed to delete review"); }
    setBusyId(null);
  };

  /* ── listing delete ── */
  const deleteListing = async (type, id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await authDel(`/admin/${type}s/${id}`);
      await load();
    } catch (e) { alert(e.message ?? "Failed to delete listing"); }
    setBusyId(null);
  };

  /* ── block / unblock provider ── */
  const blockProvider = async (providerId, providerName) => {
    if (!confirm(`Block provider "${providerName}"? They won't be able to log in.`)) return;
    setBusyId(providerId);
    try {
      await authPut(`/admin/block-user/${providerId}`);
      alert("Provider blocked successfully.");
      await load();
    } catch (e) { alert(e.message ?? "Failed to block provider"); }
    setBusyId(null);
  };

  const unblockProvider = async (providerId, providerName) => {
    if (!confirm(`Unblock provider "${providerName}"?`)) return;
    setBusyId(providerId);
    try {
      await authPut(`/admin/unblock-user/${providerId}`);
      alert("Provider unblocked successfully.");
      await load();
    } catch (e) { alert(e.message ?? "Failed to unblock provider"); }
    setBusyId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ── filter helpers ── */
  const byStatus = (arr, filter, key = "adminApprovalStatus") =>
    filter === "all" ? arr : arr.filter((r) => (r[key] || r._status) === filter);

  const countBy = (arr, key = "adminApprovalStatus") => ({
    all: arr.length,
    pending: arr.filter((r) => (r[key] || r._status) === "pending").length,
    approved: arr.filter((r) => (r[key] || r._status) === "approved").length,
    rejected: arr.filter((r) => (r[key] || r._status) === "rejected").length,
  });

  /* ── column definitions ── */
  const userColumns = [
    {
      key: "_avatar", label: "", width: "44px",
      render: (r) => (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B7410E] to-[#D7490C] flex items-center justify-center text-white text-xs font-bold shrink-0">
          {(r.name ?? "?").charAt(0).toUpperCase()}
        </div>
      ),
    },
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role", sortable: true, render: (r) => <RoleBadge role={r.role} /> },
    { key: "city", label: "City", sortable: true },
    { key: "_status", label: "Status", sortable: true, render: (r) => <Badge status={r._status} /> },
    { key: "createdAt", label: "Registered", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const thumbCell = (colorClass, Icon) => ({
    key: "_img", label: "", width: "60px",
    render: (r) =>
      r.images?.[0]?.url ? (
        <img src={r.images[0].url} alt="" className="w-11 h-9 object-cover rounded" />
      ) : (
        <div className={`w-11 h-9 rounded flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4 opacity-50" />
        </div>
      ),
  });

  const eventColumns = [
    thumbCell("bg-orange-100 text-orange-400", Calendar),
    { key: "title", label: "Title", sortable: true },
    {
      key: "category", label: "Category", sortable: true,
      render: (r) => <span className="text-[11px] px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">{r.category}</span>
    },
    { key: "provider.name", label: "Provider", sortable: true, render: (r) => r.provider?.name ?? "—" },
    { key: "location.city", label: "City", sortable: true, render: (r) => r.location?.city ?? "—" },
    { key: "venue", label: "Venue" },
    { key: "capacity", label: "Capacity", sortable: true },
    {
      key: "charges", label: "Price", sortable: true,
      render: (r) => r.charges ? `PKR ${Number(r.charges).toLocaleString()}` : "—"
    },
    { key: "adminApprovalStatus", label: "Status", sortable: true, render: (r) => <Badge status={r.adminApprovalStatus} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const serviceColumns = [
    thumbCell("bg-purple-100 text-purple-400", Package),
    { key: "title", label: "Title", sortable: true },
    {
      key: "category", label: "Category", sortable: true,
      render: (r) => <span className="text-[11px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">{r.category}</span>
    },
    { key: "provider.name", label: "Provider", sortable: true, render: (r) => r.provider?.name ?? "—" },
    { key: "location.city", label: "City", sortable: true, render: (r) => r.location?.city ?? "—" },
    {
      key: "pricing.basePrice", label: "Base Price", sortable: true,
      render: (r) => r.pricing?.basePrice ? `PKR ${Number(r.pricing.basePrice).toLocaleString()}` : "—"
    },
    { key: "adminApprovalStatus", label: "Status", sortable: true, render: (r) => <Badge status={r.adminApprovalStatus} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const resourceColumns = [
    thumbCell("bg-emerald-100 text-emerald-400", Package),
    { key: "name", label: "Name", sortable: true },
    {
      key: "category", label: "Category", sortable: true,
      render: (r) => <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">{r.category}</span>
    },
    { key: "provider.name", label: "Provider", sortable: true, render: (r) => r.provider?.name ?? "—" },
    { key: "location.city", label: "City", sortable: true, render: (r) => r.location?.city ?? "—" },
    {
      key: "rentalPrice", label: "Rental Price", sortable: true,
      render: (r) => r.rentalPrice ? `PKR ${Number(r.rentalPrice).toLocaleString()}` : "—"
    },
    { key: "availableQuantity", label: "Qty", sortable: true },
    { key: "adminApprovalStatus", label: "Status", sortable: true, render: (r) => <Badge status={r.adminApprovalStatus} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  /* ── action builders ── */
  const makeActions = (type, statusKey = "adminApprovalStatus") => [
    {
      label: "Approve", color: "green", icon: <Check className="w-3.5 h-3.5" />,
      disabled: (r) => (r[statusKey] || r._status) !== "pending",
      loading: (r) => busyId === r._id,
      onClick: (r) => approve(type, r),
    },
    {
      label: "Reject", color: "red", icon: <X className="w-3.5 h-3.5" />,
      disabled: (r) => (r[statusKey] || r._status) !== "pending",
      loading: (r) => busyId === r._id,
      onClick: (r) => setRejectTarget({ type, row: r }),
    },
  ];

  const userActions = makeActions("user", "_status");
  const eventActions = makeActions("event");
  const serviceActions = makeActions("service");
  const resourceActions = makeActions("resource");

  const TABS = ["overview", "users", "events", "services", "resources", "reviews",];

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-[#D7490C] border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const pendingUserRows = allUsers.filter((u) => u._status === "pending");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── header ── */}
      <header className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-7 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-orange-200 text-sm mt-0.5">
              Manage users · events · services · resources · reviews
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="text-sm bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">{error}</div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-7 space-y-6">

        {/* ── stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard icon={<Users className="w-6 h-6 text-blue-600" />} iconBg="bg-blue-100" title="Total Users" total={stats.totalUsers} pending={stats.pendingUsers} />
          <StatCard icon={<Calendar className="w-6 h-6 text-[#D7490C]" />} iconBg="bg-orange-100" title="Total Events" total={stats.totalEvents} pending={stats.pendingEvents} />
          <StatCard icon={<Package className="w-6 h-6 text-purple-600" />} iconBg="bg-purple-100" title="Services & Resources" total={stats.totalServices + stats.totalResources} pending={stats.pendingServices + stats.pendingResources} />
        </div>

        {/* ── revenue ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl shrink-0">
              <DollarSign className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Platform Revenue (Fees)</p>
              <p className="text-3xl font-bold text-emerald-600">PKR {money(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-xs">
            {[
              ["Total Bookings", stats.totalBookings, false],
              ["Gross Processed", stats.grossRevenue, true],
              ["Paid to Providers", stats.providerPayouts, true],
            ].map(([label, val, isMoney]) => (
              <div key={label}>
                <p className="text-gray-400">{label}</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {isMoney ? `PKR ${money(val)}` : Number(val).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── tab container ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* tab strip */}
          <div className="border-b border-gray-200 px-4 overflow-x-auto">
            <div className="flex gap-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "py-4 px-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab
                      ? "border-[#D7490C] text-[#D7490C]"
                      : "border-transparent text-gray-500 hover:text-gray-800",
                  ].join(" ")}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "reviews" && allReviews.length > 0 && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-orange-100 text-[#D7490C] rounded-full font-bold">
                      {allReviews.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">

            {/* ── Overview ── */}
            {activeTab === "overview" && (
              <div className="space-y-7">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      ["border-yellow-400 bg-yellow-50 text-yellow-700", stats.pendingUsers, "Users awaiting verification"],
                      ["border-orange-400 bg-orange-50 text-orange-700", stats.pendingEvents, "Events pending approval"],
                      ["border-purple-400 bg-purple-50 text-purple-700", stats.pendingServices + stats.pendingResources, "Services & resources pending"],
                    ].map(([cls, n, label]) => (
                      <div key={label} className={`border-l-4 rounded-lg p-4 ${cls}`}>
                        <p className="text-3xl font-bold">{n}</p>
                        <p className="text-sm mt-1 text-gray-600">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {pendingUserRows.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Pending Users <span className="text-[#D7490C]">({pendingUserRows.length})</span>
                    </h3>
                    <DataTable
                      columns={userColumns}
                      data={pendingUserRows}
                      actions={userActions}
                      searchable={false}
                      pageSize={5}
                      emptyMessage="No pending users"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Users ── */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900">All Users</h2>
                  <SubFilter value={userFilter} onChange={setUserFilter} counts={countBy(allUsers, "_status")} />
                </div>
                <DataTable
                  columns={userColumns}
                  data={byStatus(allUsers, userFilter, "_status")}
                  actions={[
                    ...userActions,
                    {
                      label: "Block",
                      color: "red",
                      icon: <ShieldOff className="w-3.5 h-3.5" />,
                      disabled: (r) => r.isBlocked || r._status === "pending",
                      loading: (r) => busyId === r._id,
                      onClick: (r) => blockProvider(r._id, r.name),
                    },
                  ]}
                  searchable
                  searchPlaceholder="Search name, email, city…"
                  searchKeys={["name", "email", "phone", "city", "role"]}
                  pageSize={10}
                  emptyIcon={<Users className="w-12 h-12" />}
                  emptyMessage="No users match your filter."
                />
              </div>
            )}

            {/* ── Events ── */}
            {activeTab === "events" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900">All Events</h2>
                  <SubFilter value={eventFilter} onChange={setEventFilter} counts={countBy(allEvents)} />
                </div>
                <DataTable
                  columns={eventColumns}
                  data={byStatus(allEvents, eventFilter)}
                  actions={[
                    ...eventActions,
                    {
                      label: "Delete",
                      color: "red",
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      disabled: (r) => busyId === r._id,
                      loading: (r) => busyId === r._id,
                      onClick: (r) => deleteListing("event", r._id, r.title),
                    },
                  ]}
                  searchable
                  searchPlaceholder="Search title, category, venue…"
                  searchKeys={["title", "category", "venue"]}
                  pageSize={10}
                  emptyIcon={<Calendar className="w-12 h-12" />}
                  emptyMessage="No events match your filter."
                />
              </div>
            )}

            {/* ── Services ── */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900">All Services</h2>
                  <SubFilter value={serviceFilter} onChange={setServiceFilter} counts={countBy(allServices)} />
                </div>
                <DataTable
                  columns={serviceColumns}
                  data={byStatus(allServices, serviceFilter)}
                  actions={[
                    ...serviceActions,
                    {
                      label: "Delete",
                      color: "red",
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      disabled: (r) => busyId === r._id,
                      loading: (r) => busyId === r._id,
                      onClick: (r) => deleteListing("service", r._id, r.title),
                    },
                  ]}
                  searchable
                  searchPlaceholder="Search title, category…"
                  searchKeys={["title", "category"]}
                  pageSize={10}
                  emptyIcon={<Package className="w-12 h-12" />}
                  emptyMessage="No services match your filter."
                />
              </div>
            )}

            {/* ── Resources ── */}
            {activeTab === "resources" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900">All Resources</h2>
                  <SubFilter value={resourceFilter} onChange={setResourceFilter} counts={countBy(allResources)} />
                </div>
                <DataTable
                  columns={resourceColumns}
                  data={byStatus(allResources, resourceFilter)}
                  actions={[
                    ...resourceActions,
                    {
                      label: "Delete",
                      color: "red",
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      disabled: (r) => busyId === r._id,
                      loading: (r) => busyId === r._id,
                      onClick: (r) => deleteListing("resource", r._id, r.name),
                    },
                  ]}
                  searchable
                  searchPlaceholder="Search name, category…"
                  searchKeys={["name", "category"]}
                  pageSize={10}
                  emptyIcon={<Package className="w-12 h-12" />}
                  emptyMessage="No resources match your filter."
                />
              </div>
            )}

            {/* ── Reviews ── */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  All Reviews
                  <span className="ml-2 text-sm font-normal text-gray-400">({allReviews.length})</span>
                </h2>

                {allReviews.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">
                    <Star className="w-14 h-14 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">No reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allReviews.map((review) => {
                      const listingType = review.event ? "event" : review.service ? "service" : "resource";
                      const listingId = review.event?._id ?? review.service?._id ?? review.resource?._id;
                      const listingName = review.event?.title ?? review.service?.title ?? review.resource?.name ?? "—";
                      const isBusy = busyId === review._id || busyId === listingId || busyId === review.reviewee?._id;

                      return (
                        <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-4">

                          {/* review header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B7410E] to-[#D7490C] flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {(review.reviewer?.name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900 text-sm">{review.reviewer?.name ?? "Unknown"}</span>
                                <Stars rating={review.rating} />
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1 leading-relaxed">{review.comment}</p>
                            </div>
                          </div>

                          {/* listing + reviewee meta */}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3 pl-12">
                            <span>
                              <span className="font-medium text-gray-700">Listing:</span>{" "}
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium mr-1 ${listingType === "event" ? "bg-orange-100 text-orange-700" :
                                listingType === "service" ? "bg-purple-100 text-purple-700" :
                                  "bg-emerald-100 text-emerald-700"
                                }`}>{listingType}</span>
                              {listingName}
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">Provider:</span>{" "}
                              {review.reviewee?.name ?? "—"}
                              {review.reviewee?.isBlocked && (
                                <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">blocked</span>
                              )}
                            </span>
                          </div>

                          {/* action buttons */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => deleteReview(review._id)}
                              disabled={isBusy}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {busyId === review._id ? "Deleting…" : "Delete Review"}
                            </button>

                            {listingId && (
                              <button
                                onClick={() => deleteListing(listingType, listingId, listingName)}
                                disabled={isBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                {busyId === listingId ? "Deleting…" : "Delete Listing"}
                              </button>
                            )}

                            {review.reviewee && (
                              review.reviewee.isBlocked ? (
                                <button
                                  onClick={() => unblockProvider(review.reviewee._id, review.reviewee.name)}
                                  disabled={isBusy}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 disabled:opacity-50 transition-colors"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  {busyId === review.reviewee._id ? "Unblocking…" : "Unblock Provider"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => blockProvider(review.reviewee._id, review.reviewee.name)}
                                  disabled={isBusy}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                  <ShieldOff className="w-3.5 h-3.5" />
                                  {busyId === review.reviewee._id ? "Blocking…" : "Block Provider"}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <RejectModal
          title={`Reject ${rejectTarget.type}: ${rejectTarget.row.name ?? rejectTarget.row.title ?? ""}`}
          onConfirm={reject}
          onCancel={() => setRejectTarget(null)}
          loading={!!busyId}
        />
      )}
    </div>
  );
}