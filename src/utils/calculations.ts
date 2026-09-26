import { Quote, Shipment, CostAnalysis, DecisionFlag, QuoteComponent } from '../types';

export const DEFAULT_FX_USD_TO_CNY = 7.18;

/**
 * Normalizes a quote component's dollar value to USD based on shipment dimensions
 */
export function calculateComponentAmountUSD(
  component: Partial<QuoteComponent>,
  shipment: Shipment,
  fxRateToUsd: number = 1.0,
): number {
  const unit = component.unit || 'flat';
  const unitRate = Number(component.unit_rate) || 0;
  let qty = Number(component.quantity) || 1;

  if (unit === 'per_cbm') {
    qty = shipment.CBM > 0 ? shipment.CBM : qty;
  } else if (unit === 'per_kg') {
    qty = shipment.gross_weight_kg > 0 ? shipment.gross_weight_kg : qty;
  } else if (unit === 'per_carton') {
    qty = shipment.cartons > 0 ? shipment.cartons : qty;
  } else if (unit === 'per_pallet') {
    qty = shipment.pallets > 0 ? shipment.pallets : qty;
  }

  const rawAmount = qty * unitRate;
  const currency = component.currency || 'USD';
  
  if (currency === 'CNY') {
    return Number((rawAmount / (fxRateToUsd || DEFAULT_FX_USD_TO_CNY)).toFixed(2));
  }
  return Number(rawAmount.toFixed(2));
}

/**
 * Normalizes a full quote against its shipment requirements
 */
