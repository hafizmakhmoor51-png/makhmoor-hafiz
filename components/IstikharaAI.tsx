
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { calculateAbjad, calculateCurrentSaatInfo, getCurrentDayName } from '../utils/abjad';

const IstikharaAI: React.FC = () => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disclaimer = "واللہ ورسولہ اعلم (عزوجل و ﷺ) - حقیقی علم و غیب صرف اللہ تعالیٰ ہی کے پاس ہے";

  const getIstikhara = async () => {
    if (!name || !question) return;
    
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const nameAdad = calculateAbjad(name);
      const { planetName } = calculateCurrentSaatInfo();
      const day = getCurrentDayName();
      
      const prompt = `
        You are a Spiritual Consultant expert in Ilm-ul-Adad (Abjad) and Islamic traditions. 
        A user named "${name}" (Abjad value: ${nameAdad}) is asking an Istikhara question: "${question}".
        Current Context:
        - Day: ${day}
        - Current Sa'at (Planetary Hour): ${planetName}
        
        Please provide a spiritual guidance and interpretation in Urdu (using Nastaliq-friendly phrasing). 
        The tone should be supportive, religious, and wise. 
        Incorporate the significance of their Abjad number and the current planetary hour into the response.
        Keep the response concise but profound (around 150-200 words).
        Return ONLY the response in Urdu text.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          topP: 0.9,
        }
      });

      if (result.text) {
        setResponse(result.text);
      } else {
        throw new Error('No response from AI');
      }
    } catch (err: any) {
      console.error('Istikhara API Error:', err);
      setError('سرور سے رابطہ کرنے میں دشواری پیش آئی۔ براہ کرم اپنا انٹرنیٹ چیک کریں اور دوبارہ کوشش کریں۔');
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
          <h2 className="text-4xl urdu-text gold-text font-bold mb-8">روحانی استخارہ و رہنمائی</h2>
          
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-right space-y-2">
              <label className="urdu-text text-slate-400 block pr-2">آپ کا نام</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-right urdu-text text-xl focus:border-amber-500 focus:outline-none transition-all"
                placeholder="نام یہاں لکھیں..."
              />
            </div>

            <div className="text-right space-y-2">
              <label className="urdu-text text-slate-400 block pr-2">آپ کا سوال یا مقصد (نیت)</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-right urdu-text text-xl focus:border-amber-500 focus:outline-none transition-all resize-none"
                placeholder="اپنا سوال یا نیت یہاں تفصیل سے لکھیں..."
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 urdu-text text-sm">
                {error}
              </div>
            )}

            <button 
              onClick={getIstikhara}
              disabled={loading || !name || !question}
              className="w-full bg-amber-500 text-slate-950 font-bold py-5 rounded-2xl urdu-text text-2xl hover:bg-amber-400 transition-all shadow-[0_0_40px_-10px_rgba(212,175,55,0.4)] disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  روحانی مشاہدہ جاری ہے...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>رہنمائی حاصل کریں</span>
                  <span className="group-hover:translate-x-1 transition-transform">✨</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {response && (
        <div className="card-gradient border-2 gold-border border-double rounded-[3rem] p-10 md:p-14 text-right animate-bounce-in shadow-2xl relative">
          <div className="absolute -top-6 right-12 bg-amber-500 text-slate-950 px-6 py-2 rounded-full font-bold urdu-text text-lg shadow-lg">
            روحانی جواب
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="urdu-text text-2xl text-slate-200 leading-[2.8] whitespace-pre-line">
              {response}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col items-center gap-6">
             <p className="urdu-text text-lg italic text-amber-500/70 font-bold drop-shadow-sm text-center">
               {disclaimer}
             </p>
             <button 
               onClick={() => { setResponse(null); setQuestion(''); }}
               className="text-amber-500/60 hover:text-amber-500 transition-colors urdu-text text-sm underline"
             >
               نیا سوال پوچھیں
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IstikharaAI;
