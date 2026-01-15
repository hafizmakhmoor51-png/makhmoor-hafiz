
import React from 'react';

const RohaniIlaj: React.FC = () => {
  const instructions = [
    "اس یقین کے ساتھ علاج کروائیں کہ اللہ تعالی مجھے شفا دے گا کیونکہ اللہ تعالی نے کوئی ایسی بیماری پیدا نہیں کی جس کی شفا نہ اتاری ہو۔",
    "جلد بازی سے کام نہ لیں، اللہ تعالی اس کی دعا قبول فرماتا ہے جو جلد بازی نہیں کرتا۔",
    "نمازِ پنجگانہ اور جو اوراد و وظائف بتائے جائیں ان کی پابندی کریں۔",
    "شفا کی امید صرف اللہ تعالی سے رکھیں، جس طرح اس کے اذن کے بغیر کوئی جادو کسی پر اثر انداز نہیں ہو سکتا، اسی طرح اس کے امر کے بغیر کوئی دم، کوئی دوا اثر کر سکتی ہے نہ کسی معالج کا علاج نفع دے سکتا ہے اور نہ ہی کسی حکیم کا تجربہ کام آسکتا ہے۔",
    "ہم ایسا کوئی دعویٰ نہیں کرتے کہ ہم ہر ناممکن کو ممکن کر دکھائیں گے یا آپ کا ہر مسئلہ فوراً حل کر دیں گے، کیونکہ یہ سب ہوائی باتیں ہیں جن کا حقائق سے کوئی تعلق نہیں۔ ایسی بے سروپا باتوں پر یقین کرنے والے کئی لوگ لاکھوں روپے برباد کر دیتے ہیں اور انہیں سوائے حسرت و یاس کچھ حاصل نہیں ہوتا۔",
    "ہر مریض کی الگ کیفیت ہوتی ہے۔ اگر دس آدمی ایک ہی بیماری میں مبتلا ہوں تو ضروری نہیں کہ بہ یک وقت سارے صحت یاب ہو جائیں، بعض کو صحت یابی میں وقت لگتا ہے۔ عملیات کا بھی یہی حال ہے، اطمینانِ قلبی سے علاج جاری رکھیں۔",
    "اگر آپ جلد صحت یاب ہو جائیں تو اللہ کا شکر ادا کریں اور اگر کچھ تاخیر ہو جائے تو پریشان نہ ہوں، اللہ پاک آپ کو شفا عطا فرمائے گا!"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn pb-24 px-4">
      {/* Intro Section */}
      <div className="card-gradient border-2 gold-border border-double rounded-[3rem] p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        
        <h2 className="text-4xl urdu-text gold-text font-bold mb-6">سلسلہ روحانی علاج</h2>
        
        <div className="space-y-4 mb-8">
          <p className="urdu-text text-2xl text-emerald-50 font-bold drop-shadow-sm">
            حضرت علامہ مولانا حافظ و قاری پیر محمد حفیظ
          </p>
          <p className="urdu-text text-lg text-amber-500/80 font-bold">
            (نقشبندی، چشتی، قادری، سیفی)
          </p>
        </div>

        <div className="bg-emerald-950/50 p-6 rounded-3xl border border-amber-500/20 inline-block">
          <p className="urdu-text text-xl text-amber-500">
            وقت: ہر اتوار بعد نمازِ فجر تا ظہر
          </p>
        </div>

        <div className="mt-10">
           <a 
             href="tel:03459755655" 
             className="inline-flex items-center gap-4 gold-bg text-emerald-950 font-bold py-5 px-10 rounded-2xl urdu-text text-2xl hover:bg-amber-400 transition-all shadow-lg active:scale-95"
           >
             <span>رابطہ کریں: 0345-9755655</span>
             <span className="text-3xl">📞</span>
           </a>
        </div>
      </div>

      {/* Instructions Section */}
      <div className="card-gradient border border-slate-800 rounded-[2.5rem] p-10 shadow-xl">
        <h3 className="text-3xl urdu-text gold-text text-center mb-10 underline underline-offset-8 decoration-amber-500/30">
          مریضوں کے لیے ضروری ہدایات
        </h3>
        
        <div className="space-y-6">
          {instructions.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <div className="mt-2 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors">
                <span className="text-amber-500 text-xs font-bold group-hover:text-emerald-950">{idx + 1}</span>
              </div>
              <p className="urdu-text text-xl text-emerald-100/90 leading-[2.2] text-right">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="urdu-text text-lg italic text-amber-500/60">
          واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے
        </p>
      </div>
    </div>
  );
};

export default RohaniIlaj;
