import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, FileText, Zap, Calendar, User, Building, Briefcase, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Plus, Trash2 } from 'lucide-react';

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
  year: number;
  runningNumber: number;
  branchId: string;
  departmentId: string;
  description: string;
  status: string;
  priority: string;
  requestorId: string;
  needByDate: string;
  requisitionDate: string;
  supplierId: string;
  currency: string;
  rejectReason: string;
  createdAt: string;
  prLines: PRLine[];
}

interface Supplier { id: string; supplierName: string; isActive?: boolean; active?: boolean; }

const EDITABLE_STATUSES = ['PENDING_APPROVAL'];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-800 border-amber-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    PO_CREATED: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${map[status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    HIGH: 'bg-red-50 text-red-700 border-red-100',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-100',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span className={`px-2.5 py-1 inline-flex items-center text-xs font-bold rounded-full border ${map[priority] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
      <Zap className="h-3 w-3 mr-1" />{priority || '—'}
    </span>
  );
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-50 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest w-40 shrink-0 mb-1 sm:mb-0">{label}</span>
    <span className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-300">—</span>}</span>
  </div>
);

export const PRDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pr, setPr] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmSave, setConfirmSave] = useState(false);

  // Edit state (clone of PR for editing)
  const [editData, setEditData] = useState<Partial<PurchaseRequest>>({});
  const [editLines, setEditLines] = useState<PRLine[]>([]);

  // Reference data for dropdowns
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    fetchPR();
    fetchRefData();
  }, [id]);

  const fetchPR = async () => {
    try {
      const res = await api.get(`/purchase-requests/${id}`);
      const data: PurchaseRequest = res.data.data;
      setPr(data);
      setEditData({
        description: data.description,
        priority: data.priority,
        needByDate: data.needByDate?.split('T')[0] || '',
        supplierId: data.supplierId,
        currency: data.currency,
      });
      setEditLines((data.prLines || []).map(l => ({ ...l })));
    } catch {
      setError('Failed to load Purchase Request.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefData = async () => {
    try {
      const [supRes] = await Promise.all([
        api.get('/suppliers'),
      ]);
      setSuppliers((supRes.data.data || []).filter((s: Supplier) => s.isActive || s.active));
    } catch { /* non-critical */ }
  };

  const handleLineChange = (idx: number, field: keyof PRLine, val: any) => {
    const updated = [...editLines];
    (updated[idx] as any)[field] = val;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[idx].lineAmount = updated[idx].quantity * updated[idx].unitPrice;
    }
    setEditLines(updated);
  };

  const addLine = () => setEditLines([...editLines, { lineNo: editLines.length + 1, lineType: 'GOODS', item: '', description: '', quantity: 1, unitPrice: 0, lineAmount: 0 }]);
  const removeLine = (idx: number) => setEditLines(editLines.filter((_, i) => i !== idx).map((l, i) => ({ ...l, lineNo: i + 1 })));

  const handleSave = async () => {
    setError('');
    if (!editData.description?.trim()) { setError('Description is required.'); return; }
    if (editLines.some(l => !l.item.trim() || l.quantity <= 0 || l.unitPrice <= 0)) {
      setError('Please fill all line items correctly.'); return;
    }
    setSaving(true);
    try {
      const payload = { ...pr, ...editData, prLines: editLines.map((l, i) => ({ ...l, lineNo: i + 1, lineAmount: l.quantity * l.unitPrice })) };
      const res = await api.put(`/purchase-requests/${id}`, payload);
      setPr(res.data.data);
      setEditing(false);
      setConfirmSave(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const calcTotal = (lines: PRLine[]) => lines.reduce((s, l) => s + (l.lineAmount || l.quantity * l.unitPrice), 0);
  const fmt = (n: number, cur = 'LKR') => `${cur} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  const canEdit = pr && EDITABLE_STATUSES.includes(pr.status);

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary-600"></div>
    </div>
  );

  if (!pr) return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-3" />
      <p className="text-slate-600 font-medium">{error || 'Purchase Request not found.'}</p>
      <button onClick={() => navigate('/pr')} className="mt-4 text-sm text-primary-600 hover:underline">← Back to list</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/pr')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{pr.prNumber}</h1>
              <StatusBadge status={pr.status} />
              {pr.priority && <PriorityBadge priority={pr.priority} />}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">Purchase Request · Created {fmtDate(pr.requisitionDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            canEdit ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Edit2 className="h-4 w-4 mr-2" /> Edit
              </button>
            ) : (
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                {pr.status === 'APPROVED' ? 'Approved — read only' : pr.status === 'REJECTED' ? 'Rejected — read only' : 'Read Only'}
              </span>
            )
          ) : (
            <>
              <button onClick={() => { setEditing(false); setError(''); }} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                <X className="h-4 w-4 mr-2" /> Cancel
              </button>
              <button onClick={() => setConfirmSave(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-sm">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2"></div>{error}
        </div>
      )}

      {pr.rejectReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Rejection Reason</p>
            <p className="text-sm text-red-600 mt-0.5">{pr.rejectReason}</p>
          </div>
        </div>
      )}

      {/* Header Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Header Information</h3>

        {!editing ? (
          <div className="divide-y divide-slate-50">
            <InfoRow label="Description" value={pr.description} />
            <InfoRow label="Priority" value={pr.priority ? <PriorityBadge priority={pr.priority} /> : '—'} />
            <InfoRow label="Need By Date" value={<span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" />{fmtDate(pr.needByDate)}</span>} />
            <InfoRow label="Requestor" value={<span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" />{pr.requestorId}</span>} />
            <InfoRow label="Branch" value={<span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-400" />{pr.branchId}</span>} />
            <InfoRow label="Department" value={<span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-slate-400" />{pr.departmentId}</span>} />
            <InfoRow label="Supplier" value={<span className="flex items-center gap-1"><Package className="h-3.5 w-3.5 text-slate-400" />{pr.supplierId || '—'}</span>} />
            <InfoRow label="Currency" value={<span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-slate-400" />{pr.currency}</span>} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description *</label>
              <textarea rows={2} required value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-colors resize-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
              <select value={editData.priority || ''} onChange={e => setEditData({ ...editData, priority: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Need By Date</label>
              <input type="date" value={editData.needByDate || ''} onChange={e => setEditData({ ...editData, needByDate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Currency</label>
              <select value={editData.currency || 'LKR'} onChange={e => setEditData({ ...editData, currency: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Preferred Supplier</label>
              <select value={editData.supplierId || ''} onChange={e => setEditData({ ...editData, supplierId: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="">— None —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.supplierName}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package className="h-4 w-4" /> Line Items</h3>
          {editing && (
            <button type="button" onClick={addLine} className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              <Plus className="h-4 w-4 mr-1" /> Add Line
            </button>
          )}
        </div>

        {!editing ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['#', 'Type', 'Item', 'Description', 'Qty', 'Unit Price', 'Line Amount'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(pr.prLines || []).map(l => (
                  <tr key={l.lineNo} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{l.lineNo}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{l.lineType}</span></td>
                    <td className="px-4 py-3 font-medium text-slate-900">{l.item}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{l.description}</td>
                    <td className="px-4 py-3">{l.quantity}</td>
                    <td className="px-4 py-3">{fmt(l.unitPrice, pr.currency)}</td>
                    <td className="px-4 py-3 font-semibold text-primary-700">{fmt(l.lineAmount || l.quantity * l.unitPrice, pr.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-slate-600 uppercase tracking-widest">Total Estimated</td>
                  <td className="px-4 py-3 text-base font-bold text-primary-700">{fmt(calcTotal(pr.prLines || []), pr.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {editLines.map((line, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-400">Line {line.lineNo}</span>
                  <select value={line.lineType} onChange={e => handleLineChange(idx, 'lineType', e.target.value)} className="ml-auto text-xs px-3 py-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="GOODS">GOODS</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="ASSET">ASSET</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Item *</label>
                    <input type="text" required value={line.item} onChange={e => handleLineChange(idx, 'item', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <input type="text" value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                    <input type="number" min={1} value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Unit Price</label>
                    <input type="number" min={0.01} step={0.01} value={line.unitPrice} onChange={e => handleLineChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded border border-primary-100">{fmt(line.quantity * line.unitPrice, editData.currency)}</span>
                </div>
                {editLines.length > 1 && (
                  <button type="button" onClick={() => removeLine(idx)} className="absolute -right-2 -top-2 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:border-red-200">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 flex items-center gap-6">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Estimated</span>
                <span className="text-xl font-bold text-primary-700">{fmt(calcTotal(editLines), editData.currency)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmSave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Update</h3>
            <p className="text-sm text-slate-500">Are you sure you want to save changes to this Purchase Request? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setConfirmSave(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-70">
                {saving ? 'Saving...' : 'Yes, Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDetailPage;
