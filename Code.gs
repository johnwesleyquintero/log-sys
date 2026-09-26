/**
 * Google Apps Script - Hungry Artisan Freight Quoting & Cost Service
 * Service Layer between Google Sheets (Operational DB) and React Decision Interface
 * Owner: Wesley Quintero (Hungry Artisan - Logistics Operations & Freight Manager)
 * Executive Leads: Justin Hopkins (CEO) & Wesley Quintero (Logistics Ops)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * Standard table schemas for all 8 operational sheets
 */
const OPERATIONAL_TABLES = {
  Shipments: {
    headers: [
      'shipment_id', 'data_source', 'region', 'primary_storage_hub', 'fulfillment_channels',
      'PO', 'SKU', 'ASIN', 'product_name', 'units', 'cartons', 'pallets',
      'gross_weight_kg', 'CBM', 'origin', 'destination', 'target_etd',
      'target_delivery_date', 'product_unit_fob_cost', 'status',
      'approval_status', 'selected_forwarder_id', 'approval_notes', 'approved_by'
    ]
  },
  Quotes: {
    headers: [
      'quote_id', 'data_source', 'forwarder_id', 'shipment_id', 'quote_reference', 'origin',
      'destination', 'quote_date', 'valid_until', 'currency', 'incoterm',
      'service_type', 'transit_days', 'free_time_days', 'service_assumptions', 'status'
    ]
  },
  QuoteComponents: {
    headers: [
      'component_id', 'data_source', 'quote_id', 'category', 'description', 'unit',
      'quantity', 'unit_rate', 'currency', 'amount_usd', 'is_included_in_quote', 'notes'
    ]
  },
  Forwarders: {
    headers: [
      'forwarder_id', 'data_source', 'name', 'contact_name', 'contact_email', 'contact_phone',
      'service_regions', 'active', 'payment_terms', 'avg_transit_accuracy', 'notes'
    ]
  },
  HistoricalCosts: {
    headers: [
      'history_id', 'data_source', 'shipment_id', 'PO', 'SKU', 'product_name', 'forwarder_id',
      'forwarder_name', 'route', 'service_type', 'completed_date', 'units', 'CBM',
      'gross_weight_kg', 'quoted_cost', 'actual_cost', 'variance_amount', 'variance_pct',
      'quoted_transit_days', 'actual_transit_days', 'variance_reason'
    ]
  },
  RateCards: {
    headers: [
      'card_id', 'data_source', 'forwarder_id', 'route_name', 'service_type', 'currency',
      'rate', 'unit', 'minimum_charge', 'surcharges_note', 'effective_date',
      'expiration_date', 'notes'
    ]
  },
  Assumptions: {
    headers: ['key', 'value', 'description']
  },
  AuditLog: {
    headers: ['timestamp', 'shipment_id', 'action', 'selected_forwarder_id', 'approval_status', 'approved_by', 'notes']
  }
};

/**
 * Automatically creates custom menu when the Google Sheet is opened
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚡ Hungry Artisan Logistics')
    .addItem('🚀 Setup All Operational Sheets & Tables', 'setupSheets')
    .addItem('📋 Setup / Reset Current Active Sheet', 'setupActiveSheet')
    .addItem('📥 Seed Full Operational Baseline Data', 'seedDefaultData')
    .addSeparator()
    .addItem('🔄 Refresh Audit Log', 'refreshAuditLog')
    .addToUi();
}

/**
 * Sets up a single operational sheet by name with formatted headers, styles, and frozen rows.
 * @param {string} [sheetName] - Name of the sheet to setup ('Shipments', 'Quotes', etc.)
 * @returns {string} Status message
 */
function setupSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!sheetName || typeof sheetName !== 'string') {
    const active = ss.getActiveSheet();
    const activeName = active ? active.getName() : '';
    if (activeName && OPERATIONAL_TABLES[activeName]) {
      return setupSingleSheet_(ss, activeName, OPERATIONAL_TABLES[activeName].headers);
    }
    return setupSheets();
  }

  const table = OPERATIONAL_TABLES[sheetName];
  if (!table) {
    const validNames = Object.keys(OPERATIONAL_TABLES).join(', ');
    throw new Error('Unknown sheet name "' + sheetName + '". Valid operational sheets: ' + validNames);
  }

  return setupSingleSheet_(ss, sheetName, table.headers);
}

/**
 * Sets up and formats whatever sheet tab the user currently has open
 */
function setupActiveSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const currentSheet = ss.getActiveSheet();
  const name = currentSheet ? currentSheet.getName() : '';
  
  if (!name || !OPERATIONAL_TABLES[name]) {
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      'Unknown Sheet Name',
      'Current sheet "' + name + '" is not a recognized operational table.\n\nValid tables are: ' + Object.keys(OPERATIONAL_TABLES).join(', ') + '\n\nRun "Setup All Operational Sheets & Tables" to generate them.',
      ui.ButtonSet.OK
    );
    return;
  }

  setupSingleSheet_(ss, name, OPERATIONAL_TABLES[name].headers);
  const ui = SpreadsheetApp.getUi();
  ui.alert('Sheet Configured', 'Sheet "' + name + '" has been formatted with operational schema.', ui.ButtonSet.OK);
}

/**
 * Internal helper to create/format a single sheet
 */
function setupSingleSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  // Ensure header row is populated
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (!currentHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  // Format header row: dark slate background (#0f172a), white bold text, freeze row 1
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#f8fafc');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }

  Logger.log('Sheet "' + name + '" configured with ' + headers.length + ' columns.');
  return 'SUCCESS: Sheet "' + name + '" configured.';
}

/**
 * Creates and formats all 8 operational sheets with frozen headers and column styling
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(OPERATIONAL_TABLES).forEach(function(name) {
    setupSingleSheet_(ss, name, OPERATIONAL_TABLES[name].headers);
  });

  // Seed default assumptions if empty
  const assumptionsSheet = ss.getSheetByName('Assumptions');
  if (assumptionsSheet && assumptionsSheet.getLastRow() <= 1) {
    assumptionsSheet.appendRow(['FX_USD_TO_CNY', '7.22', 'Baseline USD to RMB exchange rate']);
    assumptionsSheet.appendRow(['FX_USD_TO_CAD', '1.36', 'USD to Canadian Dollar exchange rate']);
    assumptionsSheet.appendRow(['FX_USD_TO_GBP', '0.77', 'USD to British Pound Sterling rate']);
    assumptionsSheet.appendRow(['DEFAULT_OCEAN_FREE_DAYS', '14', 'Standard demurrage free time days threshold']);
    assumptionsSheet.appendRow(['STANDARD_PALLET_CM', '120x100x160', 'Standard export pallet dimensions']);
    assumptionsSheet.appendRow(['AWD_MONTHLY_STORAGE_CUFT', '0.48', 'AWD monthly storage cost per cubic foot']);
    assumptionsSheet.appendRow(['FBA_AUTO_REPLENISHMENT_FEE', '0.00', 'Automatic AWD to FBA replenishment fee ($0)']);
  }

  // Remove default 'Sheet1' if present and other sheets exist
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch(e) {}
  }

  Logger.log('All 8 operational sheets successfully created and formatted.');
  return 'SUCCESS: All 8 operational sheets configured.';
}

/**
 * Seeds complete Hungry Artisan baseline data into all 8 Google Sheets
 */
