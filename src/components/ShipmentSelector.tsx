import React from 'react';
import { Shipment, Forwarder } from '../types';
import { DataSourceBadge } from './DataSourceBadge';
import {
  Package,
  Calendar,
  MapPin,
  Scale,
  Box,
  ArrowRight,
  UserCheck,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Building2,
  ShoppingBag,
} from 'lucide-react';
import { formatUSD } from '../utils/calculations';

interface ShipmentSelectorProps {
  shipments: Shipment[];
  activeShipmentId: string;
  onSelectShipment: (id: string) => void;
  onOpenNewShipment: () => void;
  onOpenApproval: () => void;
  forwarders: Forwarder[];
}

export const ShipmentSelector: React.FC<ShipmentSelectorProps> = ({
  shipments,
  activeShipmentId,
  onSelectShipment,
  onOpenNewShipment,
  onOpenApproval,
  forwarders,
}) => {
  const activeShipment = shipments.find((s) => s.shipment_id === activeShipmentId) || shipments[0];
  const selectedForwarder = forwarders.find((f) => f.forwarder_id === activeShipment?.selected_forwarder_id);

  if (!activeShipment) return null;

  const getApprovalBadge = () => {
    switch (activeShipment.approval_status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approved by {activeShipment.approved_by || 'Justin Hopkins'}</span>
          </div>
        );
      case 'pending_justin':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Justin Hopkins (CEO)</span>
          </div>
        );
      case 'pending_wesley':
      case 'pending_herbert':
        return (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Wesley Quintero (Logistics Ops)</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Re-quote Requested</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>Routing Review Required</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Shipment Selector Dropdown / Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Active Shipment:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {shipments.map((s) => {
                const isActive = s.shipment_id === activeShipment.shipment_id;
                return (
                  <button
                    key={s.shipment_id}
                    onClick={() => onSelectShipment(s.shipment_id)}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-neutral-800 text-amber-400 border border-neutral-700 shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800/60'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-neutral-300">
                      [{s.region}]
                    </span>
                    <span>{s.shipment_id}</span>
                    <span>·</span>
                    <span>{s.PO}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={onOpenNewShipment}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-dashed border-neutral-700 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Shipment</span>
            </button>
          </div>

          {/* Decision Status & Routing Action */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            {getApprovalBadge()}
            <button
              onClick={onOpenApproval}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md transition-colors cursor-pointer shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Routing Decision & Approval</span>
            </button>
          </div>
        </div>

        {/* Detailed Shipment Specifications Header */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Column 1: Product & PO */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1.5 text-neutral-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-neutral-500" />
                <span>PO & Product</span>
              </div>
              <DataSourceBadge source={activeShipment.data_source} />
            </div>
            <div className="font-semibold text-neutral-100 text-sm truncate" title={activeShipment.product_name}>
              {activeShipment.product_name}
            </div>
            <div className="text-neutral-400 font-mono flex items-center gap-2">
              <span>PO: <strong className="text-neutral-200 font-medium">{activeShipment.PO}</strong></span>
              <span>·</span>
              <span>SKU: {activeShipment.SKU}</span>
              <span>·</span>
              <span>Region: {activeShipment.region}</span>
            </div>
          </div>

          {/* Column 2: Dimensions & Packing */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <Box className="w-3.5 h-3.5 text-neutral-500" />
              <span>Cargo Volume</span>
            </div>
            <div className="font-semibold text-neutral-100 text-sm font-mono tabular-nums">
              {activeShipment.CBM.toFixed(1)} CBM · {activeShipment.units.toLocaleString()} units
            </div>
            <div className="text-neutral-400 font-mono flex items-center gap-2 tabular-nums">
              <span>{activeShipment.cartons} ctns</span>
              <span>·</span>
              <span>{activeShipment.pallets} plts</span>
              <span>·</span>
              <span>{(activeShipment.units / activeShipment.cartons).toFixed(0)} u/ctn</span>
            </div>
          </div>

          {/* Column 3: Storage Hub & Fulfillment Channels */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <Building2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Primary Storage Hub</span>
            </div>
            <div className="font-semibold text-amber-400 text-xs truncate" title={activeShipment.primary_storage_hub}>
              {activeShipment.primary_storage_hub}
            </div>
            <div className="text-neutral-400 text-[11px] truncate" title={activeShipment.fulfillment_channels.join(', ')}>
              Channels: {activeShipment.fulfillment_channels.join(', ')}
            </div>
          </div>

          {/* Column 4: Routing Path */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>Routing Corridor</span>
            </div>
            <div className="font-semibold text-neutral-100 text-xs flex items-center gap-1 truncate">
              <span className="text-amber-400">{activeShipment.origin.split(' ')[0]}</span>
              <ArrowRight className="w-3 h-3 text-neutral-500 shrink-0" />
              <span className="text-neutral-200 truncate">{activeShipment.destination}</span>
            </div>
            <div className="text-neutral-400 font-mono">
              FOB Cost: {formatUSD(activeShipment.product_unit_fob_cost)}/unit
            </div>
          </div>

          {/* Column 5: Target Schedule */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>Target Schedule</span>
            </div>
            <div className="font-semibold text-neutral-100 text-sm font-mono">
              ETD: {activeShipment.target_etd}
            </div>
            <div className="text-neutral-400 font-mono">
              Target Delivery: {activeShipment.target_delivery_date}
            </div>
          </div>
        </div>

        {/* Selected Forwarder Note if approved */}
        {selectedForwarder && (
          <div className="mt-3 p-2.5 bg-neutral-950/60 rounded border border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Assigned Routing Forwarder:</span>
              <span className="font-semibold text-amber-400">{selectedForwarder.name}</span>
              {activeShipment.approval_notes && (
                <span className="text-neutral-400 italic">· "{activeShipment.approval_notes}"</span>
              )}
            </div>
            <span className="text-neutral-400 font-mono">{activeShipment.approval_status.replace('_', ' ').toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
