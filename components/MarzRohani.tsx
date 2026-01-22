
import React, { useState, useEffect, useCallback } from 'react';
import { calculateAbjad, getIslamicDayInfo, calculateCurrentSaatInfo } from '../utils/abjad';
import { DAY_VALUES, PLANET_VALUES } from '../constants';

interface MarzRohaniProps {
  initialSaat?: { planet: string; value: number } | null;
  solarData?: { sunrise: string; sunset: string } | null;
}

interface DiagnosisResult {
  type: string;
  adad: number;
  remainder: number;
  symptoms: string;
  treatment: string;
  breakdown: {
    nameAdad: number;
    motherAdad: number;
    dayValue: number;
    saatValue: number;
  };
}

const DIAGNOSIS_DETAILS: Record<number, { type: string; symptoms: string; treatment: string }> = {
  1: {
    type: 'نظرِ بد (Nazar-e-Bad)',
    symptoms: 'کندھوں میں بوجھ، کام میں رکاوٹ، چہرے کا رنگ بدلنا۔',
    treatment: 'معوذتین (سورہ فلق، سورہ ناس) 11 بار اور نظرِ بد کی مستند دعا۔'
  },
  2: {
    type: 'اندرونی بخار (Androoni Bukhar)',
    symptoms: 'جسم میں درد، بخار محسوس ہونا مگر تھرمامیٹر میں نہ آنا، سستی۔',
    treatment: 'صدقہ خیرات، سورہ رحمن کی تلاوت سننا، اور ڈاکٹر سے رجوع۔'
  },
  3: {
    type: 'جنات (Jinnat)',
    symptoms: 'ڈراؤنے خواب، تنہائی کا خوف، بلاوجہ چڑچڑاپن۔',
    treatment: 'منزل (آیاتِ شفاء) کی تلاوت، گھر میں اذان دینا یا اونچی آواز میں چلانا۔'
  },
  0: {
    type: 'جادو (Jadu)',
    symptoms: 'شدید بندش، گھر میں خون کے چھینٹے یا بدبو، میاں بیوی میں نفرت۔',
    treatment: 'سورہ بقرہ کی تلاوت، باقاعدہ شرعی رقیہ، اور کالے چنے کا صدقہ۔'
  }
};

const MarzRohani: React.FC<MarzRohaniProps> = ({ initialSaat, solarData }) => {
  const [name, setName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [day, setDay] = useState(getIslamicDayInfo(solarData?.sunrise, solarData?.sunset).name);
  const [selectedPlanet, setSelectedPlanet] = useState('شمس');
  const [saatValue, setSaatValue] = useState<number>(PLANET_VALUES['شمس'] || 0);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isAutoSync, setIsAutoSync] = useState(true);

  // Sync function to get current time data
  const syncCurrentData = useCallback(() => {
    if (!isAutoSync) return;
    
    // Use solarData for precise location-based calculation if available
    const lunarDay = getIslamicDayInfo(solarData?.sunrise, solarData?.sunset);
    const { planetName, value } = calculateCurrentSaatInfo(solarData?.sunrise, solarData?.sunset);
    
    setDay(lunarDay.name);
    setSelectedPlanet(planetName);
    setSaatValue(value);
  }, [isAutoSync, solarData]);

  // Handle auto-sync on mount and on intervals
  useEffect(() => {
    if (initialSaat) {
      // If user came from Saat table, use that specific data and disable auto-sync
      setSelectedPlanet(initialSaat.planet);
      setSaatValue(initialSaat.value);
      setDay(getIslamicDayInfo(solarData?.sunrise, solarData?.sunset).name);
      setIsAutoSync(false);
    } else {
      syncCurrentData();
      const interval = setInterval(syncCurrentData, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [initialSaat, syncCurrentData, solarData]);

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

    const details = DIAGNOSIS_DETAILS[remainder];

    setResult({
      type: details.type,
      symptoms: details.symptoms,
      treatment: details.treatment,
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
                {solarData ? 'مقام کی بنیاد پر درست حساب' : 'تخمیناً حساب (مقام دستیاب نہیں)'}
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

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-slate-400 urdu-text text-sm">حتمی تشخیص:</span>
              <h3 className="text-3xl md:text-4xl urdu-text font-bold text-amber-500 mb-4 drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]">
                {result.type}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Symptoms Box */}
              <div className="bg-slate-900/40 border border-amber-500/20 rounded-2xl p-5 text-right relative overflow-hidden group hover:border-amber-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-2 h-full bg-red-500/20"></div>
                <h4 className="urdu-text text-amber-500 font-bold text-lg mb-2 pr-4">علامات</h4>
                <p className="urdu-text text-slate-200 leading-relaxed pr-4 text-lg">
                  {result.symptoms}
                </p>
              </div>

              {/* Treatment Box */}
              <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-5 text-right relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500/30"></div>
                <h4 className="urdu-text text-emerald-400 font-bold text-lg mb-2 pr-4">تجویز کردہ علاج</h4>
                <p className="urdu-text text-emerald-100 leading-relaxed pr-4 text-lg">
                  {result.treatment}
                </p>
              </div>
            </div>
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
