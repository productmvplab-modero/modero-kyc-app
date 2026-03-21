import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export default function BankConnectingModal({ bank, onClose, onSuccess }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0) {
      setTimeout(() => setStep(1), 1000);
    } else if (step === 1) {
      setTimeout(() => setStep(2), 3000);
    } else if (step === 2) {
      setTimeout(() => {
        onSuccess(bank);
      }, 2000);
    }
  }, [step, bank, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold">{bank.name[0]}</span>
            </div>
            <div>
              <h2 className="font-bold">link</h2>
              <p className="text-sm opacity-90">Connecting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          <div>
            <div className={`w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center font-bold text-white text-3xl ${bank.color}`}>
              {bank.name[0]}
            </div>
            <h3 className="text-xl font-bold text-slate-900">Log in to {bank.name}</h3>
            <p className="text-sm text-slate-600 mt-2">Fast and simple</p>
            <p className="text-sm text-slate-500">Modero uses Link to securely connect your accounts.</p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { num: 0, title: 'Connecting', icon: step > 0 ? '✓' : '1' },
              { num: 1, title: 'Authorizing', icon: step > 1 ? '✓' : '2' },
              { num: 2, title: 'Verifying', icon: step > 2 ? '✓' : '3' },
            ].map(item => (
              <div key={item.num} className={`flex items-center gap-3 p-2 rounded-lg transition ${step >= item.num ? 'bg-green-50' : 'bg-slate-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${step > item.num ? 'bg-green-500 text-white' : step === item.num ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {item.icon}
                </div>
                <span className={step >= item.num ? 'text-slate-700 font-medium' : 'text-slate-500'}>{item.title}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Data is encrypted - Your data is protected, and you can <a href="#" className="text-blue-600 underline">disconnect</a> at any time.
          </p>
        </div>
      </div>
    </div>
  );
}