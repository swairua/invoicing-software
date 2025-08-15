// Production hotfix for customer data transformation
// This ensures proper balance/creditLimit handling regardless of API format

export interface RawCustomerData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  kraPin?: string;
  address?: string;
  creditLimit?: number | string;
  balance?: number | string;
  currentBalance?: number | string; // This is what the API actually returns
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function transformCustomerData(rawCustomers: RawCustomerData[]): any[] {
  return rawCustomers.map((customer) => {
    // Handle balance field - API returns currentBalance but frontend expects balance
    let balance = 0;
    if (customer.balance !== undefined && customer.balance !== null) {
      balance = Number(customer.balance);
    } else if (
      customer.currentBalance !== undefined &&
      customer.currentBalance !== null
    ) {
      balance = Number(customer.currentBalance);
    }

    // Handle creditLimit field
    let creditLimit = 0;
    if (customer.creditLimit !== undefined && customer.creditLimit !== null) {
      creditLimit = Number(customer.creditLimit);
    }

    // Ensure we have valid numbers
    balance = isNaN(balance) ? 0 : balance;
    creditLimit = isNaN(creditLimit) ? 0 : creditLimit;

    return {
      ...customer,
      balance,
      creditLimit,
      // Remove currentBalance to avoid confusion
      currentBalance: undefined,
    };
  });
}

export function safeFormatCurrency(
  amount: number | string | null | undefined,
): string {
  // Convert to number and handle all edge cases
  let numAmount = 0;

  if (amount !== null && amount !== undefined) {
    numAmount = Number(amount);
  }

  // Handle NaN, Infinity, etc.
  if (!isFinite(numAmount)) {
    numAmount = 0;
  }

  try {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(numAmount);
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `Ksh ${numAmount.toFixed(0)}`;
  }
}

export function calculateCustomerTotals(customers: any[]) {
  const totals = {
    totalBalance: 0,
    totalCreditLimit: 0,
    activeCustomers: 0,
    totalCustomers: customers.length,
  };

  customers.forEach((customer) => {
    // Safely add balance
    const balance = Number(customer.balance) || 0;
    const creditLimit = Number(customer.creditLimit) || 0;

    if (isFinite(balance)) {
      totals.totalBalance += balance;
    }

    if (isFinite(creditLimit)) {
      totals.totalCreditLimit += creditLimit;
    }

    if (customer.isActive) {
      totals.activeCustomers++;
    }
  });

  return totals;
}
