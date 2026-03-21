import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BANKS = [
  { id: 'santander', name: 'Santander', color: 'bg-red-500' },
  { id: 'bbva', name: 'BBVA', color: 'bg-blue-900' },
  { id: 'caixabank', name: 'CaixaBank', color: 'bg-blue-500' },
  { id: 'deutsche', name: 'Deutsche Bank', color: 'bg-blue-700' },
  { id: 'bnp', name: 'BNP Paribas', color: 'bg-green-600' },
  { id: 'ing', name: 'ING', color: 'bg-orange-500' },
  { id: 'hsbc', name: 'HSBC', color: 'bg-red-600' },
  { id: 'barclays', name: 'Barclays', color: 'bg-blue-400' },
  { id: 'unicredit', name: 'UniCredit', color: 'bg-red-600' },
];

export default function BankSelectionModal({ onClose, onSelect }) {
  const [search, setSearch] = useState('');
  
  const filtered = BANKS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Connect your bank</h2>
            <p className="text-sm opacity-90">Select your bank to verify income via PSD2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200">
          <Input
            placeholder="Search your bank..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Banks Grid */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="p-4 grid grid-cols-3 gap-3">
            {filtered.map(bank => (
              <button
                key={bank.id}
                onClick={() => onSelect(bank)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl ${bank.color} flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow`}>
                  {bank.name[0]}
                </div>
                <span className="text-xs font-medium text-slate-700 text-center">{bank.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}