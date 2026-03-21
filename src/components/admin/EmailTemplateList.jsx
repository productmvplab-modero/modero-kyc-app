import React, { useState } from 'react';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
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

export default function EmailTemplateList({ templates, onEdit, onDelete, onView, onCreateNew, isLoading }) {
  const [filterType, setFilterType] = useState('all');

  const filteredTemplates = filterType === 'all' 
    ? templates 
    : templates.filter(t => t.template_type === filterType);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Email Templates</h2>
          <p className="text-sm text-slate-500 mt-1">Customize notification emails for your tenants</p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterType === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Templates
        </button>
        {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterType(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === key
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTemplates.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500">No templates found. Create one to get started.</p>
          </Card>
        ) : (
          filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{template.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        template.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {template.status}
                      </span>
                      {template.is_default && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">Type:</span> {TEMPLATE_TYPES[template.template_type]}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      <span className="font-medium">Subject:</span> {template.subject}
                    </p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-slate-600 mb-1">Available Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((v, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-mono">
                                      {`{{${v.name}}}`}
                                    </span>
                                  ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(template)}
                      className="text-slate-500 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(template)}
                      className="text-slate-500 hover:text-orange-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(template.id)}
                      className="text-slate-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}