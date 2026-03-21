import React, { useState } from 'react';
import { FileText, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContractTemplateSelector({ selectedOption, onOptionChange, onPdfUpload }) {
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onPdfUpload(file);
      onOptionChange('upload');
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Contract Template</label>
      <div className="grid grid-cols-3 gap-3">
        {/* Generate */}
        <button
          onClick={() => onOptionChange('generate')}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            selectedOption === 'generate'
              ? 'border-orange-500 bg-orange-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <Wand2 className={`w-6 h-6 mb-2 ${selectedOption === 'generate' ? 'text-orange-600' : 'text-slate-600'}`} />
          <p className={`font-semibold text-sm ${selectedOption === 'generate' ? 'text-orange-900' : 'text-slate-900'}`}>
            Generate
          </p>
          <p className="text-xs text-slate-600 mt-1">Auto-fill & customize</p>
        </button>

        {/* Customize */}
        <button
          onClick={() => onOptionChange('customize')}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            selectedOption === 'customize'
              ? 'border-orange-500 bg-orange-50'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <FileText className={`w-6 h-6 mb-2 ${selectedOption === 'customize' ? 'text-orange-600' : 'text-slate-600'}`} />
          <p className={`font-semibold text-sm ${selectedOption === 'customize' ? 'text-orange-900' : 'text-slate-900'}`}>
            Customize
          </p>
          <p className="text-xs text-slate-600 mt-1">Edit template text</p>
        </button>

        {/* Upload */}
        <label className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
          selectedOption === 'upload'
            ? 'border-orange-500 bg-orange-50'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}>
          <Upload className={`w-6 h-6 mb-2 ${selectedOption === 'upload' ? 'text-orange-600' : 'text-slate-600'}`} />
          <p className={`font-semibold text-sm ${selectedOption === 'upload' ? 'text-orange-900' : 'text-slate-900'}`}>
            Upload PDF
          </p>
          <p className="text-xs text-slate-600 mt-1">{fileName || 'Your own PDF'}</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}