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
  Package,
  RefreshCw,
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

  const handleBrandingChange = (field: string, value: string) => {
    setCompanySettings(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
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

    await PDFService.generateInvoicePDF(testInvoice);
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="branding">Logo & Branding</TabsTrigger>
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

        {/* Logo & Branding */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Company Logo
                </CardTitle>
                <CardDescription>
                  Manage your company logo that appears on invoices and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Logo Display */}
                <div className="space-y-2">
                  <Label>Current Logo</Label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                    {companySettings.branding.logo ? (
                      <div className="space-y-2">
                        <img
                          src={companySettings.branding.logo}
                          alt="Company Logo"
                          className="mx-auto max-h-24 w-auto object-contain"
                        />
                        <p className="text-sm text-muted-foreground">Current logo</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={companySettings.branding.logo || ''}
                    onChange={(e) => handleBrandingChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your logo image (PNG, JPG, or SVG)
                  </p>
                </div>

                {/* Logo Upload Button */}
                <div className="space-y-2">
                  <Label>Upload Logo</Label>
                  <Button variant="outline" className="w-full" disabled>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    File upload coming soon. For now, use a URL above.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>
                  Customize the colors used in your documents and invoices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={companySettings.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      className="w-12 h-10"
                    />
                    <Input
                      value={companySettings.branding.primaryColor}
                      onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                      placeholder="#2563eb"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for headers, accents, and primary elements
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      id="secondaryColor"
                      value={companySettings.branding.secondaryColor}
                      onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                      className="w-12 h-10"
                    />
                    <Input
                      value={companySettings.branding.secondaryColor}
                      onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used for secondary elements and accents
                  </p>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Color Preview</Label>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div
                      className="h-8 rounded flex items-center px-3 text-white font-medium"
                      style={{ backgroundColor: companySettings.branding.primaryColor }}
                    >
                      Primary Color
                    </div>
                    <div
                      className="h-8 rounded flex items-center px-3 text-white font-medium"
                      style={{ backgroundColor: companySettings.branding.secondaryColor }}
                    >
                      Secondary Color
                    </div>
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
                Manage user accounts and permissions for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current User Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Simon Gichuki (You)</h4>
                    <p className="text-sm text-muted-foreground">Administrator • simon@medplusafrica.com</p>
                  </div>
                  <Badge variant="default">Admin</Badge>
                </div>
              </div>

              {/* User Roles & Permissions */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">User Roles</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Administrator</p>
                        <p className="text-sm text-muted-foreground">Full system access</p>
                      </div>
                      <Badge variant="destructive">1 user</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Sales Manager</p>
                        <p className="text-sm text-muted-foreground">Invoices, customers, quotations</p>
                      </div>
                      <Badge variant="outline">0 users</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Accountant</p>
                        <p className="text-sm text-muted-foreground">Invoices, payments, reports</p>
                      </div>
                      <Badge variant="outline">0 users</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Viewer</p>
                        <p className="text-sm text-muted-foreground">Read-only access</p>
                      </div>
                      <Badge variant="outline">0 users</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Invite New User
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Users (CSV)
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                    <p className="text-sm text-info-foreground">
                      💡 <strong>Tip:</strong> You can add team members and assign specific roles to control what they can access in the system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link to full user management */}
              <div className="border-t pt-4">
                <Button asChild>
                  <a href="/settings/users">
                    <User className="mr-2 h-4 w-4" />
                    Open Full User Management
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  View system details and version information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Version</span>
                    <span className="text-sm text-muted-foreground">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant="outline">Production</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Database</span>
                    <span className="text-sm text-muted-foreground">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-muted-foreground">12.5 MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>
                  Configure system-wide behavior and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-save drafts</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically save form data as drafts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Send email alerts for important events
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-backup</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically backup data daily
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Select defaultValue="KES">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="DD/MM/YYYY">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security & Privacy
                </CardTitle>
                <CardDescription>
                  Manage security settings and data privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-factor authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Add extra security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session timeout</Label>
                      <p className="text-xs text-muted-foreground">
                        Auto-logout after 30 minutes of inactivity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Data retention</Label>
                    <Select defaultValue="1year">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="2years">2 years</SelectItem>
                        <SelectItem value="5years">5 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Actions */}
            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>
                  Perform system maintenance and administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    View System Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Check for Updates
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-sm text-warning-foreground">
                      ⚠️ <strong>Warning:</strong> Some system actions may temporarily affect performance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
