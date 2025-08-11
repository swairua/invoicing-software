import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
  Building2,
  Save,
  Upload,
  Download,
  Palette,
  FileText,
  Settings as SettingsIcon,
  User,
  Shield,
  Ruler,
  ExternalLink,
  Percent,
} from 'lucide-react';
import { CompanySettings, defaultCompanySettings } from '@shared/company';
import PDFService from '../services/pdfService';

export default function Settings() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Update PDF service with new settings
      PDFService.updateCompanySettings(companySettings);
      
      // In a real app, this would save to backend
      console.log('Saving company settings:', companySettings);
      
      // Show success message
      setTimeout(() => {
        setIsLoading(false);
        alert('Settings saved successfully!');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      alert('Failed to save settings');
    }
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setCompanySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setCompanySettings(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field: string, value: string | string[]) => {
    setCompanySettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleTaxChange = (field: string, value: string) => {
    setCompanySettings(prev => ({
      ...prev,
      tax: {
        ...prev.tax,
        [field]: value
      }
    }));
  };

  const handleInvoiceSettingsChange = (field: string, value: any) => {
    setCompanySettings(prev => ({
      ...prev,
      invoiceSettings: {
        ...prev.invoiceSettings,
        [field]: value
      }
    }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...(companySettings.contact.phone || [])];
    newPhones[index] = value;
    handleContactChange('phone', newPhones);
  };

  const addPhoneNumber = () => {
    const newPhones = [...(companySettings.contact.phone || []), ''];
    handleContactChange('phone', newPhones);
  };

  const removePhoneNumber = (index: number) => {
    const newPhones = (companySettings.contact.phone || []).filter((_, i) => i !== index);
    handleContactChange('phone', newPhones);
  };

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...(companySettings.invoiceSettings.terms || [])];
    newTerms[index] = value;
    handleInvoiceSettingsChange('terms', newTerms);
  };

  const addTerm = () => {
    const newTerms = [...(companySettings.invoiceSettings.terms || []), ''];
    handleInvoiceSettingsChange('terms', newTerms);
  };

  const removeTerm = (index: number) => {
    const newTerms = companySettings.invoiceSettings.terms?.filter((_, i) => i !== index) || [];
    handleInvoiceSettingsChange('terms', newTerms);
  };

  const handleTestPDF = () => {
    // Generate a test invoice PDF with current settings
    const testInvoice = {
      id: 'test',
      invoiceNumber: 'TEST-001',
      customer: {
        id: '1',
        name: 'Test Customer Ltd',
        email: 'test@customer.com',
        address: 'Test Address, Nairobi, Kenya',
        phone: '+254700000000',
        kraPin: 'P051111111A',
        creditLimit: 100000,
        balance: 0,
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      items: [{
        id: '1',
        productId: '1',
        product: {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          sku: 'TEST-001',
          category: 'Test',
          unit: 'piece',
          purchasePrice: 800,
          sellingPrice: 1000,
          minStock: 10,
          maxStock: 100,
          currentStock: 50,
          isActive: true,
          companyId: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 2,
        unitPrice: 1000,
        discount: 0,
        vatRate: 16,
        total: 2000
      }],
      subtotal: 2000,
      vatAmount: 320,
      discountAmount: 0,
      total: 2320,
      amountPaid: 0,
      balance: 2320,
      status: 'draft' as const,
      dueDate: new Date(),
      issueDate: new Date(),
      companyId: '1',
      createdBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    PDFService.generateInvoicePDF(testInvoice);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your business information and system preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleTestPDF}>
            <Download className="mr-2 h-4 w-4" />
            Test PDF
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Manage document templates
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => window.location.href = '/units'}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Units of Measure</h3>
                <p className="text-sm text-muted-foreground">
                  Manage product units
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/5 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Users & Roles</h3>
                <p className="text-sm text-muted-foreground">
                  Manage user access
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/5 transition-colors"
          onClick={() => window.location.href = '/settings/taxes'}
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-md">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Tax Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure tax rates & calculations
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your company's basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={companySettings.address.line1}
                    onChange={(e) => handleAddressChange('line1', e.target.value)}
                    placeholder="P.O BOX 12345 - 00100, NAIROBI, KENYA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    value={companySettings.address.line2 || ''}
                    onChange={(e) => handleAddressChange('line2', e.target.value)}
                    placeholder="Building, Street, District"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={companySettings.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={companySettings.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      placeholder="Kenya"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Configure contact details that appear on documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Numbers</Label>
                  {(companySettings.contact.phone || []).map((phone, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder="+254 XXX XXX XXX"
                      />
                      {(companySettings.contact.phone || []).length > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removePhoneNumber(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addPhoneNumber}>
                    Add Phone Number
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.contact.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="sales@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companySettings.contact.website || ''}
                    onChange={(e) => handleContactChange('website', e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tax Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>
                  Configure tax details for compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kraPin">KRA PIN</Label>
                  <Input
                    id="kraPin"
                    value={companySettings.tax.kraPin}
                    onChange={(e) => handleTaxChange('kraPin', e.target.value)}
                    placeholder="P051234567A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={companySettings.tax.vatNumber || ''}
                    onChange={(e) => handleTaxChange('vatNumber', e.target.value)}
                    placeholder="VAT123456789"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paybillNumber">Paybill Number</Label>
                    <Input
                      id="paybillNumber"
                      value={companySettings.tax.paybillNumber || ''}
                      onChange={(e) => handleTaxChange('paybillNumber', e.target.value)}
                      placeholder="503030"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={companySettings.tax.accountNumber || ''}
                      onChange={(e) => handleTaxChange('accountNumber', e.target.value)}
                      placeholder="2047138798"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Document Settings */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Invoice Settings
              </CardTitle>
              <CardDescription>
                Configure invoice numbering and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={companySettings.invoiceSettings.prefix}
                    onChange={(e) => handleInvoiceSettingsChange('prefix', e.target.value)}
                    placeholder="INV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startingNumber">Starting Number</Label>
                  <Input
                    id="startingNumber"
                    type="number"
                    value={companySettings.invoiceSettings.startingNumber}
                    onChange={(e) => handleInvoiceSettingsChange('startingNumber', parseInt(e.target.value))}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vatRate">Default VAT Rate (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    value={companySettings.invoiceSettings.defaultVATRate}
                    onChange={(e) => handleInvoiceSettingsChange('defaultVATRate', parseInt(e.target.value))}
                    placeholder="16"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={companySettings.invoiceSettings.showVAT}
                    onCheckedChange={(checked) => handleInvoiceSettingsChange('showVAT', checked)}
                  />
                  <Label>Show VAT on documents</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Document Footer</Label>
                <Textarea
                  id="footer"
                  value={companySettings.invoiceSettings.footer || ''}
                  onChange={(e) => handleInvoiceSettingsChange('footer', e.target.value)}
                  placeholder="Thank you for your business!"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Terms and Conditions</Label>
                  <Button variant="outline" size="sm" onClick={addTerm}>
                    Add Term
                  </Button>
                </div>
                {(companySettings.invoiceSettings.terms || []).map((term, index) => (
                  <div key={index} className="flex space-x-2">
                    <Textarea
                      value={term}
                      onChange={(e) => handleTermChange(index, e.target.value)}
                      placeholder="Enter term or condition"
                      className="min-h-[60px]"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeTerm(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">User Management</h3>
                <p className="text-muted-foreground">
                  Advanced user management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">System Settings</h3>
                <p className="text-muted-foreground">
                  Advanced system configuration coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
