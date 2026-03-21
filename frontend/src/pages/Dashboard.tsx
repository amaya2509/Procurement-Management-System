import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ShoppingCart, FileText, CheckSquare, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface ActivityItem {
  id: string;
  type: 'PR' | 'PO';
  description: string;
  date: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [prs, setPrs] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [approvalsCount, setApprovalsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [prRes, poRes] = await Promise.all([
          api.get('/purchase-requests'),
          api.get('/purchase-orders'),
        ]);

        const prList = prRes.data?.data || [];
        const poList = poRes.data?.data || [];
        setPrs(prList);
        setPos(poList);

        if (user?.role === 'APPROVER' || user?.role === 'ADMIN') {
          const appRes = await api.get('/approvals/pending');
          setApprovalsCount((appRes.data?.data || []).length);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const pendingPrsCount = prs.filter((pr: any) => pr.status === 'PENDING_APPROVAL').length;
  const pendingPosCount = pos.filter((po: any) => po.status === 'PENDING_APPROVAL').length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const totalSpend = pos
    .filter((po: any) => {
      if (!po.orderDate) return false;
      const d = new Date(po.orderDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && (po.status === 'APPROVED' || po.status === 'DELIVERED');
    })
    .reduce((sum: number, po: any) => sum + (po.totalAmount || 0), 0);

  const formatCurrency = (amount: number) =>
    `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const stats = [
    { title: 'Pending PRs', value: loading ? '...' : pendingPrsCount.toString(), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Pending POs', value: loading ? '...' : pendingPosCount.toString(), icon: ShoppingCart, color: 'text-purple-500', bg: 'bg-purple-100' },
    { title: 'Awaiting Approvals', value: loading ? '...' : approvalsCount.toString(), icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-100' },
    { title: 'Total Spend (Monthly)', value: loading ? '...' : formatCurrency(totalSpend), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  const allActivities: ActivityItem[] = [
    ...prs.map((pr: any) => ({
      id: pr.prNumber || pr.id,
      type: 'PR' as const,
      description: `PR #${pr.prNumber} Created`,
      date: pr.requisitionDate || pr.createdAt || new Date().toISOString()
    })),
    ...pos.map((po: any) => ({
      id: po.poNumber || po.id,
      type: 'PO' as const,
      description: `PO #${po.poNumber} Created`,
      date: po.orderDate || po.createdAt || new Date().toISOString()
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return 'Unknown time';
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000); // in minutes
    if (diff < 0) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Here's what's happening in your procurement process today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-slate-500">Loading activity...</p>
            ) : allActivities.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity.</p>
            ) : (
              allActivities.map((activity, index) => (
                <div key={`${activity.id}-${index}`} className="flex gap-4">
                  <div className={`w-2 h-2 mt-2 flex-shrink-0 rounded-full ${activity.type === 'PR' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                    <p className="text-xs text-slate-500">{timeAgo(activity.date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
             <button 
               onClick={() => navigate('/pr/new')}
               className="text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm font-medium text-slate-700"
             >
                 + Create New Purchase Request
             </button>
             {user?.role === 'APPROVER' || user?.role === 'ADMIN' ? (
                <button 
                  onClick={() => navigate('/approvals')}
                  className="text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-colors text-sm font-medium text-slate-700"
                >
                    Review Pending Approvals
                </button>
             ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
