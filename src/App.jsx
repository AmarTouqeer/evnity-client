import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import PendingApproval from "./pages/PendingApproval";
import Register from "./pages/Register";
import RoleSelection from "./pages/RoleSelection";
import CustomerRegister from "./pages/CustomerRegister";
import ProviderRegister from "./pages/ProviderRegister";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Events from "./pages/Events";
import Services from "./pages/Services";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventDetail from "./pages/EventDetail";
import ServiceDetail from "./pages/ServiceDetail";
import ResourceDetail from "./pages/ResourceDetail";
import Bookings from "./pages/Bookings";
import Complaints from "./pages/Complaints";
import UploadReceipt from "./pages/UploadReceipt";
import Notifications from "./pages/Notifications";
import AddListing from "./pages/AddListing";
import EditListing from "./pages/EditListing";
import BookingDetail from "./pages/BookingDetail";
import ProviderStripeSettings from "./pages/ProviderStripeSettings";
import StripeSuccess from "./pages/StripeSuccess";
import StripeCancel from "./pages/StripeCancel";
import NotFound from "./pages/NotFound";
import ProviderPayments from "./pages/ProviderPayments";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin Login - Separate route outside MainLayout */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Pending Approval Page - Standalone */}
        <Route path="/pending-approval" element={<PendingApproval />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<RoleSelection />} />
          <Route path="register/customer" element={<CustomerRegister />} />
          <Route path="register/provider" element={<ProviderRegister />} />
          <Route path="verify-otp" element={<VerifyOTP />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="about" element={<About/>}/>
          <Route path="how-it-works" element={<HowItWorks/>}/>
          <Route path="privacy" element={<PrivacyPolicy/>}/>
          <Route path="terms" element={<TermsOfService/>}/>
          
          <Route
            path="reset-password/:resetToken"
            element={<ResetPassword />}
          />

          {/* Protected Routes - Require Admin Approval */}
          <Route
            path="events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="events/:id"
            element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="services/:id"
            element={
              <ProtectedRoute>
                <ServiceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="resources/:id"
            element={
              <ProtectedRoute>
                <ResourceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/provider/payments" element={
            <ProtectedRoute role="provider"><ProviderPayments /></ProtectedRoute>
          } />
          <Route
            path="bookings/:bookingId/upload-receipt"
            element={
              <ProtectedRoute>
                <UploadReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="complaints"
            element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="provider/dashboard"
            element={
              <ProtectedRoute>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="provider/settings/stripe"
            element={
              <ProtectedRoute>
                <ProviderStripeSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="provider/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="provider/edit/:type/:id"
            element={
              <ProtectedRoute>
                <EditListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="payments/stripe/success"
            element={
              <ProtectedRoute>
                <StripeSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="payments/stripe/cancel"
            element={
              <ProtectedRoute>
                <StripeCancel />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
