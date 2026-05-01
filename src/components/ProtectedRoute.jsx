import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children, requireApproval = true }) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        setShouldRedirect("/login");
        setIsChecking(false);
        return;
      }

      const user = JSON.parse(userStr);

      // Not logged in
      if (!token) {
        setShouldRedirect("/login");
        setIsChecking(false);
        return;
      }

      // Admin always has access
      if (user.role === "admin") {
        setShouldRedirect(null);
        setIsChecking(false);
        return;
      }

      // Email not verified
      if (!user.isEmailVerified) {
        setShouldRedirect("/verify-otp");
        setIsChecking(false);
        return;
      }

      // Check admin approval if required
      if (requireApproval) {
        // Rejected
        if (user.adminApprovalStatus === "rejected") {
          setShouldRedirect("/pending-approval");
          setIsChecking(false);
          return;
        }

        // Not approved yet
        if (!user.isApprovedByAdmin) {
          setShouldRedirect("/pending-approval");
          setIsChecking(false);
          return;
        }
      }

      // All checks passed
      setShouldRedirect(null);
      setIsChecking(false);
    };

    checkAuth();
  }, [location.pathname, requireApproval]); // Re-check on route change

  if (isChecking) {
    return null; // or a loading spinner
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  // All checks passed
  return children;
};

export default ProtectedRoute;
