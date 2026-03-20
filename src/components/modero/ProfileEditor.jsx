import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Pencil, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileEditor({ user }) {
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    profile_picture_url: user?.profile_picture_url || '',
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setEditing(false);
      toast.success('Profile updated successfully');
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, profile_picture_url: file_url }));
    setUploadingPhoto(false);
  };

  const handleSave = () => saveMutation.mutate(form);

  const handleCancel = () => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      company_name: user?.company_name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      profile_picture_url: user?.profile_picture_url || '',
    });
    setEditing(false);
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="overflow-hidden rounded-2xl border-0 shadow-md">
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300" />
      <div className="bg-white p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Profile Information</h2>
            <p className="text-sm text-slate-500 mt-1">Manage your personal account details</p>
          </div>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2 bg-orange-500 hover:bg-orange-600">
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-orange-200">
              <AvatarImage src={form.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white font-semibold">{initials}</AvatarFallback>
            </Avatar>
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg hover:from-orange-600 hover:to-amber-500 transition-colors"
              >
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-lg">{user?.full_name || 'Your Name'}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            {user?.role && (
              <span className="inline-block mt-2 text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-full font-medium capitalize">{user.role}</span>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'First Name', field: 'first_name', placeholder: 'John' },
          { label: 'Surname', field: 'last_name', placeholder: 'Doe' },
          { label: 'Company Name', field: 'company_name', placeholder: 'Acme Corp' },
          { label: 'Mobile Number', field: 'phone', placeholder: '+1 234 567 8900' },
          { label: 'City', field: 'city', placeholder: 'Barcelona' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <Label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</Label>
            {editing ? (
              <Input
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="border-slate-200"
              />
            ) : (
              <div className="h-10 px-3 flex items-center text-sm text-slate-800 bg-slate-50 rounded-md border border-slate-100">
                {form[field] || <span className="text-slate-400">Not set</span>}
              </div>
            )}
          </div>
        ))}

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address</Label>
          <div className="h-10 px-3 flex items-center text-sm text-slate-500 bg-slate-50 rounded-md border border-slate-100">
            {user?.email}
            <span className="ml-2 text-xs text-slate-400">(cannot be changed)</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}