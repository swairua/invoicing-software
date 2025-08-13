import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Settings,
  Building2,
  Palette,
  FileText,
  Save,
  Upload,
  Image,
  Phone,
  Mail,
  MapPin,
  Hash,
  CreditCard,
} from "lucide-react";
import { CompanySettings, defaultCompanySettings } from "@shared/company";
import { useToast } from "../hooks/use-toast";

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();

  // Load settings from database/storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // TODO: Replace with actual API call to load company settings
        // const data = await dataService.getCompanySettings();
        // setSettings(data);
        
        // For now, use default settings
        setSettings(defaultCompanySettings);
      } catch (error) {
        console.error('Failed to load company settings:', error);
        toast({
          title: "Error",
          description: "Failed to load company settings",
          variant: "destructive",
        });
      }
    };
    loadSettings();
  }, [toast]);

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => {
      const keys = field.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    setIsDirty(true);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call to save company settings
      // await dataService.updateCompanySettings(settings);
      
      // For now, just update localStorage as fallback
      localStorage.setItem('companySettings', JSON.stringify(settings));
      
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Company settings saved successfully",
      });
    } catch (error) {
      console.error('Failed to save company settings:', error);
      toast({
        title: "Error",
        description: "Failed to save company settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload to storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('branding.logo', result);
        toast({
          title: "Logo uploaded",
          description: "Logo has been updated. Don't forget to save changes.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Configure your company information, branding, and invoice settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button onClick={handleSaveSettings} disabled={loading || !isDirty}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="mr-2 h-4 w-4" />
            Company Info
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="mr-2 h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="invoicing">
            <FileText className="mr-2 h-4 w-4" />
            Invoicing
          </TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core company details used in invoices and official documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={settings?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-line1">Address Line 1</Label>
                  <Input
                    id="address-line1"
                    value={settings.address.line1}
                    onChange={(e) => handleInputChange('address.line1', e.target.value)}
                    placeholder="P.O Box or Street Address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-line2">Address Line 2</Label>
                  <Input
                    id="address-line2"
                    value={settings.address.line2 || ''}
                    onChange={(e) => handleInputChange('address.line2', e.target.value)}
                    placeholder="Building, Floor, Room"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={settings.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={settings.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={settings.address.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    placeholder="Postal Code"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-primary">Primary Phone</Label>
                <Input
                  id="phone-primary"
                  value={settings.contact.phone[0] || ''}
                  onChange={(e) => {
                    const newPhones = [...settings.contact.phone];
                    newPhones[0] = e.target.value;
                    handleInputChange('contact.phone', newPhones);
                  }}
                  placeholder="+254 XXX XXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-secondary">Secondary Phone</Label>
                <Input
                  id="phone-secondary"
                  value={settings.contact.phone[1] || ''}
                  onChange={(e) => {
                    const newPhones = [...settings.contact.phone];
                    newPhones[1] = e.target.value;
                    handleInputChange('contact.phone', newPhones);
                  }}
                  placeholder="+254 XXX XXXXXX"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.contact.website || ''}
                    onChange={(e) => handleInputChange('contact.website', e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kra-pin">KRA PIN</Label>
                  <Input
                    id="kra-pin"
                    value={settings.tax.kraPin}
                    onChange={(e) => handleInputChange('tax.kraPin', e.target.value)}
                    placeholder="P051234567Z"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-number">VAT Number</Label>
                  <Input
                    id="vat-number"
                    value={settings.tax.vatNumber || ''}
                    onChange={(e) => handleInputChange('tax.vatNumber', e.target.value)}
                    placeholder="VAT Registration Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paybill">Paybill Number</Label>
                  <Input
                    id="paybill"
                    value={settings.tax.paybillNumber || ''}
                    onChange={(e) => handleInputChange('tax.paybillNumber', e.target.value)}
                    placeholder="M-Pesa Paybill Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={settings.tax.accountNumber || ''}
                    onChange={(e) => handleInputChange('tax.accountNumber', e.target.value)}
                    placeholder="Bank Account Number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo & Visual Identity
              </CardTitle>
              <CardDescription>
                Customize your company's visual appearance on invoices and documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Company Logo</Label>
                <div className="flex items-center space-x-4">
                  {settings.branding.logo && (
                    <div className="relative">
                      <img
                        src={settings.branding.logo}
                        alt="Company Logo"
                        className="h-16 w-16 object-contain border rounded"
                      />
                    </div>
                  )}
                  <div>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-auto"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: PNG or JPG, max 2MB, square aspect ratio
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) => handleInputChange('branding.primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.branding.primaryColor}
                      onChange={(e) => handleInputChange('branding.primaryColor', e.target.value)}
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.branding.secondaryColor}
                      onChange={(e) => handleInputChange('branding.secondaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.branding.secondaryColor}
                      onChange={(e) => handleInputChange('branding.secondaryColor', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoicing Tab */}
        <TabsContent value="invoicing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Configuration
              </CardTitle>
              <CardDescription>
                Configure how your invoices are numbered and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input
                    id="invoice-prefix"
                    value={settings.invoiceSettings.prefix}
                    onChange={(e) => handleInputChange('invoiceSettings.prefix', e.target.value)}
                    placeholder="INV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="starting-number">Starting Number</Label>
                  <Input
                    id="starting-number"
                    type="number"
                    value={settings.invoiceSettings.startingNumber}
                    onChange={(e) => handleInputChange('invoiceSettings.startingNumber', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-rate">Default VAT Rate (%)</Label>
                  <Input
                    id="vat-rate"
                    type="number"
                    value={settings.invoiceSettings.defaultVATRate}
                    onChange={(e) => handleInputChange('invoiceSettings.defaultVATRate', parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="show-vat"
                  checked={settings.invoiceSettings.showVAT}
                  onCheckedChange={(checked) => handleInputChange('invoiceSettings.showVAT', checked)}
                />
                <Label htmlFor="show-vat">Show VAT on invoices</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-text">Invoice Footer</Label>
                <Input
                  id="footer-text"
                  value={settings.invoiceSettings.footer || ''}
                  onChange={(e) => handleInputChange('invoiceSettings.footer', e.target.value)}
                  placeholder="Your Medical & Laboratory Supplies Partner"
                />
              </div>

              <div className="space-y-2">
                <Label>Terms and Conditions</Label>
                <div className="space-y-2">
                  {settings.invoiceSettings.terms?.map((term, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Textarea
                        value={term}
                        onChange={(e) => {
                          const newTerms = [...(settings.invoiceSettings.terms || [])];
                          newTerms[index] = e.target.value;
                          handleInputChange('invoiceSettings.terms', newTerms);
                        }}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newTerms = [...(settings.invoiceSettings.terms || [])];
                          newTerms.splice(index, 1);
                          handleInputChange('invoiceSettings.terms', newTerms);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newTerms = [...(settings.invoiceSettings.terms || []), ''];
                      handleInputChange('invoiceSettings.terms', newTerms);
                    }}
                  >
                    Add Term
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
