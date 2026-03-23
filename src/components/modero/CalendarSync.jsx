import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ExternalLink, CheckCircle2, Info } from 'lucide-react';

export default function CalendarSync() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);

  const handleGoogleConnect = () => {
    window.open('https://calendar.google.com', '_blank');
    setGoogleConnected(true);
  };

  const handleMicrosoftConnect = () => {
    window.open('https://outlook.live.com/calendar', '_blank');
    setMicrosoftConnected(true);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-orange-500" />
          Calendar Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            Sync your confirmed viewings with your calendar so you never miss an appointment. 
            Confirmed bookings will appear as events in your connected calendar.
          </p>
        </div>

        {/* Google Calendar */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M19.5 3H17V1.5H15.5V3H8.5V1.5H7V3H4.5A1.5 1.5 0 003 4.5V19.5A1.5 1.5 0 004.5 21H19.5A1.5 1.5 0 0021 19.5V4.5A1.5 1.5 0 0019.5 3Z" fill="#4285F4"/>
                <path d="M3 9H21V19.5A1.5 1.5 0 0119.5 21H4.5A1.5 1.5 0 013 19.5V9Z" fill="#FFFFFF"/>
                <path d="M8.5 13.5H7V15H8.5V13.5Z" fill="#4285F4"/>
                <path d="M12.75 13.5H11.25V15H12.75V13.5Z" fill="#4285F4"/>
                <path d="M17 13.5H15.5V15H17V13.5Z" fill="#4285F4"/>
                <path d="M8.5 17H7V18.5H8.5V17Z" fill="#4285F4"/>
                <path d="M12.75 17H11.25V18.5H12.75V17Z" fill="#4285F4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Google Calendar</p>
              <p className="text-xs text-slate-500">Sync viewings to your Google Calendar</p>
            </div>
          </div>
          {googleConnected ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGoogleConnect}
              className="flex items-center gap-1 border-slate-300 hover:border-orange-300 hover:text-orange-600"
            >
              <ExternalLink className="w-3 h-3" />
              Connect
            </Button>
          )}
        </div>

        {/* Microsoft Outlook */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="10" height="10" fill="#F25022"/>
                <rect x="13" y="2" width="10" height="10" fill="#7FBA00"/>
                <rect x="2" y="13" width="10" height="10" fill="#00A4EF"/>
                <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Microsoft Outlook</p>
              <p className="text-xs text-slate-500">Sync viewings to your Outlook Calendar</p>
            </div>
          </div>
          {microsoftConnected ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMicrosoftConnect}
              className="flex items-center gap-1 border-slate-300 hover:border-orange-300 hover:text-orange-600"
            >
              <ExternalLink className="w-3 h-3" />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}