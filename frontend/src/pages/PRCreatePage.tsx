import React, { useState } from 'react';
import { api } from '../lib/api';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PRCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    requiredDate: '',
    justification: '',
    branchId: 'BR001', // Example static for now
    departmentId: 'DEPT001', // Example static for now
  });

  const [lines, setLines] = useState([
    { itemDescription: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleAddLine = () => {
    setLines([...lines, { itemDescription: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    (newLines[index] as any)[field] = value;
    setLines(newLines);
  };

  const calculateTotal = () => {
    return lines.reduce((total, line) => total + (line.quantity * line.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (lines.some(l => !l.itemDescription || l.quantity <= 0 || l.unitPrice <= 0)) {
        setError("Please fill all line items with valid positive numbers and descriptions.");
        return;
    }

    setLoading(true);
    try {
      const payload = {
          ...formData,
          requestDate: new Date().toISOString(),
          prLines: lines
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
        {/* General Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
             <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mr-3 text-sm">1</div>
             General Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Required Date *</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.requiredDate}
                onChange={(e) => setFormData({...formData, requiredDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Justification *</label>
              <input
                type="text"
                required
                placeholder="Why do you need these items?"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.justification}
                onChange={(e) => setFormData({...formData, justification: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-900 flex items-center">
               <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center mr-3 text-sm">2</div>
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
              <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 relative group transition-all hover:shadow-sm">
                <div className="flex-1">
                   <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                   <input
                    type="text"
                    required
                    placeholder="E.g. Dell XPS 15 Laptop"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={line.itemDescription}
                    onChange={(e) => handleLineChange(index, 'itemDescription', e.target.value)}
                  />
                </div>
                <div className="w-32">
                   <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Qty</label>
                   <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="w-40">
                   <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Unit Price</label>
                   <div className="relative">
                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">$</span>
                     <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                     />
                   </div>
                </div>
                <div className="w-32 flex flex-col justify-end h-[62px]">
                   <div className="text-right font-semibold text-slate-900 pb-2">
                      ${(line.quantity * line.unitPrice).toFixed(2)}
                   </div>
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
             <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex items-center justify-between min-w-[300px]">
               <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Total Estimated</span>
               <span className="text-2xl font-bold text-primary-600">
                 ${calculateTotal().toFixed(2)}
               </span>
             </div>
          </div>
        </div>

        {/* Action Panel */}
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
            className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-primary-500/30 font-bold tracking-wide"
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
