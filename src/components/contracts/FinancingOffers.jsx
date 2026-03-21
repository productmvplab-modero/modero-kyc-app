import React from 'react';
import { CreditCard } from 'lucide-react';

const FINANCING_OPTIONS = [
  {
    id: 'klarna',
    name: 'Klarna',
    description: 'Buy now, pay later',
    subtext: 'Flexible payment plans',
    color: 'bg-blue-50 border-blue-200 text-blue-900'
  },
  {
    id: 'santander',
    name: 'Santander',
    description: 'Personal financing',
    subtext: 'Competitive interest rates',
    color: 'bg-red-50 border-red-200 text-red-900'
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
      <div className="grid grid-cols-2 gap-3">
        {FINANCING_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => onToggleOffer(option.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedOffers.includes(option.id)
                ? `border-orange-500 ${option.color}`
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <CreditCard className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                selectedOffers.includes(option.id) ? 'text-orange-600' : 'text-slate-600'
              }`} />
              <div className="flex-1">
                <p className={`font-semibold text-sm ${
                  selectedOffers.includes(option.id) ? '' : 'text-slate-900'
                }`}>
                  {option.name}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{option.description}</p>
                <p className="text-xs text-slate-500 mt-1">{option.subtext}</p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                selectedOffers.includes(option.id)
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-slate-300'
              }`}>
                {selectedOffers.includes(option.id) && (
                  <span className="text-white text-sm">✓</span>
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