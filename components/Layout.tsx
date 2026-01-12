
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onBack: () => void;
  title: string;
  onInstall?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onBack, title, onInstall }) => {
  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 flex flex-col relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <header className="relative z-50 border-b border-amber-500/20 bg-emerald-950/80 backdrop-blur-xl p-4 md:p-6 flex items-center justify-between sticky top-0 shadow-2xl">
        <div className="flex items-center gap-4">
          {currentView !== AppView.DASHBOARD && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 bg-emerald-900/40 hover:bg-emerald-800 p-2 md:px-4 md:py-2 rounded-xl transition-all text-amber-500 border border-amber-500/20 group"
              aria-label="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="hidden md:block urdu-text text-sm font-bold">واپس</span>
            </button>
          )}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl urdu-text gold-text font-bold leading-tight">
              {title}
            </h1>
            {currentView === AppView.DASHBOARD && (
              <span className="text-[10px] text-emerald-500/60 uppercase tracking-widest font-mono">Spiritual Portal Premium</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {onInstall && (
            <button 
              onClick={onInstall}
              className="bg-gradient-to-r from-amber-600 to-amber-500 text-emerald-950 px-4 py-2 rounded-xl urdu-text text-sm font-bold shadow-lg hover:shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 border border-amber-400/30"
            >
              <span className="hidden sm:inline">ایپ انسٹال کریں</span>
              <span className="text-lg">📲</span>
            </button>
          )}
          <div className="h-10 w-10 bg-emerald-900/40 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09a13.916 13.916 0 002.522-8.113l.002-.121a.5.5 0 00-.83-.397l-.06.041a12.915 12.915 0 01-7.64 2.323l-.113-.002a.5.5 0 00-.453.54l.002.108a13.917 13.917 0 009.934 11.524l.104.025a.5.5 0 00.586-.351l.023-.076A13.916 13.916 0 0012 11zm0 0c0-3.517-1.009 6.799-2.753 9.571m-3.44 2.04l-.054.09a13.916 13.916 0 01-2.522 8.113l-.002.121a.5.5 0 01.83.397l.06-.041a12.915 12.915 0 007.64-2.323l.113.002a.5.5 0 01.453-.54l-.002-.108a13.917 13.917 0 01-9.934 11.524l-.104-.025a.5.5 0 01-.586.351l-.023.076A13.916 13.916 0 0112 11z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow p-4 md:p-10 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <footer className="relative z-10 border-t border-amber-500/20 p-8 text-center bg-emerald-950/40">
        <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
          <p className="urdu-text text-amber-500 text-lg md:text-xl font-bold">
            روحانی سرپرست: حافظ محمد حفیظ نقشبندی چشتی قادری سیفی
          </p>
          <p className="urdu-text text-amber-500/50 text-[10px] mb-2">
            قمری حساب کے مطابق دن مغرب کے وقت تبدیل ہو جاتا ہے
          </p>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-2"></div>
          <p className="urdu-text text-amber-500/60 text-sm">
            © 2025-26 جملہ حقوق محفوظ ہیں
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
