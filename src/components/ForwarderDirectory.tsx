import React, { useState } from 'react';
import { Forwarder } from '../types';
import { Users, Mail, Phone, MapPin, Plus, CheckCircle2, XCircle, Search, Edit } from 'lucide-react';

interface ForwarderDirectoryProps {
  forwarders: Forwarder[];
  onAddForwarder: (forwarder: Forwarder) => void;
  onToggleActive: (forwarderId: string) => void;
}

export const ForwarderDirectory: React.FC<ForwarderDirectoryProps> = ({
  forwarders,
  onAddForwarder,
  onToggleActive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // New forwarder form
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [regions, setRegions] = useState('Shenzhen, Ningbo, US West Coast');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 days from Bill of Lading');
  const [notes, setNotes] = useState('');

  const filtered = forwarders.filter((f) => {
    const text = `${f.name} ${f.contact_name} ${f.contact_email} ${f.service_regions.join(' ')}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newFwd: Forwarder = {
      forwarder_id: `FWD-${Math.floor(10 + Math.random() * 90)}`,
      name,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      service_regions: regions.split(',').map((r) => r.trim()),
      active: true,
      notes,
      avg_transit_accuracy: 92,
      payment_terms: paymentTerms,
    };
    onAddForwarder(newFwd);
    setIsAdding(false);
    setName('');
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Freight Forwarder Directory</h2>
          <p className="text-xs text-neutral-400">
            Registered China freight forwarders, contact liaisons, service regions, and payment terms.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Forwarder</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search forwarders by name, lane, or contact..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Forwarders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fwd) => (
          <div
            key={fwd.forwarder_id}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-neutral-400">{fwd.forwarder_id}</span>
                <button
                  onClick={() => onToggleActive(fwd.forwarder_id)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer border ${
                    fwd.active
                      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800'
                      : 'text-neutral-500 bg-neutral-950 border-neutral-800'
                  }`}
                >
                  {fwd.active ? 'Active Partner' : 'Inactive'}
                </button>
              </div>

              <h3 className="font-bold text-base text-white mb-2">{fwd.name}</h3>

              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="font-medium text-neutral-200">{fwd.contact_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <a href={`mailto:${fwd.contact_email}`} className="text-amber-400/90 hover:underline truncate">
                    {fwd.contact_email}
                  </a>
                </div>
                {fwd.contact_phone && (
                  <div className="flex items-center gap-2 font-mono text-neutral-400">
                    <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{fwd.contact_phone}</span>
                  </div>
                )}
              </div>

              {/* Service Regions as clean unboxed text list */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80">
                <div className="text-[11px] text-neutral-400 font-medium mb-1">Service Lanes:</div>
                <div className="text-xs text-neutral-300 flex flex-wrap gap-x-2 gap-y-1">
                  {fwd.service_regions.map((region, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5">
                      {region}
                      {i < fwd.service_regions.length - 1 && <span className="text-neutral-600">·</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800/80 text-xs space-y-1 text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Payment Terms:</span>
                <span className="text-neutral-200 truncate max-w-[170px]" title={fwd.payment_terms}>
                  {fwd.payment_terms}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Schedule Accuracy:</span>
                <span className="text-emerald-400 font-medium">{fwd.avg_transit_accuracy}%</span>
              </div>
              {fwd.notes && <div className="italic text-neutral-400 text-[11px] pt-1">"{fwd.notes}"</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Forwarder Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 text-neutral-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white text-sm">Register Freight Forwarder</h3>
              <button onClick={() => setIsAdding(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Company Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Liaison Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Contact Phone / WeChat</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Service Lanes / Regions (comma separated)</label>
                <input
                  type="text"
                  value={regions}
                  onChange={(e) => setRegions(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Operational Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Strengths, demurrage flexibility, terminal contacts..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-400 text-neutral-950 rounded hover:bg-amber-300"
                >
                  Save Forwarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
