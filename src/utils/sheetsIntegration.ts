import { Forwarder, Shipment, Quote, HistoricalShipment, RateCard } from '../types';

export const APPS_SCRIPT_SAMPLE_CODE = `/**
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
      'shipment_id', 'region', 'primary_storage_hub', 'fulfillment_channels',
      'PO', 'SKU', 'ASIN', 'product_name', 'units', 'cartons', 'pallets',
      'gross_weight_kg', 'CBM', 'origin', 'destination', 'target_etd',
      'target_delivery_date', 'product_unit_fob_cost', 'status',
      'approval_status', 'selected_forwarder_id', 'approval_notes', 'approved_by'
    ]
  },
  Quotes: {
    headers: [
      'quote_id', 'forwarder_id', 'shipment_id', 'quote_reference', 'origin',
      'destination', 'quote_date', 'valid_until', 'currency', 'incoterm',
      'service_type', 'transit_days', 'free_time_days', 'service_assumptions', 'status'
    ]
  },
  QuoteComponents: {
    headers: [
      'component_id', 'quote_id', 'category', 'description', 'unit',
      'quantity', 'unit_rate', 'currency', 'amount_usd', 'is_included_in_quote', 'notes'
    ]
  },
  Forwarders: {
    headers: [
      'forwarder_id', 'name', 'contact_name', 'contact_email', 'contact_phone',
      'service_regions', 'active', 'payment_terms', 'avg_transit_accuracy', 'notes'
    ]
  },
  HistoricalCosts: {
    headers: [
      'history_id', 'shipment_id', 'PO', 'SKU', 'product_name', 'forwarder_id',
      'forwarder_name', 'route', 'service_type', 'completed_date', 'units', 'CBM',
      'gross_weight_kg', 'quoted_cost', 'actual_cost', 'variance_amount', 'variance_pct',
      'quoted_transit_days', 'actual_transit_days', 'variance_reason'
    ]
  },
  RateCards: {
    headers: [
      'card_id', 'forwarder_id', 'route_name', 'service_type', 'currency',
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
    .addItem('📥 Seed Default Baseline Data', 'seedDefaultData')
    .addToUi();
}

/**
 * Sets up a single operational sheet by name with formatted headers, styles, and frozen rows.
 * If called without arguments (e.g. run directly from the Apps Script editor),
 * it detects the active sheet or initializes all operational sheets.
 * 
 * @param {string} [sheetName] - Name of the sheet to setup ('Shipments', 'Quotes', etc.)
 * @returns {string} Status message
 */
function setupSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // If no sheetName provided, check if the current active sheet is recognized
  if (!sheetName || typeof sheetName !== 'string') {
    const active = ss.getActiveSheet();
    const activeName = active ? active.getName() : '';
    if (activeName && OPERATIONAL_TABLES[activeName]) {
      return setupSingleSheet_(ss, activeName, OPERATIONAL_TABLES[activeName].headers);
    }
    // If not recognized or no specific active sheet, run full setup
    return setupSheets();
  }

  // Lookup sheet definition
  const table = OPERATIONAL_TABLES[sheetName];
  if (!table) {
    const validNames = Object.keys(OPERATIONAL_TABLES).join(', ');
    throw new Error(\`Unknown sheet name "\${sheetName}". Valid operational sheets: \${validNames}\`);
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
      \`Current sheet "\${name}" is not a recognized operational table.\\n\\nValid tables are: \${Object.keys(OPERATIONAL_TABLES).join(', ')}\\n\\nRun "Setup All Operational Sheets & Tables" to generate them.\`,
      ui.ButtonSet.OK
    );
    return;
  }

  setupSingleSheet_(ss, name, OPERATIONAL_TABLES[name].headers);
  const ui = SpreadsheetApp.getUi();
  ui.alert('Sheet Configured', \`Sheet "\${name}" has been formatted with operational schema.\`, ui.ButtonSet.OK);
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

  // Format header row: dark slate background, white bold text, freeze row 1
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0f172a');
  headerRange.setFontColor('#f8fafc');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Auto-resize columns to fit headers comfortably
  for (let c = 1; c <= headers.length; c++) {
    sheet.autoResizeColumn(c);
  }

  Logger.log(\`Sheet "\${name}" configured with \${headers.length} columns.\`);
  return \`SUCCESS: Sheet "\${name}" configured.\`;
}

/**
 * Creates and formats all 8 operational sheets with frozen headers and column styling
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(OPERATIONAL_TABLES).forEach(name => {
    setupSingleSheet_(ss, name, OPERATIONAL_TABLES[name].headers);
  });

  // Seed default assumptions if empty
  const assumptionsSheet = ss.getSheetByName('Assumptions');
  if (assumptionsSheet && assumptionsSheet.getLastRow() <= 1) {
    assumptionsSheet.appendRow(['FX_USD_TO_CNY', '7.18', 'Baseline USD to RMB exchange rate']);
    assumptionsSheet.appendRow(['DEFAULT_OCEAN_FREE_DAYS', '14', 'Standard demurrage free time days']);
    assumptionsSheet.appendRow(['STANDARD_PALLET_CM', '120x100x160', 'Standard export wooden pallet dimensions']);
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
 * Seeds initial baseline records for testing and operations
 */
function seedDefaultData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Forwarders
  const fwdSheet = ss.getSheetByName('Forwarders');
  if (fwdSheet && fwdSheet.getLastRow() <= 1) {
    fwdSheet.appendRow(['FWD-AGL', 'Amazon Global Logistics (AGL)', 'AGL Seller Support', 'agl-support@amazon.com', '+1 888 280 4331', 'China to US AWD Direct, FBA', true, 'Deducted from Seller Central', 96, 'Direct injection into AWD.']);
    fwdSheet.appendRow(['FWD-01', 'Apex Global Logistics', 'David Chen', 'dchen@apexgl-freight.com', '+86 755 8829 4410', 'Shenzhen, Ningbo, US West Coast', true, 'Net 30 days', 94, 'Primary LCL forwarder for South China.']);
    fwdSheet.appendRow(['FWD-PROLINE', 'Proline Freight Connect (Canada)', 'Bert Abedirad', 'info@prolinelogistics.ca', '(604) 500-2055', 'China to Vancouver 3PL, YHM1', true, 'Net 15 days', 95, 'Canada 3PL hub in Delta, BC.']);
    fwdSheet.appendRow(['FWD-SSD', 'SSD Maritime & Logistics (UK)', 'Matt Terry', 'office@ssdlogistix.com', '01789 777 905', 'China to Southampton, UK FBA', true, 'Net 30 days', 97, 'UK 3PL hub in Stratford-upon-Avon.']);
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
      fx_rates: { USD_TO_CNY: 7.18 },
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
    
    if (action === 'SAVE_DECISION') {
      const auditSheet = ss.getSheetByName('AuditLog') || ss.insertSheet('AuditLog');
      auditSheet.appendRow([
        new Date().toISOString(),
        payload.shipment_id,
        'HUMAN_APPROVAL_RECORDED',
        payload.selected_forwarder_id,
        payload.approval_status,
        payload.approved_by || 'Justin Hopkins',
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
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
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
`;

