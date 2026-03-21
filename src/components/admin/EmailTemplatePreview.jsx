import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmailTemplatePreview({ template, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Preview: {template.name}</CardTitle>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">From</p>
              <p className="text-sm text-slate-700">noreply@modero.com</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Subject</p>
              <p className="text-sm font-medium text-slate-900">{template.subject}</p>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-lg p-8">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: template.body }}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">Variables used in this template:</p>
            <div className="flex flex-wrap gap-2">
              {template.variables?.map((v, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-mono">
                  {{{v.name}}}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}