function seedDefaultData() {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Forwarders
  const fwdSheet = ss.getSheetByName('Forwarders');
  if (fwdSheet && fwdSheet.getLastRow() <= 1) {
    const forwarders = [
      ['FWD-AGL', 'HA data', 'Amazon Global Logistics (AGL)', 'AGL Seller Support / Account Team', 'agl-support@amazon.com', '1-888-280-4331', 'China to US AWD, China to US FBA', true, 'Amazon Seller Central Billing', 96, 'Amazon-operated end-to-end logistics directly into AWD.'],
      ['FWD-01', 'demo data', 'Apex Global Logistics', 'David Chen', 'dchen@apexgl-freight.com', '', 'Shenzhen, Ningbo, US West Coast', true, 'Net 30 days from BL', '', 'Primary South China NVOCC with 14-day demurrage free time.'],
      ['FWD-02', 'demo data', 'TransPacific Freightways', 'Angela Wu', 'angela.wu@transpacific-fw.com', '', 'Ningbo, Qingdao, US Midwest (Rail)', true, 'Net 15 days upon port arrival', '', 'Specialist in IPI intermodal rail to Chicago & Dallas.'],
      ['FWD-03', 'demo data', 'SinoGlobal Express', 'Marcus Zhang', 'm.zhang@sinoglobal-logistics.cn', '', 'Shenzhen, Guangzhou, UK, Canada', true, 'Deposit 20%, balance Net 15', '', 'Agile LCL consolidation partner for smaller replenishment.'],
      ['FWD-PROLINE', 'HA data', 'Proline Freight Connect (Canada)', 'Bert Abedirad', 'info@prolinelogistics.ca', '(604) 500-2055', 'China to Vancouver 3PL, YHM1', true, 'Net 15 days', 95, 'Exclusive Canada 3PL partner in Delta BC for Amazon YHM1.'],
      ['FWD-SSD', 'HA data', 'SSD Maritime & Logistics (UK)', 'Matt Terry', 'office@ssdlogistix.com', '+44 1789 777 905', 'China to Southampton, UK FBA', true, 'Net 30 days', 97, 'Exclusive UK 3PL partner in Stratford-upon-Avon for Amazon UK.'],
      ['FWD-FLX', 'demo data', 'Flexport International', 'Sarah Jenkins', 'sjenkins@flexport.com', '', 'Global Transpacific & Transatlantic', true, 'Net 30 days', '', 'Digital freight forwarder benchmark with real-time GPS tracking.'],
      ['FWD-EXP', 'demo data', 'Expeditors International', 'Robert Vance', 'robert.vance@expeditors.com', '', 'Global Ocean & Air', true, 'Net 30 days', '', 'Tier-1 enterprise carrier with guaranteed peak season space allocation.']
    ];
    forwarders.forEach(function(row) { fwdSheet.appendRow(row); });
  }

  // 2. Shipments
  const shpSheet = ss.getSheetByName('Shipments');
  if (shpSheet && shpSheet.getLastRow() <= 1) {
    const shipments = [
      ['SHP-2026-104', 'HA data', 'US', 'Amazon Warehousing & Distribution (AWD)', 'Amazon FBA, Walmart WFS, TikTok FBT', 'HA-PO-8842', 'HA-CIS-01', 'B09X8842K', 'Artisan Pre-Seasoned Cast Iron Skillet Set 10" & 12"', 3200, 400, 16, 8400, 22.4, 'Shenzhen (Yantian Port)', 'Amazon AWD — US West Coast', '2026-10-15', '2026-11-12', 18.5, 'comparing', 'pending_justin', 'FWD-AGL', 'AGL baseline comparison ($1.11/unit landed cost). Justin Hopkins approval required.', ''],
      ['SHP-2026-108', 'HA data', 'CA', 'Proline Logistics Services (Canada 3PL Hub)', 'Amazon FBA Canada (YHM1)', 'HA-PO-8851', 'HA-WOK-14', 'B09Y7719P', 'Hand-Hammered Carbon Steel Wok 14" with Spruce Lid', 1600, 200, 8, 3300, 12.2, 'Ningbo Port (Beilun)', 'Proline Logistics Services — Delta / Vancouver, BC → Amazon Canada', '2026-10-25', '2026-11-24', 21.0, 'comparing', 'pending_wesley', 'FWD-PROLINE', 'Proline 3PL handles local Vancouver devanning and pallet prep for Amazon Canada YHM1 dispatch. Routed to Wesley Quintero for execution.', ''],
      ['SHP-2026-109', 'HA data', 'UK', 'SSD Logistix (UK 3PL Hub)', 'Amazon FBA UK', 'HA-PO-8862', 'HA-CPK-02', 'B09M4412W', 'Ceramic Pour-Over Kettle & Heat-Resistant Carafe Set', 2400, 240, 10, 2750, 14.5, 'Shenzhen (Shekou)', 'SSD Logistix — Stratford-upon-Avon / Midlands → Amazon UK', '2026-11-05', '2026-12-08', 14.8, 'comparing', 'pending_wesley', 'FWD-SSD', 'SSD Logistix coordinates Southampton drayage, UK VAT clearance, and timed CARP pallet delivery into Amazon UK.', ''],
      ['SHP-2026-105', 'demo data', 'US', 'Amazon Warehousing & Distribution (AWD)', 'Amazon FBA, Walmart WFS, TikTok FBT', 'HA-PO-8849', 'HA-WOK-14', 'B09Y7719P', 'Hand-Hammered Carbon Steel Wok 14" with Spruce Lid', 2400, 300, 12, 4950, 18.2, 'Ningbo Port (Beilun)', 'Amazon AWD — US Midwest distribution scenario', '2026-10-22', '2026-11-28', 21.0, 'comparing', 'pending_justin', 'FWD-02', 'TransPacific competing on IPI inland rail directly into Midwest AWD hub.', ''],
      ['SHP-2026-110', 'demo data', 'US', 'Amazon Warehousing & Distribution (AWD)', 'Amazon FBA, Walmart WFS, Shopify DTC', 'HA-PO-8875', 'HA-DOK-06', 'B0BG8812D', 'Artisan Enameled Cast Iron Dutch Oven 6-Qt with Brass Knob', 2000, 500, 20, 11200, 26.5, 'Yantian (Shenzhen)', 'Amazon AWD — US West Coast Hub', '2026-11-10', '2026-12-07', 28.5, 'comparing', 'pending_justin', 'FWD-AGL', 'Heavyweight flagship SKU. Direct AWD receiving eliminates chassis split surcharges.', ''],
      ['SHP-2026-111', 'demo data', 'US', 'Amazon Warehousing & Distribution (AWD)', 'Amazon FBA, TikTok FBT', 'HA-PO-8888', 'HA-KNV-08', 'B0BK9945X', 'Damascus Steel Chef Knife 8" with Pakkawood Handle', 1800, 150, 6, 1250, 5.8, 'Shanghai Port (Yangshan)', 'Amazon AWD — US West Coast', '2026-11-15', '2026-12-05', 24.0, 'comparing', 'pending_wesley', 'FWD-01', 'High-margin priority shipment routed on 18-day fast boat.', ''],
      ['SHP-2026-112', 'demo data', 'CA', 'Proline Logistics Services (Canada 3PL Hub)', 'Amazon FBA Canada (YHM1)', 'HA-PO-8893', 'HA-PZZ-12', 'B0BP5521C', 'Cordierite Ceramic Pizza Stone & Perforated Peel Set', 1500, 250, 10, 4200, 15.0, 'Ningbo Port', 'Proline 3PL (Delta, BC) → Amazon Canada', '2026-11-01', '2026-11-29', 16.2, 'quoting', 'not_submitted', '', '', '']
    ];
    shipments.forEach(function(row) { shpSheet.appendRow(row); });
  }

  // 3. Quotes
  const qSheet = ss.getSheetByName('Quotes');
  if (qSheet && qSheet.getLastRow() <= 1) {
    const quotes = [
      ['Q-104-AGL', 'HA data', 'FWD-AGL', 'SHP-2026-104', 'AGL-AWD-SZ-9041', 'Shenzhen (Yantian)', 'Amazon AWD — US West Coast', '2026-09-22', '2026-10-15', 'USD', 'FOB', 'Amazon Global Logistics (AGL)', 20, 21, 'Direct AGL into AWD with Seller Central deduction.', 'active'],
      ['Q-104-APX', 'demo data', 'FWD-01', 'SHP-2026-104', 'APX-SZ-2026-9041', 'Shenzhen (Yantian)', 'Amazon AWD — US West Coast', '2026-09-20', '2026-10-10', 'USD', 'FOB', 'Ocean LCL Premium', 22, 14, 'FOB Yantian CFS to AWD door. 14 days free time.', 'active'],
      ['Q-104-TPF', 'demo data', 'FWD-02', 'SHP-2026-104', 'TPF-SZ-USWC-441', 'Shenzhen (Yantian)', 'Amazon AWD — US West Coast', '2026-09-19', '2026-10-05', 'USD', 'FOB', 'Ocean LCL Standard', 25, 10, 'Standard LCL service with 10 days free demurrage.', 'active'],
      ['Q-108-PRO', 'HA data', 'FWD-PROLINE', 'SHP-2026-108', 'PRO-CA-NB-2026-108', 'Ningbo Port (Beilun)', 'Proline Logistics Services — Delta / Vancouver, BC', '2026-09-22', '2026-10-20', 'USD', 'FOB', 'Integrated Ocean + 3PL', 19, 14, 'Integrated ocean, CBSA clearance, and 3PL carton handling.', 'active'],
      ['Q-108-SNO', 'demo data', 'FWD-03', 'SHP-2026-108', 'SNO-CA-2026-88', 'Ningbo Port (Beilun)', 'Vancouver Port CFS', '2026-09-21', '2026-10-15', 'USD', 'FOB', 'Ocean LCL Port-to-CFS', 21, 7, 'Port-to-CFS only; local 3PL delivery billed separately.', 'active'],
      ['Q-109-SSD', 'HA data', 'FWD-SSD', 'SHP-2026-109', 'SSD-UK-SZ-2026-109', 'Shenzhen (Shekou)', 'SSD Logistix — Stratford-upon-Avon / Midlands Hub', '2026-09-23', '2026-10-25', 'USD', 'FOB', 'Direct UK Ocean LCL + 3PL Prep', 28, 14, 'All-in ocean, HMRC clearance, and 3PL Amazon pallet staging.', 'active'],
      ['Q-109-SNO', 'demo data', 'FWD-03', 'SHP-2026-109', 'SNO-UK-2026-401', 'Shenzhen (Shekou)', 'Felixstowe Port CFS', '2026-09-20', '2026-10-15', 'USD', 'FOB', 'Ocean LCL via Felixstowe', 32, 10, 'Arrival via Felixstowe; inland haulage billed upon arrival.', 'active'],
      ['Q-105-TPF', 'demo data', 'FWD-02', 'SHP-2026-105', 'TPF-NB-ORD-2026-105', 'Ningbo Port (Beilun)', 'Amazon AWD — US Midwest distribution scenario', '2026-09-22', '2026-10-18', 'USD', 'FOB', 'Ocean IPI Intermodal Rail', 27, 14, 'BNSF rail to Chicago Corwith ramp and AWD cartage.', 'active'],
      ['Q-105-AGL', 'demo data', 'FWD-AGL', 'SHP-2026-105', 'AGL-NB-MW-2026-105', 'Ningbo Port (Beilun)', 'Amazon AWD — US Midwest distribution scenario', '2026-09-21', '2026-10-15', 'USD', 'FOB', 'Amazon Global Logistics (AGL)', 24, 21, 'AGL direct AWD Midwest booking.', 'active'],
      ['Q-110-AGL', 'demo data', 'FWD-AGL', 'SHP-2026-110', 'AGL-AWD-SZ-9110', 'Yantian (Shenzhen)', 'Amazon AWD — US West Coast Hub', '2026-09-24', '2026-10-25', 'USD', 'FOB', 'Amazon Global Logistics (AGL)', 20, 21, 'Zero detention fee structure inside AWD facilities.', 'active'],
      ['Q-110-FLX', 'demo data', 'FWD-FLX', 'SHP-2026-110', 'FLX-SZ-LA-9110', 'Yantian (Shenzhen)', 'Amazon AWD — US West Coast Hub', '2026-09-23', '2026-10-20', 'USD', 'FOB', 'Digital Ocean Freight LCL', 19, 14, 'Digital portal tracking and dedicated LA drayage partner.', 'active'],
      ['Q-111-APX', 'demo data', 'FWD-01', 'SHP-2026-111', 'APX-SH-LA-2026-111', 'Shanghai Port (Yangshan)', 'Amazon AWD — US West Coast', '2026-09-24', '2026-10-25', 'USD', 'FOB', 'Expedited Ocean LCL', 18, 14, '18-day fast boat with priority wheels-up customs release.', 'active']
    ];
    quotes.forEach(function(row) { qSheet.appendRow(row); });
  }

  // 4. QuoteComponents
  const qcSheet = ss.getSheetByName('QuoteComponents');
  if (qcSheet && qcSheet.getLastRow() <= 1) {
    const components = [
      ['QC-104-AGL-1', 'HA data', 'Q-104-AGL', 'freight', 'AGL Ocean Freight (22.4 CBM @ $110/CBM)', 'per_cbm', 22.4, 110.0, 'USD', 2464.0, true, ''],
      ['QC-104-AGL-2', 'HA data', 'Q-104-AGL', 'origin', 'Origin CFS Receiving & Export Documentation', 'flat', 1, 165.0, 'USD', 165.0, true, ''],
      ['QC-104-AGL-3', 'HA data', 'Q-104-AGL', 'customs', 'US Customs Entry & Automated ISF Filing', 'flat', 1, 135.0, 'USD', 135.0, true, ''],
      ['QC-104-AGL-4', 'HA data', 'Q-104-AGL', 'destination', 'Direct AWD Inbound Yard Drayage & Unloading', 'flat', 1, 680.0, 'USD', 680.0, true, ''],
      ['QC-104-AGL-5', 'HA data', 'Q-104-AGL', 'surcharge', 'Clean Truck & Harbor Maintenance Fee (HMF)', 'flat', 1, 95.0, 'USD', 95.0, true, ''],
      ['QC-104-APX-1', 'demo data', 'Q-104-APX', 'freight', 'Ocean Freight LCL (22.4 CBM @ $115/CBM)', 'per_cbm', 22.4, 115.0, 'USD', 2576.0, true, ''],
      ['QC-104-APX-2', 'demo data', 'Q-104-APX', 'origin', 'Yantian Origin Terminal Handling (OTHC)', 'flat', 1, 195.0, 'USD', 195.0, true, ''],
      ['QC-104-APX-3', 'demo data', 'Q-104-APX', 'customs', 'US Customs Clearance & Single Entry Bond', 'flat', 1, 150.0, 'USD', 150.0, true, ''],
      ['QC-104-APX-4', 'demo data', 'Q-104-APX', 'destination', 'LA/LB Destination Terminal Handling & Deconsolidation', 'per_cbm', 22.4, 28.0, 'USD', 627.2, true, ''],
      ['QC-104-APX-5', 'demo data', 'Q-104-APX', 'destination', 'Dedicated AWD Drayage & Appointment Slot Delivery', 'flat', 1, 750.0, 'USD', 750.0, true, ''],
      ['QC-104-APX-6', 'demo data', 'Q-104-APX', 'surcharge', 'PierPass TMF & Clean Truck Surcharge', 'flat', 1, 110.0, 'USD', 110.0, true, ''],
      ['QC-108-PRO-1', 'HA data', 'Q-108-PRO', 'freight', 'Ocean Freight Ningbo to Vancouver (12.2 CBM @ $108/CBM)', 'per_cbm', 12.2, 108.0, 'USD', 1317.6, true, ''],
      ['QC-108-PRO-2', 'HA data', 'Q-108-PRO', 'origin', 'Ningbo Port Handling & Documentation', 'flat', 1, 140.0, 'USD', 140.0, true, ''],
      ['QC-108-PRO-3', 'HA data', 'Q-108-PRO', 'customs', 'Canada Customs CBSA Clearance & B3 Filing', 'flat', 1, 135.0, 'USD', 135.0, true, ''],
      ['QC-108-PRO-4', 'HA data', 'Q-108-PRO', 'destination', 'Vancouver Port Drayage to Delta 3PL Hub', 'flat', 1, 340.0, 'USD', 340.0, true, ''],
      ['QC-108-PRO-5', 'HA data', 'Q-108-PRO', 'destination', '3PL De-stuffing, Palletizing & FNSKU Quality Audit', 'flat', 1, 280.0, 'USD', 280.0, true, ''],
      ['QC-109-SSD-1', 'HA data', 'Q-109-SSD', 'freight', 'Ocean Freight Shenzhen to Southampton (14.5 CBM @ $125/CBM)', 'per_cbm', 14.5, 125.0, 'USD', 1812.5, true, ''],
      ['QC-109-SSD-2', 'HA data', 'Q-109-SSD', 'origin', 'Shekou CFS & Export Documentation', 'flat', 1, 175.0, 'USD', 175.0, true, ''],
      ['QC-109-SSD-3', 'HA data', 'Q-109-SSD', 'customs', 'UK HMRC CDS Import Declaration & Deferment Fee', 'flat', 1, 160.0, 'USD', 160.0, true, ''],
      ['QC-109-SSD-4', 'HA data', 'Q-109-SSD', 'destination', 'Southampton Quay to Midlands 3PL Haulage', 'flat', 1, 480.0, 'USD', 480.0, true, ''],
      ['QC-109-SSD-5', 'HA data', 'Q-109-SSD', 'destination', '3PL Devanning & Amazon UK Pallet Configuration', 'flat', 1, 260.0, 'USD', 260.0, true, '']
    ];
    components.forEach(function(row) { qcSheet.appendRow(row); });
  }

  // 5. HistoricalCosts
  const histSheet = ss.getSheetByName('HistoricalCosts');
  if (histSheet && histSheet.getLastRow() <= 1) {
    const historical = [
      ['HIST-2026-092', 'HA data', 'SHP-2026-092', 'HA-PO-8790', 'HA-CIS-01', 'Artisan Pre-Seasoned Cast Iron Skillet Set', 'FWD-AGL', 'Amazon Global Logistics (AGL)', 'Shenzhen (Yantian) → Amazon AWD — US West Coast', 'Amazon Global Logistics (AGL)', '2026-08-14', 3000, 21.0, 7850, 3450.0, 3450.0, 0.0, 0.0, 20, 19, 'Shipment completed within budget; transit was 1 day faster than quoted.'],
      ['HIST-2026-088', 'HA data', 'SHP-2026-088', 'HA-PO-8744', 'HA-WOK-14', 'Hand-Hammered Carbon Steel Wok 14"', 'FWD-PROLINE', 'Proline Freight Connect (Canada)', 'Ningbo → Proline 3PL (Delta, BC) → Amazon YHM1', 'Ocean LCL', '2026-07-28', 1500, 11.5, 3100, 2120.0, 2120.0, 0.0, 0.0, 19, 18, 'Arrived at Delta 3PL warehouse 1 day ahead of schedule.'],
      ['HIST-2026-079', 'HA data', 'SHP-2026-079', 'HA-PO-8692', 'HA-CPK-02', 'Ceramic Pour-Over Kettle & Carafe Set', 'FWD-SSD', 'SSD Maritime & Logistics (UK)', 'Shenzhen → SSD Logistix Midlands 3PL → Amazon UK', 'Ocean LCL', '2026-06-19', 2000, 12.0, 2300, 2750.0, 2890.0, 140.0, 5.09, 28, 30, 'Southampton port congestion resulted in 2-day dwell time and additional terminal accessorial fees.'],
      ['HIST-2026-071', 'demo data', 'SHP-2026-071', 'HA-PO-8620', 'HA-CIS-01', 'Artisan Pre-Seasoned Cast Iron Skillet Set', 'FWD-01', 'Apex Global Logistics', 'Shenzhen → Los Angeles / Long Beach CFS → Amazon AWD', 'Ocean LCL', '2026-05-30', 3200, 22.4, 8400, 4490.0, 4940.0, 450.0, 10.02, 22, 26, 'Long Beach port chassis shortage triggered tri-axle split drayage surcharge ($450) and a 4-day wait.'],
      ['HIST-2026-065', 'HA data', 'SHP-2026-065', 'HA-PO-8588', 'HA-DOK-06', 'Artisan Enameled Cast Iron Dutch Oven 6-Qt', 'FWD-AGL', 'Amazon Global Logistics (AGL)', 'Yantian → Amazon AWD — US West Coast Hub', 'Amazon Global Logistics (AGL)', '2026-04-20', 1800, 24.0, 10100, 3200.0, 3200.0, 0.0, 0.0, 20, 20, 'Executed on budget on time. Multi-channel outbound to Walmart WFS initiated within 48 hours.'],
      ['HIST-2026-054', 'demo data', 'SHP-2026-054', 'HA-PO-8512', 'HA-WOK-14', 'Hand-Hammered Carbon Steel Wok 14"', 'FWD-02', 'TransPacific Freightways', 'Ningbo → Chicago Rail Ramp → Midwest AWD Hub', 'Ocean IPI Intermodal Rail', '2026-03-15', 2200, 16.5, 4500, 4100.0, 4350.0, 250.0, 6.1, 26, 29, 'Rail interchange bottleneck in Kansas City added 3 days and destination storage fee.'],
      ['HIST-2026-042', 'demo data', 'SHP-2026-042', 'HA-PO-8440', 'HA-KNV-08', 'Damascus Steel Chef Knife 8"', 'FWD-01', 'Apex Global Logistics', 'Shanghai (Yangshan) → Los Angeles CFS → Amazon AWD', 'Expedited Ocean LCL', '2026-02-18', 1500, 4.8, 1050, 1450.0, 1570.0, 120.0, 8.28, 18, 19, 'US Customs Intensive Exam hold at Long Beach port incurred $120 inspection fee.'],
      ['HIST-2026-031', 'HA data', 'SHP-2026-031', 'HA-PO-8390', 'HA-PZZ-12', 'Cordierite Ceramic Pizza Stone & Peel Set', 'FWD-PROLINE', 'Proline Freight Connect (Canada)', 'Ningbo → Proline 3PL (Delta, BC) → Amazon YHM1', 'Ocean LCL', '2026-01-22', 1200, 12.0, 3360, 1980.0, 1980.0, 0.0, 0.0, 19, 19, 'Perfect execution. Palletized and shrink-wrapped at Proline Delta facility with Amazon compliance.']
    ];
    historical.forEach(function(row) { histSheet.appendRow(row); });
  }

  // 6. RateCards
  const rcSheet = ss.getSheetByName('RateCards');
  if (rcSheet && rcSheet.getLastRow() <= 1) {
    const rateCards = [
      ['RC-AGL-SZ-AWD', 'HA data', 'FWD-AGL', 'Shenzhen (Yantian) → Amazon AWD — US West Coast', 'Amazon Global Logistics (AGL)', 'USD', 110.0, 'per_cbm', 220.0, 'Contracted base ocean rate. Includes direct AWD check-in.', '2026-09-01', '2026-11-30', 'Primary US West Coast baseline lane.'],
      ['RC-PRO-NB-VAN', 'HA data', 'FWD-PROLINE', 'Ningbo → Proline Logistics Services (Delta / Vancouver, BC)', 'Integrated Ocean + 3PL', 'USD', 108.0, 'per_cbm', 216.0, 'Integrated rate with CBSA clearance and 3PL staging.', '2026-09-01', '2026-11-15', 'Canada supply chain partner rate for Amazon YHM1.'],
      ['RC-SSD-SZ-SOU', 'HA data', 'FWD-SSD', 'Shenzhen → Southampton / SSD Logistix Midlands 3PL', 'Direct UK Ocean LCL + 3PL Prep', 'USD', 125.0, 'per_cbm', 250.0, 'Includes HMRC clearance and haulage to Stratford-upon-Avon.', '2026-09-01', '2026-12-31', 'Primary UK supply chain lane.'],
      ['RC-APX-SZ-USWC', 'demo data', 'FWD-01', 'Shenzhen (Yantian) → Los Angeles / Long Beach CFS', 'Ocean LCL Premium', 'USD', 115.0, 'per_cbm', 230.0, '14 days demurrage free time guaranteed at destination terminal.', '2026-09-01', '2026-10-31', 'Competitive alternative to AGL for US West Coast.'],
      ['RC-TPF-NB-ORD', 'demo data', 'FWD-02', 'Ningbo → Chicago Corwith Rail Ramp (IPI Intermodal)', 'Ocean IPI Intermodal Rail', 'USD', 112.0, 'per_cbm', 224.0, 'Base ocean rate. BNSF inland rail transit to Chicago.', '2026-09-01', '2026-11-30', 'Cost-effective routing for Midwest AWD stocking.'],
      ['RC-FLX-SZ-LA', 'demo data', 'FWD-FLX', 'Shenzhen (Yantian) → Los Angeles / Long Beach CFS', 'Digital Ocean Freight LCL', 'USD', 114.0, 'per_cbm', 228.0, 'Includes API tracking webhooks and automated ISF.', '2026-09-01', '2026-12-31', 'Digital forwarder benchmark lane.']
    ];
    rateCards.forEach(function(row) { rcSheet.appendRow(row); });
  }

  // 7. AuditLog initial entry
  const auditSheet = ss.getSheetByName('AuditLog');
  if (auditSheet && auditSheet.getLastRow() <= 1) {
    auditSheet.appendRow([
      new Date().toISOString(),
      'ALL_RECORDS',
      'INITIAL_BASELINE_SEEDED',
      'SYSTEM',
      'operational',
      'Wesley Quintero',
      'Full Hungry Artisan global baseline dataset seeded across all 8 operational sheets.'
    ]);
  }

  const ui = SpreadsheetApp.getUi();
  if (ui) {
    ui.alert('Baseline Data Seeded', 'All 8 operational sheets have been populated with baseline Hungry Artisan freight records!', ui.ButtonSet.OK);
  }
  return 'SUCCESS: Full operational baseline data seeded.';
}

