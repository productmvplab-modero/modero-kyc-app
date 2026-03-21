import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SlackIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectSlack = async () => {
    setIsConnecting(true);
    try {
      // This will redirect to Slack OAuth flow
      window.location.href = 'https://slack.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&scope=chat:write,channels:manage,users:read&redirect_uri=YOUR_REDIRECT_URI';
    } catch (error) {
      toast.error('Failed to connect to Slack');
      setIsConnecting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-400 to-red-300" />
      <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 border-b border-purple-100 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-sm">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          Connect to Slack
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">Stay connected with our team for feedback and updates</p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Integration Status */}
          <div className="flex items-start justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-900">Not Connected</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Connect your Slack account to receive notifications, share feedback, and communicate with our team in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Benefits</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Receive real-time notifications about applicants
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Share feedback and collaborate with team members
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Get instant alerts for important application status changes
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                Communicate with the Modero support team
              </li>
            </ul>
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleConnectSlack}
            disabled={isConnecting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-2 h-10"
          >
            <svg className="w-4 h-4" viewBox="0 0 127 127" fill="currentColor">
              <path d="M27.2 80c0 7.5-6.1 13.6-13.6 13.6C6.1 93.6 0 87.5 0 80c0-7.5 6.1-13.6 13.6-13.6h13.6V80zm6.8 0c0-7.5 6.1-13.6 13.6-13.6 7.5 0 13.6 6.1 13.6 13.6v34c0 7.5-6.1 13.6-13.6 13.6-7.5 0-13.6-6.1-13.6-13.6V80z"/>
              <path d="M47 27.2C47 19.7 53.1 13.6 60.6 13.6 68.1 13.6 74.2 19.7 74.2 27.2c0 7.5-6.1 13.6-13.6 13.6H47V27.2zm0 6.8c0 7.5 6.1 13.6 13.6 13.6 7.5 0 13.6-6.1 13.6-13.6v-34C74.2 6.1 68.1 0 60.6 0c-7.5 0-13.6 6.1-13.6 13.6v34z"/>
              <path d="M99.8 47c7.5 0 13.6 6.1 13.6 13.6 0 7.5-6.1 13.6-13.6 13.6h-13.6V47h13.6zm-6.8 0c0 7.5-6.1 13.6-13.6 13.6-7.5 0-13.6-6.1-13.6-13.6V13.6C65.8 6.1 71.9 0 79.4 0c7.5 0 13.6 6.1 13.6 13.6v33.4z"/>
              <path d="M79.4 99.8c-7.5 0-13.6-6.1-13.6-13.6 0-7.5 6.1-13.6 13.6-13.6h13.6v13.6c0 7.5-6.1 13.6-13.6 13.6zm6.8 0c0-7.5 6.1-13.6 13.6-13.6 7.5 0 13.6 6.1 13.6 13.6v34c0 7.5-6.1 13.6-13.6 13.6-7.5 0-13.6-6.1-13.6-13.6v-34z"/>
            </svg>
            {isConnecting ? 'Connecting...' : 'Connect to Slack'}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            You'll be redirected to authorize the Modero Slack app
          </p>
        </div>
      </CardContent>
    </Card>
  );
}