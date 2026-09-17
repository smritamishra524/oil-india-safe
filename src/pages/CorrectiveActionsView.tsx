import React, { useState } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Filter, Plus, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CorrectiveAction } from '../types';

export const CorrectiveActionsView: React.FC = () => {
  const { correctiveActions, updateActionStatus, reports, addCorrectiveAction, user } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New action form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<CorrectiveAction['priority']>('High');
  const [installation, setInstallation] = useState('Duliajan Central Field');
  const [barrierAddressed, setBarrierAddressed] = useState('Energy Isolation (LOTO)');
  const [verificationMethod, setVerificationMethod] = useState('Supervisory physical witness test and zero-pressure tag verification.');

  const filteredActions = correctiveActions.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !owner.trim()) return;

    addCorrectiveAction({
      reportId: 'OIL-MANUAL-ACT',
      title,
      description,
      owner,
      targetDate: targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority,
      status: 'OPEN',
      verificationMethod,
      barrierAddressed,
      installation
    });

    setIsCreateOpen(false);
    setTitle('');
    setDescription('');
    setOwner('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Action Center
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-slate-500">Closure & Verification</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">Corrective Actions Register</h1>
            <p className="text-xs text-slate-500">
              Track lifecycle status of SIF precursor mitigations. Every action requires formal supervisory verification before closure.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-oil-600 hover:bg-oil-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Corrective Action</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto pb-1">
        <div className="flex space-x-1 min-w-max">
          {['ALL', 'OPEN', 'ASSIGNED', 'IN PROGRESS', 'ACTION TAKEN', 'AWAITING VERIFICATION', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
                statusFilter === status
                  ? 'border-oil-600 text-oil-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {status} {status !== 'ALL' && `(${correctiveActions.filter(a => a.status === status).length})`}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline ml-4 shrink-0">
          {filteredActions.length} Actions displayed
        </span>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filteredActions.map((action) => {
          const isClosed = action.status === 'CLOSED';
          const isAwaiting = action.status === 'AWAITING VERIFICATION';
          const isActionTaken = action.status === 'ACTION TAKEN';
          const isCritical = action.priority === 'Critical';
          const linkedReport = reports.find(r => r.id === action.reportId);

          return (
            <div
              key={action.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-oil-700">{action.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-700">{action.installation}</span>
                  {linkedReport && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600 font-bold text-[10px]">
                        Linked: {linkedReport.id}
                      </span>
                      {linkedReport.preventRecurrence?.isRecurring && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Potential Recurring Precursor
                        </span>
                      )}
                    </>
                  )}
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">Target: {action.targetDate}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {action.priority} Priority
                  </span>

                  <select
                    value={action.status}
                    onChange={(e) => updateActionStatus(action.id, e.target.value as any)}
                    className={`text-xs font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${
                      isClosed ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      isAwaiting ? 'bg-purple-50 text-purple-800 border-purple-300' :
                      isActionTaken ? 'bg-cyan-50 text-cyan-800 border-cyan-300' :
                      action.status === 'IN PROGRESS' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                      action.status === 'ASSIGNED' ? 'bg-indigo-50 text-indigo-800 border-indigo-300' :
                      'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="ACTION TAKEN">ACTION TAKEN</option>
                    <option value="AWAITING VERIFICATION">AWAITING VERIFICATION</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{action.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{action.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Owner / Lead</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {action.owner}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Safety Barrier</span>
                  <span className="font-semibold text-rose-700">{action.barrierAddressed}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Verification Method</span>
                  <span className="text-slate-700 truncate block">{action.verificationMethod}</span>
                </div>
              </div>

              {action.verifiedBy && (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Formally Verified By: {action.verifiedBy}
                  </span>
                  <span className="text-[11px] font-mono">{action.verifiedAt}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">New Corrective Mitigation</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Install calibrated wireless pressure transducer"
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed engineering / procedural scope of mitigation..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Owner</label>
                  <input
                    type="text"
                    required
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. Lead Mechanical Engineer"
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Installation</label>
                  <select
                    value={installation}
                    onChange={(e) => setInstallation(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
                  >
                    <option value="Duliajan Central Field">Duliajan Central Field</option>
                    <option value="Moran Oil Field">Moran Oil Field</option>
                    <option value="Digboi Refinery Area & Fields">Digboi Refinery Area & Fields</option>
                    <option value="Jorhat Exploration Rig 4">Jorhat Exploration Rig 4</option>
                    <option value="Bagjan Wellsite Operations">Bagjan Wellsite Operations</option>
                    <option value="Rajasthan Block-RJ (Jaisalmer)">Rajasthan Block-RJ (Jaisalmer)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-oil-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-oil-600 text-white font-bold rounded-lg hover:bg-oil-700 shadow-sm"
                >
                  Create Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