/**
 * Synchronizes an export bundle from the React app directly into the 8 operational sheets
 */
function syncAllData_(ss, bundle) {
  if (!bundle) return;

  // Sync Shipments
  if (bundle.shipments && bundle.shipments.length > 0) {
    const sheet = ss.getSheetByName('Shipments') || ss.insertSheet('Shipments');
    setupSingleSheet_(ss, 'Shipments', OPERATIONAL_TABLES.Shipments.headers);
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    bundle.shipments.forEach(function(s) {
      sheet.appendRow([
        s.shipment_id || '',
        s.data_source || '',
        s.region || '',
        s.primary_storage_hub || '',
        Array.isArray(s.fulfillment_channels) ? s.fulfillment_channels.join(', ') : (s.fulfillment_channels || ''),
        s.PO || '',
        s.SKU || '',
        s.ASIN || '',
        s.product_name || '',
        s.units || 0,
        s.cartons || 0,
        s.pallets || 0,
        s.gross_weight_kg || 0,
        s.CBM || 0,
        s.origin || '',
        s.destination || '',
        s.target_etd || '',
        s.target_delivery_date || '',
        s.product_unit_fob_cost || 0,
        s.status || '',
        s.approval_status || '',
        s.selected_forwarder_id || '',
        s.approval_notes || '',
        s.approved_by || ''
      ]);
    });
  }

  // Sync Forwarders
  if (bundle.forwarders && bundle.forwarders.length > 0) {
    const sheet = ss.getSheetByName('Forwarders') || ss.insertSheet('Forwarders');
    setupSingleSheet_(ss, 'Forwarders', OPERATIONAL_TABLES.Forwarders.headers);
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    bundle.forwarders.forEach(function(f) {
      sheet.appendRow([
        f.forwarder_id || '',
        f.data_source || '',
        f.name || '',
        f.contact_name || '',
        f.contact_email || '',
        f.contact_phone || '',
        Array.isArray(f.service_regions) ? f.service_regions.join(', ') : (f.service_regions || ''),
        f.active !== undefined ? f.active : true,
        f.payment_terms || '',
        f.avg_transit_accuracy || '',
        f.notes || ''
      ]);
    });
  }

  // Sync Quotes & QuoteComponents
  if (bundle.quotes && bundle.quotes.length > 0) {
    const qSheet = ss.getSheetByName('Quotes') || ss.insertSheet('Quotes');
    setupSingleSheet_(ss, 'Quotes', OPERATIONAL_TABLES.Quotes.headers);
    if (qSheet.getLastRow() > 1) {
      qSheet.getRange(2, 1, qSheet.getLastRow() - 1, qSheet.getLastColumn()).clearContent();
    }

    const qcSheet = ss.getSheetByName('QuoteComponents') || ss.insertSheet('QuoteComponents');
    setupSingleSheet_(ss, 'QuoteComponents', OPERATIONAL_TABLES.QuoteComponents.headers);
    if (qcSheet.getLastRow() > 1) {
      qcSheet.getRange(2, 1, qcSheet.getLastRow() - 1, qcSheet.getLastColumn()).clearContent();
    }

    bundle.quotes.forEach(function(q) {
      qSheet.appendRow([
        q.quote_id || '',
        q.data_source || '',
        q.forwarder_id || '',
        q.shipment_id || '',
        q.quote_reference || '',
        q.origin || '',
        q.destination || '',
        q.quote_date || '',
        q.valid_until || '',
        q.currency || 'USD',
        q.incoterm || 'FOB',
        q.service_type || '',
        q.transit_days || 0,
        q.free_time_days || 14,
        q.service_assumptions || '',
        q.status || 'active'
      ]);

      if (q.components && q.components.length > 0) {
        q.components.forEach(function(c) {
          qcSheet.appendRow([
            c.component_id || '',
            c.data_source || q.data_source || '',
            q.quote_id || '',
            c.category || '',
            c.description || '',
            c.unit || '',
            c.quantity || 0,
            c.unit_rate || 0,
            c.currency || 'USD',
            c.amount_usd || 0,
            c.is_included_in_quote !== undefined ? c.is_included_in_quote : true,
            c.notes || ''
          ]);
        });
      }
    });
  }

  // Sync Rate Cards
  if (bundle.rate_cards && bundle.rate_cards.length > 0) {
    const sheet = ss.getSheetByName('RateCards') || ss.insertSheet('RateCards');
    setupSingleSheet_(ss, 'RateCards', OPERATIONAL_TABLES.RateCards.headers);
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
    }
    bundle.rate_cards.forEach(function(rc) {
      sheet.appendRow([
        rc.card_id || '',
        rc.data_source || '',
        rc.forwarder_id || '',
        rc.route_name || '',
        rc.service_type || '',
        rc.currency || 'USD',
        rc.rate || 0,
        rc.unit || 'per_cbm',
        rc.minimum_charge || 0,
        rc.surcharges_note || '',
        rc.effective_date || '',
        rc.expiration_date || '',
        rc.notes || ''
      ]);
    });
  }

  // Log in AuditLog
  const auditSheet = ss.getSheetByName('AuditLog') || ss.insertSheet('AuditLog');
  auditSheet.appendRow([
    new Date().toISOString(),
    'ALL_TABLES',
    'FULL_APP_SYNC_RECEIVED',
    'REACT_CLIENT',
    'synced',
    'Wesley Quintero',
    'Full bidirectional sync received: ' + (bundle.shipments ? bundle.shipments.length : 0) + ' shipments, ' + (bundle.quotes ? bundle.quotes.length : 0) + ' quotes written to Google Sheets.'
  ]);
}

