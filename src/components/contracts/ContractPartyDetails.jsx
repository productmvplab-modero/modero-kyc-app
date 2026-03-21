import React, { useState } from 'react';
import { Mail, Phone, MapPin, FileText, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const getCountryIdLabel = (country) => {
  if (!country) return 'ID Number';
  const upperCountry = country.toUpperCase();
  if (upperCountry.includes('SPAIN')) return 'NIE / NIF';
  if (upperCountry.includes('PORTUGAL')) return 'NIF';
  if (upperCountry.includes('ITALY')) return 'Codice Fiscale';
  if (upperCountry.includes('FRANCE')) return 'INSEE';
  if (upperCountry.includes('GERMANY')) return 'Steuer-ID';
  return 'ID Number';
};

export default function ContractPartyDetails({ tenant, property, idealista_id }) {
  const [isEditingLandlord, setIsEditingLandlord] = useState(false);
  const [isEditingTenant, setIsEditingTenant] = useState(false);
  
  const [landlordInfo, setLandlordInfo] = useState({
    name: property?.property_owner || '',
    email: property?.owner_email || '',
    phone: property?.agent_phone || '',
    address: property?.address || '',
    customFields: []
  });

  const [tenantInfo, setTenantInfo] = useState({
    name: tenant?.tenant_name || '',
    email: tenant?.tenant_email || '',
    phone: tenant?.tenant_phone || '',
    address: tenant?.address || '',
    postalCode: tenant?.postal_code || '',
    city: tenant?.city || '',
    dniNie: tenant?.dni_nie_number || '',
    taxId: tenant?.national_tax_id || '',
    customFields: []
  });

  const handleFieldChange = (field, value) => {
    setLandlordInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setLandlordInfo(prev => {
      const updated = [...prev.customFields];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customFields: updated };
    });
  };

  const addCustomField = () => {
    setLandlordInfo(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  const removeCustomField = (index) => {
    setLandlordInfo(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleTenantFieldChange = (field, value) => {
    setTenantInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleTenantCustomFieldChange = (index, field, value) => {
    setTenantInfo(prev => {
      const updated = [...prev.customFields];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customFields: updated };
    });
  };

  const addTenantCustomField = () => {
    setTenantInfo(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: '', value: '' }]
    }));
  };

  const removeTenantCustomField = (index) => {
    setTenantInfo(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tenant Information - Editable */}
        <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200">
            <div>
              <Badge className="bg-orange-600 text-white mb-2">Editable</Badge>
              <h3 className="text-lg font-bold text-orange-900">Tenant Information</h3>
            </div>
            <Button
              onClick={() => setIsEditingTenant(!isEditingTenant)}
              variant={isEditingTenant ? "default" : "outline"}
              className={`text-sm h-8 ${isEditingTenant ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            >
              {isEditingTenant ? 'Save' : 'Edit'}
            </Button>
          </div>

          {isEditingTenant ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Name</label>
                  <Input
                    value={tenantInfo.name}
                    onChange={(e) => handleTenantFieldChange('name', e.target.value)}
                    placeholder="Tenant name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Email</label>
                  <Input
                    value={tenantInfo.email}
                    onChange={(e) => handleTenantFieldChange('email', e.target.value)}
                    placeholder="tenant@email.com"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Phone</label>
                  <Input
                    value={tenantInfo.phone}
                    onChange={(e) => handleTenantFieldChange('phone', e.target.value)}
                    placeholder="+34 XXX XXX XXX"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Address</label>
                  <Input
                    value={tenantInfo.address}
                    onChange={(e) => handleTenantFieldChange('address', e.target.value)}
                    placeholder="Tenant address"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Postal Code</label>
                  <Input
                    value={tenantInfo.postalCode}
                    onChange={(e) => handleTenantFieldChange('postalCode', e.target.value)}
                    placeholder="Postal code"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">City</label>
                  <Input
                    value={tenantInfo.city}
                    onChange={(e) => handleTenantFieldChange('city', e.target.value)}
                    placeholder="City"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">ID Number</label>
                  <Input
                    value={tenantInfo.dniNie}
                    onChange={(e) => handleTenantFieldChange('dniNie', e.target.value)}
                    placeholder="DNI/NIE"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Tax ID</label>
                  <Input
                    value={tenantInfo.taxId}
                    onChange={(e) => handleTenantFieldChange('taxId', e.target.value)}
                    placeholder="Tax ID"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Custom Fields */}
              {tenantInfo.customFields.map((field, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 pt-2 border-t border-orange-200">
                  <Input
                    value={field.label}
                    onChange={(e) => handleTenantCustomFieldChange(index, 'label', e.target.value)}
                    placeholder="Field name"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={field.value}
                      onChange={(e) => handleTenantCustomFieldChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="text-sm flex-1"
                    />
                    <Button
                      onClick={() => removeTenantCustomField(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                onClick={addTenantCustomField}
                variant="outline"
                className="w-full text-orange-600 hover:bg-orange-50 mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tenantInfo.name && (
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Name</p>
                    <p className="text-sm font-medium text-orange-900">{tenantInfo.name}</p>
                  </div>
                </div>
              )}

              {tenantInfo.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Email</p>
                    <p className="text-sm font-medium text-orange-900 break-all">{tenantInfo.email}</p>
                  </div>
                </div>
              )}

              {tenantInfo.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Phone</p>
                    <p className="text-sm font-medium text-orange-900">{tenantInfo.phone}</p>
                  </div>
                </div>
              )}

              {tenantInfo.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Address</p>
                    <p className="text-sm font-medium text-orange-900">
                      {tenantInfo.address}
                      {tenantInfo.postalCode && `, ${tenantInfo.postalCode}`}
                      {tenantInfo.city && ` ${tenantInfo.city}`}
                    </p>
                  </div>
                </div>
              )}

              {tenantInfo.dniNie && (
                <div className="bg-white border border-orange-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">ID Number</p>
                  </div>
                  <p className="text-sm font-bold text-orange-900 font-mono">{tenantInfo.dniNie}</p>
                </div>
              )}

              {tenantInfo.taxId && (
                <div className="bg-white border border-orange-300 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Tax ID</p>
                  </div>
                  <p className="text-sm font-bold text-orange-900 font-mono">{tenantInfo.taxId}</p>
                </div>
              )}

              {tenantInfo.customFields.map((field, index) => (
                field.label && (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-orange-700 font-semibold">{field.label}</p>
                      <p className="text-sm font-medium text-orange-900">{field.value}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Owner/Landlord Information - Editable */}
        <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200">
            <div>
              <Badge className="bg-orange-600 text-white mb-2">Editable</Badge>
              <h3 className="text-lg font-bold text-orange-900">Landlord/Owner Information</h3>
            </div>
            <Button
              onClick={() => setIsEditingLandlord(!isEditingLandlord)}
              variant={isEditingLandlord ? "default" : "outline"}
              className={`text-sm h-8 ${isEditingLandlord ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
            >
              {isEditingLandlord ? 'Save' : 'Edit'}
            </Button>
          </div>

          {isEditingLandlord ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Name</label>
                  <Input
                    value={landlordInfo.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Landlord name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Email</label>
                  <Input
                    value={landlordInfo.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="landlord@email.com"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Phone</label>
                  <Input
                    value={landlordInfo.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+34 XXX XXX XXX"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Address</label>
                  <Input
                    value={landlordInfo.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="Landlord address"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Custom Fields */}
              {landlordInfo.customFields.map((field, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 pt-2 border-t border-orange-200">
                  <Input
                    value={field.label}
                    onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                    placeholder="Field name"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="text-sm flex-1"
                    />
                    <Button
                      onClick={() => removeCustomField(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                onClick={addCustomField}
                variant="outline"
                className="w-full text-orange-600 hover:bg-orange-50 mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {landlordInfo.name && (
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Name</p>
                    <p className="text-sm font-medium text-orange-900">{landlordInfo.name}</p>
                  </div>
                </div>
              )}

              {landlordInfo.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Email</p>
                    <p className="text-sm font-medium text-orange-900 break-all">{landlordInfo.email}</p>
                  </div>
                </div>
              )}

              {landlordInfo.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Phone</p>
                    <p className="text-sm font-medium text-orange-900">{landlordInfo.phone}</p>
                  </div>
                </div>
              )}

              {landlordInfo.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-orange-700 font-semibold">Address</p>
                    <p className="text-sm font-medium text-orange-900">{landlordInfo.address}</p>
                  </div>
                </div>
              )}

              {landlordInfo.customFields.map((field, index) => (
                field.label && (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-orange-700 font-semibold">{field.label}</p>
                      <p className="text-sm font-medium text-orange-900">{field.value}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}