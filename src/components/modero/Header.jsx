import React from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, Settings, Globe, BarChart3 } from "lucide-react";
import NotificationsBell from '@/components/modero/NotificationsBell';
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  
  const { data: isAuthenticated } = useQuery({
    queryKey: ['isAuthenticated'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
            Modero
          </h1>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/Analytics" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-orange-500 transition-colors">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
          {isAuthenticated && <NotificationsBell />}
          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-fit sm:w-[140px] border-slate-200 gap-2">
              <Globe className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline text-sm">
                {{ en: 'English', es: 'Español', pt: 'Português', it: 'Italiano' }[language]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
            </SelectContent>
          </Select>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="rounded-full p-[2px] bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 shadow-md shadow-orange-200/50">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-white">
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm font-semibold">
                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.full_name || user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-slate-500 truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/MyAccount" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={handleLogin} className="gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t('login')}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}