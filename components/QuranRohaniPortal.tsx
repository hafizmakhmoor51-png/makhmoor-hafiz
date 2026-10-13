import React, { useState } from 'react';

const QuranRohaniPortal: React.FC = () => {
  const portalUrl = 'https://noonwalqalam.vercel.app/';
  const [viewMode, setViewMode] = useState<'embedded' | 'overview'>('embedded');
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  const features = [
    {
      title: 'تلاوتِ قرآنِ پاک',
      desc: 'قرآن مجید کی مکمل سورتیں، تجوید اور آیاتِ شفا کی تلاوت و سماعت',
      icon: '📖'
    },
    {
      title: 'طبِ نبوی و مسنون علاج',
      desc: 'حضور نبی کریم ﷺ کے بتائے ہوئے مستند قدرتی و نبوی طریقے',
      icon: '🌿'
    },
    {
      title: 'مجرب قرآنی وظائف',
      desc: 'رزق، صحت، بیماری، رشتوں اور گھریلو و معاشی رکاوٹوں کے اوراد',
      icon: '🤲'
    },
    {
      title: 'مستند نقوش و روحانی تشخیص',
      desc: 'جملہ جسمانی، نفسیاتی اور نظرِ بد کے شرعی نقوش و تعویذات',
      icon: '✨'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-24 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="card-gradient border-2 gold-border border-double rounded-[2.5rem] p-6 md:p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
            📖
          </div>

          <h2 className="text-3xl md:text-4xl urdu-text gold-text font-bold">
            روحانی علاج و طبِ نبوی
          </h2>
          <p className="urdu-text text-lg md:text-xl text-emerald-100/90 max-w-2xl leading-relaxed">
            قرآنی وظائف، نبوی علاج، روحانی تشخیص اور تلاوتِ قرآنِ پاک کا مستند آن لائن پورٹل
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-bg text-emerald-950 font-bold px-6 py-3.5 rounded-2xl urdu-text text-lg hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <span>مکمل ویب پورٹل کھولیں (نئی ونڈو)</span>
              <span className="text-xl">↗</span>
            </a>

            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setViewMode('embedded')}
                className={`px-4 py-2 rounded-xl urdu-text text-sm font-bold transition-all ${
                  viewMode === 'embedded'
                    ? 'gold-bg text-emerald-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ایپ کے اندر دیکھیں
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-4 py-2 rounded-xl urdu-text text-sm font-bold transition-all ${
                  viewMode === 'overview'
                    ? 'gold-bg text-emerald-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                خصوصیات و معلومات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Live Viewer Mode */}
      {viewMode === 'embedded' && (
        <div className="card-gradient rounded-3xl border border-amber-500/20 overflow-hidden shadow-2xl relative">
          {/* Iframe Top Bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIframeLoading(true);
                  const iframe = document.getElementById('rohani-portal-iframe') as HTMLIFrameElement;
                  if (iframe) iframe.src = portalUrl;
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
                title="Refresh"
              >
                <span>🔄 ریفریش</span>
              </button>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs rounded-lg transition-colors border border-amber-500/30"
              >
                براؤزر میں کھولیں ↗
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400/80 urdu-text font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>noonwalqalam.vercel.app</span>
            </div>
          </div>

          {/* Loading indicator */}
          {iframeLoading && (
            <div className="absolute inset-0 top-12 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-10">
              <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="urdu-text text-amber-400 text-lg">روحانی علاج پورٹل لوڈ ہو رہا ہے...</p>
            </div>
          )}

          {/* The Embed iframe */}
          <iframe
            id="rohani-portal-iframe"
            src={portalUrl}
            title="روحانی علاج و طبِ نبوی پورٹل"
            className="w-full h-[75vh] md:h-[82vh] border-0 bg-white"
            onLoad={() => setIframeLoading(false)}
            allow="fullscreen; autoplay"
          />
        </div>
      )}

      {/* Overview & Feature Details Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="card-gradient rounded-3xl p-6 text-right border border-slate-800 hover:border-amber-500/30 transition-all flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-grow">
                  <h3 className="urdu-text text-2xl font-bold text-amber-400">
                    {f.title}
                  </h3>
                  <p className="urdu-text text-emerald-100/80 text-base leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-3xl shrink-0">
                  {f.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="card-gradient rounded-3xl p-8 text-center border border-slate-800 space-y-4">
            <h3 className="urdu-text text-2xl font-bold text-amber-400">
              پورٹل تک رسائی کا براہِ راست لنک
            </h3>
            <p className="urdu-text text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
              اگر آپ اپنے موبائل کے بیرونی براؤزر میں تمام قرآنی وظائف اور تلاوتِ قرآن پاک پڑھنا چاہتے ہیں تو نیچے دیے گئے لنک پر کلک فرمائیں:
            </p>
            <div className="pt-2">
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 gold-bg text-emerald-950 font-bold px-8 py-4 rounded-2xl urdu-text text-xl hover:bg-amber-400 transition-all shadow-xl active:scale-95"
              >
                <span>روحانی علاج پورٹل کھولیں</span>
                <span className="text-2xl">🔗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranRohaniPortal;
