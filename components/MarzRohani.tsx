
import React, { useState, useEffect, useCallback } from 'react';
import { calculateAbjad, getIslamicDayInfo, calculateCurrentSaatInfo } from '../utils/abjad';
import { DAY_VALUES, PLANET_VALUES } from '../constants';

interface MarzRohaniProps {
  initialSaat?: { planet: string; value: number } | null;
}

interface DiagnosisResult {
  type: string;
  adad: number;
  remainder: number;
  breakdown: {
    nameAdad: number;
    motherAdad: number;
    dayValue: number;
    saatValue: number;
  };
}

const MarzRohani: React.FC<MarzRohaniProps> = ({ initialSaat }) => {
  const [name, setName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [day, setDay] = useState(getIslamicDayInfo().name);
  const [selectedPlanet, setSelectedPlanet] = useState('شمس');
  const [saatValue, setSaatValue] = useState<number>(PLANET_VALUES['شمس'] || 0);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isAutoSync, setIsAutoSync] = useState(true);

  // Sync function to get current time data
  const syncCurrentData = useCallback(() => {
    if (!isAutoSync) return;
    
    const lunarDay = getIslamicDayInfo();
    const { planetName, value } = calculateCurrentSaatInfo();
    
    setDay(lunarDay.name);
    setSelectedPlanet(planetName);
    setSaatValue(value);
  }, [isAutoSync]);

  // Handle auto-sync on mount and on intervals
  useEffect(() => {
    if (initialSaat) {
      // If user came from Saat table, use that specific data and disable auto-sync
      setSelectedPlanet(initialSaat.planet);
      setSaatValue(initialSaat.value);
      setDay(getIslamicDayInfo().name);
      setIsAutoSync(false);
    } else {
      syncCurrentData();
      const interval = setInterval(syncCurrentData, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [initialSaat, syncCurrentData]);

  // Handle manual changes
  const handleDayChange = (val: string) => {
    setDay(val);
    setIsAutoSync(false);
  };

  const handlePlanetChange = (val: string) => {
    setSelectedPlanet(val);
    setSaatValue(PLANET_VALUES[val] || 0);
    setIsAutoSync(false);
  };

  const diagnose = () => {
    const nameAdad = calculateAbjad(name);
    const motherAdad = calculateAbjad(motherName);
    const dayValue = DAY_VALUES[day] || 0;
    
    const total = nameAdad + motherAdad + dayValue + saatValue;
    const remainder = total % 4;

    let diagnosisType = '';
    switch (remainder) {
      case 0: diagnosisType = 'جادو (Jadu)'; break;
      case 3: diagnosisType = 'جنات (Jinnat)'; break;
      case 2: diagnosisType = 'نظرِ بد (Nazar-e-Bad)'; break;
      case 1: diagnosisType = 'اندرونی بخار (Androoni Bukhar)'; break;
      default: diagnosisType = 'نامعلوم';
    }

    setResult({
      type: diagnosisType,
      adad: total,
      remainder,
      breakdown: {
        nameAdad,
        motherAdad,
        dayValue,
        saatValue
      }
    });
  };

  const disclaimer = "واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے";

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="card-gradient border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="absolute top-4 left-4">
          <button 
            onClick={() => setIsAutoSync(!isAutoSync)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-tighter transition-all ${isAutoSync ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoSync ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></span>
            {isAutoSync ? 'Live Sync ON' : 'Manual Mode'}
          </button>
        </div>

        <h2 className="text-2xl urdu-text gold-text text-center mb-8 underline underline-offset-8 decoration-amber-500/30">مرض روحانی یا جسمانی؟</h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right urdu-text text-slate-400 mb-2">والدہ کا نام</label>
              <input 
                type="text" 
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-right text-xl urdu-text focus:border-amber-500 focus:outline-none transition-all"
                placeholder="والدہ کا نام لکھیں..."
              />
            </div>
            <div>
              <label className="block text-right urdu-text text-slate-400 mb-2">مریض کا نام</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-right text-xl urdu-text focus:border-amber-500 focus:outline-none transition-all"
                placeholder="مریض کا نام لکھیں..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-right urdu-text text-slate-400 mb-2">سیارہ/ساعت منتخب کریں</label>
              <select 
                value={selectedPlanet}
                onChange={(e) => handlePlanetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-right urdu-text focus:border-amber-500 focus:outline-none transition-all appearance-none"
              >
                {Object.keys(PLANET_VALUES).map(p => (
                  <option key={p} value={p}>{p} ({PLANET_VALUES[p]})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-right urdu-text text-slate-400 mb-2">دن منتخب کریں</label>
              <select 
                value={day}
                onChange={(e) => handleDayChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-right urdu-text focus:border-amber-500 focus:outline-none transition-all appearance-none"
              >
                {Object.keys(DAY_VALUES).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {isAutoSync && (
            <div className="text-center space-y-1">
              <p className="urdu-text text-amber-500/60 text-xs animate-pulse">
                موجودہ ساعت اور دن خودکار طریقے سے منتخب کر لیے گئے ہیں
              </p>
              <p className="urdu-text text-emerald-500/40 text-[10px]">
                قمری حساب کے مطابق دن مغرب کے وقت تبدیل ہو جاتا ہے
              </p>
            </div>
          )}

          <button 
            onClick={diagnose}
            disabled={!name || !motherName}
            className="w-full gold-bg text-slate-900 font-bold py-4 rounded-xl urdu-text text-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_4px_15px_-5px_rgba(212,175,55,0.5)] active:scale-95"
          >
            تشخیص کریں
          </button>
        </div>
      </div>

      {result && (
        <div className="card-gradient border-2 gold-border border-double rounded-3xl p-8 text-center animate-bounce-in relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/20 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/20 rounded-br-3xl"></div>
          
          <div className="mb-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <h4 className="urdu-text text-slate-500 text-sm mb-3">حسابی تفصیل (Breakdown)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center urdu-text text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="block text-slate-500">نام</span>
                <span className="text-amber-500 font-bold">{result.breakdown.nameAdad}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="block text-slate-500">والدہ</span>
                <span className="text-amber-500 font-bold">{result.breakdown.motherAdad}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="block text-slate-500">دن</span>
                <span className="text-amber-500 font-bold">{result.breakdown.dayValue}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="block text-slate-500">ساعت</span>
                <span className="text-amber-500 font-bold">{result.breakdown.saatValue}</span>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between items-center urdu-text text-sm">
              <span className="text-slate-400">کل اعداد (Total):</span>
              <span className="text-2xl font-bold text-amber-500">{result.adad}</span>
            </div>
            <div className="flex justify-between items-center urdu-text text-sm mt-1">
              <span className="text-slate-400">باقیماندہ (% 4):</span>
              <span className="text-xl font-bold text-amber-500">{result.remainder}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 urdu-text text-sm">حتمی تشخیص:</span>
            <h3 className="text-4xl urdu-text font-bold text-amber-500 mb-4 drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
              {result.type}
            </h3>
          </div>

          <div className="mt-8 pt-6 border-t border-amber-500/10">
            <p className="urdu-text text-xs italic text-amber-500/60 leading-relaxed">
              {disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarzRohani;
