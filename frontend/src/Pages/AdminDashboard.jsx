import { useEffect, useState } from "react";
import {
  getAdminPayments,
  getAdminReports,
  getAdminStats,
  getAdminVerifications,
  reviewAdminVerification,
  updateAdminReport,
} from "../api/api";

function Stat({ label, value }) {
  return <div className="surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true); setError("");
      const [statsRes, verificationRes, reportsRes, paymentsRes] = await Promise.all([
        getAdminStats(), getAdminVerifications(), getAdminReports(), getAdminPayments(),
      ]);
      setStats(statsRes.data.stats);
      setVerifications(verificationRes.data.requests);
      setReports(reportsRes.data.reports);
      setPayments(paymentsRes.data.payments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin dashboard");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function review(id, decision) {
    let reason = "";
    if (decision === "rejected") {
      reason = window.prompt("Reason for rejection:", "Verification details need clarification") || "Verification details need clarification";
    }
    try {
      await reviewAdminVerification(id, { decision, reason });
      await load();
    } catch (err) { setError(err.response?.data?.message || "Failed to review verification"); }
  }

  async function updateReport(id, status) {
    try { await updateAdminReport(id, status); await load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to update report"); }
  }

  if (loading) return <div className="page-shell flex items-center justify-center"><p className="text-sm text-gray-500">Loading admin dashboard...</p></div>;

  return (
    <div className="page-shell">
      <div className="page-container max-w-6xl">
        <div className="mb-8"><p className="eyebrow">Operations</p><h1 className="section-title mt-2">Admin Dashboard</h1><p className="section-copy">Keep an eye on marketplace activity, verification and payments.</p></div>
        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {stats && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Users" value={stats.users}/><Stat label="Active cars" value={stats.activeCars}/><Stat label="Pro sellers" value={stats.proUsers}/><Stat label="Verified sellers" value={stats.verifiedSellers}/><Stat label="Pending verification" value={stats.pendingVerification}/><Stat label="Pending reports" value={stats.pendingReports}/><Stat label="All listings" value={stats.cars}/><Stat label="Recorded revenue" value={`₹${Number(stats.revenue).toLocaleString("en-IN")}`}/>
        </div>}

        <section className="mt-8">
          <div className="mb-4"><h2 className="text-xl font-bold">Verification requests</h2><p className="mt-1 text-sm text-gray-500">Paid requests waiting for manual review.</p></div>
          {!verifications.length ? <div className="surface p-7 text-sm text-gray-500">No paid verification requests are waiting.</div> : <div className="surface overflow-x-auto"><table className="w-full min-w-190 text-left"><thead className="border-b border-gray-200 bg-gray-50"><tr><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Seller</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">ID</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Phone</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Submitted</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Action</th></tr></thead><tbody>{verifications.map((item) => <tr key={item._id} className="border-b border-gray-100 last:border-0"><td className="p-4"><p className="font-semibold">{item.fullName}</p><p className="text-xs text-gray-500">{item.user?.name} · {item.user?.email}</p></td><td className="p-4 text-sm">{item.idType}<br/><span className="text-gray-500">•••• {item.idLast4}</span></td><td className="p-4 text-sm">{item.phone}</td><td className="p-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td><td className="p-4"><div className="flex gap-2"><button onClick={() => review(item._id, "approved")} className="primary-button px-3 py-2 text-xs">Approve</button><button onClick={() => review(item._id, "rejected")} className="secondary-button px-3 py-2 text-xs">Reject</button></div></td></tr>)}</tbody></table></div>}
        </section>

        <section className="mt-8">
          <div className="mb-4"><h2 className="text-xl font-bold">Reports</h2><p className="mt-1 text-sm text-gray-500">Review listings reported by users.</p></div>
          {!reports.length ? <div className="surface p-7 text-sm text-gray-500">No unresolved reports.</div> : <div className="space-y-3">{reports.map((report) => <div key={report._id} className="surface p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold">{report.car?.brand} {report.car?.model} {report.car?.variant || ""}</p><p className="mt-1 text-sm text-gray-500">Reported by {report.reporter?.name || "User"} · {new Date(report.createdAt).toLocaleDateString("en-IN")}</p><p className="mt-3 text-sm">{report.reason}</p></div><div className="flex items-center gap-2"><select value={report.status} onChange={(e) => updateReport(report._id, e.target.value)} className="field w-auto! py-2 text-sm"><option value="pending">Pending</option><option value="reviewed">Reviewed</option><option value="resolved">Resolved</option></select></div></div></div>)}</div>}
        </section>

        <section className="mt-8">
          <div className="mb-4"><h2 className="text-xl font-bold">Recent payments</h2><p className="mt-1 text-sm text-gray-500">Payment records stored by MyCarsHub.</p></div>
          <div className="surface overflow-x-auto"><table className="w-full min-w-162.5 text-left"><thead className="border-b border-gray-200 bg-gray-50"><tr><th className="p-4 text-xs uppercase tracking-wider text-gray-500">User</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Type</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Amount</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Status</th><th className="p-4 text-xs uppercase tracking-wider text-gray-500">Date</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment._id} className="border-b border-gray-100 last:border-0"><td className="p-4 font-medium">{payment.user?.name || "User"}</td><td className="p-4 text-sm capitalize">{payment.type}</td><td className="p-4 text-sm">₹{Number(payment.amount).toLocaleString("en-IN")}</td><td className="p-4 text-sm capitalize">{payment.status}</td><td className="p-4 text-sm text-gray-500">{new Date(payment.createdAt).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  );
}
