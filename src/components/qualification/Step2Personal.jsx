import React, { useState } from 'react';
import { User, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';
import { base44 } from '@/api/base44Client';

export default function Step2Personal({ formData, updateForm, onNext, onBack, t }) {
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

  const genders = [
    { val: 'male', label: t('s2_gender_male') },
    { val: 'female', label: t('s2_gender_female') },
    { val: 'other', label: t('s2_gender_other') },
    { val: 'prefer_not_to_say', label: t('s2_gender_prefer') },
  ];

  const showGermanIdField = formData.country === 'Germany' || formData.country === 'germany' || formData.nationality === 'German';

  return (
    <StepCard
      icon={User}
      title={t('s2_title')}
      subtitle={t('s2_subtitle')}
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!canContinue}
      loading={loading}
      t={t}
    >
      {/* Profile Photo */}
       <div className="flex flex-col items-center mb-6 pb-4 border-b border-border">
         <div className="relative">
           {formData.profile_picture_url ? (
             <img src={formData.profile_picture_url} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-secondary" />
           ) : (
             <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-orange-200">
               <User className="w-10 h-10 text-white" />
             </div>
           )}
           <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center cursor-pointer hover:from-orange-500 hover:to-orange-700 transition-all shadow-md">
             {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
             <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
           </label>
         </div>
         <p className="text-xs text-muted-foreground mt-3 font-medium">{t('s2_photo')}</p>
       </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_first_name')}</label>
          <Input value={formData.first_name} onChange={e => updateForm({ first_name: e.target.value })} placeholder="John" className="bg-card" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_last_name')}</label>
            <Input value={formData.last_name} onChange={e => updateForm({ last_name: e.target.value })} placeholder="Doe" className="bg-card" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{showGermanIdField ? 'National ID (Personalausweis)' : t('s2_dni')}</label>
            <Input value={formData.dni_nie_number} onChange={e => updateForm({ dni_nie_number: e.target.value })} placeholder={showGermanIdField ? "e.g., 12345678 A" : t('s2_dni_ph')} className="bg-card" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_age')}</label>
            <Input type="number" min={18} max={99} value={formData.age} onChange={e => updateForm({ age: e.target.value })} placeholder="30" className="bg-card" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_gender')}</label>
            <select
              value={formData.gender}
              onChange={e => updateForm({ gender: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              <option value="">{t('s2_gender_placeholder')}</option>
              {genders.map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_nationality')}</label>
          <Input value={formData.nationality} onChange={e => updateForm({ nationality: e.target.value })} placeholder={t('s2_nationality_ph')} className="bg-card" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_pob')}</label>
          <Input value={formData.place_of_birth} onChange={e => updateForm({ place_of_birth: e.target.value })} placeholder={t('s2_pob_ph')} className="bg-card" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_address')}</label>
          <Input value={formData.address} onChange={e => updateForm({ address: e.target.value })} placeholder={t('s2_address_ph')} className="bg-card" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_city')}</label>
            <Input value={formData.city} onChange={e => updateForm({ city: e.target.value })} placeholder={t('s2_city_ph')} className="bg-card" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_postal')}</label>
            <Input value={formData.postal_code} onChange={e => updateForm({ postal_code: e.target.value })} placeholder={t('s2_postal_ph')} className="bg-card" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_country')}</label>
          <Input value={formData.country} onChange={e => updateForm({ country: e.target.value })} placeholder={t('s2_country_ph')} className="bg-card" />
        </div>
      </div>
    </StepCard>
  );
}