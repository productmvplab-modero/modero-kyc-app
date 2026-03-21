import React from 'react';
import { Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  return (
    <div className="space-y-4">
      {/* Idealista Reference */}
      {idealista_id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">Idealista Reference</p>
          <p className="text-lg font-bold text-blue-900">{idealista_id}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tenant Information */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="mb-4 pb-3 border-b border-slate-200">
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 mb-2">Tenant</Badge>
            <h3 className="text-lg font-bold text-slate-900">{tenant?.tenant_name || 'N/A'}</h3>
          </div>
          
          <div className="space-y-3">
            {tenant?.tenant_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600">Email</p>
                  <p className="text-sm font-medium text-slate-900 break-all">{tenant.tenant_email}</p>
                </div>
              </div>
            )}
            
            {tenant?.tenant_phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{tenant.tenant_phone}</p>
                </div>
              </div>
            )}
            
            {tenant?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600">Address</p>
                  <p className="text-sm font-medium text-slate-900">
                    {tenant.address}{tenant.postal_code ? `, ${tenant.postal_code}` : ''}{tenant.city ? ` ${tenant.city}` : ''}
                  </p>
                </div>
              </div>
            )}

            {tenant?.dni_nie_number && (
              <div className="bg-white border border-slate-300 rounded-lg p-3 mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {getCountryIdLabel(tenant.country)}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900 font-mono">{tenant.dni_nie_number}</p>
              </div>
            )}

            {tenant?.national_tax_id && tenant.national_tax_id !== tenant.dni_nie_number && (
              <div className="bg-white border border-slate-300 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">National Tax ID</p>
                </div>
                <p className="text-sm font-bold text-slate-900 font-mono">{tenant.national_tax_id}</p>
              </div>
            )}
          </div>
        </div>

        {/* Owner/Landlord Information */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="mb-4 pb-3 border-b border-orange-200">
            <Badge className="bg-orange-100 text-orange-700 border border-orange-200 mb-2">Landlord/Owner</Badge>
            <h3 className="text-lg font-bold text-orange-900">{property?.property_owner || 'N/A'}</h3>
          </div>
          
          <div className="space-y-3">
            {property?.owner_email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-orange-700">Email</p>
                  <p className="text-sm font-medium text-orange-900 break-all">{property.owner_email}</p>
                </div>
              </div>
            )}
            
            {property?.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-orange-700">Property Address</p>
                  <p className="text-sm font-medium text-orange-900">{property.address}</p>
                </div>
              </div>
            )}

            {property?.city && (
              <div>
                <p className="text-xs text-orange-700 mb-1">City</p>
                <p className="text-sm font-medium text-orange-900">{property.city}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}