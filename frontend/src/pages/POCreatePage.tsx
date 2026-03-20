import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, ArrowLeft, Save, Search } from 'lucide-react';
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

interface PRPreview {
  prNumber: string;
  status: string;
  description: string;
  currency: string;
  prLines: PRLine[];
}

interface Supplier {
  id: string;
  supplierName: string;
  active: boolean;
}

interface POLine {
  lineNo: number;
  item: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

const defaultLine = (): POLine => ({
  lineNo: 1,
  item: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  lineAmount: 0,
});

export const POCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [availablePRs, setAvailablePRs] = useState<PRPreview[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [formData, setFormData] = useState({
    prId: '',          // backend field name
    supplierId: '',
    description: '',
    currency: 'LKR',
    branchId: '',
  });

  const [lines, setLines] = useState<POLine[]>([defaultLine()]);

  useEffect(() => {
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const [prsRes, supsRes] = await Promise.all([
        api.get('/purchase-requests'),
        api.get('/suppliers'),
      ]);
      const approvedPRs = (prsRes.data.data || []).filter((pr: PRPreview) => pr.status === 'APPROVED');
      setAvailablePRs(approvedPRs);

      // Use boolean active (not string 'ACTIVE')
      const activeSups = (supsRes.data.data || []).filter((s: Supplier) => s.active === true);
      setSuppliers(activeSups);
    } catch (err) {
      console.error('Failed to fetch lookups', err);
    }
  };

  const handlePRSelection = async (prId: string) => {
    setFormData({ ...formData, prId });
    if (!prId) return;
    try {
      const res = await api.get(`/purchase-requests/${prId}`);
      const pr: PRPreview = res.data.data;

      if (pr && pr.prLines) {
        // Map PR lines → PO lines using correct field names
        const mappedLines: POLine[] = pr.prLines.map((l, i) => ({
          lineNo: i + 1,
          item: l.item || '',
          description: l.description || '',
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineAmount: l.lineAmount || l.quantity * l.unitPrice,
        }));
        setLines(mappedLines);
      }
      // Also auto-fill currency and description from PR
      setFormData(prev => ({
        ...prev,
        prId,
        currency: pr.currency || prev.currency,
        description: pr.description || prev.description,
        branchId: (pr as any).branchId || prev.branchId,
      }));
    } catch (err) {
      console.error('Failed to fetch PR details', err);
    }
  };

  const handleAddLine = () => {
    setLines([...lines, { ...defaultLine(), lineNo: lines.length + 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, lineNo: i + 1 })));
  };

  const handleLineChange = (index: number, field: keyof POLine, value: any) => {
    const updated = [...lines];
    (updated[index] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].lineAmount = updated[index].quantity * updated[index].unitPrice;
    }
    setLines(updated);
  };

  const calculateTotal = () => lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const formatCurrency = (amount: number) =>
    `${formData.currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.prId || !formData.supplierId) {
      setError('Please select a referenced PR and a Supplier.');
      return;
    }
    if (lines.some(l => !l.item.trim() || l.quantity <= 0 || l.unitPrice <= 0)) {
      setError('Please fill all line items with valid Item Name, Quantity and Price.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        prId: formData.prId,
        supplierId: formData.supplierId,
        description: formData.description,
        currency: formData.currency,
        branchId: formData.branchId,
        totalAmount: calculateTotal(),
        poLines: lines.map((l, i) => ({
          lineNo: i + 1,
          item: l.item,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          lineAmount: l.quantity * l.unitPrice,
        })),
      };

      await api.post('/purchase-orders', payload);
      navigate('/po');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create Purchase Order. Ensure the PR is APPROVED and exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/po')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create Purchase Order</h1>
          <p className="text-sm text-slate-500 mt-1">Generate a formal vendor order based on an approved purchase request.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 text-sm font-bold">1</div>
            Order Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Referenced PR */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Referenced Approved PR *</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none"
                  value={formData.prId}
                  onChange={(e) => handlePRSelection(e.target.value)}
                >
                  <option value="" disabled>Select an approved PR</option>
                  {availablePRs.map(pr => (
                    <option key={pr.prNumber} value={pr.prNumber}>{pr.prNumber} — {pr.description}</option>
                  ))}
                </select>
              </div>
              {availablePRs.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No APPROVED PRs available. Approve a PR first.</p>
              )}
            </div>

            {/* Vendor/Supplier */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Vendor / Supplier *</label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="" disabled>Select a Vendor</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.supplierName}</option>
                ))}
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency *</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-colors"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input
                type="text"
                placeholder="Order description…"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Order Lines */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mr-3 text-sm font-bold">2</div>
              Order Lines
            </h3>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center px-3 py-1.5 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Line
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group transition-all hover:shadow-sm">
                <div className="mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Line {line.lineNo}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Item *</label>
                    <input
                      type="text"
                      required
                      placeholder="Item name"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                      value={line.item}
                      onChange={(e) => handleLineChange(index, 'item', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                    <input
                      type="text"
                      placeholder="Detail"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                      value={line.description}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Qty *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Agreed Price *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
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

          <div className="mt-6 flex justify-end pt-6 border-t border-slate-100">
            <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex items-center justify-between min-w-[320px]">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Order Value</span>
              <span className="text-2xl font-bold text-emerald-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/po')}
            className="px-6 py-3 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default POCreatePage;
