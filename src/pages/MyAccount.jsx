import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, Settings, Calendar } from 'lucide-react';
import Header from '@/components/modero/Header';
import ProfileEditor from '@/components/modero/ProfileEditor';
import KycRulesSettings from '@/components/modero/KycRulesSettings';
import BookingRulesManager from '@/components/modero/BookingRulesManager';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'kyc', label: 'KYC Rules', icon: Settings },
  { id: 'booking', label: 'Booking Rules', icon: Calendar },
];

export default function MyAccount() {
  const params = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(params.get('tab') || 'profile');

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <Header />
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Account</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage your profile and tenant screening settings</p>

          {/* Tabs */}
          <div className="flex gap-0 sm:gap-1 mt-4 sm:mt-6 border-b border-slate-200 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
       <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
         {activeTab === 'profile' && <ProfileEditor user={user} />}
         {activeTab === 'kyc' && <KycRulesSettings userEmail={user?.email} />}
         {activeTab === 'booking' && user?.email && (
           <div className="space-y-6">
             {/* For single property simplicity - in production would loop through user's properties */}
             <BookingRulesManager propertyId="default" ownerEmail={user.email} />
           </div>
         )}
       </div>
    </div>
  );
}