import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Search, CheckCircle, XCircle, FileText, ShoppingCart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  status: string;
  createdAt: string;
}

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await api.get('/approvals/pending');
      setApprovals(response.data.data);
    } catch (error) {
      console.error('Failed to fetch pending approvals', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    let rejectReason = '';
    
    if (action === 'REJECTED') {
      const reason = window.prompt("Please provide a reason for rejection:");
      if (!reason) return; // Cancelled
      rejectReason = reason;
    }

    setActionLoading(id);
    try {
      await api.post(`/approvals/${id}/action`, { action, rejectReason });
      // Remove from pending list
      setApprovals(approvals.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to action approval.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApprovals = approvals.filter(a => 
    a.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Approvals Inbox</h1>
          <p className="text-sm text-slate-500 mt-1">Review and action pending Purchase Requests and Purchase Orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
              placeholder="Search by Document ID or Requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Document
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Requested By
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th scope="col" className="relative px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary-600"></div>
                    <p className="mt-2 text-sm">Loading pending approvals...</p>
                  </td>
                </tr>
              ) : filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <p className="text-base font-bold text-slate-900">You're all caught up!</p>
                    <p className="text-sm mt-1 text-slate-500">No pending approvals require your attention right now.</p>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((approval) => (
                  <tr key={approval.id} onClick={() => navigate(`/approvals/${approval.id}`)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border ${
                          approval.entityType === 'PR' ? 'bg-primary-50 border-primary-100 text-primary-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          {approval.entityType === 'PR' ? <FileText className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900 tracking-wide">
                            {approval.entityId}
                          </div>
                          <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                            {approval.entityType === 'PR' ? 'Purchase Request' : 'Purchase Order'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-medium text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                          {approval.requestedBy}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {formatDate(approval.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            disabled={actionLoading === approval.id}
                            onClick={() => handleAction(approval.id, 'REJECTED')}
                            className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === approval.id ? 'Processing...' : <><XCircle className="h-4 w-4 mr-1.5" /> Reject</>}
                          </button>
                          <button 
                            disabled={actionLoading === approval.id}
                            onClick={() => handleAction(approval.id, 'APPROVED')}
                            className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            {actionLoading === approval.id ? 'Processing...' : <><CheckCircle className="h-4 w-4 mr-1.5" /> Approve</>}
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
