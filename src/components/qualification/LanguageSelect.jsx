import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹', native: 'Português' },
  { code: 'it', label: 'Italian', flag: '🇮🇹', native: 'Italiano' },
];

export default function LanguageSelect({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Modero
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-1">
            {selected ? ({ en: 'Welcome! Start your application process.', es: '¡Bienvenido! Comienza tu proceso de solicitud.', pt: 'Bem-vindo! Inicie o seu processo de candidatura.', it: 'Benvenuto! Inizia il tuo processo di candidatura.' }[selected]) : 'Welcome to Modero'}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-6">
            {selected
              ? ({ en: 'You have applied to rent an apartment. Please select your preferred language to begin the qualification process. You are just 7 steps away from being qualified!', es: 'Ha solicitado alquilar un apartamento. Seleccione su idioma preferido para comenzar el proceso de calificación. ¡Está a solo 7 pasos de ser calificado!', pt: 'Você solicitou alugar um apartamento. Selecione seu idioma preferido para iniciar o processo de qualificação. Você está a apenas 7 passos de ser qualificado!', it: 'Hai richiesto di affittare un appartamento. Seleziona la tua lingua preferita per iniziare il processo di qualificazione. Sei a soli 7 passi dalla qualificazione!' }[selected])
              : 'Please select your preferred language to begin'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelected(lang.code)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selected === lang.code
                    ? 'border-orange-400 bg-orange-50 shadow-sm'
                    : 'border-slate-200 hover:border-orange-200 bg-white hover:bg-orange-50/40'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">{lang.native}</div>
                  <div className="text-xs text-slate-400">{lang.label}</div>
                </div>
                {selected === lang.code && (
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {{ en: 'Continue', es: 'Continuar', pt: 'Continuar', it: 'Continua' }[selected] || 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}