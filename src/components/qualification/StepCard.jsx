import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function StepCard({ icon, title, subtitle, children, onNext, onBack, nextLabel, nextDisabled = false, loading = false, hideBack = false, t }) {
  const Icon = icon;
  const backLabel = t ? t('s2_back') : 'Back';
  const continueLabel = nextLabel || (t ? t('s2_next') : 'Continue');

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="mb-6 text-center">
        {Icon && (
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-7 h-7 text-orange-500" />
          </div>
        )}
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="space-y-4">{children}</div>

      <div className={`flex gap-3 mt-8 ${hideBack ? '' : 'justify-between'}`}>
        {!hideBack && (
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2 border-slate-200">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Button>
        )}
        <Button
          onClick={() => onNext()}
          disabled={nextDisabled || loading}
          className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>{continueLabel} <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}