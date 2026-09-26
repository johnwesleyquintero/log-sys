import {
  Forwarder,
  Shipment,
  Quote,
  HistoricalShipment,
  RateCard,
  OperationsContact,
  SupplyChainRegion,
} from '../types';

export interface RegionalFramework {
  region: SupplyChainRegion;
  region_name: string;
  inbound_origin: string;
  primary_storage_hub: string;
  fulfillment_channels: string[];
  operational_workflow: string;
}

/**
 * HA GLOBAL SUPPLY CHAIN FRAMEWORK
 *
 * Source:
 * - Hungry Artisan-provided operational framework
 * - HA-provided contacts and logistics relationships
 *
 * This file contains operational seed data for the logistics decision UI.
 * Rates, quotes, historical costs, and shipment examples should be replaced
 * or reconciled with live operational data as the Q4 logistics project
 * progresses.
 */
export const GLOBAL_SUPPLY_CHAIN_FRAMEWORK: RegionalFramework[] = [
  {
    region: 'US',
    region_name: 'United States',
    inbound_origin:
      'Chinese Supplier via Amazon Global Logistics (AGL) and/or ocean freight forwarders',
    primary_storage_hub:
      'Amazon Warehousing & Distribution (AWD)',
    fulfillment_channels: [
      'Amazon FBA',
      'Walmart WFS',
      'TikTok FBT',
      'Shopify DTC (Map My Channel / WebBee integration)',
    ],
    operational_workflow:
      'Bulk inventory is shipped from Chinese suppliers into Amazon Warehousing & Distribution (AWD), including HA shipments using Amazon Global Logistics (AGL) where applicable. AWD supports replenishment into Amazon FBA and distribution to other approved channels or external locations through Amazon fulfillment and distribution workflows. HA also uses Map My Channel / WebBee for multi-channel integration support.',
  },
  {
    region: 'CA',
    region_name: 'Canada',
    inbound_origin:
      'Chinese Supplier via ocean freight to the Vancouver / Delta area',
    primary_storage_hub:
      'Proline Logistics Services (Canada 3PL Hub)',
    fulfillment_channels: [
      'Amazon FBA Canada (YHM1 / Hamilton, ON)',
    ],
    operational_workflow:
      'Shipments from Chinese suppliers move into the Vancouver / Delta area and are received by Proline Logistics Services. Proline provides Canadian 3PL handling, including warehousing, carton/pallet preparation, and outbound LTL or carton shipments to Amazon Canada as required.',
  },
  {
    region: 'UK',
    region_name: 'United Kingdom',
    inbound_origin:
      'Chinese Supplier via ocean freight to the UK',
    primary_storage_hub:
      'SSD Logistix (UK 3PL Hub)',
    fulfillment_channels: [
      'Amazon FBA UK',
    ],
    operational_workflow:
      'Shipments from Chinese suppliers move into the UK and are received by SSD Logistix. The UK 3PL provides warehouse handling and FBA shipment preparation before inventory is dispatched to Amazon UK fulfillment facilities.',
  },
];

export const OPERATIONS_CONTACTS: OperationsContact[] = [
  {
    contact_id: 'CONT-01',
    name: 'Justin Hopkins',
    role: 'Founder & CEO',
    organization: 'Hungry Artisan',
    email: 'justin@hungryartisan.com',
    location: 'United States',
    responsibilities: [
      'Inbound logistics oversight',
      'Operational oversight',
      'Approval of major freight and inventory decisions',
      'Freight budgeting and supplier/forwarder decisions',
    ],
  },
  {
    contact_id: 'CONT-02',
    name: 'Wesley Quintero',
    role: 'Logistics Operations & Freight Manager',
    organization: 'Hungry Artisan',
    email: 'wesley@hungryartisan.com',
    location: 'Operations Hub',
    responsibilities: [
      'AWD and multi-channel inventory transfer execution',
      'Canada and UK 3PL replenishment execution',
      'Freight reporting, sales velocity, and stock monitoring',
      'Forwarder quote collection and normalization',
      'Landed logistics cost analysis',
      'Carrier SLA and rate-card review',
      'Operational decision interface and Google Sheets coordination',
    ],
  },
  {
    contact_id: 'CONT-03',
    name: 'Bert Abedirad',
    role: 'Director / VP',
    organization: 'Proline Logistics Services (Canada)',
    email: 'info@prolinelogistics.ca',
    phone: '(604) 500-2055',
    location: 'Vancouver / Delta, BC, Canada',
    responsibilities: [
      'Canada 3PL warehousing',
      'Container de-stuffing and receiving',
      'Carton and pallet labeling / preparation',
      'LTL freight dispatch to Amazon Canada',
    ],
  },
  {
    contact_id: 'CONT-04',
    name: 'Matt Terry',
    role: 'Warehouse Manager',
    organization: 'SSD Logistix (UK)',
    email: 'office@ssdlogistix.com',
    phone: '01789 777 905',
    location: 'Stratford-upon-Avon / Midlands, UK',
    responsibilities: [
      'UK 3PL warehouse operations',
      'Container receiving and warehouse handling',
      'FBA shipment preparation',
      'Pallet and carton processing for Amazon UK',
    ],
  },
  {
    contact_id: 'CONT-05',
    name: 'Jules',
    role: 'WebBee / Integration Specialist',
    organization: 'External Technology Partner',
    email: 'jules@webbee-integration.internal',
    location: 'Internal Slack',
    responsibilities: [
      'Multi-channel integration support',
      'Map My Channel / WebBee synchronization support',
      'Shopify and marketplace integration support',
    ],
  },
];

