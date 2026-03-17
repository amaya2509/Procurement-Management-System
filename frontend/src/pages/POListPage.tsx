import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Search, Eye, ShoppingCart, AlertCircle, Calendar, Truck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface POLine {
  id: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

interface PurchaseOrder {
  poNumber: string;
  prNumber: string;
  supplierId: string;
  requesterId: string;
  branchId: string;
  departmentId: string;
  status: string;
  totalAmount: number;
  orderDate: string;
  deliveryDate: string;
  poLines: POLine[];
}

export const POListPage: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPos(response.data.data);
    } catch (error) {
      console.error('Failed to fetch POs', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPOs = pos.filter(po => 
    po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.prNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'DELIVERED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vendor orders generated from approved purchase requests.</p>
        </div>
        {user?.role === 'REQUESTER' || user?.role === 'ADMIN' ? (
          <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-all hover:shadow-md hover:-translate-y-0.5"
            onClick={() => window.location.href='/po/new'}>
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </button>
        ) : null}
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
              placeholder="Search by PO or PR Number..."
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
                  Order Details
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary-600"></div>
                    <p className="mt-2 text-sm">Loading purchase orders...</p>
                  </td>
                </tr>
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm">No purchase orders found.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => (
                  <tr key={po.poNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                          <ShoppingCart className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {po.poNumber}
                          </div>
                          <div className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                            Ref: {po.prNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 flex items-center">
                        <Truck className="h-4 w-4 mr-1.5 text-slate-400" />
                        {po.supplierId}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        Est. Delivery: {formatDate(po.deliveryDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(po.totalAmount)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {po.poLines.length} Items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(po.status)}`}>
                        {po.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-slate-400 hover:text-emerald-600 p-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200" title="View Details">
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

export default POListPage;
