import React, { useState } from 'react';

interface PremiumModalProps {
  onClose: () => void;
  onUnlock: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUnlock }) => {
  const [code, setCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState(false);
  const MASTER_KEY = 'MAKHMOOR786';

  const handleVerify = () => {
    if (code.trim().toUpperCase() === MASTER_KEY) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div 
        className="max-w-md w-full card-gradient border-2 gold-border border-double rounded-[3rem] p-8 md:p-12 text-center premium-shadow relative" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-emerald-500 hover:text-amber-500 transition-colors p-2">✕</button>
        
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mx-auto mb-8 shadow-[0_0_40px_rgba(212,175,55,0.1)]">
          <span className="text-5xl">💎</span>
        </div>

        <h3 className="text-3xl urdu-text gold-text font-bold mb-6">یہ ایک پریمیم فیچر ہے!</h3>
        
        <p className="urdu-text text-xl text-emerald-100/80 mb-10 leading-relaxed px-2">
          مکمل ورژن ان لاک کرنے کے لیے ایک بار فیس (2,000 PKR) ادا کر کے ایکسس کوڈ حاصل کریں۔
        </p>

        {!showInput ? (
          <div className="space-y-4">
            <a 
              href="https://wa.me/923459755655?text=Assalam-o-Alaikum! I want to buy the Premium Access Code for 2000 PKR."
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full gold-bg text-emerald-950 font-bold py-5 rounded-[1.5rem] urdu-text text-xl hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <span>واٹس ایپ پر رابطہ کریں</span>
              <span className="text-2xl">📱</span>
            </a>
            
            <button 
              onClick={() => setShowInput(true)}
              className="w-full bg-emerald-900/40 text-amber-500 border border-amber-500/30 font-bold py-5 rounded-[1.5rem] urdu-text text-xl hover:bg-emerald-900 transition-all active:scale-95"
            >
              ایکسس کوڈ درج کریں
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            <div className="relative">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ایکسس کوڈ یہاں درج کریں"
                className={`w-full bg-emerald-950 border-2 ${error ? 'border-red-500 animate-shake' : 'border-emerald-800'} rounded-[1.5rem] p-5 text-center urdu-text text-2xl focus:border-amber-500 focus:outline-none transition-all placeholder:text-emerald-900/40 text-emerald-50`}
                autoFocus
              />
              {error && <p className="text-red-400 urdu-text text-sm mt-3">غلط کوڈ! دوبارہ کوشش کریں</p>}
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
        
        <div className="mt-10 pt-6 border-t border-emerald-900/50">
          <p className="urdu-text text-xs text-emerald-700 italic">
            ایک بار ان لاک کرنے پر ایپ ہمیشہ کے لیے فعال ہو جائے گی
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;