export const INITIAL_FORWARDERS: Forwarder[] = [
  {
    forwarder_id: 'FWD-AGL',
    name: 'Amazon Global Logistics (AGL)',
    contact_name: 'AGL Seller Support / Account Team',
    contact_email: '',
    contact_phone: '',
    service_regions: [
      'China to US AWD',
      'China to US FBA',
      'Yantian',
      'Ningbo',
      'Shanghai',
    ],
    active: true,
    notes:
      'Amazon-operated end-to-end logistics option for eligible routes. HA uses AGL for US inbound logistics where applicable. Booking, payment, tracking, and shipment management are handled through Amazon systems.',
    avg_transit_accuracy: 96,
    payment_terms: 'Amazon / Seller Central billing',
  },
  {
    forwarder_id: 'FWD-01',
    name: 'Apex Global Logistics',
    contact_name: 'David Chen',
    contact_email: 'dchen@apexgl-freight.com',
    contact_phone: '+86 755 8829 4410',
    service_regions: [
      'Shenzhen',
      'Ningbo',
      'Shanghai',
      'US West Coast',
      'US East Coast',
    ],
    active: true,
    notes:
      'HA seed forwarder for comparison against AGL on US ocean lanes. Validate current service coverage, rates, destination charges, and Amazon delivery requirements against the actual quote.',
    avg_transit_accuracy: 94,
    payment_terms: 'Net 30 days from Bill of Lading',
  },
  {
    forwarder_id: 'FWD-02',
    name: 'TransPacific Freightways',
    contact_name: 'Angela Wu',
    contact_email: 'angela.wu@transpacific-fw.com',
    contact_phone: '+86 574 8701 9283',
    service_regions: [
      'Ningbo',
      'Qingdao',
      'Shanghai',
      'US West Coast',
      'US Midwest',
    ],
    active: true,
    notes:
      'HA seed forwarder for comparison on China-to-US lanes, including Midwest routing scenarios. Quote structure and rate basis should be normalized before comparison.',
    avg_transit_accuracy: 91,
    payment_terms: 'Net 15 days upon port arrival',
  },
  {
    forwarder_id: 'FWD-03',
    name: 'SinoGlobal Express',
    contact_name: 'Marcus Zhang',
    contact_email: 'm.zhang@sinoglobal-logistics.cn',
    contact_phone: '+86 20 8391 0022',
    service_regions: [
      'Shenzhen',
      'Guangzhou',
      'Hong Kong',
      'US West Coast',
      'UK',
    ],
    active: true,
    notes:
      'HA seed forwarder for multi-route comparison. Confirm destination charges, accessorials, customs scope, and final delivery terms from each quote.',
    avg_transit_accuracy: 88,
    payment_terms: 'Deposit 20% on booking, balance Net 15',
  },
  {
    forwarder_id: 'FWD-PROLINE',
    name: 'Proline Freight Connect (Canada)',
    contact_name: 'Bert Abedirad',
    contact_email: 'info@prolinelogistics.ca',
    contact_phone: '(604) 500-2055',
    service_regions: [
      'China to Vancouver / Delta Hub',
      'Canada 3PL',
      'YHM1 outbound replenishment',
    ],
    active: true,
    notes:
      'HA Canada logistics partner. Integrated freight and 3PL handling with outbound replenishment to Amazon Canada.',
    avg_transit_accuracy: 95,
    payment_terms: 'Net 15 days',
  },
  {
    forwarder_id: 'FWD-SSD',
    name: 'SSD Maritime & Logistics (UK)',
    contact_name: 'Matt Terry',
    contact_email: 'office@ssdlogistix.com',
    contact_phone: '01789 777 905',
    service_regions: [
      'China to UK',
      'UK 3PL',
      'Amazon UK FBA',
    ],
    active: true,
    notes:
      'HA UK logistics partner. Provides UK 3PL handling and FBA shipment preparation.',
    avg_transit_accuracy: 97,
    payment_terms: 'Net 30 days',
  },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    shipment_id: 'SHP-2026-104',
    region: 'US',
    primary_storage_hub:
      'Amazon Warehousing & Distribution (AWD)',
    fulfillment_channels: [
      'Amazon FBA',
      'Walmart WFS',
      'TikTok FBT',
      'Shopify DTC (Map My Channel / WebBee)',
    ],
    PO: 'HA-PO-8842',
    SKU: 'HA-CIS-01',
    ASIN: 'B09X8842K',
    product_name:
      'Artisan Pre-Seasoned Cast Iron Skillet Set 10" & 12"',
    units: 3200,
    cartons: 400,
    pallets: 16,
    gross_weight_kg: 8400,
    CBM: 22.4,
    origin: 'Shenzhen (Yantian Port)',
    destination: 'Amazon AWD — US West Coast',
    target_etd: '2026-10-15',
    target_delivery_date: '2026-11-12',
    product_unit_fob_cost: 18.5,
    status: 'comparing',
    approval_status: 'pending_justin',
    selected_forwarder_id: 'FWD-AGL',
    approval_notes:
      'AGL is included as the current comparison option for direct US inbound to AWD. Final selection should be based on normalized landed logistics cost, service scope, transit, and quote assumptions.',
  },
  {
    shipment_id: 'SHP-2026-108',
    region: 'CA',
    primary_storage_hub:
      'Proline Logistics Services (Canada 3PL Hub)',
    fulfillment_channels: [
      'Amazon FBA Canada (YHM1)',
    ],
    PO: 'HA-PO-8851',
    SKU: 'HA-WOK-14',
    ASIN: 'B09Y7719P',
    product_name:
      'Hand-Hammered Carbon Steel Wok 14" with Spruce Lid',
    units: 1600,
    cartons: 200,
    pallets: 8,
    gross_weight_kg: 3300,
    CBM: 12.2,
    origin: 'Ningbo Port (Beilun)',
    destination:
      'Proline Logistics Services — Delta / Vancouver, BC → Amazon Canada',
    target_etd: '2026-10-25',
    target_delivery_date: '2026-11-24',
    product_unit_fob_cost: 21.0,
    status: 'comparing',
    approval_status: 'pending_wesley',
    selected_forwarder_id: 'FWD-PROLINE',
    approval_notes:
      'Proline is the HA Canada 3PL partner. Shipment comparison should account for ocean freight, customs, destination handling, 3PL receiving/preparation, and outbound Amazon replenishment.',
  },
  {
    shipment_id: 'SHP-2026-109',
    region: 'UK',
    primary_storage_hub:
      'SSD Logistix (UK 3PL Hub)',
    fulfillment_channels: [
      'Amazon FBA UK',
    ],
    PO: 'HA-PO-8862',
    SKU: 'HA-CPK-02',
    ASIN: 'B09M4412W',
    product_name:
      'Ceramic Pour-Over Kettle & Heat-Resistant Carafe Set',
    units: 2400,
    cartons: 240,
    pallets: 10,
    gross_weight_kg: 2750,
    CBM: 14.5,
    origin: 'Shenzhen (Shekou)',
    destination:
      'SSD Logistix — Stratford-upon-Avon / Midlands → Amazon UK',
    target_etd: '2026-11-05',
    target_delivery_date: '2026-12-08',
    product_unit_fob_cost: 14.8,
    status: 'quoting',
    approval_status: 'not_submitted',
  },
  {
    shipment_id: 'SHP-2026-105',
    region: 'US',
    primary_storage_hub:
      'Amazon Warehousing & Distribution (AWD)',
    fulfillment_channels: [
      'Amazon FBA',
      'Walmart WFS',
      'TikTok FBT',
    ],
    PO: 'HA-PO-8849',
    SKU: 'HA-WOK-14',
    ASIN: 'B09Y7719P',
    product_name:
      'Hand-Hammered Carbon Steel Wok 14" with Spruce Lid',
    units: 2400,
    cartons: 300,
    pallets: 12,
    gross_weight_kg: 4950,
    CBM: 18.2,
    origin: 'Ningbo Port (Beilun)',
    destination:
      'Amazon AWD — US Midwest distribution scenario',
    target_etd: '2026-10-22',
    target_delivery_date: '2026-11-28',
    product_unit_fob_cost: 21.0,
    status: 'comparing',
    approval_status: 'pending_justin',
    selected_forwarder_id: 'FWD-02',
    approval_notes:
      'TransPacific is included as a comparison scenario for Ningbo-to-US Midwest routing. Validate the actual inland rail/intermodal scope and destination charges against the live quote before approval.',
  },
];