export interface GoogleSheetsExportBundle {
  exported_at: string;
  forwarders: Forwarder[];
  shipments: Shipment[];
  quotes: Quote[];
  historical_shipments: HistoricalShipment[];
  rate_cards: RateCard[];
  assumptions: {
    fx_rate_usd_to_cny: number;
    default_ocean_free_time_days: number;
    standard_pallet_dimensions_cm: string;
  };
}

export function generateExportBundle(
  forwarders: Forwarder[],
  shipments: Shipment[],
  quotes: Quote[],
  historical_shipments: HistoricalShipment[],
  rate_cards: RateCard[],
): GoogleSheetsExportBundle {
  return {
    exported_at: new Date().toISOString(),
    forwarders,
    shipments,
    quotes,
    historical_shipments,
    rate_cards,
    assumptions: {
      fx_rate_usd_to_cny: 7.18,
      default_ocean_free_time_days: 14,
      standard_pallet_dimensions_cm: '120x100x160',
    },
  };
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function convertToCSV(items: Record<string, unknown>[]): string {
  if (items.length === 0) return '';
  const headers = Object.keys(items[0]);
  const csvRows = [headers.join(',')];

  for (const row of items) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCodeGs(): void {
  const blob = new Blob([APPS_SCRIPT_SAMPLE_CODE], { type: 'text/javascript;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Code.gs';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
