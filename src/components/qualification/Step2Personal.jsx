import React, { useState } from 'react';
import { User, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StepCard from './StepCard';
import { base44 } from '@/api/base44Client';

export default function Step2Personal({ formData, updateForm, onNext, onBack, t }) {
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = formData.first_name && formData.last_name && formData.city && formData.country && formData.nationality && formData.dni_nie_number && formData.national_tax_id;

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

  const nationalities = [
    "Afghan","Albanian","Algerian","American","Andorran","Angolan","Argentine","Armenian","Australian","Austrian",
    "Azerbaijani","Bahamian","Bahraini","Bangladeshi","Barbadian","Belarusian","Belgian","Belizean","Beninese","Bhutanese",
    "Bolivian","Bosnian","Brazilian","British","Bruneian","Bulgarian","Burkinabe","Burmese","Burundian","Cambodian",
    "Cameroonian","Canadian","Cape Verdean","Central African","Chadian","Chilean","Chinese","Colombian","Comorian","Congolese",
    "Costa Rican","Croatian","Cuban","Cypriot","Czech","Danish","Djiboutian","Dominican","Dutch","Ecuadorian",
    "Egyptian","Emirati","Equatorial Guinean","Eritrean","Estonian","Ethiopian","Fijian","Filipino","Finnish","French",
    "Gabonese","Gambian","Georgian","German","Ghanaian","Greek","Grenadian","Guatemalan","Guinean","Guyanese",
    "Haitian","Honduran","Hungarian","Icelandic","Indian","Indonesian","Iranian","Iraqi","Irish","Israeli",
    "Italian","Ivorian","Jamaican","Japanese","Jordanian","Kazakh","Kenyan","Korean","Kuwaiti","Kyrgyz",
    "Lao","Latvian","Lebanese","Liberian","Libyan","Lithuanian","Luxembourgish","Macedonian","Malagasy","Malawian",
    "Malaysian","Maldivian","Malian","Maltese","Mauritanian","Mauritian","Mexican","Moldovan","Monegasque","Mongolian",
    "Montenegrin","Moroccan","Mozambican","Namibian","Nepalese","New Zealander","Nicaraguan","Nigerian","Norwegian","Omani",
    "Pakistani","Palestinian","Panamanian","Paraguayan","Peruvian","Polish","Portuguese","Qatari","Romanian","Russian",
    "Rwandan","Saudi","Senegalese","Serbian","Sierra Leonean","Singaporean","Slovak","Slovenian","Somali","South African",
    "South Sudanese","Spanish","Sri Lankan","Sudanese","Surinamese","Swedish","Swiss","Syrian","Taiwanese","Tajik",
    "Tanzanian","Thai","Togolese","Trinidadian","Tunisian","Turkish","Turkmen","Ugandan","Ukrainian","Uruguayan",
    "Uzbek","Venezuelan","Vietnamese","Yemeni","Zambian","Zimbabwean"
  ];

  const countries = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
    "Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
    "Bosnia and Herzegovina","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde",
    "Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba",
    "Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea",
    "Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
    "Greece","Grenada","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India",
    "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan",
    "Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Liberia","Libya","Lithuania","Luxembourg",
    "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova",
    "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand",
    "Nicaragua","Nigeria","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama","Paraguay","Peru",
    "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia",
    "Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Sudan","Spain","Sri Lanka","Sudan",
    "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago",
    "Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan",
    "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
  ];

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
        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_first_name')}</label>
          <Input value={formData.first_name} onChange={e => updateForm({ first_name: e.target.value })} placeholder="John" className="bg-card" />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_last_name')}</label>
          <Input value={formData.last_name} onChange={e => updateForm({ last_name: e.target.value })} placeholder="Doe" className="bg-card" />
        </div>

        {/* DNI/ID */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{showGermanIdField ? 'National ID (Personalausweis)' : t('s2_dni')}</label>
          <Input value={formData.dni_nie_number} onChange={e => updateForm({ dni_nie_number: e.target.value })} placeholder={showGermanIdField ? "e.g., 12345678 A" : t('s2_dni_ph')} className="bg-card" />
        </div>

        {/* National Tax/Registration ID */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">National Tax/Registration ID *</label>
          <p className="text-xs text-muted-foreground mb-2">
            {formData.country === 'Spain' && 'e.g., NIF or CIF'}
            {formData.country === 'France' && 'e.g., SIREN or SIRET'}
            {formData.country === 'Germany' && 'e.g., Steuernummer'}
            {formData.country === 'Netherlands' && 'e.g., BSN or BTW ID'}
            {formData.country === 'Portugal' && 'e.g., NIF'}
            {formData.country === 'Italy' && 'e.g., Codice Fiscale'}
            {formData.country === 'Belgium' && 'e.g., National Register Number'}
            {!['Spain', 'France', 'Germany', 'Netherlands', 'Portugal', 'Italy', 'Belgium'].includes(formData.country) && 'Please provide your national tax or registration ID'}
          </p>
          <Input value={formData.national_tax_id} onChange={e => updateForm({ national_tax_id: e.target.value })} placeholder="Enter your national tax/registration ID" className="bg-card" />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_age')}</label>
          <Input type="number" min={18} max={99} value={formData.age} onChange={e => updateForm({ age: e.target.value })} placeholder="30" className="bg-card" />
        </div>

        {/* Gender */}
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

        {/* Nationality */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_nationality')} *</label>
          <select
            value={formData.nationality}
            onChange={e => updateForm({ nationality: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="">{t('s2_nationality_ph')}</option>
            {nationalities.map(nat => <option key={nat} value={nat}>{nat}</option>)}
          </select>
        </div>

        {/* Place of Birth */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_pob')}</label>
          <Input value={formData.place_of_birth} onChange={e => updateForm({ place_of_birth: e.target.value })} placeholder={t('s2_pob_ph')} className="bg-card" />
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_address')}</label>
          <Input value={formData.address} onChange={e => updateForm({ address: e.target.value })} placeholder={t('s2_address_ph')} className="bg-card" />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_city')}</label>
          <Input value={formData.city} onChange={e => updateForm({ city: e.target.value })} placeholder={t('s2_city_ph')} className="bg-card" />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_postal')}</label>
          <Input value={formData.postal_code} onChange={e => updateForm({ postal_code: e.target.value })} placeholder={t('s2_postal_ph')} className="bg-card" />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">{t('s2_country')} *</label>
          <select
            value={formData.country}
            onChange={e => updateForm({ country: e.target.value })}
            className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="">{t('s2_country_ph')}</option>
            {countries.map(country => <option key={country} value={country}>{country}</option>)}
          </select>
        </div>
      </div>
    </StepCard>
  );
}