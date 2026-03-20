import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, FileText, DollarSign, Package, Building, AlertTriangle, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

interface POLine { lineNo: number; item: string; description: string; quantity: number; unitPrice: number; lineAmount: number; }
interface PurchaseOrder { poNumber: string; prId: string; supplierId: string; branchId: string; description: string; status: string; currency: string; totalAmount: number; orderDate: string; rejectReason: string; createdBy: string; poLines: POLine[]; }
interface Supplier { id: string; supplierName: string; isActive?: boolean; active?: boolean; }

function StatusBadge({ status }: { status: string }) {
  const m: Record<string,string> = { APPROVED:'bg-emerald-100 text-emerald-800 border-emerald-200', PENDING_APPROVAL:'bg-amber-100 text-amber-800 border-amber-200', REJECTED:'bg-red-100 text-red-800 border-red-200', DELIVERED:'bg-blue-100 text-blue-800 border-blue-200' };
  return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${m[status]||'bg-slate-100 text-slate-700 border-slate-200'}`}>{status.replace(/_/g,' ')}</span>;
}
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-50 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest w-40 shrink-0 mb-1 sm:mb-0">{label}</span>
    <span className="text-sm text-slate-800 font-medium">{value||<span className="text-slate-300">—</span>}</span>
  </div>
);

export const PODetailPage: React.FC = () => {
  const { id } = useParams<{id:string}>();
  const navigate = useNavigate();
  const [po, setPo] = useState<PurchaseOrder|null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmSave, setConfirmSave] = useState(false);
  const [editData, setEditData] = useState<Partial<PurchaseOrder>>({});
  const [editLines, setEditLines] = useState<POLine[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => { fetchPO(); fetchSuppliers(); }, [id]);

  const fetchPO = async () => {
    try {
      const res = await api.get(`/purchase-orders/${id}`);
      const d: PurchaseOrder = res.data.data;
      setPo(d);
      setEditData({ description: d.description, supplierId: d.supplierId, currency: d.currency });
      setEditLines((d.poLines||[]).map(l=>({...l})));
    } catch { setError('Failed to load Purchase Order.'); } finally { setLoading(false); }
  };

  const fetchSuppliers = async () => {
    try { const r = await api.get('/suppliers'); setSuppliers((r.data.data||[]).filter((s:Supplier)=>s.isActive||s.active)); } catch{}
  };

  const changeL = (idx:number, f:keyof POLine, v:any) => {
    const u=[...editLines]; (u[idx] as any)[f]=v;
    if(f==='quantity'||f==='unitPrice') u[idx].lineAmount=u[idx].quantity*u[idx].unitPrice;
    setEditLines(u);
  };

  const handleSave = async () => {
    setError('');
    if(editLines.some(l=>!l.item.trim()||l.quantity<=0||l.unitPrice<=0)){setError('Fill all line items correctly.');return;}
    setSaving(true);
    try {
      const total=editLines.reduce((s,l)=>s+l.quantity*l.unitPrice,0);
      const payload={...po,...editData,totalAmount:total,poLines:editLines.map((l,i)=>({...l,lineNo:i+1,lineAmount:l.quantity*l.unitPrice}))};
      const res=await api.put(`/purchase-orders/${id}`,payload);
      setPo(res.data.data); setEditing(false); setConfirmSave(false);
    } catch(err:any){setError(err.response?.data?.message||'Failed to save.');} finally{setSaving(false);}
  };

  const calcTotal=(lines:POLine[])=>lines.reduce((s,l)=>s+(l.lineAmount||l.quantity*l.unitPrice),0);
  const fmt=(n:number,cur='LKR')=>`${cur} ${n.toLocaleString('en-US',{minimumFractionDigits:2})}`;
  const fmtDate=(d:string)=>d?new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'—';
  const canEdit=po&&po.status==='PENDING_APPROVAL';

  if(loading) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600"></div></div>;
  if(!po) return <div className="bg-white rounded-2xl p-12 text-center border border-slate-100"><AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-3"/><p className="text-slate-600 font-medium">{error||'PO not found.'}</p><button onClick={()=>navigate('/po')} className="mt-4 text-sm text-emerald-600 hover:underline">← Back to list</button></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button onClick={()=>navigate('/po')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5"/></button>
          <div>
            <div className="flex items-center gap-3 flex-wrap"><h1 className="text-2xl font-bold text-slate-900">{po.poNumber}</h1><StatusBadge status={po.status}/></div>
            <p className="text-sm text-slate-400 mt-0.5">Purchase Order · {fmtDate(po.orderDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (canEdit ? <button onClick={()=>setEditing(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"><Edit2 className="h-4 w-4 mr-2"/>Edit</button> : <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">Read Only</span>) : (
            <><button onClick={()=>{setEditing(false);setError('');}} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50"><X className="h-4 w-4 mr-2"/>Cancel</button>
            <button onClick={()=>setConfirmSave(true)} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"><Save className="h-4 w-4 mr-2"/>Save Changes</button></>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
      {po.rejectReason && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3"><AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/><div><p className="text-sm font-semibold text-red-800">Rejection Reason</p><p className="text-sm text-red-600 mt-0.5">{po.rejectReason}</p></div></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingCart className="h-4 w-4"/>Order Information</h3>
        {!editing ? (
          <div className="divide-y divide-slate-50">
            <InfoRow label="PO Number" value={po.poNumber}/>
            <InfoRow label="PR Reference" value={<button onClick={()=>navigate(`/pr/${po.prId}`)} className="text-primary-600 hover:underline flex items-center gap-1"><FileText className="h-3.5 w-3.5"/>{po.prId}</button>}/>
            <InfoRow label="Supplier" value={<span className="flex items-center gap-1"><Package className="h-3.5 w-3.5 text-slate-400"/>{po.supplierId}</span>}/>
            <InfoRow label="Branch" value={<span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-400"/>{po.branchId}</span>}/>
            <InfoRow label="Description" value={po.description}/>
            <InfoRow label="Currency" value={<span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-slate-400"/>{po.currency}</span>}/>
            <InfoRow label="Total Amount" value={<span className="text-base font-bold text-emerald-700">{fmt(po.totalAmount,po.currency)}</span>}/>
            <InfoRow label="Order Date" value={fmtDate(po.orderDate)}/>
            <InfoRow label="Created By" value={po.createdBy}/>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
              <input type="text" value={editData.description||''} onChange={e=>setEditData({...editData,description:e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Supplier</label>
              <select value={editData.supplierId||''} onChange={e=>setEditData({...editData,supplierId:e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="">— None —</option>
                {suppliers.map(s=><option key={s.id} value={s.id}>{s.supplierName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Currency</label>
              <select value={editData.currency||'LKR'} onChange={e=>setEditData({...editData,currency:e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm">
                <option value="LKR">LKR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package className="h-4 w-4"/>Order Lines</h3>
          {editing && <button type="button" onClick={()=>setEditLines([...editLines,{lineNo:editLines.length+1,item:'',description:'',quantity:1,unitPrice:0,lineAmount:0}])} className="inline-flex items-center px-3 py-1.5 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"><Plus className="h-4 w-4 mr-1"/>Add Line</button>}
        </div>
        {!editing ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead><tr className="bg-slate-50">{['#','Item','Description','Qty','Unit Price','Line Amount'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-50">
                {(po.poLines||[]).map(l=>(
                  <tr key={l.lineNo} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-500">{l.lineNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{l.item}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{l.description}</td>
                    <td className="px-4 py-3">{l.quantity}</td>
                    <td className="px-4 py-3">{fmt(l.unitPrice,po.currency)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{fmt(l.lineAmount||l.quantity*l.unitPrice,po.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="bg-slate-50"><td colSpan={5} className="px-4 py-3 text-right text-sm font-bold text-slate-600 uppercase tracking-widest">Total Order Value</td><td className="px-4 py-3 text-base font-bold text-emerald-700">{fmt(po.totalAmount,po.currency)}</td></tr></tfoot>
            </table>
          </div>
        ) : (
          <div className="space-y-3">
            {editLines.map((line,idx)=>(
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                <span className="text-xs font-bold text-slate-400 block mb-3">Line {line.lineNo}</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 md:col-span-1"><label className="block text-xs font-medium text-slate-500 mb-1">Item *</label><input type="text" required value={line.item} onChange={e=>changeL(idx,'item',e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"/></div>
                  <div className="col-span-2 md:col-span-1"><label className="block text-xs font-medium text-slate-500 mb-1">Description</label><input type="text" value={line.description} onChange={e=>changeL(idx,'description',e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"/></div>
                  <div><label className="block text-xs font-medium text-slate-500 mb-1">Qty</label><input type="number" min={1} value={line.quantity} onChange={e=>changeL(idx,'quantity',parseFloat(e.target.value)||0)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"/></div>
                  <div><label className="block text-xs font-medium text-slate-500 mb-1">Unit Price</label><input type="number" min={0.01} step={0.01} value={line.unitPrice} onChange={e=>changeL(idx,'unitPrice',parseFloat(e.target.value)||0)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"/></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 ml-auto">{fmt(line.quantity*line.unitPrice,editData.currency)}</span>
                </div>
                {editLines.length>1&&<button type="button" onClick={()=>setEditLines(editLines.filter((_,i)=>i!==idx).map((l,i)=>({...l,lineNo:i+1})))} className="absolute -right-2 -top-2 bg-white text-slate-400 hover:text-red-500 border border-slate-200 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:border-red-200"><Trash2 className="h-3.5 w-3.5"/></button>}
              </div>
            ))}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <div className="bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 flex items-center gap-6">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Order Value</span>
                <span className="text-xl font-bold text-emerald-700">{fmt(calcTotal(editLines),editData.currency)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmSave&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Update</h3>
            <p className="text-sm text-slate-500">Save changes to this Purchase Order?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={()=>setConfirmSave(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-70">{saving?'Saving...':'Yes, Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PODetailPage;
