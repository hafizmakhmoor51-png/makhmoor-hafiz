
import React, { useState } from 'react';

interface PaywallProps {
  onUnlock: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const MASTER_KEY = 'MAKHMOOR786';

  const handleUnlock = () => {
    if (code.trim().toUpperCase() === MASTER_KEY) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const features = [
    'روحانی تشخیص (مرض روحانی یا جسمانی)',
    'خیر و شر کی پہچان (کاروبار، ملازمت، سفر)',
    'شادی میں موافقت (81 تفصیلی نتائج)',
    'اسمِ اعظم (اسمائے حسنیٰ کے جوڑ)',
    'مکمل علم الساعات (سعد و نحس اور وظائف)'
  ];

  const whatsappNumber = "9234494466680";

  return (
    <div className="min-h-screen flex flex-col p-4 bg-emerald-950 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-800 rounded-full blur-[150px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600 rounded-full blur-[150px] opacity-10"></div>

      <div className="flex-grow flex items-center justify-center py-10">
        <div className="max-w-2xl w-full card-gradient rounded-[3rem] premium-shadow p-8 md:p-12 text-center animate-fadeIn border-2 border-amber-500/30 relative z-10">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-6">
              <span className="text-5xl">🏆</span>
            </div>
            <h1 className="text-3xl md:text-4xl urdu-text gold-text font-bold mb-4">
              روحانی حساب کتاب و استخارہ پورٹل
            </h1>
            <p className="text-emerald-100/70 urdu-text text-lg">
              مکمل ورژن حاصل کریں اور تمام روحانی خصوصیات تک رسائی پائیں۔
            </p>
          </div>

          <div className="space-y-4 mb-10">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center justify-between bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/50 group hover:border-amber-500/30 transition-all">
                <span className="text-amber-500 text-xl">🔒</span>
                <span className="urdu-text text-lg text-emerald-50">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Assalam-o-Alaikum! I want to buy the full access for the Spiritual App.`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full gold-bg text-emerald-950 font-bold py-5 rounded-2xl urdu-text text-xl hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <span>مکمل ایکسس خریدنے کے لیے ابھی رابطہ کریں</span>
              <span className="text-2xl">📱</span>
            </a>

            <div className="pt-8 border-t border-emerald-800/50">
              <p className="urdu-text text-emerald-400/60 text-sm mb-4">اگر آپ کے پاس کوڈ ہے تو یہاں درج کریں:</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleUnlock}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl urdu-text font-bold transition-all border border-emerald-700"
                >
                  ان لاک کریں
                </button>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ایکسس کوڈ درج کریں"
                  className={`flex-grow bg-emerald-950 border ${error ? 'border-red-500 animate-shake' : 'border-emerald-800'} rounded-xl px-4 text-center urdu-text text-lg focus:border-amber-500 focus:outline-none transition-all placeholder:text-emerald-900`}
                />
              </div>
              {error && <p className="text-red-400 urdu-text text-xs mt-2">غلط کوڈ! دوبارہ کوشش کریں</p>}
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-amber-500/20 p-8 text-center bg-emerald-950/40 w-full mt-auto">
        <div className="flex flex-col items-center gap-2 max-w-2xl mx-auto">
          <p className="urdu-text text-amber-500 text-lg md:text-xl font-bold">
            روحانی سرپرست: حافظ محمد حفیظ نقشبندی چشتی قادری سیفی
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

export default Paywall;
