
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const Khwabnama: React.FC = () => {
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disclaimer = "واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے";
  const interpretationDisclaimer = "تعبیر ایک تخمینہ ہے، حتمی علم صرف اللہ کے پاس ہے";

  const getInterpretation = async () => {
    if (!dream.trim()) return;
    
    setLoading(true);
    setInterpretation(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        User has described a dream: "${dream}".
        
        As an expert in Islamic dream interpretation (Ta'bir al-Ahlam) following the traditions of Imam Ibn Sirin and other authentic Islamic sources, provide a clear, detailed, and respectful interpretation in Urdu.
        
        Guidelines:
        - Use Nastaliq-friendly phrasing.
        - Maintain a spiritual, humble, and supportive tone.
        - Explain potential meanings or symbols within the dream.
        - If the dream is unclear, ask for more details politely while providing general possibilities.
        - Ensure the response is around 150-250 words.
        - Start directly with the interpretation.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert Islamic dream interpreter based on Ibn Sirin teachings. You respond only in Urdu with wisdom and spiritual depth.',
          temperature: 0.7,
        }
      });

      if (result.text) {
        setInterpretation(result.text);
      } else {
        throw new Error('No response from AI');
      }
    } catch (err: any) {
      console.error('Khwabnama API Error:', err);
      setError('تعبیر حاصل کرنے میں دشواری پیش آئی۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-24 px-4">
      <div className="card-gradient border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full -ml-20 -mb-20"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <span className="text-6xl animate-pulse">🌙</span>
          </div>
          <h2 className="text-4xl urdu-text gold-text font-bold mb-8">اے آئی خوابنامہ</h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-right space-y-2">
              <label className="urdu-text text-slate-400 block pr-2">اپنے خواب کی تفصیل لکھیں</label>
              <textarea 
                value={dream}
                onChange={(e) => setDream(e.target.value)}
                rows={5}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-6 text-right urdu-text text-xl focus:border-amber-500 focus:outline-none transition-all resize-none text-emerald-50"
                placeholder="خواب میں آپ نے کیا دیکھا؟ تفصیل یہاں درج کریں..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 urdu-text text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={getInterpretation}
              disabled={loading || !dream.trim()}
              className="w-full gold-bg text-slate-950 font-bold py-5 rounded-2xl urdu-text text-2xl hover:bg-amber-400 transition-all shadow-[0_0_40px_-10px_rgba(212,175,55,0.4)] disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  تعبیر تلاش کی جا رہی ہے...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>تعبیر معلوم کریں</span>
                  <span className="group-hover:rotate-12 transition-transform">⭐</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {interpretation && (
        <div className="card-gradient border-2 gold-border border-double rounded-[3rem] p-10 md:p-14 text-right animate-bounce-in shadow-2xl relative">
          <div className="absolute -top-6 right-12 bg-amber-500 text-slate-950 px-6 py-2 rounded-full font-bold urdu-text text-lg shadow-lg">
             خواب کی تعبیر
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="urdu-text text-2xl text-slate-200 leading-[2.8] whitespace-pre-line italic">
              {interpretation}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4">
             <p className="urdu-text text-lg italic text-amber-500/70 font-bold drop-shadow-sm text-center">
               {interpretationDisclaimer}
             </p>
             <p className="urdu-text text-sm text-amber-500/40 text-center">
               {disclaimer}
             </p>
             <button 
               onClick={() => { setInterpretation(null); setDream(''); }}
               className="mt-4 text-amber-500/60 hover:text-amber-500 transition-colors urdu-text text-sm underline"
             >
               دوسرا خواب لکھیں
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Khwabnama;
