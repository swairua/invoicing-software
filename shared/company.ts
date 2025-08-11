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

// Default company settings based on Medplus Africa Limited invoice
export const defaultCompanySettings: CompanySettings = {
  id: '1',
  name: 'Medplus Africa Limited',
  address: {
    line1: 'P.O BOX 45352 - 00100, NAIROBI, KENYA',
    line2: 'Siens Plaza 4th floor room 1 opposite kcb bank River road',
    city: 'Nairobi',
    country: 'Kenya',
    postalCode: '00100'
  },
  contact: {
    phone: ['+254 713416022', '+254 786830610'],
    email: 'sales@medplusafrica.com',
    website: 'www.medplusafrica.com'
  },
  tax: {
    kraPin: 'P052045925Z',
    paybillNumber: '303030',
    accountNumber: '2047138798'
  },
  branding: {
    logo: 'https://cdn.builder.io/api/v1/image/assets%2F36ce27fc004b41f8b60187584af31eda%2F3cee787ea7404d498214c3c0a3fb9674?format=webp&width=800',
    primaryColor: '#2563eb',
    secondaryColor: '#10b981'
  },
  invoiceSettings: {
    prefix: 'INV',
    startingNumber: 901,
    terms: [
      'The company shall have general as well as particular lien on all goods for any unpaid A/C',
      'Cash transactions of any kind are not acceptable. All payments should be made by cheque, MPESA, or Bank transfer only',
      'Claims and queries must be lodged with us within 21 days of dispatch of goods, otherwise they will not be accepted back',
      'Where applicable, transport will be invoiced separately',
      'The company will not be responsible for any loss or damage of goods on transit collected by the customer or sent via customer\'s courier A/C',
      'The VAT is inclusive where applicable'
    ],
    footer: 'Your Medical & Laboratory Supplies Partner',
    showVAT: true,
    defaultVATRate: 16
  }
};