/**
 * Refreshes audit log view
 */
function refreshAuditLog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AuditLog');
  if (sheet) {
    sheet.autoResizeColumns(1, 7);
  }
}

/**
 * Web App GET endpoint: reads and returns all operational data to React
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = {
      forwarders: getSheetData(ss, 'Forwarders'),
      shipments: getSheetData(ss, 'Shipments'),
      quotes: getSheetData(ss, 'Quotes'),
      quote_components: getSheetData(ss, 'QuoteComponents'),
      historical_costs: getSheetData(ss, 'HistoricalCosts'),
      rate_cards: getSheetData(ss, 'RateCards'),
      fx_rates: { USD_TO_CNY: 7.22, USD_TO_CAD: 1.36, USD_TO_GBP: 0.77 },
      synced_at: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web App POST endpoint: handles sync, setup, decisions, and approvals
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'SETUP_SHEETS' || action === 'SETUP_SHEET') {
      if (payload.sheet_name) {
        setupSheet(payload.sheet_name);
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Operational sheet "' + payload.sheet_name + '" created and formatted successfully.'
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        setupSheets();
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'All 8 operational sheets created and formatted successfully.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === 'SEED_BASELINE') {
      seedDefaultData();
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Full operational baseline dataset written to all 8 sheets in Google Sheets!'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'SYNC_ALL') {
      const bundle = payload.payload || payload;
      syncAllData_(ss, bundle);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'All operational records successfully written and synchronized into Google Sheets.',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'SAVE_DECISION') {
      const auditSheet = ss.getSheetByName('AuditLog') || ss.insertSheet('AuditLog');
      auditSheet.appendRow([
        new Date().toISOString(),
        payload.shipment_id,
        'HUMAN_APPROVAL_RECORDED',
        payload.selected_forwarder_id,
        payload.approval_status,
        payload.approved_by || 'Wesley Quintero',
        payload.approval_notes || ''
      ]);
      
      updateShipmentStatus(ss, payload.shipment_id, payload.approval_status, payload.selected_forwarder_id);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Operational database updated successfully',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
}

function updateShipmentStatus(ss, shipmentId, status, forwarderId) {
  const sheet = ss.getSheetByName('Shipments');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === shipmentId) {
      sheet.getRange(i + 1, 20).setValue(status); // approval_status column
      sheet.getRange(i + 1, 21).setValue(forwarderId); // selected_forwarder_id column
      break;
    }
  }
}
