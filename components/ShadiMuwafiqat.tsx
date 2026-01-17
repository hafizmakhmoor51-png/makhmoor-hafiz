
import React, { useState } from 'react';
import { calculateAbjad, calculateMufrad } from '../utils/abjad';

const MUWAFIQAT_MAP: Record<string, string> = {
  '1-1': 'دونوں کی زندگی بہت خوبصورت گزرے گی',
  '1-2': 'قابل رشک زندگی گزارنے کی علامت ہے',
  '1-3': 'نا اتفاقی اور خانہ جنگی میں مبتلا رہیں گے',
  '1-4': 'انجام طلاق',
  '1-5': 'معتدل زندگی گزاریں گے',
  '1-6': 'ایک دوسرے سے مدد گار رہیں گے',
  '1-7': 'اولاد کا غم دیکھنا پڑے گا',
  '1-8': 'غربت مفلسی اور رنج وغم کا سامنا کرنا پڑے گا',
  '1-9': 'انجام بہتر ہو گا زندگی معتدل رہے گی',
  '2-1': 'قابل رشک زندگی گزارنے کی علامت ہے',
  '2-2': 'دونوں خوشگوار زندگی گزاریں گے',
  '2-3': 'لڑائی جھگڑا انجام طلاق',
  '2-4': 'ہر وقت لڑائی جھگڑا لیکن طلاق نہیں ہو گی',
  '2-5': 'ذہنی سکون حاصل نہیں ہوگا',
  '2-6': 'ایک دوسرے پر الزام تراشی کرتے رہیں گے',
  '2-7': 'ایک دوسرے کے قدردان رہیں گے',
  '2-8': 'ابتداء میں محبت کریں گے بعد میں جھگڑے شروع ہو جائیں گے',
  '2-9': 'ایک دوسرے کی قدر کریں گے',
  '3-1': 'نا اتفاقی اور خانہ جنگی میں مبتلا رہیں گے',
  '3-2': 'لڑائی جھگڑا انجام طلاق',
  '3-3': 'شادی محبت کی ہو گی انجام بے وفائی',
  '3-4': 'طلاق کا اندیشہ رہے گا',
  '3-5': 'طلاق ہو جائے گی',
  '3-6': 'لڑائی جھگڑا نوبت طلاق',
  '3-7': 'ایک دوسرے پر جان نچھاور کریں گے',
  '3-8': 'ٹھیک زندگی گزاریں گے',
  '3-9': 'لڑیں گے لیکن جدا نہیں ہوں گے',
  '4-1': 'انجام طلاق',
  '4-2': 'ہر وقت لڑائی جھگڑا لیکن طلاق نہیں ہو گی',
  '4-3': 'طلاق کا اندیشہ رہے گا',
  '4-4': 'انجام طلاق اور جدائی',
  '4-5': 'انجام طلاق اور جدائی',
  '4-6': 'اچھی اور بے مثال زندگی',
  '4-7': 'قابل رشک زندگی گزاریں گے',
  '4-8': 'ایک دوسرے کی محبت میں گرفتار',
  '4-9': 'جنگ وجدل ایک دوسرے پر کیچڑ اچھالنے والے',
  '5-1': 'معتدل زندگی گزاریں گے',
  '5-2': 'ذہنی سکون حاصل نہیں ہو گا',
  '5-3': 'طلاق ہو جائے گی',
  '5-4': 'انجام طلاق اور جدائی',
  '5-5': 'انجام جدائی اور طلاق',
  '5-6': 'دونوں میں موافقت رہے گی',
  '5-7': 'قابل رشک زندگی بسر کریں گے',
  '5-8': 'دونوں میں پیار محبت ہو گا',
  '5-9': 'دونوں اعتدال کے ساتھ زندگی گزاریں گے',
  '6-1': 'ایک دوسرے سے مدد گار رہیں گے',
  '6-2': 'ایک دوسرے پر الزام تراشی کرتے رہیں گے',
  '6-3': 'لڑائی جھگڑا نوبت طلاق',
  '6-4': 'اچھی اور بے مثال زندگی',
  '6-5': 'دونوں میں موافقت رہے گی',
  '6-6': 'قابل تعریف زندگی بسر کریں گے',
  '6-7': 'اعتدال (میانہ روی) قائم رہے گا',
  '6-8': 'قابل رشک زندگی گزاریں گے',
  '6-9': 'میانہ انداز کا تعلق ہمیشہ قائم رہے گا',
  '7-1': 'اولاد کا غم دیکھنا پڑے گا',
  '7-2': 'ایک دوسرے کے قدردان رہیں گے',
  '7-3': 'ایک دوسرے پر جان نچھاور کریں گے',
  '7-4': 'قابل رشک زندگی گزاریں گے',
  '7-5': 'قابل رشک زندگی بسر کریں گے',
  '7-6': 'اعتدال (میانہ روی) قائم رہے گا',
  '7-7': 'بے مثال ازدواجی زندگی گزاریں گے',
  '7-8': 'شروع میں اختلاف رہے گا بعد میں موافقت ہو جائے گی',
  '7-9': 'دونوں کے مزاج میں اختلاف رہے گا',
  '8-1': 'غربت مفلسی اور رنج وغم کا سامنا کرنا پڑے گا',
  '8-2': 'ابتداء میں محبت کریں گے بعد میں جھگڑے شروع ہو جائیں گے',
  '8-3': 'ٹھیک زندگی گزاریں گے',
  '8-4': 'ایک دوسرے کی محبت میں گرفتار',
  '8-5': 'دونوں میں پیار محبت ہو گا',
  '8-6': 'قابل رشک زندگی گزاریں گے',
  '8-7': 'شروع میں اختلاف رہے گا بعد میں موافقت ہو جائے گی',
  '8-8': 'بے مثال جوڑی',
  '8-9': 'ہر اعتبار سے خوشگوار زندگی گزاریں گے',
  '9-1': 'انجام بہتر ہو گا زندگی معتدل رہے گی',
  '9-2': 'ایک دوسرے کی قدر کریں گے',
  '9-3': 'لڑیں گے لیکن جدا نہیں ہوں گے',
  '9-4': 'جنگ وجدل ایک دوسرے پر کیچڑ اچھالنے والے',
  '9-5': 'دونوں اعتدال کے ساتھ زندگی گزاریں گے',
  '9-6': 'میانہ انداز کا تعلق ہمیشہ قائم رہے گا',
  '9-7': 'دونوں کے مزاج میں اختلاف رہے گا',
  '9-8': 'ہر اعتبار سے خوشگوار زندگی گزاریں گے',
  '9-9': 'ہمیشہ جنگ و جدل کا شکار رہیں گے لیکن طلاق نہیں ہو گی',
};

