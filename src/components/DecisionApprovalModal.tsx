import React, { useState } from 'react';
import { Shipment, Quote, Forwarder } from '../types';
import { analyzeQuoteCost, formatUSD } from '../utils/calculations';
import { X, ShieldCheck, UserCheck, CheckCircle2, AlertTriangle, FileText, Building2 } from 'lucide-react';

interface DecisionApprovalModalProps {
  shipment: Shipment;
  quotes: Quote[];
  forwarders: Forwarder[];
  isOpen: boolean;
  onClose: () => void;
  onSaveApproval: (payload: {
    selected_forwarder_id: string;
    approval_status: Shipment['approval_status'];
    approval_notes: string;
    approved_by: string;
  }) => void;
}

export const DecisionApprovalModal: React.FC<DecisionApprovalModalProps> = ({
  shipment,
  quotes,
  forwarders,
  isOpen,
  onClose,
  onSaveApproval,
}) => {
  const shipmentQuotes = quotes.filter((q) => q.shipment_id === shipment.shipment_id);

  const [selectedForwarderId, setSelectedForwarderId] = useState<string>(
    shipment.selected_forwarder_id || shipmentQuotes[0]?.forwarder_id || '',
  );
  const [approver, setApprover] = useState<'Justin Hopkins' | 'Wesley Quintero'>('Justin Hopkins');
  const [approvalStatus, setApprovalStatus] = useState<Shipment['approval_status']>(
    shipment.approval_status === 'not_submitted' ? 'approved' : shipment.approval_status,
  );
  const [notes, setNotes] = useState<string>(
    shipment.approval_notes ||
      `Routing approved for injection into ${shipment.primary_storage_hub}. Normalized landed cost verified.`,
  );
  const [stipulations, setStipulations] = useState<string>(
    shipment.region === 'US'
      ? 'Forwarder must confirm direct AWD receiving appointment 48 hours prior to delivery.'
      : shipment.region === 'CA'
      ? 'Proline Logistics to confirm pallet prep & labeling for Amazon YHM1 transfer.'
      : 'SSD Logistix to confirm customs clearance SAD and UK FBA delivery slot.',
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNotes = stipulations ? `${notes} [Stipulation: ${stipulations}]` : notes;
    onSaveApproval({
      selected_forwarder_id: selectedForwarderId,
      approval_status: approvalStatus,
      approval_notes: finalNotes,
      approved_by: approver,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full p-6 text-neutral-100 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Hungry Artisan Approval & Routing Sign-off</h3>
              <p className="text-xs text-neutral-400">
                Decision support sign-off for {shipment.shipment_id} ({shipment.PO}) · [{shipment.region} Region]
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Context Banner */}
        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded text-xs space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span className="text-neutral-400">Hub Target:</span>
            <span className="text-amber-400 font-semibold">{shipment.primary_storage_hub}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Downstream Fulfillment:</span>
            <span className="text-neutral-200 truncate max-w-sm">{shipment.fulfillment_channels.join(', ')}</span>
          </div>
        </div>

        {/* Warning Banner: Human Decision Authority */}
        <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded text-xs text-amber-200/90 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Operational Governance:</strong> The system acts as decision support and does not execute automatic bookings. Sign-off is held by Justin Hopkins (Founder & CEO - Inbound & China oversight) and Wesley Quintero (Logistics Operations & Freight Management).
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Forwarder Candidate Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Selected Routing Forwarder
            </label>
            <div className="grid grid-cols-1 gap-2">
              {shipmentQuotes.map((quote) => {
                const fwd = forwarders.find((f) => f.forwarder_id === quote.forwarder_id);
                const cost = analyzeQuoteCost(quote, shipment, shipmentQuotes);
                const isSelected = selectedForwarderId === quote.forwarder_id;

                return (
                  <label
                    key={quote.quote_id}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-amber-400 bg-neutral-800/80 text-white'
                        : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-800/40 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="forwarderSelection"
                        value={quote.forwarder_id}
                        checked={isSelected}
                        onChange={() => setSelectedForwarderId(quote.forwarder_id)}
                        className="text-amber-500 focus:ring-amber-500 h-4 w-4 bg-neutral-900 border-neutral-700"
                      />
                      <div>
                        <div className="font-semibold text-sm">{fwd?.name}</div>
                        <div className="text-xs text-neutral-400">
                          {quote.service_type} · {quote.transit_days} days transit · {quote.free_time_days}d free time
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-neutral-100 tabular-nums">
                        {formatUSD(cost.total_logistics_cost)}
                      </div>
                      <div className="text-xs font-mono text-neutral-400 tabular-nums">
                        {formatUSD(cost.cost_per_unit, 3)}/unit
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Approver & Sign-off State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                Authorized Executive / Lead
              </label>
              <select
                value={approver}
                onChange={(e) => setApprover(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Justin Hopkins">Justin Hopkins (Founder & CEO)</option>
                <option value="Wesley Quintero">Wesley Quintero (Logistics Operations & Freight Manager)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                Decision Action
              </label>
              <select
                value={approvalStatus}
                onChange={(e) => setApprovalStatus(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="approved">Approve Routing Selection</option>
                <option value="pending_justin">Route to Justin Hopkins for Sign-off</option>
                <option value="pending_wesley">Route to Wesley Quintero for Execution</option>
                <option value="rejected">Reject / Request Forwarder Re-quote</option>
              </select>
            </div>
          </div>

          {/* Reasoning & Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
              Wesley's Decision & Routing Rationale
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              placeholder="State key reasons (e.g. lowest landed cost, direct AWD injection, Proline 3PL readiness)..."
            />
          </div>

          {/* Stipulations / Operational Conditions */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
              Mandatory Carrier / 3PL Stipulation
            </label>
            <input
              type="text"
              value={stipulations}
              onChange={(e) => setStipulations(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              placeholder="e.g. Free time 14 days guaranteed in writing; direct BNSF rail line..."
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors cursor-pointer"
            >
              Record Human Decision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
