import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const PREDEFINED_VARIABLES = {
  qualification_update: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'property_address', description: 'Property address' },
    { name: 'qualification_score', description: 'Qualification score (0-100)' },
    { name: 'status', description: 'Application status' },
  ],
  viewing_confirmation: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'property_address', description: 'Property address' },
    { name: 'viewing_date', description: 'Viewing date' },
    { name: 'viewing_time', description: 'Viewing time' },
  ],
  document_request: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'required_documents', description: 'List of required documents' },
    { name: 'deadline', description: 'Document submission deadline' },
  ],
  approval: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'property_address', description: 'Property address' },
    { name: 'move_in_date', description: 'Move-in date' },
  ],
  rejection: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'property_address', description: 'Property address' },
    { name: 'reason', description: 'Rejection reason' },
  ],
  contract_signature: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'property_address', description: 'Property address' },
    { name: 'signature_link', description: 'Contract signing link' },
    { name: 'deadline', description: 'Signature deadline' },
  ],
  general: [
    { name: 'tenant_name', description: 'Tenant full name' },
    { name: 'property_address', description: 'Property address' },
  ],
};

export default function EmailTemplateEditor({ template, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState(template || {
    name: '',
    template_type: 'general',
    subject: '',
    body: '',
    variables: [],
    is_default: false,
    status: 'active',
  });

  const [showVariableInput, setShowVariableInput] = useState(false);
  const [newVariable, setNewVariable] = useState({ name: '', description: '' });

  useEffect(() => {
    // Auto-populate variables based on template type
    if (!template && formData.template_type) {
      setFormData(prev => ({
        ...prev,
        variables: PREDEFINED_VARIABLES[formData.template_type] || [],
      }));
    }
  }, [formData.template_type, template]);

  const handleAddVariable = () => {
    if (newVariable.name.trim()) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable],
      }));
      setNewVariable({ name: '', description: '' });
      setShowVariableInput(false);
    }
  };

  const handleRemoveVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const insertVariable = (varName) => {
    const textarea = document.getElementById('body-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newBody = 
      formData.body.substring(0, start) + 
      `{{${varName}}}` + 
      formData.body.substring(end);
    setFormData(prev => ({ ...prev, body: newBody }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{template ? 'Edit Template' : 'Create New Template'}</CardTitle>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Template Name *</label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Viewing Confirmation - Standard"
              className="bg-card"
            />
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Template Type *</label>
            <select
              value={formData.template_type}
              onChange={e => setFormData({ ...formData, template_type: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            >
              {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Subject *</label>
            <Input
              value={formData.subject}
              onChange={e => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Your apartment viewing is confirmed"
              className="bg-card"
            />
          </div>

          {/* Status & Default */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">Set as Default Template</span>
              </label>
            </div>
          </div>

          {/* Variables */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-slate-700">Available Variables</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVariableInput(!showVariableInput)}
                className="flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Variable
              </Button>
            </div>

            {showVariableInput && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
                <Input
                  placeholder="Variable name (e.g., tenant_name)"
                  value={newVariable.name}
                  onChange={e => setNewVariable({ ...newVariable, name: e.target.value })}
                  className="bg-white"
                />
                <Input
                  placeholder="Description"
                  value={newVariable.description}
                  onChange={e => setNewVariable({ ...newVariable, description: e.target.value })}
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddVariable} size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Add
                  </Button>
                  <Button onClick={() => setShowVariableInput(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {formData.variables?.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg">
                  <button
                    onClick={() => insertVariable(v.name)}
                    title={v.description}
                    className="font-mono text-sm text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                  >
                    {`{{${v.name}}}`}
                  </button>
                  <button
                    onClick={() => handleRemoveVariable(idx)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Click a variable to insert it into the email body</p>
          </div>

          {/* Body Editor */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Body (HTML) *</label>
            <textarea
              id="body-editor"
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter email content. Use HTML formatting and {{variable}} syntax for dynamic content."
              className="w-full h-48 rounded-md border border-input bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">Supports HTML. Click variables above to insert them.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={() => onSave(formData)}
              disabled={!formData.name || !formData.subject || !formData.body || isSaving}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}