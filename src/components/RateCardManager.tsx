import React, { useState } from 'react';
import { RateCard, Forwarder, RateUnit, Currency, DataSource } from '../types';
import { formatUSD } from '../utils/calculations';
import { DataSourceBadge } from './DataSourceBadge';
import { CreditCard, AlertTriangle, CheckCircle2, Clock, Plus, Search, Filter } from 'lucide-react';

interface RateCardManagerProps {
  rateCards: RateCard[];
  forwarders: Forwarder[];
  onAddRateCard: (card: RateCard) => void;
  onDeleteRateCard: (cardId: string) => void;
}

export const RateCardManager: React.FC<RateCardManagerProps> = ({
  rateCards,
  forwarders,
  onAddRateCard,
  onDeleteRateCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | DataSource>('ALL');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [dataSource, setDataSource] = useState<DataSource>('HA data');
  const [forwarderId, setForwarderId] = useState(forwarders[0]?.forwarder_id || '');
  const [routeName, setRouteName] = useState('Shenzhen (Yantian) to Long Beach CFS');
  const [serviceType, setServiceType] = useState('Ocean LCL');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rate, setRate] = useState<number>(118);
  const [unit, setUnit] = useState<RateUnit>('per_cbm');
  const [minCharge, setMinCharge] = useState<number>(236);
  const [surchargesNote, setSurchargesNote] = useState('DTHC $28/cbm, Doc fee $65, CFS $80');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState(
    new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('Standard contracted tier for Hungry Artisan.');

  const now = new Date();

  const getStatus = (card: RateCard) => {
    const exp = new Date(card.expiration_date);
    if (exp < now) {
      return { label: 'Expired', color: 'text-rose-400 bg-rose-950/40 border-rose-800' };
    }
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (daysLeft <= 14) {
      return {
        label: `Expiring in ${daysLeft}d`,
        color: 'text-amber-400 bg-amber-950/40 border-amber-800',
      };
    }
    return { label: 'Active', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
  };

  const filtered = rateCards.filter((c) => {
    if (sourceFilter !== 'ALL') {
      if ((c.data_source || '') !== sourceFilter) return false;
    }
    const fwd = forwarders.find((f) => f.forwarder_id === c.forwarder_id);
    const text = `${c.route_name} ${fwd?.name} ${c.notes} ${c.service_type}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: RateCard = {
      card_id: `RC-${Date.now().toString().slice(-5)}`,
      data_source: dataSource,
      forwarder_id: forwarderId,
      route_name: routeName,
      service_type: serviceType,
      currency,
      rate: Number(rate),
      unit,
      minimum_charge: Number(minCharge),
      surcharges_note: surchargesNote,
      effective_date: effectiveDate,
      expiration_date: expirationDate,
      notes,
    };
    onAddRateCard(newCard);
    setIsAdding(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Forwarder Contract Rate Cards</h2>
          <p className="text-xs text-neutral-400">
            Maintain active lane rate cards with contracted minimums and validity windows. Expired cards cannot be used for new quotes.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Rate Card</span>
        </button>
      </div>

      {/* Operational Notice: Expiration Governance */}
      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg flex items-start gap-3 text-xs text-neutral-300">
        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-100">Rate Card Rule (Section 10):</strong> Expired forwarder rates should never silently be applied to active quoting scenarios. When a card expires, the system triggers validation exceptions requiring re-negotiation.
        </div>
      </div>

      {/* Search & Provenance Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter rate cards by route or forwarder..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-500">Filter Provenance:</span>
          {(['ALL', 'HA data', 'demo data'] as const).map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setSourceFilter(filterVal)}
              className={`text-[11px] px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                sourceFilter === filterVal
                  ? 'bg-neutral-800 text-neutral-100 border-neutral-700 font-semibold'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border-neutral-800'
              }`}
            >
              {filterVal === 'ALL' ? 'All Cards' : filterVal}
            </button>
          ))}
        </div>
      </div>

      {/* Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((card) => {
          const fwd = forwarders.find((f) => f.forwarder_id === card.forwarder_id);
          const status = getStatus(card);

          return (
            <div
              key={card.card_id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">{card.card_id}</span>
                    <DataSourceBadge source={card.data_source} size="xs" />
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="font-bold text-sm text-white mb-1">{fwd?.name}</div>
                <div className="text-xs text-neutral-300 font-medium mb-3">{card.route_name}</div>

                <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded space-y-2 mb-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-neutral-400">Baseline Rate:</span>
                    <span className="font-mono font-bold text-lg text-amber-400 tabular-nums">
                      ${card.rate.toFixed(2)}
                      <span className="text-xs font-normal text-neutral-400 ml-1">
                        / {card.unit.replace('per_', '').toUpperCase()}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
                    <span>Minimum Charge:</span>
                    <span className="text-neutral-200">${card.minimum_charge.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-xs text-neutral-400 space-y-1">
                  <div>
                    <span className="text-neutral-500">Service:</span> {card.service_type}
                  </div>
                  {card.surcharges_note ? (
                    <div>
                      <span className="text-neutral-500">Surcharges:</span>{' '}
                      <span className="text-neutral-300">{card.surcharges_note}</span>
                    </div>
                  ) : null}
                  {card.notes && (
                    <div className="italic text-neutral-400 pt-1">"{card.notes}"</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <div>
                  Valid: {card.effective_date} → {card.expiration_date}
                </div>
                <button
                  onClick={() => onDeleteRateCard(card.card_id)}
                  className="text-neutral-500 hover:text-rose-400 font-sans cursor-pointer text-[11px]"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rate Card Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-lg w-full p-6 text-neutral-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white text-sm">Add Contracted Rate Card</h3>
              <button onClick={() => setIsAdding(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Data Origin / Provenance</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="rateOrigin"
                      checked={dataSource === 'HA data'}
                      onChange={() => setDataSource('HA data')}
                      className="accent-amber-400"
                    />
                    <span>HA data (Hungry Artisan Verified)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="rateOrigin"
                      checked={dataSource === 'demo data'}
                      onChange={() => setDataSource('demo data')}
                      className="accent-amber-400"
                    />
                    <span>Demo data (Demonstration)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Forwarder</label>
                <select
                  value={forwarderId}
                  onChange={(e) => setForwarderId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                >
                  {forwarders.map((f) => (
                    <option key={f.forwarder_id} value={f.forwarder_id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Route Name</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                  >
                    <option value="per_cbm">Per CBM</option>
                    <option value="per_kg">Per KG</option>
                    <option value="flat">Flat</option>
                    <option value="per_container">Per Container</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Minimum ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minCharge}
                    onChange={(e) => setMinCharge(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Effective Date</label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Expiration Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Surcharges & Accessorials</label>
                <input
                  type="text"
                  value={surchargesNote}
                  onChange={(e) => setSurchargesNote(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save Rate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
