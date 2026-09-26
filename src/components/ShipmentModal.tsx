import React, { useState } from 'react';
import { Shipment, SupplyChainRegion, DataSource } from '../types';
import { X, Package, Calendar, Box, Scale, MapPin, Building2, ShoppingBag } from 'lucide-react';

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveShipment: (shipment: Shipment) => void;
  existingShipment?: Shipment | null;
}

export const ShipmentModal: React.FC<ShipmentModalProps> = ({
  isOpen,
  onClose,
  onSaveShipment,
  existingShipment,
}) => {
  const [dataSource, setDataSource] = useState<DataSource>(
    existingShipment?.data_source || 'HA data'
  );
  const [shipmentId, setShipmentId] = useState(
    existingShipment?.shipment_id || `SHP-2026-${Math.floor(100 + Math.random() * 900)}`,
  );
  const [region, setRegion] = useState<SupplyChainRegion>(existingShipment?.region || 'US');
  const [storageHub, setStorageHub] = useState(
    existingShipment?.primary_storage_hub || 'Amazon Warehousing & Distribution (AWD)',
  );
  const [channels, setChannels] = useState(
    existingShipment?.fulfillment_channels?.join(', ') ||
      'Amazon FBA, Walmart WFS, TikTok FBT, Shopify WebBee',
  );
  const [po, setPo] = useState(existingShipment?.PO || 'HA-PO-8875');
  const [sku, setSku] = useState(existingShipment?.SKU || 'HA-CIS-02');
  const [asin, setAsin] = useState(existingShipment?.ASIN || 'B09X8899K');
  const [productName, setProductName] = useState(
    existingShipment?.product_name || 'Artisan Cast Iron Dutch Oven 6-Quart',
  );
  const [units, setUnits] = useState(existingShipment?.units || 2500);
  const [cartons, setCartons] = useState(existingShipment?.cartons || 350);
  const [pallets, setPallets] = useState(existingShipment?.pallets || 14);
  const [grossWeight, setGrossWeight] = useState(existingShipment?.gross_weight_kg || 6800);
  const [cbm, setCbm] = useState(existingShipment?.CBM || 19.5);
  const [origin, setOrigin] = useState(existingShipment?.origin || 'Shenzhen (Yantian Port)');
  const [destination, setDestination] = useState(
    existingShipment?.destination || 'Amazon AWD Hub (West Coast, CA)',
  );
  const [targetEtd, setTargetEtd] = useState(existingShipment?.target_etd || '2026-11-01');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState(
    existingShipment?.target_delivery_date || '2026-11-28',
  );
  const [productFobCost, setProductFobCost] = useState(existingShipment?.product_unit_fob_cost || 24.5);

  if (!isOpen) return null;

  const handleRegionChange = (newReg: SupplyChainRegion) => {
    setRegion(newReg);
    if (newReg === 'US') {
      setStorageHub('Amazon Warehousing & Distribution (AWD)');
      setChannels('Amazon FBA, Walmart WFS, TikTok FBT, Shopify WebBee');
      setDestination('Amazon AWD Hub (West Coast / Eastvale, CA)');
    } else if (newReg === 'CA') {
      setStorageHub('Proline Logistics Services (Canada 3PL Hub)');
      setChannels('Amazon FBA Canada (YHM1 Warehouse)');
      setDestination('Proline Logistics Services (Delta / Vancouver, BC) → YHM1');
    } else if (newReg === 'UK') {
      setStorageHub('SSD Logistix (UK 3PL Hub)');
      setChannels('Amazon FBA UK (Direct pallet replenishment)');
      setDestination('SSD Logistix (Stratford-upon-Avon / Midlands Hub) → Amazon UK');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShipment: Shipment = {
      shipment_id: shipmentId,
      data_source: dataSource,
      region,
      primary_storage_hub: storageHub,
      fulfillment_channels: channels.split(',').map((c) => c.trim()),
      PO: po,
      SKU: sku,
      ASIN: asin,
      product_name: productName,
      units: Number(units) || 1,
      cartons: Number(cartons) || 1,
      pallets: Number(pallets) || 1,
      gross_weight_kg: Number(grossWeight) || 1,
      CBM: Number(cbm) || 1,
      origin: origin,
      destination: destination,
      target_etd: targetEtd,
      target_delivery_date: targetDeliveryDate,
      product_unit_fob_cost: Number(productFobCost) || 0,
      status: existingShipment?.status || 'quoting',
      approval_status: existingShipment?.approval_status || 'not_submitted',
      selected_forwarder_id: existingShipment?.selected_forwarder_id || '',
      approval_notes: existingShipment?.approval_notes || '',
      approved_by: existingShipment?.approved_by || '',
      approved_at: existingShipment?.approved_at || '',
    };

    onSaveShipment(newShipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full p-6 text-neutral-100 shadow-xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                {existingShipment ? 'Edit Shipment Requirements' : 'Create New Shipment Requirement'}
              </h3>
              <p className="text-xs text-neutral-400">
                Define dimensions, carton specs, and regional destination hub (AWD / Proline / SSD).
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Data Provenance Option */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded">
            <label className="font-semibold text-neutral-300 block mb-1.5">Data Origin / Provenance</label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 text-neutral-200 cursor-pointer">
                <input
                  type="radio"
                  name="shipmentOrigin"
                  checked={dataSource === 'HA data'}
                  onChange={() => setDataSource('HA data')}
                  className="accent-amber-400"
                />
                <span>HA data (Hungry Artisan Actual)</span>
              </label>
              <label className="inline-flex items-center gap-1.5 text-neutral-200 cursor-pointer">
                <input
                  type="radio"
                  name="shipmentOrigin"
                  checked={dataSource === 'demo data'}
                  onChange={() => setDataSource('demo data')}
                  className="accent-amber-400"
                />
                <span>Demo data (Demonstration)</span>
              </label>
            </div>
          </div>

          {/* Region & Hub Selection */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-neutral-300 block mb-1">Supply Chain Region</label>
                <select
                  value={region}
                  onChange={(e) => handleRegionChange(e.target.value as SupplyChainRegion)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="US">United States (AWD Hub)</option>
                  <option value="CA">Canada (Proline 3PL Hub)</option>
                  <option value="UK">United Kingdom (SSD 3PL Hub)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-neutral-300 block mb-1">Primary Storage Hub</label>
                <input
                  type="text"
                  value={storageHub}
                  onChange={(e) => setStorageHub(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Downstream Fulfillment Channels (comma separated)</label>
              <input
                type="text"
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
                placeholder="Amazon FBA, Walmart WFS, TikTok FBT, Shopify WebBee"
                className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Shipment ID</label>
              <input
                type="text"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">PO Number</label>
              <input
                type="text"
                value={po}
                onChange={(e) => setPo(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Product SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">ASIN</label>
              <input
                type="text"
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">FOB Factory Cost ($/unit)</label>
              <input
                type="number"
                step="0.01"
                value={productFobCost}
                onChange={(e) => setProductFobCost(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-300 block mb-1">Product Description</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Total Units</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Cartons</label>
              <input
                type="number"
                value={cartons}
                onChange={(e) => setCartons(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Pallets</label>
              <input
                type="number"
                value={pallets}
                onChange={(e) => setPallets(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Weight (KG)</label>
              <input
                type="number"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Volume (CBM)</label>
              <input
                type="number"
                step="0.1"
                value={cbm}
                onChange={(e) => setCbm(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Origin Port / CFS</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Destination Facility</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Target Cargo Ready (ETD)</label>
              <input
                type="date"
                value={targetEtd}
                onChange={(e) => setTargetEtd(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-300 block mb-1">Required Delivery Date</label>
              <input
                type="date"
                value={targetDeliveryDate}
                onChange={(e) => setTargetDeliveryDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-neutral-200 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

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
              Save Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
