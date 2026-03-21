import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, ExternalLink } from 'lucide-react';
import StepCard from './StepCard';
import { base44 } from '@/api/base44Client';

const DOC_TYPES = [
  { key: 'cv_url', label: 'CV / Resume', desc: 'Your most recent curriculum vitae', required: true, icon: '📄' },
  { key: 'payslip_url', label: 'Payslips', desc: 'Last 3 months of payslips', required: true, icon: '💰' },
  { key: 'work_contract_url', label: 'Work Contract', desc: 'Employment or service contract', required: false, icon: '📋' },
  { key: 'id_document_url', label: 'ID Document', desc: 'Passport, DNI, or NIE scan', required: true, icon: '🪪' },
];

function DocUploader({ docType, documents, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const url = documents[docType.key];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUpload(docType.key, file_url);
    setUploading(false);
  };

  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${url ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{docType.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{docType.label}</span>
            {docType.required && <span className="text-xs text-orange-500 font-medium">Required</span>}
            {url && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{docType.desc}</p>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-green-600 mt-1 hover:underline">
              <ExternalLink className="w-3 h-3" /> View uploaded file
            </a>
          )}
        </div>
        <label className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${url ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
          {uploading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3 h-3" />}
          {url ? 'Replace' : 'Upload'}
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}

export default function Step4Documents({ formData, updateForm, onNext, onBack }) {
  const [loading, setLoading] = useState(false);

  const requiredDocs = DOC_TYPES.filter(d => d.required);
  const allRequired = requiredDocs.every(d => formData.documents[d.key]);

  const handleUpload = (key, url) => {
    updateForm({ documents: { ...formData.documents, [key]: url } });
  };

  return (
    <StepCard
      icon={FileText}
      title="Upload Your Documents"
      subtitle="Please upload the required documents to proceed with your application"
      onNext={async () => { setLoading(true); await onNext(); setLoading(false); }}
      onBack={onBack}
      nextDisabled={!allRequired}
      loading={loading}
    >
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
        <span className="text-lg">📌</span>
        <p className="text-xs text-orange-700">All files are encrypted and stored securely. Only authorized parties can access your documents.</p>
      </div>

      <div className="space-y-3">
        {DOC_TYPES.map(doc => (
          <DocUploader key={doc.key} docType={doc} documents={formData.documents} onUpload={handleUpload} />
        ))}
      </div>

      <div className="text-xs text-slate-400 text-center">
        {requiredDocs.filter(d => formData.documents[d.key]).length} / {requiredDocs.length} required documents uploaded
      </div>
    </StepCard>
  );
}