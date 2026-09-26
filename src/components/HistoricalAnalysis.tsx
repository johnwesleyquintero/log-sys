import React, { useState } from 'react';
import { HistoricalShipment, Forwarder, DataSource } from '../types';
import { formatUSD } from '../utils/calculations';
import { DataSourceBadge } from './DataSourceBadge';
import { TrendingUp, AlertTriangle, CheckCircle2, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, Clock, FileSpreadsheet } from 'lucide-react';

interface HistoricalAnalysisProps {
  historicalShipments: HistoricalShipment[];
  forwarders: Forwarder[];
  onAddActualRecord: (record: HistoricalShipment) => void;
}

export const HistoricalAnalysis: React.FC<HistoricalAnalysisProps> = ({
  historicalShipments,
  forwarders,
  onAddActualRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [forwarderFilter, setForwarderFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | DataSource>('ALL');
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  // New record form state
  const [dataSource, setDataSource] = useState<DataSource>('HA data');
  const [newPo, setNewPo] = useState('HA-PO-8812');
  const [newSku, setNewSku] = useState('HA-CIS-01');
  const [newProductName, setNewProductName] = useState('Artisan Cast Iron Skillet Set');
  const [newForwarderId, setNewForwarderId] = useState(forwarders[0]?.forwarder_id || '');
  const [newRoute, setNewRoute] = useState('Shenzhen (Yantian) -> ONT8 Amazon FBA');
  const [newQuotedCost, setNewQuotedCost] = useState(4600);
  const [newActualCost, setNewActualCost] = useState(4980);
  const [newQuotedTransit, setNewQuotedTransit] = useState(22);
  const [newActualTransit, setNewActualTransit] = useState(25);
  const [newUnits, setNewUnits] = useState(3000);
  const [newCbm, setNewCbm] = useState(21.0);
  const [newReason, setNewReason] = useState('Weekend terminal gate fee and chassis rental surcharge.');

  const filtered = historicalShipments.filter((h) => {
    if (sourceFilter !== 'ALL') {
      if ((h.data_source || '') !== sourceFilter) return false;
    }
    const matchesSearch =
      h.PO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.forwarder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesForwarder = forwarderFilter === 'ALL' || h.forwarder_id === forwarderFilter;
    return matchesSearch && matchesForwarder;
  });

  // Aggregate metrics
  const totalQuoted = filtered.reduce((s, h) => s + h.quoted_cost, 0);
  const totalActual = filtered.reduce((s, h) => s + h.actual_cost, 0);
  const totalVariance = totalActual - totalQuoted;
  const netVariancePct = totalQuoted > 0 ? (totalVariance / totalQuoted) * 100 : 0;
  const avgTransitVariance =
    filtered.length > 0
      ? filtered.reduce((s, h) => s + (h.actual_transit_days - h.quoted_transit_days), 0) /
        filtered.length
      : 0;

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const fwd = forwarders.find((f) => f.forwarder_id === newForwarderId);
    const varianceAmt = Number((newActualCost - newQuotedCost).toFixed(2));
    const variancePct = newQuotedCost > 0 ? Number(((varianceAmt / newQuotedCost) * 100).toFixed(2)) : 0;

    const record: HistoricalShipment = {
      history_id: `HIST-${Date.now().toString().slice(-4)}`,
      data_source: dataSource,
      shipment_id: `SHP-${newPo.replace('HA-PO-', '')}`,
      PO: newPo,
      SKU: newSku,
      product_name: newProductName,
      forwarder_id: newForwarderId,
      forwarder_name: fwd?.name || 'Partner',
      route: newRoute,
      service_type: 'Ocean LCL',
      completed_date: new Date().toISOString().split('T')[0],
      units: Number(newUnits),
      CBM: Number(newCbm),
      gross_weight_kg: Number(newCbm) * 350,
      quoted_cost: Number(newQuotedCost),
      actual_cost: Number(newActualCost),
      variance_amount: varianceAmt,
      variance_pct: variancePct,
      quoted_transit_days: Number(newQuotedTransit),
      actual_transit_days: Number(newActualTransit),
      variance_reason: newReason,
    };

    onAddActualRecord(record);
    setIsAddingRecord(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Historical Rate & Cost Variance Audit</h2>
          <p className="text-xs text-neutral-400">
            Audit actual invoiced freight costs against original quotes. Creates empirical evidence for negotiations and routing decisions.
          </p>
        </div>
        <button
          onClick={() => setIsAddingRecord(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Completed Actuals</span>
        </button>
      </div>

      {/* KPI Cards: Variance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1">Total Quoted Budget</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatUSD(totalQuoted)}
          </div>
          <div className="mt-2 text-xs text-neutral-400 font-mono">
            {filtered.length} completed shipments
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1">Total Actual Invoiced</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatUSD(totalActual)}
          </div>
          <div className="mt-2 text-xs text-neutral-400 font-mono">
            Final landed cost post-accessorials
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1">Cumulative Cost Variance</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums flex items-baseline gap-1 ${
              totalVariance > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {totalVariance > 0 ? '+' : ''}
            {formatUSD(totalVariance)}
            <span className="text-xs font-medium">
              ({totalVariance > 0 ? '+' : ''}
              {netVariancePct.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            {totalVariance > 0 ? 'Cost inflation / pass-through' : 'Within quoted budget'}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1">Avg Transit Schedule Delay</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              avgTransitVariance > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {avgTransitVariance > 0 ? `+${avgTransitVariance.toFixed(1)}d` : `${avgTransitVariance.toFixed(1)}d`}
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            Actual delivery vs initial forwarder quote
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO, SKU, Forwarder, Route..."
            className="w-full bg-neutral-950 border border-neutral-700 rounded pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto text-xs w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Origin:</span>
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
                {filterVal === 'ALL' ? 'All Records' : filterVal}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 font-medium">Forwarder:</span>
            <select
              value={forwarderFilter}
              onChange={(e) => setForwarderFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Forwarders</option>
              {forwarders.map((f) => (
                <option key={f.forwarder_id} value={f.forwarder_id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Historical Shipments Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Shipment & PO</th>
                <th className="py-3 px-4">Forwarder & Route</th>
                <th className="py-3 px-4 text-right">Volume</th>
                <th className="py-3 px-4 text-right">Quoted Cost</th>
                <th className="py-3 px-4 text-right">Actual Cost</th>
                <th className="py-3 px-4 text-right">Variance ($ / %)</th>
                <th className="py-3 px-4 text-right">Transit Days</th>
                <th className="py-3 px-4">Variance Root Cause Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-mono tabular-nums">
              {filtered.map((item) => {
                const isOverBudget = item.variance_amount > 0;
                const isExact = item.variance_amount === 0;

                return (
                  <tr key={item.history_id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-100">{item.PO}</span>
                        <DataSourceBadge source={item.data_source} size="xs" />
                      </div>
                      <div className="text-[11px] text-neutral-400 font-sans">
                        {item.SKU} · {item.completed_date}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-neutral-200">{item.forwarder_name}</div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-xs">{item.route}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-neutral-200">{item.CBM} CBM</div>
                      <div className="text-[11px] text-neutral-400">{item.units.toLocaleString()} units</div>
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-300">
                      {formatUSD(item.quoted_cost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-100">
                      {formatUSD(item.actual_cost)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div
                        className={`font-bold flex items-center justify-end gap-1 ${
                          isOverBudget ? 'text-rose-400' : isExact ? 'text-neutral-400' : 'text-emerald-400'
                        }`}
                      >
                        {isOverBudget ? <ArrowUpRight className="w-3.5 h-3.5" /> : !isExact ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                        <span>
                          {isOverBudget ? '+' : ''}
                          {formatUSD(item.variance_amount)}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {item.variance_pct > 0 ? `+${item.variance_pct}%` : `${item.variance_pct}%`}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="text-neutral-200 font-semibold">{item.actual_transit_days}d</div>
                      <div className="text-[11px] text-neutral-400">
                        quoted: {item.quoted_transit_days}d ({item.actual_transit_days - item.quoted_transit_days > 0 ? `+${item.actual_transit_days - item.quoted_transit_days}d` : `${item.actual_transit_days - item.quoted_transit_days}d`})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans text-xs text-neutral-300 max-w-xs">
                      <div className="line-clamp-2" title={item.variance_reason}>
                        {item.variance_reason || '—'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Actuals Modal */}
      {isAddingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-xl w-full p-6 text-neutral-100 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-white text-sm">Record Completed Shipment Actual Costs</h3>
              <button
                onClick={() => setIsAddingRecord(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Data Origin / Provenance</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="histOrigin"
                      checked={dataSource === 'HA data'}
                      onChange={() => setDataSource('HA data')}
                      className="accent-amber-400"
                    />
                    <span>HA data (Hungry Artisan Actuals)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-neutral-200 cursor-pointer">
                    <input
                      type="radio"
                      name="histOrigin"
                      checked={dataSource === 'demo data'}
                      onChange={() => setDataSource('demo data')}
                      className="accent-amber-400"
                    />
                    <span>Demo data (Demonstration)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">PO Number</label>
                  <input
                    type="text"
                    value={newPo}
                    onChange={(e) => setNewPo(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">SKU</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Forwarder</label>
                <select
                  value={newForwarderId}
                  onChange={(e) => setNewForwarderId(e.target.value)}
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
                <label className="font-semibold block mb-1 text-neutral-300">Route Corridor</label>
                <input
                  type="text"
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Quoted Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newQuotedCost}
                    onChange={(e) => setNewQuotedCost(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Actual Final Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newActualCost}
                    onChange={(e) => setNewActualCost(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Quoted Transit Days</label>
                  <input
                    type="number"
                    value={newQuotedTransit}
                    onChange={(e) => setNewQuotedTransit(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-neutral-300">Actual Transit Days</label>
                  <input
                    type="number"
                    value={newActualTransit}
                    onChange={(e) => setNewActualTransit(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-neutral-300">Variance Root Cause / Invoice Notes</label>
                <textarea
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Demurrage incurred due to port chassis congestion, additional clean truck fee..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddingRecord(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-400 text-neutral-950 rounded hover:bg-amber-300"
                >
                  Save Historical Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
