import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Search, Eye, FileText, AlertCircle, Calendar, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface PRLine {
  lineNo: number;
  lineType: string;
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

interface PurchaseRequest {
  prNumber: string;
  requestorId: string;
  branchId: string;
  departmentId: string;
  description: string;
  status: string;
  priority: string;
  needByDate: string;
  requisitionDate: string;
  supplierId: string;
  currency: string;
  rejectReason: string;
  prLines: PRLine[];
}

export const PRListPage: React.FC = () => {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPRs();
  }, []);

  const fetchPRs = async () => {
    try {
      const response = await api.get('/purchase-requests');
      setPrs(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch PRs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPRs = prs.filter(pr =>
    (pr.prNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pr.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PO_CREATED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority || '').toUpperCase()) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
      case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const calcTotal = (prLines: PRLine[]) =>
    (prLines || []).reduce((sum, l) => sum + (l.lineAmount || l.quantity * l.unitPrice), 0);

  const formatCurrency = (amount: number, currency?: string) =>
    `${currency || 'LKR'} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Requests</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage all procurement requests across the organization.</p>
        </div>
        {(user?.role === 'REQUESTER' || user?.role === 'ADMIN') && (
          <button
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-all hover:shadow-md hover:-translate-y-0.5"
            onClick={() => navigate('/pr/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create PR
          </button>
        )}
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
              placeholder="Search by PR Number or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PR Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Amount</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary-600"></div>
                    <p className="mt-2 text-sm">Loading purchase requests...</p>
                  </td>
                </tr>
              ) : filteredPRs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm">No purchase requests found.</p>
                  </td>
                </tr>
              ) : (
                filteredPRs.map((pr) => (
                  <tr key={pr.prNumber} onClick={() => navigate(`/pr/${pr.prNumber}`)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary-50 border border-primary-100">
                          <FileText className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{pr.prNumber}</div>
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(pr.requisitionDate)} · Need by: {formatDate(pr.needByDate)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate" title={pr.description}>{pr.description || '—'}</div>
                      <div className="text-xs text-slate-500 mt-1">{(pr.prLines || []).length} line item(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pr.priority ? (
                        <span className={`px-2.5 py-1 inline-flex items-center text-xs leading-5 font-bold rounded-full border ${getPriorityColor(pr.priority)}`}>
                          <Zap className="h-3 w-3 mr-1" />{pr.priority}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{formatCurrency(calcTotal(pr.prLines), pr.currency)}</div>
                      <div className="text-xs text-slate-500 mt-1">{pr.currency || 'LKR'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(pr.status)}`}>
                        {(pr.status || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-slate-400 hover:text-primary-600 p-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
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

export default PRListPage;
