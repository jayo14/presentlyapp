import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, TrendingUp, Users, Receipt, ListOrdered,
  RefreshCw, Plus, X, Check, Search, Loader, AlertCircle,
  DollarSign, Package, UserCheck, Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { billingApi } from '../../services/api/billing';
import { SEO } from '../SEO';

type Tab = 'overview' | 'plans' | 'subscriptions' | 'payments' | 'seats' | 'credits';

interface BillingStats {
  active_subscriptions: number;
  total_revenue_kobo: number;
  total_revenue_formatted: string;
  subscriptions_by_plan: { plan__code: string; plan__name: string; count: number }[];
  subscriptions_by_status: { status: string; count: number }[];
  revenue_by_month: { month: string | null; total_kobo: number }[];
  total_plans: number;
  active_plans: number;
  total_payments: number;
  successful_payments: number;
  total_department_seats: number;
  active_department_seats: number;
  total_users: number;
  users_with_seats: number;
}

export const BillingAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState<Tab | null>(null);
  const [subFilter, setSubFilter] = useState('');
  const [planForm, setPlanForm] = useState({
    code: '', name: '', billing_owner_type: 'SELF',
    price_kobo: 0, interval: 'MONTHLY',
    seat_limit: '', course_limit: '', features: '{}', is_active: true,
  });

  const loadStats = useCallback(async () => {
    try {
      const data = await billingApi.adminGetStats();
      setStats(data);
    } catch { /* handled by interceptor */ }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const data = await billingApi.adminListPlans();
      setPlans(data);
    } catch { /* handled by interceptor */ }
  }, []);

  const loadSubscriptions = useCallback(async () => {
    try {
      const data = await billingApi.adminListSubscriptions();
      setSubscriptions(data);
    } catch { /* handled by interceptor */ }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const data = await billingApi.adminListPayments();
      setPayments(data);
    } catch { /* handled by interceptor */ }
  }, []);

  const loadSeats = useCallback(async () => {
    try {
      const data = await billingApi.adminListSeats();
      setSeats(data);
    } catch { /* handled by interceptor */ }
  }, []);

  const loadCredits = useCallback(async () => {
    try {
      const data = await billingApi.adminListCredits();
      setCredits(data);
    } catch { /* handled by interceptor */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(), loadPlans(), loadSubscriptions(), loadPayments(), loadSeats(), loadCredits()])
      .finally(() => setLoading(false));
  }, [loadStats, loadPlans, loadSubscriptions, loadPayments, loadSeats, loadCredits]);

  const handleSavePlan = async () => {
    try {
      const payload = {
        ...planForm,
        price_kobo: Number(planForm.price_kobo),
        seat_limit: planForm.seat_limit ? Number(planForm.seat_limit) : null,
        course_limit: planForm.course_limit ? Number(planForm.course_limit) : null,
        features: JSON.parse(planForm.features || '{}'),
      };

      if (editingPlan) {
        await billingApi.adminUpdatePlan(editingPlan.id, payload);
        toast.success('Plan updated');
      } else {
        await billingApi.adminCreatePlan(payload);
        toast.success('Plan created');
      }
      setShowPlanModal(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to save plan');
    }
  };

  const handleDeactivatePlan = async (planId: number) => {
    try {
      await billingApi.adminDeactivatePlan(planId);
      toast.success('Plan deactivated');
      setConfirmDelete(null);
      await loadPlans();
    } catch { /* handled by interceptor */ }
  };

  const handleOverrideStatus = async (subId: number, status: string) => {
    try {
      await billingApi.adminOverrideSubscription(subId, status);
      toast.success(`Subscription status changed to ${status}`);
      await loadSubscriptions();
    } catch { /* handled by interceptor */ }
  };

  const refreshTab = async (tab: Tab) => {
    setRefreshing(tab);
    try {
      if (tab === 'overview') await loadStats();
      if (tab === 'plans') await loadPlans();
      if (tab === 'subscriptions') await loadSubscriptions();
      if (tab === 'payments') await loadPayments();
      if (tab === 'seats') await loadSeats();
      if (tab === 'credits') await loadCredits();
    } finally {
      setRefreshing(null);
    }
  };

  const openEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      code: plan.code,
      name: plan.name,
      billing_owner_type: plan.billing_owner_type,
      price_kobo: plan.price_kobo,
      interval: plan.interval,
      seat_limit: plan.seat_limit?.toString() || '',
      course_limit: plan.course_limit?.toString() || '',
      features: JSON.stringify(plan.features || {}, null, 2),
      is_active: plan.is_active,
    });
    setShowPlanModal(true);
  };

  const openNewPlan = () => {
    setEditingPlan(null);
    setPlanForm({
      code: '', name: '', billing_owner_type: 'SELF',
      price_kobo: 0, interval: 'MONTHLY',
      seat_limit: '', course_limit: '', features: '{}', is_active: true,
    });
    setShowPlanModal(true);
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'plans', label: 'Plans', icon: Package },
    { id: 'subscriptions', label: 'Subscriptions', icon: ListOrdered },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'seats', label: 'Seats', icon: UserCheck },
    { id: 'credits', label: 'Credits', icon: CreditCard },
  ];

  const StatCard = ({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: any; sub?: string }) => (
    <div className="bg-white rounded-2xl border border-black/5 p-6 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-sungold/10 flex items-center justify-center shrink-0">
        <Icon size={24} className="text-sungold" />
      </div>
      <div>
        <p className="text-sm text-neutral-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-neutral-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size={32} className="animate-spin text-sungold" />
      </div>
    );
  }

  return (
    <div>
      <SEO title="Billing Management" />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-black/5 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:bg-neutral-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => refreshTab(activeTab)}
          className="ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ─── Overview ─────────────────────────────────── */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Subscriptions" value={stats.active_subscriptions} icon={TrendingUp} />
            <StatCard label="Total Revenue" value={`₦${stats.total_revenue_formatted}`} icon={DollarSign} sub={`${stats.successful_payments} successful payments`} />
            <StatCard label="Active Plans" value={`${stats.active_plans}/${stats.total_plans}`} icon={Package} />
            <StatCard label="Active Seats" value={`${stats.active_department_seats}/${stats.total_department_seats}`} icon={UserCheck} sub={`${stats.users_with_seats} users seated`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6">
              <h3 className="font-medium text-neutral-900 mb-4">Subscriptions by Plan</h3>
              {stats.subscriptions_by_plan.length === 0 ? (
                <p className="text-sm text-neutral-400">No active subscriptions</p>
              ) : (
                <div className="space-y-3">
                  {stats.subscriptions_by_plan.map(p => (
                    <div key={p.plan__code} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{p.plan__name}</span>
                      <span className="text-sm font-medium text-neutral-900">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-black/5 p-6">
              <h3 className="font-medium text-neutral-900 mb-4">Subscriptions by Status</h3>
              {stats.subscriptions_by_status.length === 0 ? (
                <p className="text-sm text-neutral-400">No subscriptions</p>
              ) : (
                <div className="space-y-3">
                  {stats.subscriptions_by_status.map(s => (
                    <div key={s.status} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700">{s.status}</span>
                      <span className="text-sm font-medium text-neutral-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {stats.revenue_by_month.length > 0 && (
            <div className="bg-white rounded-2xl border border-black/5 p-6">
              <h3 className="font-medium text-neutral-900 mb-4">Revenue by Month</h3>
              <div className="space-y-2">
                {stats.revenue_by_month.map(r => (
                  <div key={r.month} className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">{r.month || 'Unknown'}</span>
                    <span className="text-sm font-medium text-neutral-900">₦{(r.total_kobo / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Plans ────────────────────────────────────── */}
      {activeTab === 'plans' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-neutral-500">{plans.length} plan(s)</p>
            <button onClick={openNewPlan} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors">
              <Plus size={16} /> New Plan
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-black/5">
                <tr>
                  <th className="text-left p-4 font-medium text-neutral-500">Code</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Name</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Type</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Price</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Interval</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Limits</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Active</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-mono text-xs">{plan.code}</td>
                    <td className="p-4 font-medium">{plan.name}</td>
                    <td className="p-4 text-neutral-500">{plan.billing_owner_type}</td>
                    <td className="p-4">₦{(plan.price_kobo / 100).toLocaleString()}</td>
                    <td className="p-4">{plan.interval}</td>
                    <td className="p-4 text-neutral-500">
                      {plan.course_limit ? `${plan.course_limit} courses` : '∞ courses'}
                      {plan.seat_limit ? `, ${plan.seat_limit} seats` : ''}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {plan.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditPlan(plan)} className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors">
                          <Check size={14} />
                        </button>
                        {plan.is_active && (
                          <button onClick={() => setConfirmDelete(plan.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Subscriptions ────────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-neutral-500">{subscriptions.length} subscription(s)</p>
            <div className="flex items-center gap-2">
              <Search size={14} className="text-neutral-400" />
              <input
                type="text"
                placeholder="Filter by plan code..."
                value={subFilter}
                onChange={e => setSubFilter(e.target.value)}
                className="text-sm border border-black/10 rounded-lg px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-sungold/40"
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-black/5">
                <tr>
                  <th className="text-left p-4 font-medium text-neutral-500">Owner</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Plan</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Status</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Period</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Created</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {subscriptions
                  .filter(sub => !subFilter || sub.plan?.code?.toLowerCase().includes(subFilter.toLowerCase()))
                  .map(sub => (
                  <tr key={sub.id} className="hover:bg-neutral-50/50">
                    <td className="p-4">
                      <span className="text-xs font-mono">{sub.billing_owner?.owner_type}:{sub.billing_owner?.owner_user?.email || sub.billing_owner?.owner_department?.name || sub.id}</span>
                    </td>
                    <td className="p-4 font-medium">{sub.plan?.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        sub.status === 'TRIALING' ? 'bg-blue-100 text-blue-700' :
                        sub.status === 'PAST_DUE' ? 'bg-yellow-100 text-yellow-700' :
                        sub.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>{sub.status}</span>
                    </td>
                    <td className="p-4 text-xs text-neutral-500">
                      {sub.current_period_start?.slice(0, 10)} → {sub.current_period_end?.slice(0, 10)}
                    </td>
                    <td className="p-4 text-xs text-neutral-500">{sub.created_at?.slice(0, 10)}</td>
                    <td className="p-4">
                      <select
                        value={sub.status}
                        onChange={e => handleOverrideStatus(sub.id, e.target.value)}
                        className="text-xs border border-black/10 rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="TRIALING">Trialing</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAST_DUE">Past Due</option>
                        <option value="CANCELED">Canceled</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Payments ─────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div>
          <p className="text-sm text-neutral-500 mb-6">{payments.length} payment(s)</p>
          <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-black/5">
                <tr>
                  <th className="text-left p-4 font-medium text-neutral-500">Reference</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Amount</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Currency</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Status</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Paid At</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {payments.map(pmt => (
                  <tr key={pmt.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 font-mono text-xs">{pmt.paystack_reference}</td>
                    <td className="p-4">₦{(pmt.amount_kobo / 100).toLocaleString()}</td>
                    <td className="p-4">{pmt.currency}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        pmt.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        pmt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        pmt.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-neutral-100 text-neutral-500'
                      }`}>{pmt.status}</span>
                    </td>
                    <td className="p-4 text-xs text-neutral-500">{pmt.paid_at?.slice(0, 10) || '-'}</td>
                    <td className="p-4 text-xs text-neutral-500">{pmt.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Seats ────────────────────────────────────── */}
      {activeTab === 'seats' && (
        <div>
          <p className="text-sm text-neutral-500 mb-6">{seats.length} seat(s)</p>
          <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-black/5">
                <tr>
                  <th className="text-left p-4 font-medium text-neutral-500">User</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Plan</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Active</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {seats.map(seat => (
                  <tr key={seat.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 text-xs font-mono">{seat.user?.email || seat.user}</td>
                    <td className="p-4">{seat.subscription?.plan?.name || '-'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${seat.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {seat.is_active ? 'Active' : 'Revoked'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-neutral-500">{seat.assigned_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Credits ──────────────────────────────────── */}
      {activeTab === 'credits' && (
        <div>
          <p className="text-sm text-neutral-500 mb-6">{credits.length} credit(s)</p>
          <div className="bg-white rounded-2xl border border-black/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-black/5">
                <tr>
                  <th className="text-left p-4 font-medium text-neutral-500">User</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Amount</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Reason</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Consumed</th>
                  <th className="text-left p-4 font-medium text-neutral-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {credits.map(cr => (
                  <tr key={cr.id} className="hover:bg-neutral-50/50">
                    <td className="p-4 text-xs font-mono">{cr.user?.email || cr.user}</td>
                    <td className="p-4">₦{(cr.amount_kobo / 100).toLocaleString()}</td>
                    <td className="p-4 text-xs text-neutral-500">{cr.reason}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cr.consumed ? 'bg-neutral-100 text-neutral-500' : 'bg-blue-100 text-blue-700'}`}>
                        {cr.consumed ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-neutral-500">{cr.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Confirm Deactivate ──────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl text-center">
            <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">Deactivate plan?</h2>
            <p className="text-sm text-neutral-500 mb-8">Existing subscriptions won't be affected, but no new subscriptions can use this plan.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-colors">Cancel</button>
              <button onClick={() => handleDeactivatePlan(confirmDelete)} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">Deactivate</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Plan Modal ───────────────────────────────── */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">{editingPlan ? 'Edit Plan' : 'New Plan'}</h2>
              <button onClick={() => { setShowPlanModal(false); setEditingPlan(null); }} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Code</label>
                <input type="text" value={planForm.code} onChange={e => setPlanForm({ ...planForm, code: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                <input type="text" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <select value={planForm.billing_owner_type} onChange={e => setPlanForm({ ...planForm, billing_owner_type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40">
                    <option value="SELF">Self</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="INSTITUTION">Institution</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Interval</label>
                  <select value={planForm.interval} onChange={e => setPlanForm({ ...planForm, interval: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40">
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="ONE_TIME">One Time</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price (kobo)</label>
                <input type="number" value={planForm.price_kobo} onChange={e => setPlanForm({ ...planForm, price_kobo: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40" />
                <p className="text-xs text-neutral-400 mt-1">₦{(planForm.price_kobo / 100).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Course Limit</label>
                  <input type="number" value={planForm.course_limit} onChange={e => setPlanForm({ ...planForm, course_limit: e.target.value })}
                    placeholder="Unlimited" className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Seat Limit</label>
                  <input type="number" value={planForm.seat_limit} onChange={e => setPlanForm({ ...planForm, seat_limit: e.target.value })}
                    placeholder="Unlimited" className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-sungold/40" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Features (JSON)</label>
                <textarea value={planForm.features} onChange={e => setPlanForm({ ...planForm, features: e.target.value })} rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sungold/40" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowPlanModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:bg-neutral-100 transition-colors">Cancel</button>
              <button onClick={handleSavePlan} className="px-6 py-2.5 rounded-xl text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                {editingPlan ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