export const INITIAL_QUOTES: Quote[] = [
  /*
   * US — SHP-2026-104
   * Shenzhen / Yantian → Amazon AWD
   *
   * These records represent quote-comparison seed data.
   * Actual quote scope and charges should be reconciled against
   * the live forwarder quote before operational use.
   */

  {
    quote_id: 'Q-104-AGL',
    forwarder_id: 'FWD-AGL',
    shipment_id: 'SHP-2026-104',
    quote_reference: 'AGL-AWD-SZ-9041',
    origin: 'Shenzhen (Yantian)',
    destination: 'Amazon AWD — US West Coast',
    quote_date: '2026-09-22',
    valid_until: '2026-10-15',
    currency: 'USD',
    fx_rate_to_usd: 1.0,
    incoterm: 'FOB',
    service_type: 'Amazon Global Logistics (AGL)',
    transit_days: 20,
    free_time_days: 21,
    service_assumptions:
      'Seed quote for comparison. Direct AGL shipment into AWD with Amazon-managed logistics and customs scope as applicable. Confirm final charge structure and included services in Seller Central before booking.',
    status: 'active',
    components: [
      {
        component_id: 'QC-104-AGL-1',
        quote_id: 'Q-104-AGL',
        category: 'freight',
        description: 'AGL Ocean Freight — AWD',
        unit: 'per_cbm',
        quantity: 22.4,
        unit_rate: 110.0,
        currency: 'USD',
        amount_usd: 2464.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-AGL-2',
        quote_id: 'Q-104-AGL',
        category: 'origin',
        description: 'Origin Handling / Export Processing',
        unit: 'flat',
        quantity: 1,
        unit_rate: 165.0,
        currency: 'USD',
        amount_usd: 165.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-AGL-3',
        quote_id: 'Q-104-AGL',
        category: 'customs',
        description: 'US Customs / Import Processing',
        unit: 'flat',
        quantity: 1,
        unit_rate: 135.0,
        currency: 'USD',
        amount_usd: 135.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-AGL-4',
        quote_id: 'Q-104-AGL',
        category: 'destination',
        description: 'AWD Delivery / Inbound Handling',
        unit: 'flat',
        quantity: 1,
        unit_rate: 680.0,
        currency: 'USD',
        amount_usd: 680.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-AGL-5',
        quote_id: 'Q-104-AGL',
        category: 'surcharge',
        description: 'Port / Security / Accessorial Allowance',
        unit: 'flat',
        quantity: 1,
        unit_rate: 95.0,
        currency: 'USD',
        amount_usd: 95.0,
        is_included_in_quote: true,
      },
    ],
  },

  {
    quote_id: 'Q-104-APX',
    forwarder_id: 'FWD-01',
    shipment_id: 'SHP-2026-104',
    quote_reference: 'APX-SZ-2026-9041',
    origin: 'Shenzhen (Yantian)',
    destination: 'Amazon AWD — US West Coast',
    quote_date: '2026-09-20',
    valid_until: '2026-10-10',
    currency: 'USD',
    fx_rate_to_usd: 1.0,
    incoterm: 'FOB',
    service_type: 'Ocean LCL',
    transit_days: 22,
    free_time_days: 14,
    service_assumptions:
      'FOB Yantian CFS to AWD door. Destination delivery and appointment scope should be confirmed against the actual forwarder quote.',
    status: 'active',
    components: [
      {
        component_id: 'QC-104-APX-1',
        quote_id: 'Q-104-APX',
        category: 'freight',
        description: 'Base Ocean Freight — Yantian to Long Beach',
        unit: 'per_cbm',
        quantity: 22.4,
        unit_rate: 115.0,
        currency: 'USD',
        amount_usd: 2576.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-APX-2',
        quote_id: 'Q-104-APX',
        category: 'origin',
        description: 'CFS Receiving & Export Documentation',
        unit: 'flat',
        quantity: 1,
        unit_rate: 180.0,
        currency: 'USD',
        amount_usd: 180.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-APX-3',
        quote_id: 'Q-104-APX',
        category: 'customs',
        description: 'US Customs Entry / ISF Processing',
        unit: 'flat',
        quantity: 1,
        unit_rate: 145.0,
        currency: 'USD',
        amount_usd: 145.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-APX-4',
        quote_id: 'Q-104-APX',
        category: 'destination',
        description: 'Destination THC / Deconsolidation',
        unit: 'per_cbm',
        quantity: 22.4,
        unit_rate: 28.0,
        currency: 'USD',
        amount_usd: 627.2,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-APX-5',
        quote_id: 'Q-104-APX',
        category: 'destination',
        description: 'Inland Delivery — Long Beach to AWD',
        unit: 'flat',
        quantity: 1,
        unit_rate: 850.0,
        currency: 'USD',
        amount_usd: 850.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-APX-6',
        quote_id: 'Q-104-APX',
        category: 'surcharge',
        description: 'Port / Clean Truck / Accessorial Charges',
        unit: 'flat',
        quantity: 1,
        unit_rate: 110.0,
        currency: 'USD',
        amount_usd: 110.0,
        is_included_in_quote: true,
      },
    ],
  },

  {
    quote_id: 'Q-104-TPF',
    forwarder_id: 'FWD-02',
    shipment_id: 'SHP-2026-104',
    quote_reference: 'TPF-QUOTE-4482',
    origin: 'Shenzhen (Yantian)',
    destination: 'Amazon AWD — US West Coast',
    quote_date: '2026-09-22',
    valid_until: '2026-10-12',
    currency: 'USD',
    fx_rate_to_usd: 1.0,
    incoterm: 'FOB',
    service_type: 'Ocean LCL',
    transit_days: 26,
    free_time_days: 10,
    service_assumptions:
      'Seed quote quoted at $0.38/kg ocean rate plus $65/pallet delivery. Confirm destination, customs, CFS, and accessorial scope before operational comparison.',
    status: 'active',
    components: [
      {
        component_id: 'QC-104-TPF-1',
        quote_id: 'Q-104-TPF',
        category: 'freight',
        description: 'Ocean Freight & CFS Port-to-Port',
        unit: 'per_kg',
        quantity: 8400,
        unit_rate: 0.38,
        currency: 'USD',
        amount_usd: 3192.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-TPF-2',
        quote_id: 'Q-104-TPF',
        category: 'customs',
        description: 'US Customs Clearance',
        unit: 'flat',
        quantity: 1,
        unit_rate: 125.0,
        currency: 'USD',
        amount_usd: 125.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-TPF-3',
        quote_id: 'Q-104-TPF',
        category: 'destination',
        description: 'Final Delivery to Amazon AWD',
        unit: 'per_pallet',
        quantity: 16,
        unit_rate: 65.0,
        currency: 'USD',
        amount_usd: 1040.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-104-TPF-4',
        quote_id: 'Q-104-TPF',
        category: 'surcharge',
        description: 'Fuel / Port Security / Accessorial Allowance',
        unit: 'flat',
        quantity: 1,
        unit_rate: 160.0,
        currency: 'USD',
        amount_usd: 160.0,
        is_included_in_quote: true,
      },
    ],
  },

  /*
   * CANADA — SHP-2026-108
   */

  {
    quote_id: 'Q-108-PROLINE',
    forwarder_id: 'FWD-PROLINE',
    shipment_id: 'SHP-2026-108',
    quote_reference: 'PRO-CAN-2026-118',
    origin: 'Ningbo Port',
    destination:
      'Proline Logistics Services — Delta / Vancouver, BC',
    quote_date: '2026-09-23',
    valid_until: '2026-10-20',
    currency: 'USD',
    fx_rate_to_usd: 1.0,
    incoterm: 'FOB',
    service_type: 'Ocean LCL',
    transit_days: 19,
    free_time_days: 14,
    service_assumptions:
      'Seed Canada logistics quote covering ocean freight into Vancouver, movement to Proline Delta 3PL, and warehouse preparation for subsequent Amazon Canada replenishment.',
    status: 'active',
    components: [
      {
        component_id: 'QC-108-PRO-1',
        quote_id: 'Q-108-PROLINE',
        category: 'freight',
        description: 'Ocean Freight — Ningbo to Vancouver',
        unit: 'per_cbm',
        quantity: 12.2,
        unit_rate: 108.0,
        currency: 'USD',
        amount_usd: 1317.6,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-108-PRO-2',
        quote_id: 'Q-108-PROLINE',
        category: 'customs',
        description: 'Canada Customs / Commercial Entry',
        unit: 'flat',
        quantity: 1,
        unit_rate: 160.0,
        currency: 'USD',
        amount_usd: 160.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-108-PRO-3',
        quote_id: 'Q-108-PROLINE',
        category: 'destination',
        description: 'Vancouver Port to Proline Delta 3PL',
        unit: 'flat',
        quantity: 1,
        unit_rate: 480.0,
        currency: 'USD',
        amount_usd: 480.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-108-PRO-4',
        quote_id: 'Q-108-PROLINE',
        category: 'warehouse',
        description: 'Palletizing & Amazon YHM1 Preparation',
        unit: 'per_pallet',
        quantity: 8,
        unit_rate: 22.0,
        currency: 'USD',
        amount_usd: 176.0,
        is_included_in_quote: true,
      },
    ],
  },

  /*
   * UK — SHP-2026-109
   */

  {
    quote_id: 'Q-109-SSD',
    forwarder_id: 'FWD-SSD',
    shipment_id: 'SHP-2026-109',
    quote_reference: 'SSD-UK-2026-442',
    origin: 'Shenzhen (Shekou)',
    destination:
      'SSD Logistix — Stratford-upon-Avon / Midlands',
    quote_date: '2026-09-24',
    valid_until: '2026-10-22',
    currency: 'USD',
    fx_rate_to_usd: 1.0,
    incoterm: 'FOB',
    service_type: 'Ocean LCL',
    transit_days: 28,
    free_time_days: 14,
    service_assumptions:
      'Seed UK logistics quote covering ocean freight to Southampton, customs clearance, haulage to SSD Logistix, and warehouse preparation for Amazon UK FBA.',
    status: 'active',
    components: [
      {
        component_id: 'QC-109-SSD-1',
        quote_id: 'Q-109-SSD',
        category: 'freight',
        description: 'Ocean Freight — Shenzhen to Southampton',
        unit: 'per_cbm',
        quantity: 14.5,
        unit_rate: 125.0,
        currency: 'USD',
        amount_usd: 1812.5,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-109-SSD-2',
        quote_id: 'Q-109-SSD',
        category: 'customs',
        description: 'UK Customs Entry',
        unit: 'flat',
        quantity: 1,
        unit_rate: 150.0,
        currency: 'USD',
        amount_usd: 150.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-109-SSD-3',
        quote_id: 'Q-109-SSD',
        category: 'destination',
        description: 'Southampton to SSD Logistix',
        unit: 'flat',
        quantity: 1,
        unit_rate: 590.0,
        currency: 'USD',
        amount_usd: 590.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-109-SSD-4',
        quote_id: 'Q-109-SSD',
        category: 'warehouse',
        description: 'Devanning & UK FBA Pallet Preparation',
        unit: 'per_pallet',
        quantity: 10,
        unit_rate: 20.0,
        currency: 'USD',
        amount_usd: 200.0,
        is_included_in_quote: true,
      },
    ],
  },

  /*
   * US — SHP-2026-105
   */

  {
    quote_id: 'Q-105-TPF',
    forwarder_id: 'FWD-02',
    shipment_id: 'SHP-2026-105',
    quote_reference: 'TPF-NB-CHI-991',
    origin: 'Ningbo Port',
    destination:
      'Amazon AWD — US Midwest distribution scenario',
    quote_date: '2026-09-21',
    valid_until: '2026-10-18',
    currency: 'USD',
    fx_rate_to_usd: 1.0,
    incoterm: 'FOB',
    service_type: 'Ocean LCL',
    transit_days: 30,
    free_time_days: 14,
    service_assumptions:
      'Seed intermodal scenario for Ningbo-to-US Midwest routing. Ocean, rail/intermodal, destination handling, and final delivery scope should be validated against the actual forwarder quote.',
    status: 'active',
    components: [
      {
        component_id: 'QC-105-TPF-1',
        quote_id: 'Q-105-TPF',
        category: 'freight',
        description: 'Ocean / Intermodal Freight — Ningbo to Midwest',
        unit: 'per_cbm',
        quantity: 18.2,
        unit_rate: 185.0,
        currency: 'USD',
        amount_usd: 3367.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-105-TPF-2',
        quote_id: 'Q-105-TPF',
        category: 'origin',
        description: 'Ningbo CFS & Export Processing',
        unit: 'flat',
        quantity: 1,
        unit_rate: 195.0,
        currency: 'USD',
        amount_usd: 195.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-105-TPF-3',
        quote_id: 'Q-105-TPF',
        category: 'customs',
        description: 'US Customs Entry / Import Processing',
        unit: 'flat',
        quantity: 1,
        unit_rate: 155.0,
        currency: 'USD',
        amount_usd: 155.0,
        is_included_in_quote: true,
      },
      {
        component_id: 'QC-105-TPF-4',
        quote_id: 'Q-105-TPF',
        category: 'destination',
        description: 'Rail Ramp / Deconsolidation / Final Delivery',
        unit: 'flat',
        quantity: 1,
        unit_rate: 980.0,
        currency: 'USD',
        amount_usd: 980.0,
        is_included_in_quote: true,
      },
    ],
  },
];

