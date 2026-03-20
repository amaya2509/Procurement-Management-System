import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface PRLine {
  lineNo: number;
  lineType: string; // GOODS | SERVICE | ASSET
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

interface Supplier {
  id: string;
  supplierName: string;
  active: boolean;
}

interface ReferenceItem {
  id: string;
  branchName?: string;
  departmentName?: string;
}

const defaultLine = (): PRLine => ({
  lineNo: 1,
  lineType: 'GOODS',
  item: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  lineAmount: 0,
});

export const PRCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<ReferenceItem[]>([]);
  const [departments, setDepartments] = useState<ReferenceItem[]>([]);

  const [formData, setFormData] = useState({
    description: '',
    priority: 'MEDIUM',
    needByDate: '',
    supplierId: '',
    currency: 'LKR',
    branchId: '',
    departmentId: '',
  });

  const [lines, setLines] = useState<PRLine[]>([defaultLine()]);

  useEffect(() => {
    const fetchRefData = async () => {
      try {
        const [suppRes, branchRes, deptRes] = await Promise.all([
          api.get('/suppliers'),
          api.get('/users/reference/branches'),
          api.get('/users/reference/departments'),
        ]);
        const activeSuppliers = (suppRes.data.data || []).filter((s: Supplier) => s.active);
        setSuppliers(activeSuppliers);
        setBranches(branchRes.data.data || []);
        setDepartments(deptRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch reference data', err);
      }
    };
    fetchRefData();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { ...defaultLine(), lineNo: lines.length + 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, lineNo: i + 1 })));
  };

  const handleLineChange = (index: number, field: keyof PRLine, value: any) => {
    const updated = [...lines];
    (updated[index] as any)[field] = value;
    // Auto-calculate lineAmount
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].lineAmount = updated[index].quantity * updated[index].unitPrice;
    }
    setLines(updated);
  };

  const calculateTotal = () =>
    lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const formatCurrency = (amount: number) =>
    `${formData.currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Please enter a description for the Purchase Request.');
      return;
    }
    if (!formData.needByDate) {
      setError('Please select a Need By Date.');
      return;
    }
    if (lines.some(l => !l.item.trim() || l.quantity <= 0 || l.unitPrice <= 0)) {
      setError('Please fill all line items with valid Item Name, Quantity and Unit Price.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        prLines: lines.map((l, i) => ({
          lineNo: i + 1,
          lineType: l.lineType,
          item: l.item,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineAmount: l.quantity * l.unitPrice,
        })),
      };

      await api.post('/purchase-requests', payload);
      navigate('/pr');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create Purchase Request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pr')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Purchase Request</h1>
          <p className="text-sm text-slate-500 mt-1">Fill out the details below to submit a new PR for approval.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mr-3 text-sm font-bold">1</div>
            General Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description / Justification *</label>
              <textarea
                required
                rows={2}
                placeholder="Reason for this purchase request…"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Need By Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Need By Date *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.needByDate}
                onChange={(e) => setFormData({ ...formData, needByDate: e.target.value })}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-colors"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-colors"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>

            {/* Preferred Supplier */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Supplier</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-colors"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">— No Preference —</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.supplierName}</option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Branch *</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-colors"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              >
                <option value="" disabled>Select Branch</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.branchName}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department *</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-colors"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="" disabled>Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>

            {/* Requestor (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Requestor</label>
              <input
                type="text"
                readOnly
                value={user?.username || ''}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mr-3 text-sm font-bold">2</div>
              Line Items
            </h3>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center px-3 py-1.5 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group transition-all hover:shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Line {line.lineNo}</span>
                  <select
                    value={line.lineType}
                    onChange={(e) => handleLineChange(index, 'lineType', e.target.value)}
                    className="ml-auto text-xs px-3 py-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors"
                  >
                    <option value="GOODS">GOODS</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="ASSET">ASSET</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Item */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Item Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dell XPS Laptop"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                      value={line.item}
                      onChange={(e) => handleLineChange(index, 'item', e.target.value)}
                    />
                  </div>
                  {/* Description */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                    <input
                      type="text"
                      placeholder="Additional detail"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                      value={line.description}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                    />
                  </div>
                  {/* Qty */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Qty *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {/* Unit Price */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Unit Price *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                    {formatCurrency(line.quantity * line.unitPrice)}
                  </span>
                </div>

                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(index)}
                    className="absolute -right-2 -top-2 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 flex justify-end pt-6 border-t border-slate-100">
            <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex items-center justify-between min-w-[320px]">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Estimated</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/pr')}
            className="px-6 py-3 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Submit for Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default PRCreatePage;
