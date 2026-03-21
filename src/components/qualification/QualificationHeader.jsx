import React from 'react';

export default function QualificationHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Modero
          </span>
        </div>
        <span className="text-xs text-slate-400 hidden sm:block">Secure Tenant Qualification</span>
      </div>
    </div>
  );
}