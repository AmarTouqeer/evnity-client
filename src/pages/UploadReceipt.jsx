import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Upload,
  Check,
  X,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { bookingAPI } from "../services/api";

const UploadReceipt = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState({
    transactionId: "",
    paymentDate: "",
    paymentMethod: "",
    amount: "",
    notes: "",
  });
  const [uploading, setUploading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [error, setError] = useState(null);

  // Load booking info
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoadingBooking(true);
        setError(null);
        const response = await bookingAPI.getById(bookingId);
        const data =
          response?.data?.booking ||
          response?.booking ||
          response?.data ||
          response;
        if (!data) {
          throw new Error("Booking not found");
        }
        setBooking(data);
      } catch (err) {
        console.error("Error loading booking:", err);
        setError(err.message || "Failed to load booking");
      } finally {
        setLoadingBooking(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload only JPG, PNG, or PDF files");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB");
        return;
      }

      setReceiptFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiptFile) {
      alert("Please upload a receipt file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("receipt", receiptFile);

      // Map UI payment method to backend methodType
      const mapMethodToType = (method) => {
        switch (method) {
          case "Bank Transfer":
            return "bank_transfer";
          case "Cash Deposit":
            return "cash";
          case "Easypaisa":
            return "easypaisa";
          case "JazzCash":
            return "jazzcash";
          default:
            return undefined;
        }
      };

      const methodType = mapMethodToType(transactionDetails.paymentMethod);
      if (methodType) {
        formData.append("methodType", methodType);
      }
      if (transactionDetails.transactionId) {
        formData.append("transactionId", transactionDetails.transactionId);
      }

      const response = await bookingAPI.uploadReceipt(bookingId, formData);
      if (response && response.success === false) {
        throw new Error(response.message || "Failed to upload receipt");
      }

      alert(
        "Receipt uploaded successfully in test mode. You can review and confirm this booking from the booking details screen."
      );
      navigate(`/bookings/${bookingId}`);
    } catch (err) {
      console.error("Error uploading receipt:", err);
      alert(err.message || "Failed to upload receipt. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Upload Payment Receipt</h1>
          <p className="text-orange-100">
            Upload your payment receipt for verification
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Booking Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Booking Details
          </h2>
          {loadingBooking ? (
            <div className="text-sm text-gray-600">Loading booking...</div>
          ) : error || !booking ? (
            <div className="text-sm text-red-600">
              {error || "Unable to load booking information."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Booking ID</div>
                <div className="font-semibold text-gray-900">
                  #{booking._id}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Item/Service</div>
                <div className="font-semibold text-gray-900">
                  {booking.event?.title ||
                    booking.service?.title ||
                    booking.resource?.name ||
                    "Booking"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Provider</div>
                <div className="font-semibold text-gray-900">
                  {booking.provider?.name || "Provider"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Amount to Pay</div>
                <div className="font-semibold text-[#D7490C] text-lg">
                  PKR {(booking.totalAmount || 0).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Payment Receipt Upload
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={transactionDetails.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              >
                <option value="">Select payment method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash Deposit">Cash Deposit</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID / Reference Number{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transactionId"
                value={transactionDetails.transactionId}
                onChange={handleInputChange}
                placeholder="e.g., TXN123456789"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={transactionDetails.paymentDate}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={transactionDetails.amount}
                onChange={handleInputChange}
                placeholder={
                  booking && typeof booking.totalAmount === "number"
                    ? booking.totalAmount.toString()
                    : ""
                }
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Receipt <span className="text-red-500">*</span>
              </label>

              {!receiptFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D7490C] transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or PDF (max 5MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        <ImageIcon className="w-8 h-8 text-[#D7490C]" />
                      ) : (
                        <FileText className="w-8 h-8 text-[#D7490C]" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {receiptFile.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(receiptFile.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="mt-4">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="max-h-64 mx-auto rounded border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Please ensure the receipt clearly shows transaction details
                including amount, date, and reference number
              </p>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={transactionDetails.notes}
                onChange={handleInputChange}
                placeholder="Any additional information about the payment..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              />
            </div>

            {/* Important Information */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Admin will verify your receipt within 24 hours</li>
                    <li>Make sure the receipt is clear and readable</li>
                    <li>Transaction amount should match the booking amount</li>
                    <li>You'll receive confirmation once verified</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading || !receiptFile}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Receipt
                  </>
                )}
              </button>
              <Link
                to="/bookings"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-3">
            If you're having trouble uploading your receipt or have questions
            about the verification process:
          </p>
          <div className="flex gap-3">
            <Link
              to="/complaints/new"
              className="text-sm text-[#D7490C] font-semibold hover:underline"
            >
              Contact Support
            </Link>
            <span className="text-gray-400">•</span>
            <a
              href="tel:+923001234567"
              className="text-sm text-[#D7490C] font-semibold hover:underline"
            >
              Call: 0300-1234567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReceipt;
