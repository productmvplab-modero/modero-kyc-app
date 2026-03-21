import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/modero/Header';
import EmailTemplateList from '@/components/admin/EmailTemplateList';
import EmailTemplateEditor from '@/components/admin/EmailTemplateEditor';
import EmailTemplatePreview from '@/components/admin/EmailTemplatePreview';

export default function AdminEmailTemplates() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch email templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates', currentUser?.email],
    queryFn: () => {
      if (!currentUser?.email) return [];
      return base44.entities.EmailTemplate.filter({
        owner_email: currentUser.email,
      });
    },
    enabled: !!currentUser?.email,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (templateData) => {
      if (editingTemplate) {
        return base44.entities.EmailTemplate.update(editingTemplate.id, templateData);
      } else {
        return base44.entities.EmailTemplate.create({
          ...templateData,
          owner_email: currentUser.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setShowEditor(false);
      setEditingTemplate(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (templateId) => base44.entities.EmailTemplate.delete(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleDelete = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleView = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30">
      <Header />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Email Templates</h1>
            <p className="text-slate-600">Manage and customize automated notification emails</p>
          </div>

          {/* Main Content */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <EmailTemplateList
                templates={templates}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onCreateNew={handleCreateNew}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <EmailTemplateEditor
          template={editingTemplate}
          onSave={(data) => saveMutation.mutate(data)}
          onCancel={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          isSaving={saveMutation.isPending}
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