export function analyzeQuoteCost(
  quote: Quote,
  shipment: Shipment,
  allQuotesForShipment: Quote[] = [],
): CostAnalysis {
  let freight_cost = 0;
  let origin_cost = 0;
  let destination_cost = 0;
  let customs_cost = 0;
  let handling_cost = 0;
  let surcharges_cost = 0;
  let other_cost = 0;

  quote.components.forEach((comp) => {
    // Only sum included components in the baseline cost calculation
    if (!comp.is_included_in_quote) return;

    const amt = comp.amount_usd ?? calculateComponentAmountUSD(comp, shipment, quote.fx_rate_to_usd);

    switch (comp.category) {
      case 'freight':
        freight_cost += amt;
        break;
      case 'origin':
        origin_cost += amt;
        break;
      case 'destination':
        destination_cost += amt;
        break;
      case 'customs':
        customs_cost += amt;
        break;
      case 'handling':
        handling_cost += amt;
        break;
      case 'surcharge':
        surcharges_cost += amt;
        break;
      case 'warehouse':
      case 'other':
      default:
        other_cost += amt;
        break;
    }
  });

  const total_logistics_cost = Number(
    (
      freight_cost +
      origin_cost +
      destination_cost +
      customs_cost +
      handling_cost +
      surcharges_cost +
      other_cost
    ).toFixed(2)
  );

  const units = shipment.units > 0 ? shipment.units : 1;
  const cartons = shipment.cartons > 0 ? shipment.cartons : 1;
  const pallets = shipment.pallets > 0 ? shipment.pallets : 1;
  const cbm = shipment.CBM > 0 ? shipment.CBM : 1;
  const kg = shipment.gross_weight_kg > 0 ? shipment.gross_weight_kg : 1;

  const cost_per_unit = Number((total_logistics_cost / units).toFixed(3));
  const cost_per_carton = Number((total_logistics_cost / cartons).toFixed(2));
  const cost_per_pallet = Number((total_logistics_cost / pallets).toFixed(2));
  const cost_per_CBM = Number((total_logistics_cost / cbm).toFixed(2));
  const cost_per_kg = Number((total_logistics_cost / kg).toFixed(3));

  const productFob = shipment.product_unit_fob_cost || 0;
  const landed_unit_cost = Number((productFob + cost_per_unit).toFixed(3));
  const landed_cost_impact_pct =
    productFob > 0 ? Number(((cost_per_unit / productFob) * 100).toFixed(2)) : 0;

  // Generate Decision Support Flags & Exceptions
  const flags: DecisionFlag[] = [];

  // Expiration check
  const now = new Date();
  const validUntil = new Date(quote.valid_until);
  if (validUntil < now) {
    flags.push({
      id: `exp-${quote.quote_id}`,
      type: 'expired',
      severity: 'error',
      message: `Quote expired on ${quote.valid_until}. Needs refresh from forwarder before approval.`,
    });
  } else {
    const daysUntilExp = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExp <= 3) {
      flags.push({
        id: `exp-soon-${quote.quote_id}`,
        type: 'expired',
        severity: 'warning',
        message: `Quote expires in ${daysUntilExp} day(s) on ${quote.valid_until}.`,
      });
    }
  }

  // Missing components check
  const excludedComponents = quote.components.filter((c) => !c.is_included_in_quote);
  if (excludedComponents.length > 0) {
    const names = excludedComponents.map((c) => c.description).join(', ');
    flags.push({
      id: `missing-${quote.quote_id}`,
      type: 'missing_component',
      severity: 'warning',
      message: `Excluded / unconfirmed fees: ${names}. Expected pass-through risk.`,
    });
  }

  // Check if destination drayage/delivery is present
  const hasDestination = quote.components.some(
    (c) => c.category === 'destination' && c.is_included_in_quote && c.amount_usd > 0,
  );
  if (!hasDestination) {
    flags.push({
      id: `no-dest-${quote.quote_id}`,
      type: 'missing_component',
      severity: 'warning',
      message: 'No destination drayage/delivery charge detected. Verify port-to-door coverage.',
    });
  }

  // Check if customs entry is present
  const hasCustoms = quote.components.some(
    (c) => c.category === 'customs' && c.is_included_in_quote && c.amount_usd > 0,
  );
  if (!hasCustoms) {
    flags.push({
      id: `no-cust-${quote.quote_id}`,
      type: 'missing_component',
      severity: 'info',
      message: 'Customs & ISF filing not itemized. Confirm if handled in-house or by forwarder.',
    });
  }

  // High surcharges check
  if (freight_cost > 0 && surcharges_cost / freight_cost > 0.25) {
    flags.push({
      id: `high-sur-${quote.quote_id}`,
      type: 'high_surcharge',
      severity: 'warning',
      message: `Surcharges ($${surcharges_cost.toFixed(2)}) exceed 25% of ocean freight ($${freight_cost.toFixed(2)}).`,
    });
  }

  // Multi-quote comparative flags
  if (allQuotesForShipment.length > 1) {
    // Find min cost among active quotes
    const quoteTotals = allQuotesForShipment.map((q) => {
      let t = 0;
      q.components.forEach((c) => {
        if (c.is_included_in_quote) {
          t += c.amount_usd ?? calculateComponentAmountUSD(c, shipment, q.fx_rate_to_usd);
        }
      });
      return { id: q.quote_id, total: t, transit: q.transit_days };
    });

    const minTotal = Math.min(...quoteTotals.map((qt) => qt.total));
    const minTransit = Math.min(...quoteTotals.map((qt) => qt.transit));

    if (total_logistics_cost === minTotal) {
      flags.push({
        id: `lowest-${quote.quote_id}`,
        type: 'lowest_cost',
        severity: 'success',
        message: `Lowest normalized total cost ($${total_logistics_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}) among compared quotes.`,
      });
    }

    if (quote.transit_days === minTransit && minTransit > 0) {
      flags.push({
        id: `fastest-${quote.quote_id}`,
        type: 'fastest_transit',
        severity: 'info',
        message: `Fastest transit schedule (${quote.transit_days} days) for this route.`,
      });
    }

    // Large variance alert if cost is > 25% higher than lowest
    if (total_logistics_cost > minTotal * 1.25 && minTotal > 0) {
      const diffPct = (((total_logistics_cost - minTotal) / minTotal) * 100).toFixed(1);
      flags.push({
        id: `var-${quote.quote_id}`,
        type: 'high_variance',
        severity: 'warning',
        message: `Quote is ${diffPct}% higher than the lowest quote ($${(total_logistics_cost - minTotal).toFixed(2)} difference).`,
      });
    }
  }

  return {
    quote_id: quote.quote_id,
    freight_cost,
    origin_cost,
    destination_cost,
    customs_cost,
    handling_cost,
    surcharges_cost,
    other_cost,
    total_logistics_cost,
    cost_per_unit,
    cost_per_carton,
    cost_per_pallet,
    cost_per_CBM,
    cost_per_kg,
    landed_unit_cost,
    landed_cost_impact_pct,
    flags,
  };
}

/**
 * Format currency with tabular figures
 */
export function formatUSD(amount: number, digits: number = 2): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}
