
import React, { useState } from 'react';

interface FaalResult {
  letter: string;
  interpretation: string;
  advice: string;
}

const FAL_DATA: Record<string, FaalResult> = {
  'ا': { letter: 'ا', interpretation: 'مقصد میں کامیابی ملے گی', advice: 'اپنے ارادے پر قائم رہیں اور اللہ پر بھروسہ رکھیں۔' },
  'ب': { letter: 'ب', interpretation: 'خوشخبری اور برکت کا اشارہ ہے', advice: 'صدقہ و خیرات کریں، کام میں برکت ہوگی۔' },
  'ج': { letter: 'ج', interpretation: 'صبر کا پھل میٹھا ملے گا', advice: 'جلد بازی سے گریز کریں، وقت آپ کے حق میں ہے۔' },
  'د': { letter: 'د', interpretation: 'دولت اور عزت میں اضافہ ہوگا', advice: 'شکر گزاری اختیار کریں، نعمتوں میں اضافہ ہوگا۔' },
  'ہ': { letter: 'ہ', interpretation: 'پریشانی دور ہونے کا وقت ہے', advice: 'گھبرائیں نہیں، اندھیرے کے بعد سویرا ہے۔' },
  'و': { letter: 'و', interpretation: 'سفر یا تبدیلی متوقع ہے', advice: 'نئے راستے کھل رہے ہیں، ہمت نہ ہاریں۔' },
  'ز': { letter: 'ز', interpretation: 'دشمن مغلوب ہوں گے', advice: 'اپنی حفاظت کریں اور ذکرِ الہیٰ میں مشغول رہیں۔' },
  'ح': { letter: 'ح', interpretation: 'حاجت پوری ہونے کی امید ہے', advice: 'خلوصِ دل سے دعا کریں، دروازہ کھلنے والا ہے۔' },
  'ط': { letter: 'ط', interpretation: 'طہارت اور پاکیزگی کا پیغام ہے', advice: 'اپنے خیالات اور نیت کو صاف رکھیں۔' },
  'ی': { letter: 'ی', interpretation: 'یقین کامل کامیابی کی کنجی ہے', advice: 'شک و شبہ کو دل سے نکال دیں، فتح آپ کی ہے۔' },
  'ک': { letter: 'ک', interpretation: 'کشادہ رزق کی نوید ہے', advice: 'رزق حلال کی تلاش جاری رکھیں، برکت ہوگی۔' },
  'ل': { letter: 'ل', interpretation: 'لطف و کرم کا وقت ہے', advice: 'دوسروں کے ساتھ نرمی برتیں، آپ پر بھی کرم ہوگا۔' },
  'م': { letter: 'م', interpretation: 'محبت اور الفت بڑھے گی', advice: 'رشتوں کو وقت دیں، تلخیاں دور ہوں گی۔' },
  'ن': { letter: 'ن', interpretation: 'نیکی کا بدلہ نیکی ملے گا', advice: 'نیک کاموں میں پیش پیش رہیں، صلہ ضرور ملے گا۔' },
  'س': { letter: 'س', interpretation: 'سکونِ قلب حاصل ہوگا', advice: 'عبادت اور مراقبہ کو معمول بنائیں۔' },
  'ع': { letter: 'ع', interpretation: 'علم اور حکمت میں اضافہ ہوگا', advice: 'سیکھنے کا عمل جاری رکھیں، مقام بلند ہوگا۔' },
  'ف': { letter: 'ف', interpretation: 'فتح و نصرت قریب ہے', advice: 'مشکلات سے نہ گھبرائیں، کامیابی قدم چومے گی۔' },
  'ص': { letter: 'ص', interpretation: 'صبر و استقامت کا امتحان ہے', advice: 'ثابت قدم رہیں، انجام بخیر ہوگا۔' },
  'ق': { letter: 'ق', interpretation: 'قوت اور ارادے کی مضبوطی', advice: 'اپنے فیصلے پر نظرِ ثانی نہ کریں، حق پر رہیں۔' },
  'ر': { letter: 'ر', interpretation: 'راحت اور سکون کی خوشخبری', advice: 'سختی کا دور گزر گیا، اب آسانی کا وقت ہے۔' },
  'ش': { letter: 'ش', interpretation: 'شرف اور بزرگی ملے گی', advice: 'اپنے بزرگوں کا احترام کریں، دعا لیں کٹھن راستے آسان ہوں گے۔' },
  'ت': { letter: 'ت', interpretation: 'توبہ اور رجوع الی اللہ', advice: 'اپنی غلطیوں کی معافی مانگیں، نیا راستہ ملے گا۔' },
  'ث': { letter: 'ث', interpretation: 'ثواب اور بھلائی کا راستہ', advice: 'خیر کے کاموں میں حصہ لیں، نفع ہوگا۔' },
  'خ': { letter: 'خ', interpretation: 'خیر و عافیت کا سایہ', advice: 'سلامتی آپ کے ساتھ ہے، خوفزدہ نہ ہوں۔' },
  'ذ': { letter: 'ذ', interpretation: 'ذہانت سے کام لینے کی ضرورت ہے', advice: 'ہوشیاری سے قدم اٹھائیں، کامیابی ملے گی۔' },
  'ض': { letter: 'ض', interpretation: 'ضمانت اور حفاظت کا اشارہ', advice: 'اللہ آپ کا نگہبان ہے، توکل کریں۔' },
  'ظ': { letter: 'ظ', interpretation: 'ظاہر و باطن کی یکسانیت', advice: 'منافقت سے بچیں، سچائی میں نجات ہے۔' },
  'غ': { letter: 'غ', interpretation: 'غیبی مدد حاصل ہوگی', advice: 'ناامید نہ ہوں، مدد وہاں سے آئے گی جہاں سے گمان نہ ہو۔' },
};

