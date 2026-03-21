import React from 'react';
import Header from './components/modero/Header';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-slate-950 text-white mt-auto">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" />

        <div className="w-full px-4 py-12 md:px-6 md:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Brand Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">M</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Modero</h2>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Automated Tenant Segmentation and KYC Risk Decision System for modern property management.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="h-11 w-11 rounded-lg bg-slate-800 hover:bg-orange-500 transition-colors flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="h-11 w-11 rounded-lg bg-slate-800 hover:bg-orange-500 transition-colors flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

            {/* Contact Section */}
            <div className="border-t border-slate-800 pt-10">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Contact</h3>
              <div className="flex flex-col gap-4">
                <a href="https://wa.me/1234567890" className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors active:bg-slate-700">
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-white">WhatsApp</span>
                    <span className="text-sm text-slate-400">Support</span>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                </a>

                <a href="tel:+1234567890" className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors active:bg-slate-700">
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-white">Phone</span>
                    <span className="text-sm text-slate-400">Call us</span>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                </a>

                <a href="mailto:support@moderokyc.com" className="flex items-center justify-between gap-3 p-4 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors active:bg-slate-700">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-base font-medium text-white">Email</span>
                    <span className="text-sm text-slate-400 truncate">support@moderokyc.com</span>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col gap-6">
              <p className="text-slate-400 text-sm text-center">© 2026 Modero. All rights reserved.</p>
              <div className="flex flex-col gap-3 md:flex-row md:justify-center md:gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm text-center">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm text-center">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm text-center">GDPR</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}