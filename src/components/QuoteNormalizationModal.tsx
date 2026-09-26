import React, { useState } from 'react';
import { Quote, Shipment, Forwarder, QuoteComponent, ComponentCategory, RateUnit, Currency, Incoterm, ServiceType } from '../types';
import { calculateComponentAmountUSD, formatUSD } from '../utils/calculations';
import { X, Plus, Trash2, Calculator, Check, AlertCircle, FileText } from 'lucide-react';

interface QuoteNormalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment;
  forwarders: Forwarder[];
  quoteToEdit?: Quote | null;
  onSaveQuote: (quote: Quote) => void;
}

export const QuoteNormalizationModal: React.FC<QuoteNormalizationModalProps> = ({
  isOpen,
  onClose,
  shipment,
  forwarders,
  quoteToEdit,
  onSaveQuote,
}) => {
  const [forwarderId, setForwarderId] = useState<string>(
    quoteToEdit?.forwarder_id || forwarders[0]?.forwarder_id || '',
  );
  const [quoteReference, setQuoteReference] = useState<string>(
    quoteToEdit?.quote_reference || `Q-${shipment.shipment_id.replace('SHP-', '')}-${Date.now().toString().slice(-4)}`,
  );
  const [incoterm, setIncoterm] = useState<Incoterm>(quoteToEdit?.incoterm || 'FOB');
  const [serviceType, setServiceType] = useState<ServiceType>(quoteToEdit?.service_type || 'Ocean LCL');
  const [transitDays, setTransitDays] = useState<number>(quoteToEdit?.transit_days || 24);
  const [freeTimeDays, setFreeTimeDays] = useState<number>(quoteToEdit?.free_time_days || 14);
  const [validUntil, setValidUntil] = useState<string>(
    quoteToEdit?.valid_until || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
  );
  const [currency, setCurrency] = useState<Currency>(quoteToEdit?.currency || 'USD');
  const [fxRate, setFxRate] = useState<number>(quoteToEdit?.fx_rate_to_usd || 7.18);
  const [serviceAssumptions, setServiceAssumptions] = useState<string>(
    quoteToEdit?.service_assumptions ||
      'FOB origin port CFS to destination warehouse. Standard demurrage 14 days free time.',
  );

  // Initialize components
  const [components, setComponents] = useState<QuoteComponent[]>(
    quoteToEdit?.components || [
      {
        component_id: `QC-base-${Date.now()}`,
        quote_id: quoteToEdit?.quote_id || '',
        category: 'freight',
        description: 'Base Ocean Freight',
        unit: 'per_cbm',
        quantity: shipment.CBM,
        unit_rate: 110,
        currency: 'USD',
        amount_usd: Number((shipment.CBM * 110).toFixed(2)),
        is_included_in_quote: true,
      },
      {
        component_id: `QC-dest-${Date.now()}`,
        quote_id: quoteToEdit?.quote_id || '',
        category: 'destination',
        description: 'Inland Drayage & Delivery to Door',
        unit: 'flat',
        quantity: 1,
        unit_rate: 750,
        currency: 'USD',
        amount_usd: 750,
        is_included_in_quote: true,
      },
      {
        component_id: `QC-cust-${Date.now()}`,
        quote_id: quoteToEdit?.quote_id || '',
        category: 'customs',
        description: 'Customs Clearance & ISF Entry',
        unit: 'flat',
        quantity: 1,
        unit_rate: 140,
        currency: 'USD',
        amount_usd: 140,
        is_included_in_quote: true,
      },
    ],
  );

  if (!isOpen) return null;

  const handleAddComponent = () => {
    const newComp: QuoteComponent = {
      component_id: `QC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quote_id: quoteToEdit?.quote_id || '',
      category: 'surcharge',
      description: 'Port Handling / Fuel Surcharge',
      unit: 'flat',
      quantity: 1,
      unit_rate: 100,
      currency: currency,
      amount_usd: 100,
      is_included_in_quote: true,
    };
    setComponents([...components, newComp]);
  };

  const handleUpdateComponent = (index: number, updates: Partial<QuoteComponent>) => {
    const updated = [...components];
    const current = { ...updated[index], ...updates };

    // Auto-calculate normalized USD amount based on unit & shipment dimensions
    let calcQty = current.quantity;
    if (current.unit === 'per_cbm') calcQty = shipment.CBM;
    else if (current.unit === 'per_kg') calcQty = shipment.gross_weight_kg;
    else if (current.unit === 'per_carton') calcQty = shipment.cartons;
    else if (current.unit === 'per_pallet') calcQty = shipment.pallets;

    current.quantity = calcQty;
    const rawVal = calcQty * (Number(current.unit_rate) || 0);
    current.amount_usd =
      current.currency === 'CNY'
        ? Number((rawVal / (fxRate || 7.18)).toFixed(2))
        : Number(rawVal.toFixed(2));

    updated[index] = current;
    setComponents(updated);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Compute live normalized total
  const normalizedTotalUSD = components.reduce((sum, c) => {
    return c.is_included_in_quote ? sum + (c.amount_usd || 0) : sum;
  }, 0);

  const costPerUnit = shipment.units > 0 ? (normalizedTotalUSD / shipment.units).toFixed(3) : '0';
  const costPerCBM = shipment.CBM > 0 ? (normalizedTotalUSD / shipment.CBM).toFixed(2) : '0';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuoteId = quoteToEdit?.quote_id || `Q-${shipment.shipment_id.replace('SHP-', '')}-${forwarderId.replace('FWD-', '')}-${Date.now().toString().slice(-3)}`;

    const normalizedComponents = components.map((c) => ({
      ...c,
      quote_id: finalQuoteId,
    }));

    const newQuote: Quote = {
      quote_id: finalQuoteId,
      forwarder_id: forwarderId,
      shipment_id: shipment.shipment_id,
      quote_reference: quoteReference,
      origin: shipment.origin,
      destination: shipment.destination,
      quote_date: quoteToEdit?.quote_date || new Date().toISOString().split('T')[0],
      valid_until: validUntil,
      currency: currency,
      fx_rate_to_usd: fxRate,
      incoterm: incoterm,
      service_type: serviceType,
      transit_days: Number(transitDays) || 20,
      free_time_days: Number(freeTimeDays) || 14,
      service_assumptions: serviceAssumptions,
      components: normalizedComponents,
      status: 'active',
    };

    onSaveQuote(newQuote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-4xl w-full p-6 text-neutral-100 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {quoteToEdit ? 'Edit Forwarder Quote' : 'Enter & Normalize Forwarder Quote'}
              </h3>
              <p className="text-xs text-neutral-400">
                Shipment {shipment.shipment_id} · {shipment.CBM.toFixed(1)} CBM · {shipment.gross_weight_kg} kg · {shipment.units} units
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Forwarder & Route Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Forwarder Partner</label>
              <select
                value={forwarderId}
                onChange={(e) => setForwarderId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                required
              >
                {forwarders.map((f) => (
                  <option key={f.forwarder_id} value={f.forwarder_id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Quote Reference #</label>
              <input
                type="text"
                value={quoteReference}
                onChange={(e) => setQuoteReference(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Ocean LCL">Ocean LCL</option>
                <option value="Ocean FCL 20ft">Ocean FCL 20ft</option>
                <option value="Ocean FCL 40HQ">Ocean FCL 40HQ</option>
                <option value="Air Freight Standard">Air Freight Standard</option>
                <option value="Air Freight Express">Air Freight Express</option>
                <option value="Expedited Ocean (Matson/ZIM)">Expedited Ocean</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Incoterm</label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              >
                <option value="FOB">FOB (Origin Port)</option>
                <option value="EXW">EXW (Factory Door)</option>
                <option value="DAP">DAP (Delivered at Place)</option>
                <option value="DDP">DDP (Delivered Duty Paid)</option>
                <option value="CIF">CIF (Port of Discharge)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Transit, Validity & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Transit Time (Days)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={transitDays}
                onChange={(e) => setTransitDays(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Free Time at Port (Days)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={freeTimeDays}
                onChange={(e) => setFreeTimeDays(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Quote Valid Until</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Quote Currency</label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-1/2 bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="USD">USD ($)</option>
                  <option value="CNY">CNY (¥)</option>
                </select>
                {currency === 'CNY' && (
                  <input
                    type="number"
                    step="0.01"
                    title="USD to CNY FX Rate"
                    value={fxRate}
                    onChange={(e) => setFxRate(Number(e.target.value))}
                    className="w-1/2 bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                    placeholder="FX (7.18)"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Itemized Quote Components & Unit Normalization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">Itemized Quote Components</h4>
                <p className="text-[11px] text-neutral-400">
                  Normalize rates quoted in $/CBM, $/KG, lump-sum flat, or per-carton into standardized total landed cost.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddComponent}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-neutral-950 border border-neutral-700 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Charge Line</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {components.map((comp, idx) => (
                <div
                  key={comp.component_id}
                  className="p-3 bg-neutral-950/80 border border-neutral-800 rounded grid grid-cols-12 gap-2 items-center text-xs"
                >
                  {/* Category */}
                  <div className="col-span-12 sm:col-span-2">
                    <select
                      value={comp.category}
                      onChange={(e) =>
                        handleUpdateComponent(idx, { category: e.target.value as ComponentCategory })
                      }
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    >
                      <option value="freight">Freight</option>
                      <option value="origin">Origin</option>
                      <option value="destination">Destination</option>
                      <option value="customs">Customs</option>
                      <option value="handling">Handling</option>
                      <option value="surcharge">Surcharge</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      value={comp.description}
                      onChange={(e) => handleUpdateComponent(idx, { description: e.target.value })}
                      placeholder="Description"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    />
                  </div>

                  {/* Unit */}
                  <div className="col-span-6 sm:col-span-2">
                    <select
                      value={comp.unit}
                      onChange={(e) =>
                        handleUpdateComponent(idx, { unit: e.target.value as RateUnit })
                      }
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none"
                    >
                      <option value="flat">Flat ($)</option>
                      <option value="per_cbm">Per CBM</option>
                      <option value="per_kg">Per KG</option>
                      <option value="per_carton">Per Carton</option>
                      <option value="per_pallet">Per Pallet</option>
                      <option value="per_container">Per Container</option>
                    </select>
                  </div>

                  {/* Unit Rate */}
                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={comp.unit_rate}
                      onChange={(e) =>
                        handleUpdateComponent(idx, { unit_rate: Number(e.target.value) })
                      }
                      placeholder="Rate"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-neutral-200 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Normalized USD Total & Excluded Toggle */}
                  <div className="col-span-10 sm:col-span-1 flex items-center justify-end font-mono font-medium text-neutral-100 tabular-nums">
                    {formatUSD(comp.amount_usd)}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateComponent(idx, {
                          is_included_in_quote: !comp.is_included_in_quote,
                        })
                      }
                      title={comp.is_included_in_quote ? 'Included in quote' : 'Excluded from quote (Warning flag)'}
                      className={`p-1 rounded cursor-pointer ${
                        comp.is_included_in_quote
                          ? 'text-emerald-400 hover:bg-neutral-800'
                          : 'text-neutral-500 hover:bg-neutral-800 line-through'
                      }`}
                    >
                      {comp.is_included_in_quote ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(idx)}
                      className="p-1 text-neutral-500 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Service Assumptions & Exclusions */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Service Assumptions & Inclusions / Exclusions
            </label>
            <textarea
              rows={2}
              value={serviceAssumptions}
              onChange={(e) => setServiceAssumptions(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
              placeholder="e.g. Free time 14 days; chassis split fee included; direct BNSF rail line to Chicago..."
            />
          </div>

          {/* Live Normalized Cost Bar */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider">
                Normalized Total Landed Logistics Cost
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {formatUSD(normalizedTotalUSD)}
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono tabular-nums">
              <div>
                <span className="text-neutral-400 block">Per Unit:</span>
                <span className="text-neutral-100 font-bold">${costPerUnit}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Per CBM:</span>
                <span className="text-neutral-100 font-bold">${costPerCBM}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Transit:</span>
                <span className="text-neutral-100 font-bold">{transitDays} days</span>
              </div>
            </div>
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
              Save Normalized Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
