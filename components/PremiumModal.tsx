
import React, { useState, useEffect } from 'react';
import { getRequestCode, validateActivationKey } from '../utils/security';

interface PremiumModalProps {
  onClose: () => void;
  onUnlock: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUnlock }) => {
  const [code, setCode] = useState('');
  const [requestCode, setRequestCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Generate the unique request code for this specific device on mount
    setRequestCode(getRequestCode());
  }, []);

  const handleVerify = () => {
    if (validateActivationKey(requestCode, code)) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const whatsappNumber = "9234494466680";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Assalam-o-Alaikum! I want to buy the Premium Activation Key. My Device Request Code is: ${requestCode}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div 
        className="max-w-md w-full card-gradient border-2 gold-border border-double rounded-[3rem] p-8 md:p-12 text-center premium-shadow relative" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-emerald-500 hover:text-amber-500 transition-colors p-2">✕</button>
        
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mx-auto mb-6 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
          <span className="text-4xl">🔐</span>
        </div>

        <h3 className="text-3xl urdu-text gold-text font-bold mb-4">پریمیم رسائی</h3>
        
        <p className="urdu-text text-lg text-emerald-100/70 mb-6 leading-relaxed">
          مکمل ورژن ان لاک کرنے کے لیے اپنا 'ریکوسٹ کوڈ' ہمیں واٹس ایپ پر بھیج کر اپنی 'ایکٹیویشن کی' حاصل کریں۔
        </p>

        {/* Request Code Display */}
        <div className="bg-emerald-950/50 border border-amber-500/20 rounded-2xl p-4 mb-8">
          <span className="block text-emerald-500/60 text-[10px] uppercase tracking-widest mb-1">Your Device Request Code</span>
          <span className="text-3xl font-mono font-bold text-amber-500 tracking-widest">{requestCode}</span>
        </div>

        {!showInput ? (
          <div className="space-y-4">
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full gold-bg text-emerald-950 font-bold py-5 rounded-[1.5rem] urdu-text text-xl hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <span>واٹس ایپ پر رابطہ کریں</span>
              <span className="text-2xl">📱</span>
            </a>
            
            <button 
              onClick={() => setShowInput(true)}
              className="w-full bg-emerald-900/40 text-amber-500 border border-amber-500/30 font-bold py-5 rounded-[1.5rem] urdu-text text-xl hover:bg-emerald-900 transition-all active:scale-95"
            >
              ایکٹیویشن کی درج کریں
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="relative">
              <input 
                type="text" 
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6 ہندسوں کا کوڈ"
                className={`w-full bg-emerald-950 border-2 ${error ? 'border-red-500 animate-shake' : 'border-emerald-800'} rounded-[1.5rem] p-5 text-center font-mono text-3xl focus:border-amber-500 focus:outline-none transition-all placeholder:text-emerald-900/40 text-emerald-50`}
                autoFocus
              />
              {error && <p className="text-red-400 urdu-text text-sm mt-3 font-bold">غلط ایکٹیویشن کی! دوبارہ کوشش کریں</p>}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowInput(false)}
                className="flex-1 bg-emerald-900/40 text-emerald-500 py-4 rounded-2xl urdu-text text-lg hover:bg-emerald-900 transition-all"
              >
                واپس
              </button>
              <button 
                onClick={handleVerify}
                className="flex-[2] gold-bg text-emerald-950 font-bold py-4 rounded-2xl urdu-text text-xl hover:bg-amber-400 transition-all shadow-lg"
              >
                ان لاک کریں
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-emerald-900/50">
          <p className="urdu-text text-[10px] text-emerald-700 italic">
            ایکٹیویشن کی صرف اسی ڈیوائس کے لیے کارآمد ہوگی
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
