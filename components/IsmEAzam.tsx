
import React, { useState } from 'react';
import { calculateAbjad } from '../utils/abjad';
import { ALLAH_NAMES } from '../constants';
import { AllahName } from '../types';

interface NamePair {
  name1: AllahName;
  name2: AllahName;
  sum: number;
}

const IsmEAzam: React.FC = () => {
  const [name, setName] = useState('');
  const [pairs, setPairs] = useState<NamePair[]>([]);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isExactMatch, setIsExactMatch] = useState(false);

  const disclaimer = "واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے";

  const findMatches = () => {
    const targetAdad = calculateAbjad(name);
    setTotal(targetAdad);
    setHasSearched(true);

    const exactPairs: NamePair[] = [];
    const processedPairs = new Set<string>();

    // Search for exact pairs O(N^2) for 99 names is very fast
    for (let i = 0; i < ALLAH_NAMES.length; i++) {
      for (let j = i; j < ALLAH_NAMES.length; j++) {
        const n1 = ALLAH_NAMES[i];
        const n2 = ALLAH_NAMES[j];
        if (n1.adad + n2.adad === targetAdad) {
          const pairId = [n1.name, n2.name].sort().join('|');
          if (!processedPairs.has(pairId)) {
            exactPairs.push({ name1: n1, name2: n2, sum: targetAdad });
            processedPairs.add(pairId);
          }
        }
      }
    }

    if (exactPairs.length > 0) {
      setPairs(exactPairs);
      setIsExactMatch(true);
    } else {
      // Find closest pairs
      setIsExactMatch(false);
      let minDiff = Infinity;
      let closestPairs: NamePair[] = [];

      for (let i = 0; i < ALLAH_NAMES.length; i++) {
        for (let j = i; j < ALLAH_NAMES.length; j++) {
          const n1 = ALLAH_NAMES[i];
          const n2 = ALLAH_NAMES[j];
          const sum = n1.adad + n2.adad;
          const diff = Math.abs(sum - targetAdad);

          if (diff < minDiff) {
            minDiff = diff;
            closestPairs = [{ name1: n1, name2: n2, sum }];
          } else if (diff === minDiff) {
            closestPairs.push({ name1: n1, name2: n2, sum });
          }
        }
      }
      setPairs(closestPairs.slice(0, 10)); // Top 10 closest
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="card-gradient border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full"></div>
        
        <h2 className="text-3xl urdu-text gold-text text-center mb-8 underline underline-offset-8 decoration-amber-500/30">اسمِ اعظم کا انتخاب</h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          <div className="relative w-full">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && findMatches()}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-6 text-right text-3xl urdu-text focus:border-amber-500 focus:outline-none transition-all shadow-inner placeholder:text-slate-800"
              placeholder="نام یہاں لکھیں..."
            />
          </div>
          <button 
            onClick={findMatches}
            disabled={!name}
            className="w-full md:w-auto bg-amber-500 text-slate-950 font-bold px-12 py-6 rounded-2xl urdu-text text-2xl hover:bg-amber-400 transition-all shadow-lg active:scale-95 disabled:opacity-30 whitespace-nowrap"
          >
            تلاش کریں
          </button>
        </div>

        {total > 0 && (
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-800/50">
            <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
              <span className="block text-slate-500 urdu-text text-sm mb-1">نام کے کل اعداد</span>
              <span className="text-5xl font-bold text-amber-500">{total}</span>
            </div>
            <div className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
              <span className="block text-slate-500 urdu-text text-sm mb-1">تعدادِ وظیفہ</span>
              <span className="text-5xl font-bold text-amber-500">{total * 2}</span>
            </div>
          </div>
        )}
      </div>

      {hasSearched && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="urdu-text text-2xl text-slate-300">
              {isExactMatch ? 'موزوں اسمائے الہیٰ کے جوڑے' : 'قریبی ترین اسمائے الہیٰ'}
            </h3>
            {!isExactMatch && pairs.length > 0 && (
              <p className="urdu-text text-sm text-amber-500/60">نام کے کل اعداد کے برابر کوئی جوڑا نہیں ملا، قریب ترین نتائج درج ذیل ہیں</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pairs.map((p, idx) => (
              <div key={idx} className="card-gradient border-2 gold-border border-double p-8 rounded-[2.5rem] text-center group hover:shadow-[0_0_50px_-15px_rgba(212,175,55,0.4)] transition-all animate-bounce-in relative overflow-hidden flex flex-col justify-center min-h-[180px]">
                <div className="absolute inset-0 bg-amber-500/[0.01] group-hover:bg-amber-500/[0.03] transition-colors"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-center items-center gap-6">
                    <div className="text-4xl md:text-5xl urdu-text font-bold text-amber-500 drop-shadow-sm">{p.name1.name}</div>
                    <div className="text-3xl text-slate-700 font-light">+</div>
                    <div className="text-4xl md:text-5xl urdu-text font-bold text-amber-500 drop-shadow-sm">{p.name2.name}</div>
                  </div>
                  
                  <div className="flex justify-center gap-6 text-xs font-mono text-slate-500 tracking-widest">
                    <span className="bg-slate-900 px-3 py-1 rounded-full">{p.name1.adad}</span>
                    <span className="text-amber-500/20">|</span>
                    <span className="bg-slate-900 px-3 py-1 rounded-full">{p.name2.adad}</span>
                  </div>

                  {!isExactMatch && (
                    <div className="pt-2">
                      <span className="text-[10px] text-amber-500/40 uppercase tracking-tighter">مجموعہ: {p.sum}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pairs.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-600 urdu-text bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                کوئی موزوں جوڑا نہیں ملا۔
              </div>
            )}
          </div>
        </div>
      )}

      {hasSearched && (
        <div className="p-8 bg-slate-950/50 rounded-2xl border border-slate-900 border-dashed text-center space-y-4">
          <p className="urdu-text text-sm italic text-amber-500/60 leading-relaxed max-w-xl mx-auto">
            {disclaimer}
          </p>
          <p className="urdu-text text-[10px] text-slate-500 leading-relaxed max-w-xl mx-auto">
            ورد کرنے سے پہلے حروف کی تعداد، تلفظ اور اسم کی مناسبت کا خاص خیال رکھیں۔ بہترین نتائج کے لیے باوضو اور یکسوئی کے ساتھ تسبیح پڑھیں۔
          </p>
        </div>
      )}
    </div>
  );
};

export default IsmEAzam;
