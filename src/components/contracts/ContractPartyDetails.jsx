import React, { useState } from 'react';
import { Mail, Phone, MapPin, FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Styled read-only field box
const FieldBox = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  return (
    <div className="bg-white border border-orange-200 rounded-lg px-3 py-2">
      <p className="text-xs font-semibold text-orange-600 mb-0.5 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 break-all">{value}</p>
    </div>
  );
};

// Editable input field
const EditField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-orange-700 mb-1">{label}</label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="text-sm" />
  </div>
);

export default function ContractPartyDetails({ tenant, property }) {
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

  const updateLandlord = (field, value) => setLandlordInfo(prev => ({ ...prev, [field]: value }));
  const updateTenant = (field, value) => setTenantInfo(prev => ({ ...prev, [field]: value }));

  const addLandlordField = () => setLandlordInfo(prev => ({ ...prev, customFields: [...prev.customFields, { label: '', value: '' }] }));
  const removeLandlordField = (i) => setLandlordInfo(prev => ({ ...prev, customFields: prev.customFields.filter((_, idx) => idx !== i) }));
  const updateLandlordCustomField = (i, key, val) => setLandlordInfo(prev => {
    const updated = [...prev.customFields];
    updated[i] = { ...updated[i], [key]: val };
    return { ...prev, customFields: updated };
  });

  const addTenantField = () => setTenantInfo(prev => ({ ...prev, customFields: [...prev.customFields, { label: '', value: '' }] }));
  const removeTenantField = (i) => setTenantInfo(prev => ({ ...prev, customFields: prev.customFields.filter((_, idx) => idx !== i) }));
  const updateTenantCustomField = (i, key, val) => setTenantInfo(prev => {
    const updated = [...prev.customFields];
    updated[i] = { ...updated[i], [key]: val };
    return { ...prev, customFields: updated };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Tenant Information */}
      <div className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200">
          <h3 className="text-lg font-bold text-orange-900">Tenant Information</h3>
          <Button
            onClick={() => setIsEditingTenant(!isEditingTenant)}
            size="sm"
            className={isEditingTenant ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'border border-orange-300 bg-white text-orange-700 hover:bg-orange-100'}
            variant="outline"
          >
            {isEditingTenant ? 'Save' : 'Edit'}
          </Button>
        </div>

        {isEditingTenant ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Name" value={tenantInfo.name} onChange={v => updateTenant('name', v)} placeholder="Tenant name" />
              <EditField label="Email" value={tenantInfo.email} onChange={v => updateTenant('email', v)} placeholder="tenant@email.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Phone" value={tenantInfo.phone} onChange={v => updateTenant('phone', v)} placeholder="+34 XXX XXX XXX" />
              <EditField label="Address" value={tenantInfo.address} onChange={v => updateTenant('address', v)} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Postal Code" value={tenantInfo.postalCode} onChange={v => updateTenant('postalCode', v)} placeholder="Postal code" />
              <EditField label="City" value={tenantInfo.city} onChange={v => updateTenant('city', v)} placeholder="City" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <EditField label="ID Number" value={tenantInfo.dniNie} onChange={v => updateTenant('dniNie', v)} placeholder="DNI/NIE" />
              <EditField label="Tax ID" value={tenantInfo.taxId} onChange={v => updateTenant('taxId', v)} placeholder="Tax ID" />
            </div>

            {tenantInfo.customFields.map((field, i) => (
              <div key={i} className="flex gap-2 items-end border-t border-orange-200 pt-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Field Name</label>
                  <Input value={field.label} onChange={e => updateTenantCustomField(i, 'label', e.target.value)} placeholder="e.g. Nationality" className="text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Value</label>
                  <Input value={field.value} onChange={e => updateTenantCustomField(i, 'value', e.target.value)} placeholder="Value" className="text-sm" />
                </div>
                <Button onClick={() => removeTenantField(i)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 mb-0.5">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button onClick={addTenantField} variant="outline" className="w-full text-orange-600 border-orange-300 hover:bg-orange-100 mt-1">
              <Plus className="w-4 h-4 mr-2" /> Add Field
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FieldBox label="Name" value={tenantInfo.name} />
            <FieldBox label="Email" value={tenantInfo.email} icon={Mail} />
            <FieldBox label="Phone" value={tenantInfo.phone} icon={Phone} />
            <FieldBox label="Address" value={[tenantInfo.address, tenantInfo.postalCode, tenantInfo.city].filter(Boolean).join(', ')} icon={MapPin} />
            <FieldBox label="ID Number" value={tenantInfo.dniNie} icon={FileText} />
            <FieldBox label="Tax ID" value={tenantInfo.taxId} icon={FileText} />
            {tenantInfo.customFields.filter(f => f.label).map((field, i) => (
              <FieldBox key={i} label={field.label} value={field.value} />
            ))}
          </div>
        )}
      </div>

      {/* Landlord/Owner Information */}
      <div className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-orange-200">
          <h3 className="text-lg font-bold text-orange-900">Real Estate Agent</h3>
          <Button
            onClick={() => setIsEditingLandlord(!isEditingLandlord)}
            size="sm"
            className={isEditingLandlord ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'border border-orange-300 bg-white text-orange-700 hover:bg-orange-100'}
            variant="outline"
          >
            {isEditingLandlord ? 'Save' : 'Edit'}
          </Button>
        </div>

        {isEditingLandlord ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Name" value={landlordInfo.name} onChange={v => updateLandlord('name', v)} placeholder="Landlord name" />
              <EditField label="Email" value={landlordInfo.email} onChange={v => updateLandlord('email', v)} placeholder="landlord@email.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <EditField label="Phone" value={landlordInfo.phone} onChange={v => updateLandlord('phone', v)} placeholder="+34 XXX XXX XXX" />
              <EditField label="Address" value={landlordInfo.address} onChange={v => updateLandlord('address', v)} placeholder="Landlord address" />
            </div>

            {landlordInfo.customFields.map((field, i) => (
              <div key={i} className="flex gap-2 items-end border-t border-orange-200 pt-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Field Name</label>
                  <Input value={field.label} onChange={e => updateLandlordCustomField(i, 'label', e.target.value)} placeholder="e.g. Company" className="text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-orange-700 mb-1">Value</label>
                  <Input value={field.value} onChange={e => updateLandlordCustomField(i, 'value', e.target.value)} placeholder="Value" className="text-sm" />
                </div>
                <Button onClick={() => removeLandlordField(i)} variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 mb-0.5">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button onClick={addLandlordField} variant="outline" className="w-full text-orange-600 border-orange-300 hover:bg-orange-100 mt-1">
              <Plus className="w-4 h-4 mr-2" /> Add Field
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FieldBox label="Name" value={landlordInfo.name} />
            <FieldBox label="Email" value={landlordInfo.email} icon={Mail} />
            <FieldBox label="Phone" value={landlordInfo.phone} icon={Phone} />
            <FieldBox label="Address" value={landlordInfo.address} icon={MapPin} />
            {landlordInfo.customFields.filter(f => f.label).map((field, i) => (
              <FieldBox key={i} label={field.label} value={field.value} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}