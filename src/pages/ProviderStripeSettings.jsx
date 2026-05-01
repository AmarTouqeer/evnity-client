import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { providerStripeAPI } from "../services/api";
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";

const ProviderStripeSettings = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyInfo, setVerifyInfo] = useState(null);

  const callbackStatus = searchParams.get("status");
  const callbackMessage = searchParams.get("message");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await providerStripeAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
      } else {
        setError(response.message || "Failed to load Stripe status");
      }
    } catch (err) {
      setError(err.message || "Failed to load Stripe status");
    } finally {
      setLoading(false);
    }
  };

  const fetchVerify = async () => {
    try {
      const response = await providerStripeAPI.verifyReady();
      setVerifyInfo(response);
    } catch (err) {
      setVerifyInfo({
        success: false,
        isReady: false,
        message: err.message || "Stripe account is not ready for charges",
      });
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (status?.isConnected) {
      fetchVerify();
    }
  }, [status?.isConnected]);

  const handleConnect = async () => {
    try {
      setActionLoading(true);
      const response = await providerStripeAPI.getConnectUrl();
      if (!response || response.success === false) {
        throw new Error(
          response?.message ||
            "Failed to start Stripe Connect onboarding. Please try again."
        );
      }
      const url = response.data?.authUrl;
      if (!url) {
        throw new Error("Stripe Connect URL was not returned by the server.");
      }
      window.location.href = url;
    } catch (err) {
      alert(err.message || "Failed to start Stripe Connect onboarding.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect your Stripe account? You will no longer receive payouts via card payments."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await providerStripeAPI.disconnect();
      if (!response || response.success === false) {
        throw new Error(
          response?.message || "Failed to disconnect Stripe account"
        );
      }
      await fetchStatus();
      setVerifyInfo(null);
      alert("Stripe account disconnected successfully.");
    } catch (err) {
      alert(err.message || "Failed to disconnect Stripe account.");
    } finally {
      setActionLoading(false);
    }
  };

  const isConnected =
    status?.isConnected && status?.stripeConnectStatus === "active";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Stripe Payout Settings
          </h1>
          <p className="text-gray-600">
            Connect your Stripe account to receive payouts from card payments.
          </p>
        </div>

        {callbackStatus && (
          <div
            className={`mb-4 rounded-lg border p-4 flex items-start gap-2 ${
              callbackStatus === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {callbackStatus === "success" ? (
              <CheckCircle className="w-5 h-5 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5" />
            )}
            <div className="text-sm">
              <p className="font-semibold mb-0.5">
                {callbackStatus === "success"
                  ? "Stripe account connected"
                  : "Stripe connection error"}
              </p>
              {callbackMessage && (
                <p className="break-words">{decodeURIComponent(callbackMessage)}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <CreditCard className="w-6 h-6 text-[#D7490C]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Stripe Connect Status
                  </h2>
                  <p className="text-sm text-gray-600">
                    Stripe is used to securely process card payments and send
                    payouts to your bank account.
                  </p>
                </div>
                {loading && (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 flex items-center gap-1 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}

              {status && (
                <div className="mt-2 space-y-1 text-sm text-gray-700">
                  <p>
                    Status:{" "}
                    <span className="font-semibold capitalize">
                      {status.stripeConnectStatus || "not_connected"}
                    </span>
                  </p>
                  <p>
                    Charges:{" "}
                    <span className="font-semibold">
                      {status.stripeChargesEnabled ? "Enabled" : "Disabled"}
                    </span>{" "}
                    • Payouts:{" "}
                    <span className="font-semibold">
                      {status.stripePayoutsEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </p>
                  {status.stripeAccountId && (
                    <p className="text-xs text-gray-500">
                      Stripe Account ID:{" "}
                      <span className="font-mono">
                        {status.stripeAccountId}
                      </span>
                    </p>
                  )}
                  {status.stripeConnectedAt && (
                    <p className="text-xs text-gray-500">
                      Connected at:{" "}
                      {new Date(status.stripeConnectedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {verifyInfo && (
                <div
                  className={`mt-3 text-xs rounded-md border px-3 py-2 flex items-start gap-2 ${
                    verifyInfo.isReady
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-yellow-200 bg-yellow-50 text-yellow-800"
                  }`}
                >
                  {verifyInfo.isReady ? (
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                  )}
                  <p>{verifyInfo.message}</p>
                </div>
              )}

              {status?.accountStatus && (
                <div className="mt-3 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <p className="font-semibold mb-1">Account details from Stripe:</p>
                  <p>
                    Type: <span className="font-medium">{status.accountStatus.type}</span>{" "}
                    • Country:{" "}
                    <span className="font-medium">
                      {status.accountStatus.country}
                    </span>
                  </p>
                  <p className="mt-1">
                    Charges enabled:{" "}
                    <span className="font-medium">
                      {status.accountStatus.charges_enabled ? "Yes" : "No"}
                    </span>{" "}
                    • Payouts enabled:{" "}
                    <span className="font-medium">
                      {status.accountStatus.payouts_enabled ? "Yes" : "No"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {!isConnected ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={actionLoading}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white text-sm font-semibold hover:from-[#D7490C] hover:to-[#B7410E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  "Connect Stripe Account"
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect Stripe"
                  )}
                </button>
                <button
                  type="button"
                  onClick={fetchStatus}
                  disabled={loading || actionLoading}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Refresh Status
                </button>
              </>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            This integration is running in Stripe test mode. Use test bank
            accounts and cards provided by Stripe. No real money will move.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderStripeSettings;

