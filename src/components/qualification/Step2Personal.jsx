import React, { useState } from 'react';
import { User, Upload, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';
import { base44 } from '@/api/base44Client';

const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];
const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other', prefer_not_to_say: 'Prefer not to say' };

export default function Step2Personal({ formData, updateForm, onNext, onBack }) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = formData.first_name && formData.last_name && formData.city && formData.country && formData.nationality && formData.dni_nie_number;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateForm({ profile_picture_url: file_url });
    setUploading(false);
  };

  return (
    <StepCard
      icon={User}
      title="Personal Information"
      subtitle="Tell us about yourself so we can verify your identity"
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
    >
      {/* Profile Photo */}
      <div className="flex flex-col items-center mb-2">
        <div className="relative">
          {formData.profile_picture_url ? (
            <img src={formData.profile_picture_url} alt="Profile" className="h-20 w-20 rounded-full object-cover border-4 border-orange-100" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200">
              <User className="w-8 h-8 text-slate-400" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
            {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3.5 h-3.5 text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <p className="text-xs text-slate-400 mt-2">Upload a profile photo (optional)</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
          <Input value={formData.first_name} onChange={e => updateForm({ first_name: e.target.value })} placeholder="John" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
          <Input value={formData.last_name} onChange={e => updateForm({ last_name: e.target.value })} placeholder="Doe" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Age</label>
          <Input type="number" min={18} max={99} value={formData.age} onChange={e => updateForm({ age: e.target.value })} placeholder="30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
          <select
            value={formData.gender}
            onChange={e => updateForm({ gender: e.target.value })}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{GENDER_LABELS[g]}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nationality *</label>
        <Input value={formData.nationality} onChange={e => updateForm({ nationality: e.target.value })} placeholder="e.g. Spanish" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Place of Birth</label>
        <Input value={formData.place_of_birth} onChange={e => updateForm({ place_of_birth: e.target.value })} placeholder="e.g. Madrid" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">DNI / NIE Number *</label>
        <Input value={formData.dni_nie_number} onChange={e => updateForm({ dni_nie_number: e.target.value })} placeholder="e.g. 12345678A or X1234567B" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
        <Input value={formData.address} onChange={e => updateForm({ address: e.target.value })} placeholder="Street and number" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
          <Input value={formData.city} onChange={e => updateForm({ city: e.target.value })} placeholder="Barcelona" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Postal Code</label>
          <Input value={formData.postal_code} onChange={e => updateForm({ postal_code: e.target.value })} placeholder="08001" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Country *</label>
        <Input value={formData.country} onChange={e => updateForm({ country: e.target.value })} placeholder="Spain" />
      </div>
    </StepCard>
  );
}