export const INITIAL_HISTORICAL_SHIPMENTS: HistoricalShipment[] = [
  {
    history_id: 'HIST-2026-092',
    shipment_id: 'SHP-2026-092',
    PO: 'HA-PO-8790',
    SKU: 'HA-CIS-01',
    product_name:
      'Artisan Pre-Seasoned Cast Iron Skillet Set',
    forwarder_id: 'FWD-AGL',
    forwarder_name: 'Amazon Global Logistics (AGL)',
    route:
      'Shenzhen (Yantian) → Amazon AWD — US West Coast',
    service_type: 'Amazon Global Logistics (AGL)',
    completed_date: '2026-08-14',
    units: 3000,
    CBM: 21.0,
    gross_weight_kg: 7850,
    quoted_cost: 3450.0,
    actual_cost: 3450.0,
    variance_amount: 0.0,
    variance_pct: 0.0,
    quoted_transit_days: 20,
    actual_transit_days: 19,
    variance_reason:
      'Shipment completed within quoted logistics cost; actual transit was one day faster than quoted.',
  },
  {
    history_id: 'HIST-2026-088',
    shipment_id: 'SHP-2026-088',
    PO: 'HA-PO-8744',
    SKU: 'HA-WOK-14',
    product_name:
      'Hand-Hammered Carbon Steel Wok 14"',
    forwarder_id: 'FWD-PROLINE',
    forwarder_name:
      'Proline Freight Connect (Canada)',
    route:
      'Ningbo → Proline 3PL (Delta, BC) → Amazon YHM1',
    service_type: 'Ocean LCL',
    completed_date: '2026-07-28',
    units: 1500,
    CBM: 11.5,
    gross_weight_kg: 3100,
    quoted_cost: 2120.0,
    actual_cost: 2120.0,
    variance_amount: 0.0,
    variance_pct: 0.0,
    quoted_transit_days: 19,
    actual_transit_days: 18,
    variance_reason:
      'Shipment completed within quoted logistics cost and reached the Delta 3PL one day faster than quoted.',
  },
  {
    history_id: 'HIST-2026-079',
    shipment_id: 'SHP-2026-079',
    PO: 'HA-PO-8692',
    SKU: 'HA-CPK-02',
    product_name:
      'Ceramic Pour-Over Kettle & Carafe Set',
    forwarder_id: 'FWD-SSD',
    forwarder_name:
      'SSD Maritime & Logistics (UK)',
    route:
      'Shenzhen → SSD Logistix Midlands 3PL → Amazon UK',
    service_type: 'Ocean LCL',
    completed_date: '2026-06-19',
    units: 2000,
    CBM: 12.0,
    gross_weight_kg: 2300,
    quoted_cost: 2750.0,
    actual_cost: 2890.0,
    variance_amount: 140.0,
    variance_pct: 5.09,
    quoted_transit_days: 28,
    actual_transit_days: 30,
    variance_reason:
      'Southampton port congestion resulted in additional storage/accessorial charges and a two-day transit variance.',
  },
  {
    history_id: 'HIST-2026-071',
    shipment_id: 'SHP-2026-071',
    PO: 'HA-PO-8620',
    SKU: 'HA-CIS-01',
    product_name:
      'Artisan Pre-Seasoned Cast Iron Skillet Set',
    forwarder_id: 'FWD-01',
    forwarder_name: 'Apex Global Logistics',
    route:
      'Shenzhen → Los Angeles / Long Beach CFS → Amazon AWD',
    service_type: 'Ocean LCL',
    completed_date: '2026-05-30',
    units: 3200,
    CBM: 22.4,
    gross_weight_kg: 8400,
    quoted_cost: 4490.0,
    actual_cost: 4940.0,
    variance_amount: 450.0,
    variance_pct: 10.02,
    quoted_transit_days: 22,
    actual_transit_days: 26,
    variance_reason:
      'Long Beach chassis shortage resulted in additional drayage/waiting charges and a four-day transit variance.',
  },
];

