export type Currency = 'USD' | 'CNY' | 'CAD' | 'GBP';

export type DataSource = 'HA data' | 'demo data' | '';

export type SupplyChainRegion = 'US' | 'CA' | 'UK';

export type RateUnit =
  | 'per_cbm'
  | 'per_kg'
  | 'flat'
  | 'per_carton'
  | 'per_pallet'
  | 'per_container';

export type ComponentCategory =
  | 'freight'
  | 'origin'
  | 'destination'
  | 'customs'
  | 'handling'
  | 'surcharge'
  | 'warehouse'
  | 'other';

export type Incoterm = 'FOB' | 'EXW' | 'DAP' | 'DDP' | 'CIF';

export type ServiceType =
  | 'Ocean LCL'
  | 'Ocean FCL 20ft'
  | 'Ocean FCL 40HQ'
  | 'Amazon Global Logistics (AGL)'
  | 'Air Freight Standard'
  | 'Air Freight Express'
  | 'Expedited Ocean (Matson/ZIM)'
  | 'Ocean LCL Premium'
  | 'Ocean LCL Standard'
  | 'Integrated Ocean + 3PL'
  | 'Ocean LCL Port-to-CFS'
  | 'Direct UK Ocean LCL + 3PL Prep'
  | 'Ocean LCL via Felixstowe'
  | 'Ocean IPI Intermodal Rail'
  | 'Digital Ocean Freight LCL'
  | 'Expedited Ocean LCL';

export interface Forwarder {
  forwarder_id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  service_regions: string[];
  active: boolean;
  notes: string;
  avg_transit_accuracy?: number; // e.g. 94% or omitted if uncollected
  payment_terms: string; // e.g. "Net 30 from arrival"
  data_source?: DataSource;
}

export interface QuoteComponent {
  component_id: string;
  quote_id: string;
  category: ComponentCategory;
  description: string;
  unit: RateUnit;
  quantity: number;
  unit_rate: number;
  currency: Currency;
  amount_usd: number; // Normalized to USD
  is_included_in_quote: boolean;
  notes?: string;
  data_source?: DataSource;
}

export interface Quote {
  quote_id: string;
  forwarder_id: string;
  shipment_id: string;
  quote_reference: string;
  origin: string;
  destination: string;
  quote_date: string;
  valid_until: string;
  currency: Currency;
  fx_rate_to_usd: number;
  incoterm: Incoterm;
  service_type: ServiceType;
  transit_days: number;
  free_time_days: number; // Demurrage / detention free time
  service_assumptions: string;
  components: QuoteComponent[];
  status: 'active' | 'expired' | 'selected' | 'superseded';
  data_source?: DataSource;
}

export interface Shipment {
  shipment_id: string;
  region: SupplyChainRegion;
  primary_storage_hub: string; // e.g. "Amazon Warehousing & Distribution (AWD)", "Proline Logistics Services (Canada 3PL)", "SSD Logistix (UK 3PL)"
  fulfillment_channels: string[]; // e.g. ["Amazon FBA", "Walmart WFS", "TikTok FBT", "Shopify WebBee"]
  PO: string;
  SKU: string;
  ASIN: string;
  product_name: string;
  units: number;
  cartons: number;
  pallets: number;
  gross_weight_kg: number;
  CBM: number;
  origin: string;
  destination: string;
  target_etd: string;
  target_delivery_date: string;
  product_unit_fob_cost: number; // USD per unit for landed cost calculation
  status: 'draft' | 'quoting' | 'comparing' | 'approved' | 'in_transit' | 'completed';
  approval_status: 'not_submitted' | 'pending_justin' | 'pending_wesley' | 'pending_herbert' | 'approved' | 'rejected';
  selected_forwarder_id?: string;
  approval_notes?: string;
  approved_by?: string;
  approved_at?: string;
  data_source?: DataSource;
}

export interface OperationsContact {
  contact_id: string;
  name: string;
  role: string;
  organization: string;
  email: string;
  phone?: string;
  location?: string;
  responsibilities: string[];
  data_source?: DataSource;
}

export interface DecisionFlag {

  id: string;
  type:
    | 'lowest_cost'
    | 'fastest_transit'
    | 'expired'
    | 'missing_component'
    | 'high_surcharge'
    | 'high_variance'
    | 'insufficient_data';
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface CostAnalysis {
  quote_id: string;
  freight_cost: number;
  origin_cost: number;
  destination_cost: number;
  customs_cost: number;
  handling_cost: number;
  surcharges_cost: number;
  other_cost: number;
  total_logistics_cost: number;
  cost_per_unit: number;
  cost_per_carton: number;
  cost_per_pallet: number;
  cost_per_CBM: number;
  cost_per_kg: number;
  landed_unit_cost: number; // FOB unit cost + logistics cost per unit
  landed_cost_impact_pct: number; // logistics cost / FOB cost
  flags: DecisionFlag[];
}

export interface HistoricalShipment {
  history_id: string;
  shipment_id: string;
  PO: string;
  SKU: string;
  product_name: string;
  forwarder_id: string;
  forwarder_name: string;
  route: string;
  service_type: string;
  completed_date: string;
  units: number;
  CBM: number;
  gross_weight_kg: number;
  quoted_cost: number;
  actual_cost: number;
  variance_amount: number;
  variance_pct: number;
  quoted_transit_days: number;
  actual_transit_days: number;
  variance_reason: string;
  data_source?: DataSource;
}

export interface RateCard {
  card_id: string;
  forwarder_id: string;
  route_name: string;
  service_type: string;
  currency: Currency;
  rate: number;
  unit: RateUnit;
  minimum_charge: number;
  surcharges_note: string;
  effective_date: string;
  expiration_date: string;
  notes: string;
  data_source?: DataSource;
}

export interface SheetsSyncState {
  web_app_url: string;
  last_synced_at: string | null;
  status: 'idle' | 'syncing' | 'connected' | 'error';
  last_payload_summary: string | null;
}
