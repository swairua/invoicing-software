import { LineItemTax, InvoiceItem } from './types';

/**
 * Calculate line item taxes for a given item
 */
export function calculateLineItemTaxes(
  item: InvoiceItem,
  availableTaxes: LineItemTax[] = []
): number {
  if (!item.lineItemTaxes || item.lineItemTaxes.length === 0) {
    return 0;
  }

  let totalTaxAmount = 0;
  const baseAmount = item.quantity * item.unitPrice - (item.quantity * item.unitPrice * item.discount / 100);

  // Calculate non-compound taxes first
  const nonCompoundTaxes = item.lineItemTaxes.filter(tax => !tax.isCompoundTax);
  let nonCompoundTaxTotal = 0;

  for (const tax of nonCompoundTaxes) {
    const taxAmount = baseAmount * (tax.rate / 100);
    nonCompoundTaxTotal += taxAmount;
    totalTaxAmount += taxAmount;
  }

  // Calculate compound taxes (applied on base amount + non-compound taxes)
  const compoundTaxes = item.lineItemTaxes.filter(tax => tax.isCompoundTax);
  const compoundTaxBase = baseAmount + nonCompoundTaxTotal;

  for (const tax of compoundTaxes) {
    const taxAmount = compoundTaxBase * (tax.rate / 100);
    totalTaxAmount += taxAmount;
  }

  return totalTaxAmount;
}

/**
 * Calculate total additional tax amount for an invoice
 */
export function calculateAdditionalTaxAmount(items: InvoiceItem[]): number {
  return items.reduce((total, item) => {
    return total + calculateLineItemTaxes(item);
  }, 0);
}

/**
 * Update line item tax amounts based on current rates
 */
export function updateLineItemTaxAmounts(item: InvoiceItem): InvoiceItem {
  if (!item.lineItemTaxes || item.lineItemTaxes.length === 0) {
    return item;
  }

  const baseAmount = item.quantity * item.unitPrice - (item.quantity * item.unitPrice * item.discount / 100);
  let cumulativeAmount = baseAmount;

  const updatedTaxes = item.lineItemTaxes.map(tax => {
    let taxAmount: number;
    
    if (tax.isCompoundTax) {
      // Compound tax is calculated on base amount + previous taxes
      taxAmount = cumulativeAmount * (tax.rate / 100);
      cumulativeAmount += taxAmount;
    } else {
      // Non-compound tax is calculated on base amount only
      taxAmount = baseAmount * (tax.rate / 100);
    }

    return {
      ...tax,
      amount: taxAmount
    };
  });

  return {
    ...item,
    lineItemTaxes: updatedTaxes
  };
}

/**
 * Common tax configurations
 */
export const COMMON_LINE_ITEM_TAXES = {
  EXCISE_TAX: {
    id: 'excise',
    name: 'Excise Tax',
    rate: 10,
    amount: 0,
    isCompoundTax: false
  },
  LUXURY_TAX: {
    id: 'luxury',
    name: 'Luxury Tax',
    rate: 5,
    amount: 0,
    isCompoundTax: false
  },
  ENVIRONMENTAL_LEVY: {
    id: 'env_levy',
    name: 'Environmental Levy',
    rate: 2,
    amount: 0,
    isCompoundTax: false
  },
  IMPORT_DUTY: {
    id: 'import_duty',
    name: 'Import Duty',
    rate: 25,
    amount: 0,
    isCompoundTax: false
  },
  SERVICE_CHARGE: {
    id: 'service_charge',
    name: 'Service Charge',
    rate: 10,
    amount: 0,
    isCompoundTax: true // Applied after other taxes
  }
} as const;

/**
 * Get tax by ID
 */
export function getTaxById(taxId: string): LineItemTax | null {
  const tax = Object.values(COMMON_LINE_ITEM_TAXES).find(t => t.id === taxId);
  return tax ? { ...tax } : null;
}

/**
 * Get all available taxes
 */
export function getAvailableTaxes(): LineItemTax[] {
  return Object.values(COMMON_LINE_ITEM_TAXES).map(tax => ({ ...tax }));
}
