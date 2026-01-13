
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PLANET_VALUES, PLANET_WAZIFAS, STATUS_JUDGMENTS, SAAT_STATUS_MATRIX } from '../constants';
import { SaatHour } from '../types';
import { getIslamicDayInfo } from '../utils/abjad';

interface SaatProps {
  onUseSaat: (planet: string, value: number) => void;
  onSolarDataUpdate?: (data: { sunrise: string, sunset: string }) => void;
}

const Saat: React.FC<SaatProps> = ({ onUseSaat, onSolarDataUpdate }) => {
  const [locationName, setLocationName] = useState<string>('مقام تلاش کیا جا رہا ہے...');
  const [sunrise, setSunrise] = useState<string>('--:--');
  const [sunset, setSunset] = useState<string>('--:--');
  const [dayName, setDayName] = useState<string>('');
  const [nextDayName, setNextDayName] = useState<string>('');
  const [dayHours, setDayHours] = useState<SaatHour[]>([]);
  const [nightHours, setNightHours] = useState<SaatHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<SaatHour | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const hasFetched = useRef(false);
  const planetsSequence = ['زحل', 'مشتری', 'مریخ', 'شمس', 'زہرہ', 'عطارد', 'قمر'];
  
  const getDayRegent = (dayIndex: number) => {
    const mapping: Record<number, string> = {
      0: 'شمس', 1: 'قمر', 2: 'مریخ', 3: 'عطارد', 4: 'مشتری', 5: 'زہرہ', 6: 'زحل'
    };
    return mapping[dayIndex];
  };

  const calculateHours = useCallback((todaySr: string, todaySs: string, tomorrowSr: string) => {
    const sr = new Date(todaySr);
    const ss = new Date(todaySs);
    const tmSr = new Date(tomorrowSr);

    const dayDuration = ss.getTime() - sr.getTime();
    const dayHourLength = dayDuration / 12;

    const nightDuration = tmSr.getTime() - ss.getTime();
    const nightHourLength = nightDuration / 12;

    const dayIndex = sr.getDay();
    const startPlanet = getDayRegent(dayIndex);
    let planetIdx = planetsSequence.indexOf(startPlanet);

    const now = new Date();
    const newDayHours: SaatHour[] = [];
    const newNightHours: SaatHour[] = [];
    const dayStatusRow = SAAT_STATUS_MATRIX[dayIndex] || [];
    const days = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
    
    setDayName(days[dayIndex]);
    setNextDayName(days[(dayIndex + 1) % 7]);

    // Day Hours (Sunrise to Sunset)
    for (let i = 0; i < 12; i++) {
      const start = new Date(sr.getTime() + i * dayHourLength);
      const end = new Date(sr.getTime() + (i + 1) * dayHourLength);
      const planet = planetsSequence[planetIdx % 7];
      const status = dayStatusRow[i] || 'معلوم نہیں';
      newDayHours.push({
        index: i + 1,
        start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        planet,
        isCurrent: now >= start && now < end,
        value: PLANET_VALUES[planet] || 0,
        status,
        judgment: STATUS_JUDGMENTS[status] || 'حکم دستیاب نہیں',
        wazifa: PLANET_WAZIFAS[planet] || ''
      });
      planetIdx++;
    }

    // Night Hours (Sunset to Next Sunrise)
    for (let i = 0; i < 12; i++) {
      const start = new Date(ss.getTime() + i * nightHourLength);
      const end = new Date(ss.getTime() + (i + 1) * nightHourLength);
      const planet = planetsSequence[planetIdx % 7];
      const status = dayStatusRow[i + 12] || 'معلوم نہیں';
      newNightHours.push({
        index: i + 1,
        start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        planet,
        isCurrent: now >= start && now < end,
        value: PLANET_VALUES[planet] || 0,
        status,
        judgment: STATUS_JUDGMENTS[status] || 'حکم دستیاب نہیں',
        wazifa: PLANET_WAZIFAS[planet] || ''
      });
      planetIdx++;
    }

    setDayHours(newDayHours);
    setNightHours(newNightHours);
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ur`);
      const data = await response.json();
      if (data && data.address) {
        return data.address.city || data.address.town || data.address.village || data.address.state || data.address.country || 'عالمی مقام';
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    }
    return `مقام: ${lat.toFixed(2)}N, ${lng.toFixed(2)}E`;
  };

  const fetchData = async (lat: number, lng: number, customName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const resToday = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`);
      const dataToday = await resToday.json();
      const resTomorrow = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=tomorrow&formatted=0`);
      const dataTomorrow = await resTomorrow.json();
      
      if (dataToday.status === 'OK' && dataTomorrow.status === 'OK') {
        calculateHours(dataToday.results.sunrise, dataToday.results.sunset, dataTomorrow.results.sunrise);
        setSunrise(new Date(dataToday.results.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setSunset(new Date(dataToday.results.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Notify parent of accurate solar data
        if (onSolarDataUpdate) {
          onSolarDataUpdate({
            sunrise: dataToday.results.sunrise,
            sunset: dataToday.results.sunset
          });
        }

        if (customName) {
          setLocationName(customName);
        } else {
          const detectedName = await reverseGeocode(lat, lng);
          setLocationName(detectedName);
        }
        
        hasFetched.current = true;
      } else {
        throw new Error('Solar API Error');
      }
    } catch (err) {
      setError('انٹرنیٹ یا سولر ڈیٹا سرور سے رابطہ نہیں ہو سکا۔');
    } finally {
      setLoading(false);
    }
  };

  const fetchByIP = async () => {
    try {
      console.log('Fetching location by IP...');
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        await fetchData(data.latitude, data.longitude, data.city || 'آپ کا مقام');
        return true;
      }
    } catch (e) {
      console.error('IP Location Error:', e);
    }
    return false;
  };

  const initLocation = useCallback(async (forceRefresh = false) => {
    if (hasFetched.current && !forceRefresh) return;
    
    setLoading(true);
    
    // Attempt Geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await fetchData(pos.coords.latitude, pos.coords.longitude);
        },
        async (err) => {
          console.warn('Browser Geolocation failed/denied. Trying IP fallback...');
          const ipSuccess = await fetchByIP();
          if (!ipSuccess) {
            console.warn('IP fallback failed. Using Makkah fallback.');
            await fetchData(21.3891, 39.8579, 'مکہ مکرمہ');
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      const ipSuccess = await fetchByIP();
      if (!ipSuccess) {
        await fetchData(21.3891, 39.8579, 'مکہ مکرمہ');
      }
    }
  }, []);

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&accept-language=ur&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const displayName = result.display_name.split(',')[0];
        await fetchData(lat, lon, displayName);
        setSearchQuery('');
      } else {
        alert('شہر نہیں مل سکا۔ براہ کرم صحیح نام درج کریں۔');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('تلاش کے دوران خرابی پیش آئی۔');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  const HourTable = ({ title, data, dayLabel }: { title: string, data: SaatHour[], dayLabel?: string }) => (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <h3 className="text-xl urdu-text gold-text text-center border-b border-amber-500/20 pb-2">{title}</h3>
        {dayLabel && <span className="urdu-text text-amber-500/40 text-xs mt-1">{dayLabel}</span>}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-xl bg-slate-950/50">
        <table className="w-full text-right urdu-text border-collapse min-w-[600px]">
          <thead className="bg-slate-900/80 border-b border-slate-800">
            <tr>
              <th className="p-4 text-slate-400 font-light text-center w-12">#</th>
              <th className="p-4 text-slate-400 font-light text-center">وقت</th>
              <th className="p-4 text-slate-400 font-light">سیارہ</th>
              <th className="p-4 text-slate-400 font-light">حالت</th>
              <th className="p-4 text-slate-400 font-light text-center">تفصیل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.map((h) => (
              <tr 
                key={h.index} 
                className={`transition-all group ${h.isCurrent ? 'bg-amber-500/10 ring-1 ring-inset ring-amber-500/30' : 'hover:bg-slate-900/40 cursor-pointer'}`}
                onClick={() => setSelectedHour(h)}
              >
                <td className="p-4 text-center text-slate-500 font-mono text-sm">{h.index}</td>
                <td className="p-4 text-center font-mono text-[10px] text-slate-300">
                  <span className="block">{h.start}</span>
                  <span className="text-amber-500/40">تا</span>
                  <span className="block">{h.end}</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${h.isCurrent ? 'text-amber-400' : 'text-slate-300'}`}>{h.planet}</span>
                    <span className="text-[9px] text-slate-600 uppercase tracking-tighter">Adad: {h.value}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] ${
                    h.status.includes('سعد') ? 'bg-green-500/20 text-green-400' : 
                    h.status.includes('نحس') || h.status.includes('بد') ? 'bg-red-500/20 text-red-400' : 
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {h.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="text-amber-500 hover:text-amber-400 text-xs">🔍</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      <p className="urdu-text text-xl text-amber-500 animate-pulse">ساعات مرتب کی جا رہی ہیں...</p>
      <p className="urdu-text text-xs text-slate-500">خودکار مقام اور سولر ڈیٹا حاصل کیا جا رہا ہے</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6 card-gradient rounded-3xl border border-red-500/20">
      <div className="text-6xl text-red-500">⚠️</div>
      <p className="urdu-text text-xl text-red-400 text-center">{error}</p>
      <button 
        onClick={() => { hasFetched.current = false; initLocation(true); }}
        className="gold-bg text-emerald-950 px-8 py-3 rounded-xl urdu-text font-bold text-lg"
      >
        دوبارہ کوشش کریں
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn pb-24 px-4">
      {/* Search Bar & Location Info */}
      <div className="flex flex-col gap-6">
        <form onSubmit={handleCitySearch} className="flex gap-2 max-w-2xl mx-auto w-full">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-emerald-900/20 border border-amber-500/20 rounded-2xl p-4 text-right urdu-text text-xl focus:border-amber-500 focus:outline-none transition-all placeholder:text-emerald-500/30 text-emerald-50 shadow-inner"
            placeholder="شہر کا نام یہاں تلاش کریں (مثلاً گوجر خان)"
            disabled={isSearching}
          />
          <button 
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="gold-bg text-emerald-950 px-6 rounded-2xl font-bold urdu-text text-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {isSearching ? 'تلاش...' : 'تلاش کریں'}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center card-gradient border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full"></div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center justify-end gap-2">
               <h2 className="urdu-text text-amber-500 text-2xl font-bold">{locationName}</h2>
               <span className="text-xl">📍</span>
            </div>
            <button 
              onClick={() => { hasFetched.current = false; initLocation(true); }}
              className="text-[10px] text-emerald-500/60 uppercase tracking-widest hover:text-amber-500 transition-colors urdu-text"
            >
              [ Auto Detect Location ]
            </button>
          </div>

          <div className="flex justify-center gap-10">
            <div className="text-center">
              <span className="block text-amber-500/60 urdu-text text-xs">طلوعِ آفتاب</span>
              <span className="font-mono text-xl text-slate-200">{sunrise}</span>
            </div>
            <div className="text-center">
              <span className="block text-amber-500/60 urdu-text text-xs">غروبِ آفتاب</span>
              <span className="font-mono text-xl text-slate-200">{sunset}</span>
            </div>
          </div>

          <div className="text-left hidden md:block">
            <div className="bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 inline-block">
              <span className="urdu-text text-amber-500 text-sm">موجودہ دن: {getIslamicDayInfo().name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sa'at Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <HourTable title="دن کی ساعات" data={dayHours} dayLabel={`سورج نکلنے سے غروب تک: ${dayName}`} />
        <HourTable title="رات کی ساعات" data={nightHours} dayLabel={`غروب سے اگلی صبح تک: ${nextDayName}`} />
      </div>

      {/* Details Modal */}
      {selectedHour && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedHour(null)}>
          <div className="card-gradient border-2 gold-border border-double rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-bounce-in text-right" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
              <button onClick={() => setSelectedHour(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
              <div className="flex flex-col items-end">
                <span className="urdu-text text-amber-500 text-2xl font-bold">{selectedHour.planet} کی ساعت</span>
                <span className="font-mono text-xs text-slate-500">{selectedHour.start} - {selectedHour.end}</span>
              </div>
            </div>

            <div className="space-y-6 text-center">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 inline-block w-full">
                <span className="block urdu-text text-slate-500 text-sm mb-1">وقت کی حالت:</span>
                <span className={`urdu-text text-xl font-bold ${
                  selectedHour.status.includes('سعد') ? 'text-green-400' : 'text-amber-500'
                }`}>{selectedHour.status}</span>
              </div>

              <div className="text-right">
                <span className="block urdu-text text-slate-500 text-sm mb-1">حکم:</span>
                <p className="urdu-text text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 italic text-lg">
                  "{selectedHour.judgment}"
                </p>
              </div>

              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                <span className="block urdu-text text-amber-500/60 text-sm mb-1 text-right">اس وقت کا وظیفہ:</span>
                <span className="urdu-text text-2xl text-amber-400 font-bold block">{selectedHour.wazifa}</span>
              </div>

              <button 
                onClick={() => setSelectedHour(null)}
                className="w-full max-w-[200px] border border-slate-700 text-slate-400 font-bold py-3 rounded-xl urdu-text text-lg hover:bg-slate-800 transition-all"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Saat;
