
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onSelect: (view: AppView) => void;
  isUnlocked: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelect, isUnlocked }) => {
  const isPremium = (id: AppView) => id !== AppView.ILM_US_SAAT;

  const features = [
    { 
      id: AppView.ILM_US_SAAT, 
      title: 'علم الساعت', 
      desc: 'نیک و بد ساعات کا معلوم کرنا (مفت)', 
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: AppView.MARZ_ROHANI, 
      title: 'مرض روحانی یا جسمانی؟', 
      desc: 'بیماری کی تشخیص بذریعہ اعداد', 
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      id: AppView.ISM_E_AZAM, 
      title: 'اسم اعظم کا انتخاب', 
      desc: 'اپنے نام کے اعداد کے مطابق اسم الہیٰ', 
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      id: AppView.SHADI_MUWAFIQAT, 
      title: 'شادی کی موافقت', 
      desc: 'ازدواجی زندگی کی مطابقت کا حساب', 
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  const disclaimer = "واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے";

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn pb-24">
      {features.map((f) => {
        const locked = !isUnlocked && isPremium(f.id);
        return (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`card-gradient p-8 rounded-[3rem] text-right transition-all transform hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group relative overflow-hidden flex flex-col items-end border-2 ${locked ? 'border-emerald-900/50' : 'border-amber-500/10'}`}
          >
            {/* Locked Overlay */}
            {locked && (
              <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[2px] flex items-center justify-center z-20">
                <div className="bg-amber-500 p-4 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.4)] border-2 border-amber-300 transform scale-110 group-hover:scale-125 transition-transform duration-500">
                  <span className="text-2xl text-emerald-950">🔒</span>
                </div>
              </div>
            )}

            <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full -ml-16 -mt-16"></div>
            
            <div className="mb-8 bg-emerald-950/50 p-5 rounded-2xl border border-emerald-800 group-hover:border-amber-500/40 transition-all self-start">
              {f.icon}
            </div>
            
            <h3 className="text-3xl urdu-text font-bold mb-4 group-hover:text-amber-500 transition-colors flex items-center gap-3">
              {f.title}
              {locked && <span className="text-amber-500/30 text-xs bg-amber-500/5 px-2 py-1 rounded">پریمیم</span>}
            </h3>
            
            <p className="text-emerald-100/60 text-lg urdu-text leading-relaxed mb-8 text-right">
              {f.desc}
            </p>

            <div className="w-full mt-auto pt-6 border-t border-amber-500/5">
              <span className="urdu-text text-[10px] italic text-amber-500/30 text-center block leading-normal">
                {disclaimer}
              </span>
            </div>
            
            {!locked && (
              <div className="mt-6 flex items-center gap-2 text-amber-500/60 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <span className="urdu-text text-sm">شروع کریں</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Dashboard;
