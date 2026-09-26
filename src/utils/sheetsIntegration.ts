import { Forwarder, Shipment, Quote, HistoricalShipment, RateCard } from '../types';

export const APPS_SCRIPT_SAMPLE_CODE = `/**
 * Google Apps Script - Hungry Artisan Freight Quoting & Cost Service
 * Service Layer between Google Sheets (Operational DB) and React Decision Interface
 * Owner: Wesley Quintero (Hungry Artisan)
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

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

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'SAVE_DECISION') {
      const auditSheet = ss.getSheetByName('AuditLog') || ss.insertSheet('AuditLog');
      auditSheet.appendRow([
        new Date().toISOString(),
        payload.shipment_id,
        payload.selected_forwarder_id,
        payload.approval_status,
        payload.approved_by || 'Wesley Quintero',
        payload.approval_notes || ''
      ]);
      
      // Update Shipment status
      updateShipmentStatus(ss, payload.shipment_id, payload.approval_status, payload.selected_forwarder_id);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Sheets updated successfully',
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
      sheet.getRange(i + 1, 14).setValue(status); // Status column
      sheet.getRange(i + 1, 15).setValue(forwarderId); // Forwarder column
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
