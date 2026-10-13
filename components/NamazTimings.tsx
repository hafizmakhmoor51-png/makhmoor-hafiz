import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PrayerTimeItem, 
  PrayerTimesData, 
  fetchPrayerTimes, 
  speakPrayerAnnouncement, 
  playAdhanChime 
} from '../utils/prayerTimes';

const NamazTimings: React.FC = () => {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Settings
  const [voiceAlertEnabled, setVoiceAlertEnabled] = useState<boolean>(() => {
    return localStorage.getItem('namaz_voice_alert_enabled') !== 'false';
  });
  const [enabledPrayers, setEnabledPrayers] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('namaz_enabled_prayers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fajr: true,
      ishraq: false,
      chasht: false,
      zawal: false,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      tahajjud: false
    };
  });
  const [isHanafi, setIsHanafi] = useState<boolean>(() => {
    return localStorage.getItem('namaz_is_hanafi') !== 'false';
  });
  const [activeTab, setActiveTab] = useState<'all' | 'fard' | 'nafl'>('all');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerTimeItem | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Track location coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number; city: string }>({
    lat: 33.25,
    lng: 73.30,
    city: 'گوجر خان'
  });

  const lastAlertedRef = useRef<{ [key: string]: string }>({});
  const hasFetched = useRef(false);

  // Save settings
  useEffect(() => {
    localStorage.setItem('namaz_voice_alert_enabled', voiceAlertEnabled.toString());
  }, [voiceAlertEnabled]);

  useEffect(() => {
    localStorage.setItem('namaz_enabled_prayers', JSON.stringify(enabledPrayers));
  }, [enabledPrayers]);

  useEffect(() => {
    localStorage.setItem('namaz_is_hanafi', isHanafi.toString());
  }, [isHanafi]);

  // Real-time ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('ur-PK', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Prayer Times for specific coordinates
  const loadPrayerTimes = useCallback(async (lat: number, lng: number, cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const schoolId = isHanafi ? 1 : 0;
      const res = await fetchPrayerTimes(lat, lng, cityName, 1, schoolId);
      setData(res);
      setCurrentCoords({ lat, lng, city: cityName });
      hasFetched.current = true;
    } catch (err) {
      console.warn('Error loading prayer times:', err);
      setError('اوقاتِ نماز لوڈ کرنے میں دشواری پیش آئی، انٹرنیٹ چیک کریں۔');
    } finally {
      setLoading(false);
    }
  }, [isHanafi]);

  // Initial IP auto-detect
  const initLocation = useCallback(async (forceRefresh = false) => {
    if (hasFetched.current && !forceRefresh) return;

    setLoading(true);
    setError(null);

    let detectedLat = 33.25;
    let detectedLng = 73.30;
    let detectedCity = 'گوجر خان';
    let ipSuccess = false;

    // 1. Try ipwho.is
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success !== false && typeof json.latitude === 'number') {
          detectedLat = json.latitude;
          detectedLng = json.longitude;
          detectedCity = json.city || 'آپ کا علاقہ';
          ipSuccess = true;
        }
      }
    } catch (e) {
      console.warn('ipwho.is bypassed:', e);
    }

    // 2. Fallback to ipapi.co
    if (!ipSuccess) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const json = await res.json();
          if (json && !json.error && typeof json.latitude === 'number') {
            detectedLat = json.latitude;
            detectedLng = json.longitude;
            detectedCity = json.city || 'آپ کا علاقہ';
            ipSuccess = true;
          }
        }
      } catch (e) {
        console.warn('ipapi.co bypassed:', e);
      }
    }

    await loadPrayerTimes(detectedLat, detectedLng, detectedCity);
  }, [loadPrayerTimes]);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  // City Search Handler
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=ur&limit=1`,
        {
          headers: {
            'User-Agent': 'RohaniPortalApp/1.0'
          }
        }
      );
      const json = await res.json();
      if (json && json.length > 0) {
        const lat = parseFloat(json[0].lat);
        const lon = parseFloat(json[0].lon);
        const cityName = json[0].display_name.split(',')[0];
        await loadPrayerTimes(lat, lon, cityName);
        setSearchQuery('');
        setSearchError(null);
      } else {
        setSearchError('مطلوبہ شہر نہیں ملا، نام کے ہجے چیک کریں۔');
      }
    } catch (err) {
      console.warn('Search error:', err);
      setSearchError('تلاش کے دوران رابطہ نہ ہو سکا، براہِ کرم دوبارہ کوشش کریں۔');
    } finally {
      setIsSearching(false);
    }
  };

  // Background audio check: Speak alert when prayer minute arrives
  useEffect(() => {
    if (!voiceAlertEnabled || !data || !data.items) return;

    const checkPrayerAlert = () => {
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayKey = now.toDateString();

      data.items.forEach((item) => {
        if (!enabledPrayers[item.id]) return;

        // Check if raw24 matches current minute
        if (item.raw24Time === currentHHMM) {
          const alertKey = `${item.id}_${todayKey}`;
          if (lastAlertedRef.current[item.id] !== alertKey) {
            lastAlertedRef.current[item.id] = alertKey;
            // Speak the prayer announcement
            speakPrayerAnnouncement(item.voiceAlertText);
          }
        }
      });
    };

    checkPrayerAlert();
    const interval = setInterval(checkPrayerAlert, 15000); // check every 15s
    return () => clearInterval(interval);
  }, [voiceAlertEnabled, data, enabledPrayers]);

  // Toggle individual prayer voice alert
  const togglePrayerAlert = (prayerId: string) => {
    setEnabledPrayers((prev) => ({
      ...prev,
      [prayerId]: !prev[prayerId]
    }));
  };

  // Filter items
  const filteredItems = (data?.items || []).filter((item) => {
    if (activeTab === 'fard') return item.type === 'fard';
    if (activeTab === 'nafl') return item.type === 'nafl' || item.type === 'prohibited';
    return true;
  });

  // Test Voice Alert
  const handleTestVoice = (customText?: string) => {
    const textToSpeak = customText || 'نماز کا وقت ہو گیا ہے';
    speakPrayerAnnouncement(textToSpeak);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn pb-24 px-4">
      {/* Header & Search */}
      <div className="flex flex-col gap-6">
        <form onSubmit={handleCitySearch} className="flex gap-2 max-w-2xl mx-auto w-full relative">
          <div className="relative flex-grow">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-emerald-900/20 border border-amber-500/20 rounded-2xl p-4 pr-12 text-right urdu-text text-xl focus:border-amber-500 focus:outline-none transition-all placeholder:text-emerald-500/30 text-emerald-50 shadow-inner"
              placeholder="اپنے شہر کا نام تلاش کریں (مثلاً لاہور، مکہ، لندن)"
              disabled={isSearching}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/40">🔍</span>
          </div>
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="gold-bg text-emerald-950 px-8 rounded-2xl font-bold urdu-text text-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all whitespace-nowrap flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></div>
            ) : (
              <span>تلاش کریں</span>
            )}
          </button>
        </form>

        {searchError && (
          <p className="urdu-text text-center text-red-400 text-sm -mt-3 animate-pulse">
            {searchError}
          </p>
        )}

        {/* Location & Current Status Card */}
        <div className="card-gradient border border-slate-800 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl rounded-full"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* City & Islamic Date */}
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-2">
                <h2 className="urdu-text text-amber-400 text-2xl md:text-3xl font-bold">
                  {data?.city || currentCoords.city}
                </h2>
                <span className="text-2xl">📍</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs urdu-text text-emerald-300/80">
                <span>{data?.hijriDate || 'تاریخ اسلامی'}</span>
                <span>•</span>
                <span>{data?.readableDate}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button 
                  onClick={() => initLocation(true)}
                  className="text-[11px] text-amber-500/70 hover:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-xl urdu-text transition-colors"
                >
                  🔄 موجودہ مقام خودکار حاصل کریں
                </button>
              </div>
            </div>

            {/* Live Clock & Next Prayer Countdown */}
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-950/40 rounded-2xl border border-amber-500/10 text-center space-y-2">
              <span className="text-xs urdu-text text-amber-400/80">موجودہ وقت (گھڑی)</span>
              <span className="font-mono text-2xl md:text-3xl text-amber-300 font-bold tracking-wider">
                {currentTimeStr || '--:--:--'}
              </span>
              
              {data?.nextPrayer && (
                <div className="mt-2 pt-2 border-t border-amber-500/10 w-full flex items-center justify-around">
                  <div>
                    <span className="text-[10px] urdu-text text-slate-400 block">اگلی نماز:</span>
                    <span className="urdu-text text-sm font-bold text-emerald-300">
                      {data.nextPrayer.name} ({data.nextPrayer.time})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] urdu-text text-slate-400 block">باقی وقت:</span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {data.nextPrayer.remainingFormatted}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Alert Switch & Settings Trigger */}
            <div className="flex flex-col items-center lg:items-end justify-center space-y-3">
              <div className="flex items-center gap-3 bg-slate-900/60 border border-amber-500/20 px-4 py-2.5 rounded-2xl w-full sm:w-auto justify-between">
                <div className="text-right">
                  <span className="urdu-text text-sm font-bold text-amber-400 block">
                    صوتی الرٹ (بول کر بتائے)
                  </span>
                  <span className="urdu-text text-[10px] text-slate-400">
                    {voiceAlertEnabled ? 'فعال ہے (وقت پر اعلان ہوگا)' : 'غیر فعال'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceAlertEnabled(!voiceAlertEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    voiceAlertEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="bg-slate-950 w-4 h-4 rounded-full shadow-md transform"></div>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleTestVoice()}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl urdu-text text-xs flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <span>🔊 آواز ٹیسٹ کریں</span>
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl urdu-text text-xs border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <span>⚙️ ترتیبات</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Settings */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-amber-500/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn text-right">
              <div className="bg-emerald-950/30 p-4 rounded-2xl border border-amber-500/10 space-y-2">
                <span className="urdu-text text-sm font-bold text-amber-400 block">طریقہ کارِ عصر (فقہی ترتیب):</span>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setIsHanafi(true); loadPrayerTimes(currentCoords.lat, currentCoords.lng, currentCoords.city); }}
                    className={`px-4 py-2 rounded-xl urdu-text text-xs font-bold transition-all ${
                      isHanafi 
                        ? 'gold-bg text-emerald-950 shadow-md' 
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    فقہ حنفی (مثلین - مروجہ پاکستان و ہند)
                  </button>
                  <button
                    onClick={() => { setIsHanafi(false); loadPrayerTimes(currentCoords.lat, currentCoords.lng, currentCoords.city); }}
                    className={`px-4 py-2 rounded-xl urdu-text text-xs font-bold transition-all ${
                      !isHanafi 
                        ? 'gold-bg text-emerald-950 shadow-md' 
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    فقہ شافعی و جمہور (مثل اول)
                  </button>
                </div>
              </div>

              <div className="bg-emerald-950/30 p-4 rounded-2xl border border-amber-500/10 space-y-2">
                <span className="urdu-text text-sm font-bold text-amber-400 block">انفرادی نمازوں کے صوتی الرٹس:</span>
                <p className="urdu-text text-[11px] text-slate-400 leading-relaxed">
                  نیچے دیے گئے کارڈز میں ہر نماز کے ساتھ موجود مائیکروفون / سپیکر کے بٹن سے کسی بھی مخصوص نماز کا الرٹ آن یا آف کر سکتے ہیں۔
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 border-b border-amber-500/10 pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2.5 rounded-2xl urdu-text text-base font-bold transition-all ${
            activeTab === 'all'
              ? 'gold-bg text-emerald-950 shadow-lg scale-105'
              : 'bg-slate-900/60 text-slate-400 hover:text-amber-300'
          }`}
        >
          تمام اوقات (9 اوقات)
        </button>
        <button
          onClick={() => setActiveTab('fard')}
          className={`px-6 py-2.5 rounded-2xl urdu-text text-base font-bold transition-all ${
            activeTab === 'fard'
              ? 'gold-bg text-emerald-950 shadow-lg scale-105'
              : 'bg-slate-900/60 text-slate-400 hover:text-amber-300'
          }`}
        >
          پنجگانہ نمازیں (5 فرض)
        </button>
        <button
          onClick={() => setActiveTab('nafl')}
          className={`px-6 py-2.5 rounded-2xl urdu-text text-base font-bold transition-all ${
            activeTab === 'nafl'
              ? 'gold-bg text-emerald-950 shadow-lg scale-105'
              : 'bg-slate-900/60 text-slate-400 hover:text-amber-300'
          }`}
        >
          نوافل و اوقاتِ کراہت
        </button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 card-gradient rounded-3xl border border-slate-800">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="urdu-text text-xl text-amber-500 animate-pulse">اوقاتِ نماز مرتب کیے جا رہے ہیں...</p>
          <p className="urdu-text text-xs text-slate-500">مقامی سائنسی و فلکیاتی حساب کتاب جاری ہے</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-10 space-y-6 card-gradient rounded-3xl border border-red-500/20">
          <div className="text-5xl">⚠️</div>
          <p className="urdu-text text-xl text-red-400 text-center">{error}</p>
          <button 
            onClick={() => initLocation(true)}
            className="gold-bg text-emerald-950 px-8 py-3 rounded-xl urdu-text font-bold text-lg"
          >
            دوبارہ کوشش کریں
          </button>
        </div>
      ) : (
        /* Prayer Times Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isAlertOn = enabledPrayers[item.id] !== false && voiceAlertEnabled;
            const isCurrent = item.isCurrent;
            const isProhibited = item.type === 'prohibited';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPrayer(item)}
                className={`card-gradient rounded-3xl p-6 text-right transition-all transform hover:-translate-y-1.5 cursor-pointer relative overflow-hidden border-2 ${
                  isCurrent 
                    ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_40px_rgba(212,175,55,0.25)]' 
                    : isProhibited
                    ? 'border-red-500/30 bg-red-950/10'
                    : 'border-slate-800 hover:border-amber-500/30'
                }`}
              >
                {/* Active Badge */}
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-emerald-950 px-4 py-1 rounded-bl-2xl font-bold urdu-text text-xs shadow-md">
                    موجودہ وقت
                  </div>
                )}
                {item.isNext && !isCurrent && (
                  <div className="absolute top-0 right-0 bg-emerald-600/80 text-white px-4 py-1 rounded-bl-2xl font-bold urdu-text text-xs shadow-md">
                    اگلی نماز
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  {/* Audio Preview & Toggle Buttons */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      title="آواز سنیں"
                      onClick={() => speakPrayerAnnouncement(item.voiceAlertText)}
                      className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                    >
                      🔊
                    </button>
                    <button
                      title={isAlertOn ? 'الرٹ فعال ہے' : 'الرٹ بند ہے'}
                      onClick={() => togglePrayerAlert(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs urdu-text transition-colors flex items-center gap-1 border ${
                        isAlertOn 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      <span>{isAlertOn ? '🔔 آن' : '🔕 آف'}</span>
                    </button>
                  </div>

                  {/* Prayer Name & Arabic */}
                  <div className="text-right">
                    <h3 className={`urdu-text text-2xl font-bold ${
                      isProhibited ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {item.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-serif block">
                      {item.arabicName}
                    </span>
                  </div>
                </div>

                {/* Big Time Display */}
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 my-4 text-center">
                  <div className="text-3xl font-mono font-bold text-slate-100 tracking-wider">
                    {item.time}
                  </div>
                  {item.endTime && (
                    <div className="text-xs urdu-text text-slate-400 mt-1">
                      اختتام: <span className="font-mono text-slate-300">{item.endTime}</span>
                    </div>
                  )}
                </div>

                {/* Rakats & Summary */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-xs urdu-text">
                    <span className="text-amber-400 font-bold">{item.rakatDesc}</span>
                    <span className="text-slate-400">تعدادِ رکعات:</span>
                  </div>
                  <p className="urdu-text text-[11px] text-slate-400/90 leading-relaxed line-clamp-2">
                    {item.virtue}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPrayer && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" 
          onClick={() => setSelectedPrayer(null)}
        >
          <div 
            className="card-gradient border-2 gold-border border-double rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-bounce-in text-right" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
              <button 
                onClick={() => setSelectedPrayer(null)} 
                className="text-slate-500 hover:text-white transition-colors text-xl p-1"
              >
                ✕
              </button>
              <div className="flex flex-col items-end">
                <span className="urdu-text text-amber-400 text-3xl font-bold">{selectedPrayer.name}</span>
                <span className="font-mono text-xs text-slate-400">{selectedPrayer.arabicName}</span>
              </div>
            </div>

            <div className="space-y-6 text-center">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                <span className="block urdu-text text-slate-400 text-xs mb-1">وقت کا آغاز:</span>
                <span className="text-3xl font-mono font-bold text-amber-300 block">{selectedPrayer.time}</span>
                {selectedPrayer.endTime && (
                  <span className="block urdu-text text-slate-400 text-xs mt-2">
                    وقت کا اختتام: <span className="font-mono text-slate-200">{selectedPrayer.endTime}</span>
                  </span>
                )}
              </div>

              <div className="text-right bg-emerald-950/30 p-4 rounded-xl border border-amber-500/10 space-y-1">
                <span className="block urdu-text text-amber-400 font-bold text-sm">رکعات کی تفصیل:</span>
                <p className="urdu-text text-slate-200 text-lg">{selectedPrayer.rakatDesc}</p>
              </div>

              <div className="text-right bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="block urdu-text text-amber-400 font-bold text-sm">فضیلت و احکام:</span>
                <p className="urdu-text text-slate-300 text-sm leading-relaxed">{selectedPrayer.virtue}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => speakPrayerAnnouncement(selectedPrayer.voiceAlertText)}
                  className="flex-1 gold-bg text-emerald-950 font-bold py-3.5 rounded-xl urdu-text text-base hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>🔊 آواز سنیں</span>
                </button>
                <button
                  onClick={() => setSelectedPrayer(null)}
                  className="px-6 py-3.5 border border-slate-700 text-slate-400 hover:text-white rounded-xl urdu-text text-base"
                >
                  بند کریں
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NamazTimings;
