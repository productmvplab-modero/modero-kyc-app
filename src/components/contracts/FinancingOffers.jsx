import React from 'react';
import { Check } from 'lucide-react';

const FINANCING_OPTIONS = [
  {
    id: 'klarna',
    name: 'Klarna',
    description: 'Buy now, pay later with flexible instalments',
    badge: 'K',
    badgeBg: 'bg-pink-300'
  },
  {
    id: 'santander',
    name: 'Santander',
    description: 'Personal financing with competitive rates',
    badge: 'S',
    badgeBg: 'bg-red-600'
  }
];

export default function FinancingOffers({ selectedOffers = [], onToggleOffer, eligible = true }) {
  if (!eligible) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          <strong>Financing not recommended</strong> based on tenant's qualification score. They may not qualify.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Offer Financing Options (Optional)</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FINANCING_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => onToggleOffer(option.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedOffers.includes(option.id)
                ? 'border-orange-400 bg-orange-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg ${option.badgeBg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-lg">{option.badge}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900">
                  {option.name}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{option.description}</p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                selectedOffers.includes(option.id)
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-slate-300'
              }`}>
                {selectedOffers.includes(option.id) && (
                  <Check className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Selected offers will be presented to the tenant as financing alternatives
      </p>
    </div>
  );
}