interface CompatibilityResult {
  interpretation: string;
  maleMufrad: number;
  femaleMufrad: number;
  maleTotalAdad: number;
  femaleTotalAdad: number;
}

const ShadiMuwafiqat: React.FC = () => {
  const [maleInput, setMaleInput] = useState('');
  const [femaleInput, setFemaleInput] = useState('');
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const disclaimer = "واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے";

  const calculateCompatibility = () => {
    const maleSum = calculateAbjad(maleInput);
    const femaleSum = calculateAbjad(femaleInput);
    
    const maleMufrad = calculateMufrad(maleSum);
    const femaleMufrad = calculateMufrad(femaleSum);
    
    const key = `${maleMufrad}-${femaleMufrad}`;
    const interpretation = MUWAFIQAT_MAP[key] || 'معلومات دستیاب نہیں';
    
    setResult({ 
      interpretation, 
      maleMufrad, 
      femaleMufrad,
      maleTotalAdad: maleSum,
      femaleTotalAdad: femaleSum
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      <div className="card-gradient border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl urdu-text gold-text text-center mb-8 underline underline-offset-8 decoration-amber-500/30">شادی کی موافقت</h2>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-right urdu-text text-slate-400">لڑکے کا نام اور والدہ کا نام</label>
            <input 
              type="text" 
              value={maleInput}
              onChange={(e) => setMaleInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-right text-2xl urdu-text focus:border-amber-500 focus:outline-none transition-all shadow-inner"
              placeholder="مثال: محمد علی زینب بی بی"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-right urdu-text text-slate-400">لڑکی کا نام اور والدہ کا نام</label>
            <input 
              type="text" 
              value={femaleInput}
              onChange={(e) => setFemaleInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-right text-2xl urdu-text focus:border-amber-500 focus:outline-none transition-all shadow-inner"
              placeholder="مثال: حمیدہ جان کلثوم بی بی"
            />
          </div>
        </div>

        <button 
          onClick={calculateCompatibility}
          disabled={!maleInput || !femaleInput}
          className="w-full gold-bg text-slate-900 font-bold py-5 rounded-xl urdu-text text-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_4px_20px_-5px_rgba(212,175,55,0.6)] active:scale-95"
        >
          موافقت معلوم کریں
        </button>
      </div>

      {result && (
        <div className="card-gradient border-2 gold-border border-double rounded-3xl p-10 text-center animate-bounce-in relative overflow-hidden shadow-[0_0_50px_-10px_rgba(212,175,55,0.2)]">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-amber-500/20 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-amber-500/20 rounded-br-3xl"></div>

          {/* Breakdown Section */}
          <div className="mb-8 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <h4 className="urdu-text text-slate-500 text-sm mb-3">حسابی تفصیل (Breakdown)</h4>
            <div className="grid grid-cols-2 gap-4 text-center urdu-text text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="block text-slate-500 mb-1">لڑکے کے کل اعداد</span>
                <span className="text-amber-500 font-bold text-lg">{result.maleTotalAdad}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="block text-slate-500 mb-1">لڑکی کے کل اعداد</span>
                <span className="text-amber-500 font-bold text-lg">{result.femaleTotalAdad}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-12 mb-8 border-b border-slate-800 pb-6">
            <div className="text-center">
              <span className="block text-slate-500 urdu-text text-sm">لڑکے کا مفرد</span>
              <span className="text-4xl font-bold text-amber-500 drop-shadow-md">{result.maleMufrad}</span>
            </div>
            <div className="text-slate-700 flex items-center text-4xl">❤</div>
            <div className="text-center">
              <span className="block text-slate-500 urdu-text text-sm">لڑکی کا مفرد</span>
              <span className="text-4xl font-bold text-amber-500 drop-shadow-md">{result.femaleMufrad}</span>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-slate-400 urdu-text text-lg">نتیجہ موافقت:</span>
            <h3 className="text-3xl md:text-5xl urdu-text font-bold text-amber-500 leading-snug drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)] px-4">
              {result.interpretation}
            </h3>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/50 space-y-4">
            <p className="urdu-text text-sm italic text-amber-500/60 drop-shadow-sm">
              {disclaimer}
            </p>
            <div className="text-[10px] text-slate-600 urdu-text italic">
              علم الاعداد کے مطابق ناموں کے مفرد نکال کر موافقت کا اندازہ لگایا گیا ہے۔
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShadiMuwafiqat;
