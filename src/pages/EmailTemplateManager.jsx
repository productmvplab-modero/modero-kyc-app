import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/modero/Header';
import EmailTemplateList from '@/components/admin/EmailTemplateList';
import EmailTemplateEditor from '@/components/admin/EmailTemplateEditor';
import EmailTemplatePreview from '@/components/admin/EmailTemplatePreview';
import { Card } from '@/components/ui/card';

export default function EmailTemplateManager() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Fetch all templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list(),
  });

  // Create/Update mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template) => {
      if (template.id) {
        await base44.entities.EmailTemplate.update(template.id, template);
      } else {
        await base44.entities.EmailTemplate.create(template);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setShowEditor(false);
      setEditingTemplate(null);
    },
  });

  // Delete mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId) => {
      if (window.confirm('Are you sure you want to delete this template?')) {
        await base44.entities.EmailTemplate.delete(templateId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDelete = (templateId) => {
    deleteTemplateMutation.mutate(templateId);
  };

  const handleView = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleSave = (templateData) => {
    saveTemplateMutation.mutate(templateData);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Email Template Manager</h1>
            <p className="text-slate-600">Create and customize email templates for automated notifications</p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-slate-600 text-sm mb-2">Total Templates</p>
              <p className="text-3xl font-bold text-orange-600">{templates.length}</p>
            </Card>
            <Card className="p-6">
              <p className="text-slate-600 text-sm mb-2">Active Templates</p>
              <p className="text-3xl font-bold text-green-600">
                {templates.filter(t => t.status === 'active').length}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-slate-600 text-sm mb-2">Template Types</p>
              <p className="text-3xl font-bold text-blue-600">
                {new Set(templates.map(t => t.template_type)).size}
              </p>
            </Card>
          </div>

          {/* Template List */}
          <EmailTemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onCreateNew={handleCreateNew}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={saveTemplateMutation.isPending}
        />
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <EmailTemplatePreview
          template={previewTemplate}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}