const Falnama: React.FC = () => {
  const [result, setResult] = useState<FaalResult | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const generateFaal = () => {
    setIsSpinning(true);
    setResult(null);
    
    setTimeout(() => {
      const keys = Object.keys(FAL_DATA);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setResult(FAL_DATA[randomKey]);
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="card-gradient border border-slate-800 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
        
        <h2 className="text-3xl urdu-text gold-text mb-6">فالنامہ (divination)</h2>
        
        <div className="space-y-6 relative z-10">
          <p className="urdu-text text-slate-400 text-lg leading-relaxed">
            اپنے مقصد یا نیت کو دل میں حاضر کریں، آنکھیں بند کر کے تین بار درود شریف پڑھیں اور نیچے دیے گئے بٹن پر کلک کریں۔
          </p>
          
          <div className="py-8">
            <button 
              onClick={generateFaal}
              disabled={isSpinning}
              className={`relative group px-12 py-5 rounded-2xl gold-bg text-slate-950 font-bold urdu-text text-2xl transition-all shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)] active:scale-95 disabled:opacity-50`}
            >
              {isSpinning ? (
                <span className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  فال نکالی جا رہی ہے...
                </span>
              ) : 'فال نکالیں'}
              
              <div className="absolute inset-0 rounded-2xl border-2 border-amber-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all"></div>
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="card-gradient border-2 gold-border border-double rounded-[3rem] p-12 text-center animate-bounce-in shadow-[0_0_60px_-10px_rgba(212,175,55,0.2)]">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-4">
              <span className="text-6xl urdu-text gold-text font-bold leading-none pt-2">{result.letter}</span>
            </div>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
          </div>

          <div className="space-y-6">
            <h3 className="text-4xl md:text-5xl urdu-text font-bold text-amber-500 drop-shadow-md">
              {result.interpretation}
            </h3>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 inline-block max-w-md">
              <span className="block text-slate-500 urdu-text text-sm mb-2">روحانی مشورہ:</span>
              <p className="urdu-text text-xl text-slate-300 leading-relaxed italic">
                "{result.advice}"
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50">
            <p className="urdu-text text-[10px] text-slate-600 italic">
              فالنامہ صرف ایک اشارہ ہے، حتمی فیصلہ اور علم غیب اللہ تعالی کے پاس ہے۔
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Falnama;
