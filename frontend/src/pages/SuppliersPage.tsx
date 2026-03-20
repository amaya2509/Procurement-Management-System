import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Search, Edit2, MapPin, Phone, Building, X, Save, Mail } from 'lucide-react';

interface Supplier {
  id: string;
  supplierName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  active: boolean;
  createdAt: string;
}

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [newSupplier, setNewSupplier] = useState({
    supplierName: '',
    address: '',
    phone: '',
    email: '',
    currency: 'LKR',
    active: true
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED SAFE SEARCH
  const filteredSuppliers = suppliers.filter(supplier => 
    (supplier.supplierName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ STATUS FROM BOOLEAN
  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/suppliers', newSupplier);

      setIsAddModalOpen(false);
      fetchSuppliers();

      setNewSupplier({
        supplierName: '',
        address: '',
        phone: '',
        email: '',
        currency: 'LKR',
        active: true
      });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to onboard supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Supplier Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vendor relationships, contacts, and approval statuses.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4 mr-2" />
          Onboard Supplier
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all"
              placeholder="Search by vendor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Vendor Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-4"></th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary-600"></div>
                    <p className="mt-2 text-sm">Loading suppliers directory...</p>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <p className="text-sm">No suppliers found.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/80 transition-colors">

                    {/* VENDOR */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                          <Building className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">
                            {supplier.supplierName}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span className="truncate max-w-[200px]">{supplier.address}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 flex flex-col gap-1">
                        <span className="flex items-center font-medium">
                          <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" />
                          {supplier.phone}
                        </span>
                        <a href={`mailto:${supplier.email}`} className="flex items-center text-primary-600 hover:text-primary-700 transition-colors">
                          <Mail className="h-3.5 w-3.5 mr-2" />
                          {supplier.email}
                        </a>
                      </div>
                    </td>

                    {/* CURRENCY */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">{supplier.currency}</span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(supplier.active)}`}>
                        {supplier.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button className="text-slate-400 hover:text-primary-600 p-2 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mr-3">
                  <Plus className="h-5 w-5" />
                </div>
                Onboard New Supplier
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <form id="addSupplierForm" onSubmit={handleAddSupplier} className="space-y-4">

                <input
                  placeholder="Supplier Name"
                  required
                  value={newSupplier.supplierName}
                  onChange={e => setNewSupplier({...newSupplier, supplierName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />

                <input
                  placeholder="Email"
                  required
                  value={newSupplier.email}
                  onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />

                <input
                  placeholder="Phone"
                  required
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />

                <textarea
                  placeholder="Address"
                  required
                  value={newSupplier.address}
                  onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />

                <input
                  placeholder="Currency"
                  value={newSupplier.currency}
                  onChange={e => setNewSupplier({...newSupplier, currency: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />

                <select
                  value={newSupplier.active ? 'ACTIVE' : 'INACTIVE'}
                  onChange={e => setNewSupplier({...newSupplier, active: e.target.value === 'ACTIVE'})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>

              </form>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl">
                Cancel
              </button>
              <button type="submit" form="addSupplierForm" disabled={submitting} className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl text-white bg-primary-600">
                {submitting ? 'Saving...' : <><Save className="h-4 w-4 mr-2"/>Save Supplier</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuppliersPage;