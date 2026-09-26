import React, { useState } from 'react';
import { Shipment, Forwarder, Quote, SupplyChainRegion, DataSource } from '../types';
import { formatUSD } from '../utils/calculations';
import { DataSourceBadge } from './DataSourceBadge';
import {
  Package,
  Plus,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Layers,
  Edit,
  Building2,
  ShoppingBag,
} from 'lucide-react';

interface ShipmentListProps {
  shipments: Shipment[];
  quotes: Quote[];
  forwarders: Forwarder[];
  activeShipmentId: string;
  onSelectShipment: (id: string) => void;
  onOpenNewShipment: () => void;
  onEditShipment: (shipment: Shipment) => void;
  onViewComparison: (shipmentId: string) => void;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({
  shipments,
  quotes,
  forwarders,
  activeShipmentId,
  onSelectShipment,
  onOpenNewShipment,
  onEditShipment,
  onViewComparison,
}) => {
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSource, setFilterSource] = useState<string>('ALL');

  const filtered = shipments.filter((s) => {
    const matchesRegion = filterRegion === 'ALL' || s.region === filterRegion;
    const matchesStatus =
      filterStatus === 'ALL' || s.approval_status === filterStatus || s.status === filterStatus;
    const matchesSource =
      filterSource === 'ALL' ||
      (filterSource === 'HA data' && s.data_source === 'HA data') ||
      (filterSource === 'demo data' && s.data_source === 'demo data');
    return matchesRegion && matchesStatus && matchesSource;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Active & Planned Shipment Requirements</h2>
          <p className="text-xs text-neutral-400">
            China factory production batches across US (AWD), Canada (Proline 3PL), and UK (SSD Logistix).
          </p>
        </div>
        <button
          onClick={onOpenNewShipment}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Shipment Requirement</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 p-2 rounded-lg border border-neutral-800 text-xs">
        {/* Region Segmented Controls */}
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 font-medium px-2">Region:</span>
          {['ALL', 'US', 'CA', 'UK'].map((reg) => (
            <button
              key={reg}
              onClick={() => setFilterRegion(reg)}
              className={`px-3 py-1.5 font-medium rounded transition-colors cursor-pointer ${
                filterRegion === reg
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {reg === 'ALL' ? 'All Regions' : reg}
            </button>
          ))}
        </div>

        {/* Provenance Filter */}
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 font-medium px-2">Data Source:</span>
          {[
            { id: 'ALL', label: 'All Data' },
            { id: 'HA data', label: 'HA data' },
            { id: 'demo data', label: 'demo data' },
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setFilterSource(src.id)}
              className={`px-2.5 py-1.5 font-medium rounded transition-colors cursor-pointer flex items-center gap-1 ${
                filterSource === src.id
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1">
          <span className="text-neutral-400 font-medium px-2">Status:</span>
          {['ALL', 'quoting', 'comparing', 'approved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 font-medium rounded transition-colors cursor-pointer capitalize ${
                filterStatus === st
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Shipments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((shipment) => {
          const shipmentQuotes = quotes.filter((q) => q.shipment_id === shipment.shipment_id);
          const selectedFwd = forwarders.find((f) => f.forwarder_id === shipment.selected_forwarder_id);
          const isActive = shipment.shipment_id === activeShipmentId;

          return (
            <div
              key={shipment.shipment_id}
              className={`bg-neutral-900 border rounded-lg p-5 flex flex-col justify-between space-y-4 transition-colors ${
                isActive
                  ? 'border-amber-400/80 shadow-md ring-1 ring-amber-400/20'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[11px] font-bold rounded bg-neutral-950 border border-neutral-700 text-amber-400 font-mono">
                      {shipment.region}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-100">
                      {shipment.shipment_id}
                    </span>
                    <DataSourceBadge source={shipment.data_source} />
                    <span className="text-neutral-500 font-mono">·</span>
                    <span className="font-mono text-xs text-neutral-400">PO: {shipment.PO}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditShipment(shipment)}
                      title="Edit Dimensions"
                      className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-neutral-700 bg-neutral-950 text-neutral-300">
                      {shipment.approval_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white mb-1" title={shipment.product_name}>
                  {shipment.product_name}
                </h3>
                <div className="text-xs text-neutral-400 font-mono mb-3">
                  SKU: {shipment.SKU} · ASIN: {shipment.ASIN} · FOB: {formatUSD(shipment.product_unit_fob_cost)}/unit
                </div>

                {/* Storage Hub & Fulfillment Channels */}
                <div className="mb-3 p-2.5 bg-neutral-950/60 border border-neutral-800 rounded text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Primary Storage Hub: {shipment.primary_storage_hub}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    Channels: {shipment.fulfillment_channels.join(', ')}
                  </div>
                </div>

                {/* Specs Box */}
                <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono tabular-nums">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Units:</span>
                    <span className="font-bold text-neutral-100">{shipment.units.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Volume:</span>
                    <span className="font-bold text-neutral-100">{shipment.CBM.toFixed(1)} CBM</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Cartons / Plt:</span>
                    <span className="text-neutral-200">{shipment.cartons} ctn / {shipment.pallets} pl</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Gross Weight:</span>
                    <span className="text-neutral-200">{shipment.gross_weight_kg.toLocaleString()} kg</span>
                  </div>
                </div>

                {/* Routing Corridor */}
                <div className="mt-3 text-xs text-neutral-300 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{shipment.origin}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500 shrink-0" />
                  <span className="truncate text-amber-400/90">{shipment.destination}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono">ETD: {shipment.target_etd}</span>
                  <span>·</span>
                  <span className="text-neutral-300 font-medium">
                    {shipmentQuotes.length} quotes collected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectShipment(shipment.shipment_id);
                      onViewComparison(shipment.shipment_id);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Compare Quotes</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
