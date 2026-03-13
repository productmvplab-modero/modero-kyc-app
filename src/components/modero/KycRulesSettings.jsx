import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Loader2, ShieldCheck, TrendingUp, Banknote, Briefcase, FileText, AlertTriangle, Zap, Phone, Link2, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Section = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
    <div className="flex items-center gap-3 mb-5">
      <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const ToggleRow = ({ label, description, value, onChange, required }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1 pr-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        {required && <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-medium">Required</span>}
      </div>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <Switch checked={value} onCheckedChange={onChange} />
  </div>
);

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: 'bg-slate-100 text-slate-600',  icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',    icon: RefreshCw },
  verified:    { label: 'Verified',    color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  rejected:    { label: 'Rejected',    color: 'bg-red-100 text-red-700',      icon: XCircle },
};

const StatusBadge = ({ status = 'pending' }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const IntegrationCard = ({ logo, name, description, provider, enabled, onToggle, weight }) => (
  <div className={`rounded-xl border-2 p-5 transition-all ${enabled ? 'border-indigo-200 bg-indigo-50/40' : 'border-slate-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold ${enabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {logo}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-sm">{name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{provider}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
    <p className="text-xs text-slate-500 mt-3 leading-relaxed">{description}</p>
    {weight && (
      <p className="text-xs text-indigo-600 font-medium mt-2">+{weight} pts to verification score</p>
    )}
  </div>
);

const DEFAULT_SETTINGS = {
  identity_verification_required: true,
  acceptable_id_types: ['passport', 'national_id'],
  id_verified_before_qualification: true,
  mobile_verification_required: true,
  email_verification_required: true,
  business_email_verification_required: false,
  min_credit_score: 60,
  credit_check_required: true,
  max_rent_to_income_ratio: 40,
  min_income_multiplier: 3,
  income_docs_required: ['payslips'],
  employment_status_required: true,
  linkedin_verification_required: false,
  require_proof_of_income: true,
  require_employment_contract: false,
  require_id_document: true,
  require_tax_declaration: false,
  flag_low_credit_score: true,
  flag_missing_id: true,
  flag_incomplete_docs: true,
  flag_unverified_contact: true,
  auto_approve_logic: 'manual_review',
  integration_linkedin_enabled: false,
  integration_identomat_enabled: false,
  integration_twilio_enabled: false,
  integration_business_email_enabled: false,
  integration_dnb_enabled: false,
  integration_psd2_enabled: false,
};

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'residence_permit', label: 'Residence Permit' },
];

const INCOME_DOCS = [
  { value: 'payslips', label: 'Payslips' },
  { value: 'employment_contract', label: 'Employment Contract' },
  { value: 'tax_declaration', label: 'Tax Declaration' },
];

export default function KycRulesSettings({ userEmail }) {
  const queryClient = useQueryClient();
  const [rules, setRules] = useState(DEFAULT_SETTINGS);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['kycSettings', userEmail],
    queryFn: () => base44.entities.KycSettings.filter({ owner_email: userEmail }),
    enabled: !!userEmail,
  });

  useEffect(() => {
    if (existing && existing.length > 0) {
      setRules({ ...DEFAULT_SETTINGS, ...existing[0] });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existing && existing.length > 0) {
        return base44.entities.KycSettings.update(existing[0].id, data);
      }
      return base44.entities.KycSettings.create({ ...data, owner_email: userEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycSettings', userEmail] });
      toast.success('KYC rules saved successfully');
    },
  });

  const set = (field, value) => setRules((r) => ({ ...r, [field]: value }));

  const toggleArrayItem = (field, value) => {
    setRules((r) => {
      const arr = r[field] || [];
      return { ...r, [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">KYC Rules & Screening</h2>
          <p className="text-sm text-slate-500 mt-1">Configure tenant qualification requirements for your properties</p>
        </div>
        <Button onClick={() => saveMutation.mutate(rules)} disabled={saveMutation.isPending} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Rules
        </Button>
      </div>

      {/* Identity */}
      <Section icon={ShieldCheck} title="Identity Verification" description="Control ID verification requirements">
        <ToggleRow label="Require ID Verification" value={rules.identity_verification_required} onChange={(v) => set('identity_verification_required', v)} required />
        <ToggleRow label="Identity Verified Before Qualification" value={rules.id_verified_before_qualification} onChange={(v) => set('id_verified_before_qualification', v)} />
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Acceptable ID Types</Label>
          <div className="flex flex-wrap gap-4">
            {ID_TYPES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={(rules.acceptable_id_types || []).includes(value)} onCheckedChange={() => toggleArrayItem('acceptable_id_types', value)} />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section icon={Phone} title="Contact Verification" description="Verify tenant contact information">
        <ToggleRow label="Mobile Phone Verification Required" value={rules.mobile_verification_required} onChange={(v) => set('mobile_verification_required', v)} />
        <ToggleRow label="Email Verification Required" value={rules.email_verification_required} onChange={(v) => set('email_verification_required', v)} />
        <ToggleRow label="Business Email Verification Required" value={rules.business_email_verification_required} onChange={(v) => set('business_email_verification_required', v)} />
      </Section>

      {/* Credit */}
      <Section icon={Banknote} title="Creditworthiness" description="Set credit score and check requirements">
        <ToggleRow label="Credit Check Required" value={rules.credit_check_required} onChange={(v) => set('credit_check_required', v)} />
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Minimum Credit Score (1–100)</Label>
            <Input type="number" min={1} max={100} value={rules.min_credit_score} onChange={(e) => set('min_credit_score', Number(e.target.value))} className="border-slate-200" />
          </div>
        </div>
      </Section>

      {/* Income */}
      <Section icon={Banknote} title="Income & Affordability" description="Define income and affordability thresholds">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Max Rent-to-Income Ratio (%)</Label>
            <Input type="number" min={1} max={100} value={rules.max_rent_to_income_ratio} onChange={(e) => set('max_rent_to_income_ratio', Number(e.target.value))} className="border-slate-200" />
            <p className="text-xs text-slate-400 mt-1">e.g. 40 means rent ≤ 40% of monthly income</p>
          </div>
          <div className="flex-1">
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Minimum Income Multiplier (x rent)</Label>
            <Input type="number" min={1} max={10} step={0.5} value={rules.min_income_multiplier} onChange={(e) => set('min_income_multiplier', Number(e.target.value))} className="border-slate-200" />
            <p className="text-xs text-slate-400 mt-1">e.g. 3 means income must be ≥ 3× monthly rent</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Required Income Documentation</Label>
          <div className="flex flex-wrap gap-4">
            {INCOME_DOCS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={(rules.income_docs_required || []).includes(value)} onCheckedChange={() => toggleArrayItem('income_docs_required', value)} />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      {/* Employment */}
      <Section icon={Briefcase} title="Employment Verification" description="Verify employment and professional profiles">
        <ToggleRow label="Employment Status Required" value={rules.employment_status_required} onChange={(v) => set('employment_status_required', v)} />
        <ToggleRow label="LinkedIn Profile Verification Required" value={rules.linkedin_verification_required} onChange={(v) => set('linkedin_verification_required', v)} />
      </Section>

      {/* Documents */}
      <Section icon={FileText} title="Required Documents" description="Specify which documents tenants must submit">
        <ToggleRow label="Proof of Income" value={rules.require_proof_of_income} onChange={(v) => set('require_proof_of_income', v)} />
        <ToggleRow label="Employment Contract" value={rules.require_employment_contract} onChange={(v) => set('require_employment_contract', v)} />
        <ToggleRow label="ID Document" value={rules.require_id_document} onChange={(v) => set('require_id_document', v)} required />
        <ToggleRow label="Tax Declaration" value={rules.require_tax_declaration} onChange={(v) => set('require_tax_declaration', v)} />
      </Section>

      {/* Verification Integrations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Verification Integrations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Enable third-party verification providers for your KYC workflow</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-5 pl-12">Each enabled integration contributes to the overall tenant verification score. Statuses are shown per tenant in their profile.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IntegrationCard
            logo="in"
            name="LinkedIn Verification"
            provider="LinkedIn"
            description="Confirm employment history and professional identity by connecting the tenant's LinkedIn profile."
            enabled={rules.integration_linkedin_enabled}
            onToggle={(v) => set('integration_linkedin_enabled', v)}
            weight={15}
          />
          <IntegrationCard
            logo="🪪"
            name="Biometric ID Verification"
            provider="Identomat"
            description="Verify ID documents and perform facial biometric checks to confirm the tenant's real identity."
            enabled={rules.integration_identomat_enabled}
            onToggle={(v) => set('integration_identomat_enabled', v)}
            weight={25}
          />
          <IntegrationCard
            logo="💬"
            name="SMS Mobile Verification"
            provider="Twilio"
            description="Send a one-time code to the tenant's mobile number to confirm ownership of the phone number."
            enabled={rules.integration_twilio_enabled}
            onToggle={(v) => set('integration_twilio_enabled', v)}
            weight={10}
          />
          <IntegrationCard
            logo="@"
            name="Business Email Verification"
            provider="Email Validation"
            description="Confirm the validity and ownership of the tenant's business email address domain."
            enabled={rules.integration_business_email_enabled}
            onToggle={(v) => set('integration_business_email_enabled', v)}
            weight={10}
          />
          <IntegrationCard
            logo="📊"
            name="Credit Check"
            provider="Dun & Bradstreet"
            description="Assess financial reliability and creditworthiness through Dun & Bradstreet's comprehensive credit database."
            enabled={rules.integration_dnb_enabled}
            onToggle={(v) => set('integration_dnb_enabled', v)}
            weight={30}
          />
          <IntegrationCard
            logo="🏦"
            name="Bank Account Verification"
            provider="PSD2 Open Banking"
            description="Verify the tenant's bank account and financial information through secure PSD2 open banking authentication."
            enabled={rules.integration_psd2_enabled}
            onToggle={(v) => set('integration_psd2_enabled', v)}
            weight={20}
          />
        </div>

        {/* Score preview */}
        <div className="mt-5 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Max Achievable Verification Score</span>
            <span className="text-lg font-bold text-indigo-600">
              {[
                rules.integration_linkedin_enabled && 15,
                rules.integration_identomat_enabled && 25,
                rules.integration_twilio_enabled && 10,
                rules.integration_business_email_enabled && 10,
                rules.integration_dnb_enabled && 30,
                rules.integration_psd2_enabled && 20,
              ].filter(Boolean).reduce((a, b) => a + b, 0)} / 110 pts
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ([
                rules.integration_linkedin_enabled && 15,
                rules.integration_identomat_enabled && 25,
                rules.integration_twilio_enabled && 10,
                rules.integration_business_email_enabled && 10,
                rules.integration_dnb_enabled && 30,
                rules.integration_psd2_enabled && 20,
              ].filter(Boolean).reduce((a, b) => a + b, 0) / 110) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Enable more integrations to increase the maximum qualification score available to tenants.</p>
        </div>
      </div>

      {/* Risk Flags */}
      <Section icon={AlertTriangle} title="Tenant Risk Flags" description="Rules that trigger warnings or manual review">
        <ToggleRow label="Flag: Credit Score Below Threshold" value={rules.flag_low_credit_score} onChange={(v) => set('flag_low_credit_score', v)} />
        <ToggleRow label="Flag: Missing Identity Verification" value={rules.flag_missing_id} onChange={(v) => set('flag_missing_id', v)} />
        <ToggleRow label="Flag: Incomplete Documentation" value={rules.flag_incomplete_docs} onChange={(v) => set('flag_incomplete_docs', v)} />
        <ToggleRow label="Flag: Unverified Contact Information" value={rules.flag_unverified_contact} onChange={(v) => set('flag_unverified_contact', v)} />
      </Section>

      {/* Auto Logic */}
      <Section icon={Zap} title="Automatic Qualification Logic" description="Define how tenants are qualified based on rule combinations">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">Default Qualification Decision</Label>
          <Select value={rules.auto_approve_logic} onValueChange={(v) => set('auto_approve_logic', v)}>
            <SelectTrigger className="max-w-xs border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_approve">
                <span className="text-green-700 font-medium">Auto Approve</span> — automatically qualify if all rules pass
              </SelectItem>
              <SelectItem value="manual_review">
                <span className="text-amber-700 font-medium">Manual Review</span> — always require landlord review
              </SelectItem>
              <SelectItem value="auto_reject">
                <span className="text-red-700 font-medium">Auto Reject</span> — reject if any rule fails
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'auto_approve', label: 'Auto Approve', desc: 'All rules pass → instantly qualified', color: 'border-green-200 bg-green-50 text-green-800' },
              { value: 'manual_review', label: 'Manual Review', desc: 'Landlord reviews every application', color: 'border-amber-200 bg-amber-50 text-amber-800' },
              { value: 'auto_reject', label: 'Auto Reject', desc: 'Any rule fails → automatically rejected', color: 'border-red-200 bg-red-50 text-red-800' },
            ].map(({ value, label, desc, color }) => (
              <button
                key={value}
                onClick={() => set('auto_approve_logic', value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${rules.auto_approve_logic === value ? color + ' ring-2 ring-offset-1 ring-current' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs mt-0.5 text-slate-500">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <div className="flex justify-end mt-6">
        <Button onClick={() => saveMutation.mutate(rules)} disabled={saveMutation.isPending} className="gap-2 bg-indigo-600 hover:bg-indigo-700 px-8">
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Rules
        </Button>
      </div>
    </div>
  );
}