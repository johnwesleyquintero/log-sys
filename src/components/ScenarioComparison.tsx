import React, { useState } from 'react';
import { Quote, Shipment, Forwarder, CostAnalysis } from '../types';
import { analyzeQuoteCost, formatUSD } from '../utils/calculations';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  DollarSign,
  TrendingUp,
  Ship,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ScenarioComparisonProps {
  shipment: Shipment;
  quotes: Quote[];
  forwarders: Forwarder[];
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (quoteId: string) => void;
  onAddQuote: () => void;
  onSelectForApproval: (forwarderId: string, quoteId: string) => void;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  shipment,
  quotes,
  forwarders,
  onEditQuote,
  onDeleteQuote,
  onAddQuote,
  onSelectForApproval,
}) => {
  const [expandedComponents, setExpandedComponents] = useState<Record<string, boolean>>({});
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);

  // Filter quotes for current shipment
  const shipmentQuotes = quotes.filter((q) => q.shipment_id === shipment.shipment_id);

  // Compute cost analysis for all quotes
  const analyses: Record<string, CostAnalysis> = {};
  shipmentQuotes.forEach((quote) => {
    analyses[quote.quote_id] = analyzeQuoteCost(quote, shipment, shipmentQuotes);
  });

  const toggleComponents = (quoteId: string) => {
    setExpandedComponents((prev) => ({
      ...prev,
      [quoteId]: !prev[quoteId],
    }));
  };

  const getForwarder = (fwdId: string) => {
    return forwarders.find((f) => f.forwarder_id === fwdId);
  };

  // Find lowest cost quote and fastest quote for summary cards
  const validAnalyses = Object.values(analyses);
  const lowestCostAnalysis = validAnalyses.length > 0
    ? [...validAnalyses].sort((a, b) => a.total_logistics_cost - b.total_logistics_cost)[0]
    : null;
  const lowestCostQuote = lowestCostAnalysis
    ? shipmentQuotes.find((q) => q.quote_id === lowestCostAnalysis.quote_id)
    : null;

  const fastestQuote = shipmentQuotes.length > 0
    ? [...shipmentQuotes].sort((a, b) => a.transit_days - b.transit_days)[0]
    : null;

  if (shipmentQuotes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Ship className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Quotes Collected for {shipment.shipment_id}</h3>
          <p className="text-sm text-neutral-400 mb-6">
            Enter forwarder proposals for {shipment.origin} → {shipment.destination} to normalize rates, compare apples-to-apples, and calculate landed costs.
          </p>
          <button
            onClick={onAddQuote}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enter First Forwarder Quote</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Section: Operational Summary & Decision Anchors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Quotes Under Review */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1 flex items-center justify-between">
            <span>Quotes Under Review</span>
            <Layers className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {shipmentQuotes.length}{' '}
            <span className="text-xs font-normal text-neutral-400">proposals</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5">
            <span>Normalized against:</span>
            <span className="font-mono text-neutral-200">
              {shipment.CBM.toFixed(1)} CBM · {shipment.units.toLocaleString()} units
            </span>
          </div>
        </div>

        {/* Metric 2: Lowest Normalized Cost */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1 flex items-center justify-between">
            <span>Lowest Normalized Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {lowestCostAnalysis ? formatUSD(lowestCostAnalysis.total_logistics_cost) : '—'}
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5 truncate">
            <span>Lead:</span>
            <span className="font-medium text-neutral-200 truncate">
              {lowestCostQuote ? getForwarder(lowestCostQuote.forwarder_id)?.name : '—'}
            </span>
            <span>·</span>
            <span className="font-mono text-neutral-300">
              {lowestCostAnalysis ? formatUSD(lowestCostAnalysis.cost_per_unit, 3) : ''}/unit
            </span>
          </div>
        </div>

        {/* Metric 3: Transit Window */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <div className="text-xs text-neutral-400 font-medium mb-1 flex items-center justify-between">
            <span>Transit Window</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {fastestQuote ? `${fastestQuote.transit_days}d` : '—'}
            <span className="text-xs font-normal text-neutral-400 ml-2">
              (spread:{' '}
              {Math.max(...shipmentQuotes.map((q) => q.transit_days)) -
                Math.min(...shipmentQuotes.map((q) => q.transit_days))}
              d)
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1.5 truncate">
            <span>Fastest:</span>
            <span className="font-medium text-neutral-200 truncate">
              {fastestQuote ? getForwarder(fastestQuote.forwarder_id)?.name : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Side-by-Side Comparison Matrix */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Apples-to-Apples Quote Comparison</h2>
            <p className="text-xs text-neutral-400">
              All raw forwarder quotes normalized to USD total logistics landed cost. No decisions are made from headline rates alone.
            </p>
          </div>
          <button
            onClick={onAddQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Competitor Quote</span>
          </button>
        </div>

        {/* Responsive Grid of Quote Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(shipmentQuotes.length, 3)} lg:grid-cols-${Math.min(shipmentQuotes.length, 4)} gap-4`}>
          {shipmentQuotes.map((quote) => {
            const fwd = getForwarder(quote.forwarder_id);
            const analysis = analyses[quote.quote_id];
            const isExpanded = !!expandedComponents[quote.quote_id];
            const isSelectedForShipment = shipment.selected_forwarder_id === quote.forwarder_id;
            const isLowestCost = lowestCostAnalysis?.quote_id === quote.quote_id;

            return (
              <div
                key={quote.quote_id}
                className={`bg-neutral-900 border rounded-lg flex flex-col transition-all ${
                  isSelectedForShipment
                    ? 'border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                    : isLowestCost
                    ? 'border-emerald-600/70'
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Header: Forwarder & Ref */}
                <div className="p-4 border-b border-neutral-800/80 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs text-neutral-400 font-mono">
                        {quote.quote_reference || quote.quote_id}
                      </div>
                      <h3 className="font-bold text-base text-white truncate" title={fwd?.name}>
                        {fwd?.name || 'Unknown Forwarder'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditQuote(quote)}
                        title="Edit Quote & Components"
                        className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteQuote(quote.quote_id)}
                        title="Delete Quote"
                        className="p-1 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata line without pills */}
                  <div className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
                    <span>{quote.service_type}</span>
                    <span aria-hidden="true">·</span>
                    <span>{quote.incoterm}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{quote.free_time_days}d free time</span>
                  </div>
                </div>

                {/* Primary Metrics Block */}
                <div className="p-4 bg-neutral-950/40 border-b border-neutral-800/80 space-y-3">
                  <div>
                    <div className="text-xs text-neutral-400">Total Normalized Logistics Cost</div>
                    <div className="text-2xl font-bold font-mono text-white tabular-nums">
                      {formatUSD(analysis.total_logistics_cost)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/60 text-xs">
                    <div>
                      <span className="text-neutral-400 block">Cost / Unit:</span>
                      <span className="font-bold font-mono text-neutral-100 tabular-nums text-sm">
                        {formatUSD(analysis.cost_per_unit, 3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Transit Time:</span>
                      <span className="font-bold font-mono text-neutral-100 tabular-nums text-sm">
                        {quote.transit_days} days
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Cost / CBM:</span>
                      <span className="font-mono text-neutral-300 tabular-nums">
                        {formatUSD(analysis.cost_per_CBM)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Cost / KG:</span>
                      <span className="font-mono text-neutral-300 tabular-nums">
                        {formatUSD(analysis.cost_per_kg, 3)}
                      </span>
                    </div>
                  </div>

                  {/* Landed Cost Impact */}
                  <div className="pt-2 border-t border-neutral-800/60 text-xs flex items-center justify-between">
                    <span className="text-neutral-400">Landed Unit Cost:</span>
                    <span className="font-mono font-medium text-amber-400 tabular-nums">
                      {formatUSD(analysis.landed_unit_cost, 3)}{' '}
                      <span className="text-neutral-400 text-[11px]">
                        (+{analysis.landed_cost_impact_pct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Decision Flags & Exceptions */}
                <div className="p-4 border-b border-neutral-800/80 space-y-2 flex-1">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Audit & Exception Flags
                  </div>
                  {analysis.flags.length === 0 ? (
                    <div className="text-xs text-neutral-400 italic">No exceptions detected.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {analysis.flags.map((flag) => {
                        let icon = <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
                        let colorClass = 'text-neutral-300';
                        if (flag.severity === 'success') {
                          icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
                          colorClass = 'text-emerald-300';
                        } else if (flag.severity === 'warning') {
                          icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
                          colorClass = 'text-amber-300';
                        } else if (flag.severity === 'error') {
                          icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
                          colorClass = 'text-rose-300';
                        }

                        return (
                          <div
                            key={flag.id}
                            className="flex items-start gap-1.5 text-xs leading-snug"
                          >
                            <span className="mt-0.5">{icon}</span>
                            <span className={colorClass}>{flag.message}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Validity and Terms */}
                  <div className="pt-2 border-t border-neutral-800/50 text-[11px] text-neutral-400 space-y-1">
                    <div className="flex items-center justify-between font-mono">
                      <span>Valid until:</span>
                      <span className="text-neutral-300">{quote.valid_until}</span>
                    </div>
                    {fwd?.payment_terms && (
                      <div className="flex items-center justify-between">
                        <span>Terms:</span>
                        <span className="text-neutral-300 truncate max-w-[140px] text-right" title={fwd.payment_terms}>
                          {fwd.payment_terms}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Assumptions & Exclusions */}
                <div className="px-4 py-3 bg-neutral-950/20 border-b border-neutral-800/80 text-xs">
                  <div className="text-neutral-400 font-medium mb-1">Service Assumptions:</div>
                  <div className="text-neutral-300 text-[11px] leading-relaxed line-clamp-3" title={quote.service_assumptions}>
                    {quote.service_assumptions || 'Standard port-to-door terms.'}
                  </div>
                </div>

                {/* Collapsible Itemized Cost Components */}
                <div className="border-b border-neutral-800/80">
                  <button
                    onClick={() => toggleComponents(quote.quote_id)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 transition-colors cursor-pointer"
                  >
                    <span>Itemized Cost Breakdown ({quote.components.length})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 py-3 bg-neutral-950/60 border-t border-neutral-800/60 space-y-2 text-xs">
                      {quote.components.map((comp) => (
                        <div
                          key={comp.component_id}
                          className={`flex items-start justify-between gap-2 py-1 border-b border-neutral-800/40 last:border-0 ${
                            !comp.is_included_in_quote ? 'opacity-60 line-through' : ''
                          }`}
                        >
                          <div className="truncate">
                            <div className="text-neutral-200 font-medium truncate" title={comp.description}>
                              {comp.description}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {comp.category} · {comp.unit === 'per_cbm' ? `${comp.quantity} CBM @ $${comp.unit_rate}` : comp.unit === 'per_kg' ? `${comp.quantity} kg @ $${comp.unit_rate}` : comp.unit === 'per_pallet' ? `${comp.quantity} plts @ $${comp.unit_rate}` : comp.unit}
                              {!comp.is_included_in_quote && ' (EXCLUDED)'}
                            </div>
                          </div>
                          <div className="font-mono text-neutral-100 tabular-nums shrink-0 font-medium">
                            {formatUSD(comp.amount_usd)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Footer: Recommend for Hungry Artisan Approval */}
                <div className="p-3 bg-neutral-950/60">
                  <button
                    onClick={() => onSelectForApproval(quote.forwarder_id, quote.quote_id)}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelectedForShipment
                        ? 'bg-amber-400 text-neutral-950 hover:bg-amber-300'
                        : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {isSelectedForShipment ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Recommended Choice</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Select for Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Category Breakdown Table (Apples-to-Apples Normalization) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-sm">Normalized Component Matrix</h3>
            <p className="text-xs text-neutral-400">
              Categorized subtotal breakdown across Ocean Freight, Origin, Destination, Customs, Handling, and Surcharges.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider text-[11px] border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Cost Component Category</th>
                {shipmentQuotes.map((q) => (
                  <th key={q.quote_id} className="py-3 px-4 text-right">
                    {getForwarder(q.forwarder_id)?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-mono tabular-nums">
              <tr>
                <td className="py-2.5 px-4 font-sans text-neutral-300 font-medium">1. Ocean / Air Freight</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2.5 px-4 text-right text-neutral-100">
                    {formatUSD(analyses[q.quote_id].freight_cost)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans text-neutral-300 font-medium">2. Origin Charges (CFS, Export Doc, Wharfage)</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2.5 px-4 text-right text-neutral-100">
                    {formatUSD(analyses[q.quote_id].origin_cost)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans text-neutral-300 font-medium">3. Destination Charges (DTHC, Drayage to Door)</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2.5 px-4 text-right text-neutral-100">
                    {formatUSD(analyses[q.quote_id].destination_cost)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans text-neutral-300 font-medium">4. US Customs & ISF Filing</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2.5 px-4 text-right text-neutral-100">
                    {formatUSD(analyses[q.quote_id].customs_cost)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-sans text-neutral-300 font-medium">5. Fuel & Port Surcharges (PierPass / Clean Truck)</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2.5 px-4 text-right text-neutral-100">
                    {formatUSD(analyses[q.quote_id].surcharges_cost)}
                  </td>
                ))}
              </tr>
              <tr className="bg-neutral-950/80 font-bold border-t-2 border-neutral-700">
                <td className="py-3 px-4 font-sans text-white text-sm">Total Landed Logistics Cost</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-3 px-4 text-right text-amber-400 text-sm">
                    {formatUSD(analyses[q.quote_id].total_logistics_cost)}
                  </td>
                ))}
              </tr>
              <tr className="bg-neutral-950/40 text-neutral-400">
                <td className="py-2 px-4 font-sans text-[11px]">Normalized Unit Cost ({shipment.units} units)</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2 px-4 text-right text-neutral-200">
                    {formatUSD(analyses[q.quote_id].cost_per_unit, 3)}
                  </td>
                ))}
              </tr>
              <tr className="bg-neutral-950/40 text-neutral-400">
                <td className="py-2 px-4 font-sans text-[11px]">Normalized CBM Cost ({shipment.CBM.toFixed(1)} CBM)</td>
                {shipmentQuotes.map((q) => (
                  <td key={q.quote_id} className="py-2 px-4 text-right text-neutral-200">
                    {formatUSD(analyses[q.quote_id].cost_per_CBM)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
