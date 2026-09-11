import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  DollarSign,
  CreditCard,
  Calendar,
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  Eye,
  FileText,
} from "lucide-react";
import { apiFetch } from "../../services/api";

const Payments = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("payments"); // "payments" | "refunds"
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCapturedRevenue: 0,
    capturedCount: 0,
    totalAttemptsCount: 0,
    totalRefunded: 0,
    netRevenue: 0,
    processedRefundCount: 0,
    pendingRefundCount: 0,
    failedRefundCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refundFilter, setRefundFilter] = useState("");

  // Modal States
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState(null);
  const [selectedRefundDetail, setSelectedRefundDetail] = useState(null);
  const [refundAmountInput, setRefundAmountInput] = useState("");
  const [refundReasonInput, setRefundReasonInput] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundModalError, setRefundModalError] = useState(null);
  const [refundModalSuccess, setRefundModalSuccess] = useState(null);

  const getPaymentLedger = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(
        `/api/payment/admin/payment-ledger?searchTerm=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      );
      if (data?.success) {
        setPayments(data?.payments || []);
        setRefunds(data?.refunds || []);
        setMetrics(
          data?.metrics || {
            totalCapturedRevenue: 0,
            capturedCount: 0,
            totalAttemptsCount: 0,
            totalRefunded: 0,
            netRevenue: 0,
            processedRefundCount: 0,
            pendingRefundCount: 0,
            failedRefundCount: 0,
          }
        );
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message || "Failed to load payment ledger");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    getPaymentLedger();
  }, [search, statusFilter]);

  // Open Refund Initiate Modal for a Captured Payment
  const handleOpenRefundModal = (payment) => {
    setSelectedPaymentForRefund(payment);
    setRefundAmountInput(payment.refundableBalance.toString());
    setRefundReasonInput("Customer cancellation refund");
    setRefundModalError(null);
    setRefundModalSuccess(null);
  };

  // Submit Refund Execution
  const handleExecuteRefund = async (e) => {
    e.preventDefault();
    if (!selectedPaymentForRefund) return;

    const amount = Number(refundAmountInput);
    if (isNaN(amount) || amount <= 0) {
      setRefundModalError("Please enter a valid positive refund amount.");
      return;
    }

    if (amount > selectedPaymentForRefund.refundableBalance) {
      setRefundModalError(
        `Refund amount ₹${amount} cannot exceed remaining refundable balance ₹${selectedPaymentForRefund.refundableBalance}.`
      );
      return;
    }

    try {
      setSubmittingRefund(true);
      setRefundModalError(null);
      setRefundModalSuccess(null);

      // Generate unique idempotency key per submission
      const idempotencyKey = `ui_ref_${selectedPaymentForRefund._id}_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}`;

      const res = await apiFetch("/api/payment/admin/refund", {
        method: "POST",
        body: JSON.stringify({
          bookingId: selectedPaymentForRefund.bookingId,
          amount,
          reason: refundReasonInput || "Admin initiated refund",
          idempotencyKey,
        }),
      });

      setSubmittingRefund(false);

      if (res?.success) {
        setRefundModalSuccess(res?.message || "Refund executed successfully!");
        setTimeout(() => {
          setSelectedPaymentForRefund(null);
          getPaymentLedger();
        }, 1500);
      } else {
        setRefundModalError(res?.message || "Failed to execute refund.");
      }
    } catch (err) {
      setSubmittingRefund(false);
      setRefundModalError(err.message || "An unexpected error occurred.");
    }
  };

  // Filter Refunds List
  const filteredRefunds = refunds.filter((r) => {
    if (refundFilter && r.status !== refundFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.buyerUsername?.toLowerCase().includes(q) ||
        r.buyerEmail?.toLowerCase().includes(q) ||
        r.providerRefundId?.toLowerCase().includes(q) ||
        r.providerPaymentId?.toLowerCase().includes(q) ||
        r.bookingId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 tracking-tight">
            Payments & Refund Reconciliation
          </h3>
          <p className="text-xs text-slate-500">
            Server-authoritative Razorpay transactions, atomic refunds, and financial ledgers
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Main Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200">
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "payments"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Payment Ledger ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("refunds")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "refunds"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Refund Log ({refunds.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search buyer, order, or refund ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Financial Metrics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-1.5 shadow-sm border border-slate-800">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
            Gross Revenue
          </span>
          <h4 className="font-extrabold text-2xl tracking-tight">
            ₹{metrics.totalCapturedRevenue?.toLocaleString()}
          </h4>
          <span className="text-[10px] text-slate-400 block">
            {metrics.capturedCount} captured payments
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-rose-950 border border-rose-900 text-white space-y-1.5 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-300 block">
            Total Refunded
          </span>
          <h4 className="font-extrabold text-2xl tracking-tight text-rose-400">
            ₹{metrics.totalRefunded?.toLocaleString()}
          </h4>
          <span className="text-[10px] text-rose-300/70 block">
            {metrics.processedRefundCount} processed refunds
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950 border border-emerald-900 text-white space-y-1.5 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300 block">
            Net Revenue
          </span>
          <h4 className="font-extrabold text-2xl tracking-tight text-emerald-400">
            ₹{metrics.netRevenue?.toLocaleString()}
          </h4>
          <span className="text-[10px] text-emerald-300/70 block">Gross minus refunds</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
            Refund Statuses
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold pt-1 flex-wrap">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
              {metrics.processedRefundCount} Processed
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
              {metrics.pendingRefundCount} Pending
            </span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 text-[11px]">
              {metrics.failedRefundCount} Failed
            </span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs text-center rounded-xl border border-rose-200 font-medium">
          {error}
        </div>
      )}

      {/* TAB 1: PAYMENT ATTEMPTS LEDGER */}
      {!loading && !error && activeTab === "payments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Payment Attempts & Captured Transactions
            </h4>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="">All Payment Statuses</option>
              <option value="Captured">Captured Only</option>
              <option value="Failed">Failed Only</option>
              <option value="Pending">Pending Only</option>
            </select>
          </div>

          {payments.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No payment transactions found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Package & Buyer</th>
                    <th className="py-3.5 px-4">Attempt</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Refund Status</th>
                    <th className="py-3.5 px-4">Razorpay Identifiers</th>
                    <th className="py-3.5 px-4 text-right">Amount / Balance</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => {
                    const isCaptured = p.status === "Captured";
                    const isFullyRefunded = p.refundStatus === "Fully_Refunded";

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{p.packageName}</span>
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {p.buyerUsername} ({p.buyerEmail})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                            #{p.attemptNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isCaptured ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Captured
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" /> {p.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {p.refundStatus === "Unrefunded" && (
                            <span className="text-[10px] font-medium text-slate-400">
                              Unrefunded
                            </span>
                          )}
                          {p.refundStatus === "Partially_Refunded" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              <RotateCcw className="w-3 h-3 text-amber-600" /> Partial (₹{p.refundedAmount})
                            </span>
                          )}
                          {p.refundStatus === "Fully_Refunded" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                              Fully Refunded
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600">
                          <div>Order: {p.providerOrderId}</div>
                          <div>Pay: {p.providerPaymentId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-extrabold text-slate-900">₹{p.amount?.toLocaleString()}</div>
                          {isCaptured && p.refundedAmount > 0 && (
                            <div className="text-[10px] text-rose-600 font-semibold">
                              Refunded: ₹{p.refundedAmount?.toLocaleString()}
                            </div>
                          )}
                          {isCaptured && !isFullyRefunded && (
                            <div className="text-[10px] text-emerald-700 font-bold">
                              Refundable: ₹{p.refundableBalance?.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isCaptured && !isFullyRefunded && (
                            <button
                              onClick={() => handleOpenRefundModal(p)}
                              className="px-3 py-1 bg-slate-900 text-white hover:bg-emerald-600 text-[10px] font-bold rounded-xl shadow-xs transition-all"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REFUND TRANSACTIONS LOG */}
      {!loading && !error && activeTab === "refunds" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Audit & Refund Transaction Logs
            </h4>
            <select
              value={refundFilter}
              onChange={(e) => setRefundFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
            >
              <option value="">All Refund Statuses</option>
              <option value="Processed">Processed Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Failed">Failed Only</option>
            </select>
          </div>

          {filteredRefunds.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No refund transaction logs found matching the filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Refund & Booking ID</th>
                    <th className="py-3.5 px-4">Buyer & Initiator</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Razorpay Refund ID</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRefunds.map((r) => {
                    const isProcessed = r.status === "Processed";
                    const isPending = r.status === "Pending";
                    const isFailed = r.status === "Failed";

                    return (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] text-slate-400 block">
                            Ref: {r._id}
                          </span>
                          <span className="font-bold text-slate-900 block">
                            Bk: {r.bookingId}
                          </span>
                          {r.isCancellation && (
                            <span className="inline-block bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-red-200 mt-0.5">
                              Cancellation
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{r.buyerUsername}</span>
                          <span className="text-[10px] text-slate-500 block">
                            By: {r.initiatedByUsername}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isProcessed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Processed
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" /> Pending
                            </span>
                          )}
                          {isFailed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 text-[10px] font-bold border border-red-200">
                              <XCircle className="w-3 h-3 text-red-600" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600">
                          {r.providerRefundId}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          <span className="line-clamp-1">{r.reason}</span>
                          {r.failureReason && (
                            <span className="text-[9px] text-red-600 block line-clamp-1">
                              {r.failureReason}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                          ₹{r.amount?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedRefundDetail(r)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: INITIATE REFUND */}
      {selectedPaymentForRefund && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900 tracking-tight">Initiate Admin Refund</h4>
              <button
                onClick={() => setSelectedPaymentForRefund(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
              <div>
                <span className="font-bold text-slate-900">Package:</span>{" "}
                {selectedPaymentForRefund.packageName}
              </div>
              <div>
                <span className="font-bold text-slate-900">Buyer:</span>{" "}
                {selectedPaymentForRefund.buyerUsername} ({selectedPaymentForRefund.buyerEmail})
              </div>
              <div>
                <span className="font-bold text-slate-900">Razorpay Payment ID:</span>{" "}
                <span className="font-mono">{selectedPaymentForRefund.providerPaymentId}</span>
              </div>
              <div className="pt-1 flex justify-between font-semibold">
                <span>Original Amount: ₹{selectedPaymentForRefund.amount}</span>
                <span>Refunded: ₹{selectedPaymentForRefund.refundedAmount}</span>
              </div>
              <div className="font-black text-emerald-800 text-sm pt-1">
                Maximum Refundable Balance: ₹{selectedPaymentForRefund.refundableBalance}
              </div>
            </div>

            <form onSubmit={handleExecuteRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Refund Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={selectedPaymentForRefund.refundableBalance}
                    step="any"
                    value={refundAmountInput}
                    onChange={(e) => setRefundAmountInput(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 pl-7 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-extrabold text-sm"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRefundAmountInput(selectedPaymentForRefund.refundableBalance.toString())
                  }
                  className="text-[10px] font-bold text-emerald-600 hover:underline mt-1 block"
                >
                  Set to maximum remaining balance (₹{selectedPaymentForRefund.refundableBalance})
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Reason for Refund
                </label>
                <input
                  type="text"
                  value={refundReasonInput}
                  onChange={(e) => setRefundReasonInput(e.target.value)}
                  placeholder="e.g. Customer requested cancellation"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-medium"
                  required
                />
              </div>

              {refundModalError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
                  {refundModalError}
                </div>
              )}

              {refundModalSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 font-medium">
                  {refundModalSuccess}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentForRefund(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
                >
                  {submittingRefund ? "Executing..." : "Confirm & Process Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REFUND DETAIL VIEW */}
      {selectedRefundDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900 tracking-tight">
                Refund Transaction Audit Detail
              </h4>
              <button
                onClick={() => setSelectedRefundDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Refund ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 block text-[11px]">
                    {selectedRefundDetail._id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Status
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {selectedRefundDetail.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Razorpay Refund ID
                  </span>
                  <span className="font-mono text-slate-700 block text-[11px]">
                    {selectedRefundDetail.providerRefundId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Refund Amount
                  </span>
                  <span className="font-black text-emerald-700 text-sm block">
                    ₹{selectedRefundDetail.amount} {selectedRefundDetail.currency}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">Booking ID:</span>{" "}
                  <span className="font-mono">{selectedRefundDetail.bookingId}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Booking Status:</span>{" "}
                  <span className="font-bold">{selectedRefundDetail.bookingStatus}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Buyer Account:</span>{" "}
                  {selectedRefundDetail.buyerUsername} ({selectedRefundDetail.buyerEmail})
                </div>
                <div>
                  <span className="font-bold text-slate-900">Initiated By:</span>{" "}
                  {selectedRefundDetail.initiatedByUsername}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Reason:</span>{" "}
                  {selectedRefundDetail.reason}
                </div>
                {selectedRefundDetail.failureReason && (
                  <div className="text-rose-700 font-bold">
                    <span>Failure Error:</span>{" "}
                    {selectedRefundDetail.failureReason}
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-900">Idempotency Key:</span>{" "}
                  <span className="font-mono text-[10px]">
                    {selectedRefundDetail.idempotencyKey}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">Created Timestamp:</span>{" "}
                  {new Date(selectedRefundDetail.createdAt).toLocaleString()}
                </div>
                {selectedRefundDetail.processedAt && (
                  <div>
                    <span className="font-bold text-slate-900">Processed Timestamp:</span>{" "}
                    {new Date(selectedRefundDetail.processedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRefundDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
