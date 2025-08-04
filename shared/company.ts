export interface CompanySettings {
  id: string;
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string[];
    email: string;
    website?: string;
  };
  tax: {
    kraPin: string;
    vatNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
  };
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  invoiceSettings: {
    prefix: string;
    startingNumber: number;
    terms?: string[];
    footer?: string;
    showVAT: boolean;
    defaultVATRate: number;
  };
}

// Default company settings based on the document
export const defaultCompanySettings: CompanySettings = {
  id: '1',
  name: 'BusinessERP Limited',
  address: {
    line1: 'P.O BOX 12345 - 00100, NAIROBI, KENYA',
    line2: 'Business Plaza, Central Business District',
    city: 'Nairobi',
    country: 'Kenya',
    postalCode: '00100'
  },
  contact: {
    phone: ['+254 713 416 022', '+254 786 830 610'],
    email: 'sales@businesserp.com',
    website: 'www.businesserp.com'
  },
  tax: {
    kraPin: 'P052045925Z',
    paybillNumber: '503030',
    accountNumber: '2047138798'
  },
  branding: {
    primaryColor: '#2563eb',
    secondaryColor: '#10b981'
  },
  invoiceSettings: {
    prefix: 'INV',
    startingNumber: 1000,
    terms: [
      'The company shall have general lien as well as particular lien on all goods for any unpaid A/C',
      'Cash transactions of any kind are not acceptable, all payments should be made by cheque, MPESA, or Bank transfer only',
      'Claims and queries must be lodged with us within 30 days of dispatch of goods, otherwise they will not be acceptable back',
      'Where applicable, transport will be invoiced separately',
      'The company will not be responsible for any loss or damage of goods in transit reflected by the customer or sent via customer carrier A/C'
    ],
    footer: 'Thank you for your business!',
    showVAT: true,
    defaultVATRate: 16
  }
};