export const INITIAL_RATE_CARDS: RateCard[] = [
  {
    card_id: 'RC-AGL-SZ-AWD',
    forwarder_id: 'FWD-AGL',
    route_name:
      'Shenzhen (Yantian) → Amazon AWD — US',
    service_type: 'Amazon Global Logistics (AGL)',
    currency: 'USD',
    rate: 110.0,
    unit: 'per_cbm',
    minimum_charge: 220.0,
    surcharges_note:
      'Seed rate. Confirm current AGL pricing, included services, and applicable accessorials through the Amazon booking workflow.',
    effective_date: '2026-09-01',
    expiration_date: '2026-11-30',
    notes:
      'HA seed rate for US inbound comparison. Use actual AGL booking data for operational decisions.',
  },
  {
    card_id: 'RC-PRO-NB-VAN',
    forwarder_id: 'FWD-PROLINE',
    route_name:
      'Ningbo → Proline Logistics Services (Delta / Vancouver, BC)',
    service_type: 'Ocean LCL',
    currency: 'USD',
    rate: 108.0,
    unit: 'per_cbm',
    minimum_charge: 216.0,
    surcharges_note:
      'Seed rate. Destination handling and Amazon Canada preparation charges shown separately in the comparison model.',
    effective_date: '2026-09-01',
    expiration_date: '2026-11-15',
    notes:
      'HA Canada logistics seed rate for inventory feeding Amazon Canada.',
  },
  {
    card_id: 'RC-SSD-SZ-SOU',
    forwarder_id: 'FWD-SSD',
    route_name:
      'Shenzhen → Southampton / SSD Logistix Midlands 3PL',
    service_type: 'Ocean LCL',
    currency: 'USD',
    rate: 125.0,
    unit: 'per_cbm',
    minimum_charge: 250.0,
    surcharges_note:
      'Seed rate. Customs, haulage, warehouse, and FBA preparation charges should be validated against the current quote.',
    effective_date: '2026-09-01',
    expiration_date: '2026-12-31',
    notes:
      'HA UK logistics seed rate for comparison and planning.',
  },
  {
    card_id: 'RC-APX-SZ-USWC',
    forwarder_id: 'FWD-01',
    route_name:
      'Shenzhen (Yantian) → Los Angeles / Long Beach CFS',
    service_type: 'Ocean LCL',
    currency: 'USD',
    rate: 115.0,
    unit: 'per_cbm',
    minimum_charge: 230.0,
    surcharges_note:
      'Seed rate. DTHC, documentation, CFS, free time, and destination delivery should be confirmed from the current quote.',
    effective_date: '2026-09-01',
    expiration_date: '2026-10-31',
    notes:
      'HA seed comparison lane for US West Coast alternative forwarding.',
  },
];
