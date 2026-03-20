import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, FileText, ShoppingCart, Clock, AlertTriangle, User } from 'lucide-react';

interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  requestedBy: string;
  approvedBy: string;
  rejectReason: string;
  createdAt: string;
  actionedAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string,string> = {
    APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  };
  return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${m[status]||'bg-slate-100 text-slate-700 border-slate-200'}`}>{status}</span>;
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-50 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest w-40 shrink-0 mb-1 sm:mb-0">{label}</span>
    <span className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-300">—</span>}</span>
  </div>
);

export const ApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const [approval, setApproval] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApproval = async () => {
      try {
        // Fetch all pending and find by id (no single GET endpoint in backend)
        const res = await api.get('/approvals/pending');
        const found = (res.data.data || []).find((a: Approval) => a.id === id);
        if (found) {
          setApproval(found);
        } else {
          setError('Approval record not found or already actioned.');
        }
      } catch { setError('Failed to load approval.'); }
      finally { setLoading(false); }
    };
    fetchApproval();
  }, [id]);

  const fmtDate = (d: string) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary-600"></div>
    </div>
  );

  if (!approval) return (
    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-3"/>
      <p className="text-slate-600 font-medium">{error || 'Approval not found.'}</p>
      <button onClick={() => navigate('/approvals')} className="mt-4 text-sm text-primary-600 hover:underline">← Back to Approvals</button>
    </div>
  );

  const isPR = approval.entityType === 'PR';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/approvals')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5"/>
        </button>
        <div>
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 flex items-center justify-center rounded-lg border ${isPR ? 'bg-primary-50 border-primary-100 text-primary-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              {isPR ? <FileText className="h-5 w-5"/> : <ShoppingCart className="h-5 w-5"/>}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Approval — {approval.entityId}</h1>
            <StatusBadge status={approval.status}/>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">Approval record · Submitted {fmtDate(approval.createdAt)}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-amber-600 shrink-0"/>
        <p className="text-sm text-amber-700 font-medium">This is a read-only view. Approve or reject from the Approvals Inbox.</p>
      </div>

      {approval.rejectReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-semibold text-red-800">Rejection Reason</p>
            <p className="text-sm text-red-600 mt-0.5">{approval.rejectReason}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Approval Details</h3>
        <div className="divide-y divide-slate-50">
          <InfoRow label="Approval ID" value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{approval.id}</span>}/>
          <InfoRow label="Entity Type" value={
            <span className={`px-2.5 py-1 text-xs font-bold rounded border ${isPR ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              {approval.entityType}
            </span>
          }/>
          <InfoRow label="Entity ID" value={
            <button
              onClick={() => navigate(isPR ? `/pr/${approval.entityId}` : `/po/${approval.entityId}`)}
              className={`flex items-center gap-1 font-medium hover:underline ${isPR ? 'text-primary-600' : 'text-emerald-600'}`}
            >
              {isPR ? <FileText className="h-3.5 w-3.5"/> : <ShoppingCart className="h-3.5 w-3.5"/>}
              {approval.entityId} ↗
            </button>
          }/>
          <InfoRow label="Status" value={<StatusBadge status={approval.status}/>}/>
          <InfoRow label="Requested By" value={<span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400"/>{approval.requestedBy}</span>}/>
          <InfoRow label="Approved By" value={approval.approvedBy ? <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400"/>{approval.approvedBy}</span> : '—'}/>
          <InfoRow label="Submitted At" value={<span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400"/>{fmtDate(approval.createdAt)}</span>}/>
          <InfoRow label="Actioned At" value={approval.actionedAt ? <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400"/>{fmtDate(approval.actionedAt)}</span> : '—'}/>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate(isPR ? `/pr/${approval.entityId}` : `/po/${approval.entityId}`)}
          className={`inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-xl text-white shadow-sm transition-colors ${isPR ? 'bg-primary-600 hover:bg-primary-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {isPR ? <FileText className="h-4 w-4 mr-2"/> : <ShoppingCart className="h-4 w-4 mr-2"/>}
          View {isPR ? 'Purchase Request' : 'Purchase Order'}
        </button>
      </div>
    </div>
  );
};

export default ApprovalDetailPage;
