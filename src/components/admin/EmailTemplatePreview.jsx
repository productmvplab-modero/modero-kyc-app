import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TEMPLATE_TYPES = {
  qualification_update: 'Qualification Update',
  viewing_confirmation: 'Viewing Confirmation',
  document_request: 'Document Request',
  approval: 'Approval',
  rejection: 'Rejection',
  contract_signature: 'Contract Signature',
  general: 'General',
};

// Sample data for previewing templates
const SAMPLE_DATA = {
  tenant_name: 'John Doe',
  property_address: '123 Main Street, Barcelona',
  viewing_date: 'Monday, March 25, 2026',
  viewing_time: '14:00',
  qualification_score: '85',
  status: 'qualified',
  required_documents: 'CV, Payslips, ID Document',
  deadline: 'April 1, 2026',
  move_in_date: 'April 1, 2026',
  reason: 'Credit score below threshold',
  signature_link: 'https://modero.app/sign/contract123',
  property_city: 'Barcelona',
};

export default function EmailTemplatePreview({ template, onClose }) {
  const previewBody = template.body.replace(
    /{{(\w+)}}/g,
    (match, variable) => SAMPLE_DATA[variable] || match
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
          <div>
            <CardTitle>Template Preview</CardTitle>
            <p className="text-sm text-slate-500 mt-1">{template.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Template Info */}
          <div className="grid md:grid-cols-2 gap-4 pb-6 border-b border-slate-200">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Type</p>
              <p className="font-semibold text-slate-800">{TEMPLATE_TYPES[template.template_type]}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                template.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {template.status}
              </span>
            </div>
          </div>

          {/* Email Preview */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3 font-semibold">Email Preview</p>
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              {/* Email Header */}
              <div className="bg-white p-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 mb-1">From:</p>
                <p className="font-semibold text-slate-800 mb-4">Modero Notifications</p>
                <p className="text-xs text-slate-500 mb-1">Subject:</p>
                <p className="font-semibold text-slate-800">{template.subject}</p>
              </div>

              {/* Email Body */}
              <div className="p-6 bg-white">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewBody }}
                />
              </div>
            </div>
          </div>

          {/* Variable Reference */}
          {template.variables && template.variables.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3 font-semibold">Variable Reference</p>
              <div className="space-y-2">
                {template.variables.map((v, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <code className="font-mono text-orange-600 font-semibold bg-slate-100 px-2 py-1 rounded">
                      {{{v.name}}}
                    </code>
                    <span className="text-slate-600">{v.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}