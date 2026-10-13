// Calculation and speech alert utilities for Prayer & Nawafil Times (اوقاتِ نماز و نوافل)

export interface PrayerTimeItem {
  id: string;
  name: string;
  arabicName: string;
  type: 'fard' | 'nafl' | 'prohibited';
  time: string; // 12-hour formatted time with AM/PM
  raw24Time: string; // "HH:MM"
  endTime?: string;
  rakatDesc: string;
  virtue: string;
  voiceAlertText: string;
  isCurrent?: boolean;
  isNext?: boolean;
}

export interface PrayerTimesData {
  city: string;
  latitude: number;
  longitude: number;
  readableDate: string;
  hijriDate: string;
  items: PrayerTimeItem[];
  nextPrayer: {
    id: string;
    name: string;
    time: string;
    remainingMinutes: number;
    remainingFormatted: string;
  } | null;
  currentPrayer: PrayerTimeItem | null;
}

// Convert "HH:MM" 24h string to 12-hour Urdu/English formatted time
export const format12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24;
  const parts = time24.trim().split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);
  if (isNaN(hours)) return time24;
  const isPM = hours >= 12;
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const suffix = isPM ? 'شام' : 'صبح';
  return `${hours}:${minutes} ${suffix}`;
};

// Add minutes to "HH:MM"
export const addMinutesToTime = (time24: string, minutesToAdd: number): string => {
  const [h, m] = time24.split(':').map((x) => parseInt(x, 10));
  if (isNaN(h) || isNaN(m)) return time24;
  let totalMin = h * 60 + m + minutesToAdd;
  if (totalMin < 0) totalMin += 24 * 60;
  totalMin = totalMin % (24 * 60);
  const newH = Math.floor(totalMin / 60);
  const newM = totalMin % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
};

// Minutes difference between two HH:MM
export const getMinutesDiff = (start24: string, end24: string): number => {
  const [h1, m1] = start24.split(':').map(Number);
  const [h2, m2] = end24.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60;
  return diff;
};

// Offline astronomical prayer times calculations (Standard solar formulas)
export const calculateAstronomicalTimes = (
  lat: number,
  lng: number,
  date: Date = new Date(),
  isHanafi: boolean = true
) => {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );

  // Approximate solar declination & equation of time
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // in minutes
  const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180)); // in degrees

  const radLat = lat * (Math.PI / 180);
  const radDec = declination * (Math.PI / 180);

  // Solar noon
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  const noonMinutes = 12 * 60 + (timezoneOffsetHours * 15 - lng) * 4 - eot;

  const minToTimeStr = (min: number): string => {
    let normalized = Math.round(min);
    while (normalized < 0) normalized += 24 * 60;
    normalized = normalized % (24 * 60);
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Hour angle helper
  const hourAngle = (angle: number): number | null => {
    const radAngle = angle * (Math.PI / 180);
    const cosH = (Math.sin(radAngle) - Math.sin(radLat) * Math.sin(radDec)) /
                 (Math.cos(radLat) * Math.cos(radDec));
    if (cosH < -1 || cosH > 1) return null;
    return (Math.acos(cosH) * 180 / Math.PI) * 4; // in minutes
  };

  // Sunrise/Sunset angle (-0.833 degrees)
  const sunriseHalfDay = hourAngle(-0.833) || 360;
  // Fajr: 18 degrees (Karachi / Subcontinent / MWL)
  const fajrHalfDay = hourAngle(-18) || 450;
  // Isha: 18 degrees
  const ishaHalfDay = hourAngle(-18) || 450;

  // Asr: shadow = 1 (Shafi) or shadow = 2 (Hanafi)
  const shadowFactor = isHanafi ? 2 : 1;
  const asrAngle = (Math.atan(1 / (shadowFactor + Math.tan(Math.abs(radLat - radDec)))) * 180 / Math.PI);
  const asrHalfDay = hourAngle(asrAngle) || 240;

  const fajrMin = noonMinutes - fajrHalfDay;
  const sunriseMin = noonMinutes - sunriseHalfDay;
  const dhuhrMin = noonMinutes + 2; // small safety margin after exact zenith
  const asrMin = noonMinutes + asrHalfDay;
  const sunsetMin = noonMinutes + sunriseHalfDay;
  const maghribMin = sunsetMin + 2;
  const ishaMin = noonMinutes + ishaHalfDay;

  return {
    Fajr: minToTimeStr(fajrMin),
    Sunrise: minToTimeStr(sunriseMin),
    Dhuhr: minToTimeStr(dhuhrMin),
    Asr: minToTimeStr(asrMin),
    Sunset: minToTimeStr(sunsetMin),
    Maghrib: minToTimeStr(maghribMin),
    Isha: minToTimeStr(ishaMin),
  };
};

// Fetch prayer times with online Aladhan API and local fallback
export const fetchPrayerTimes = async (
  lat: number,
  lng: number,
  cityName: string,
  methodId: number = 1, // 1 = University of Islamic Sciences, Karachi
  schoolId: number = 1  // 1 = Hanafi, 0 = Shafi
): Promise<PrayerTimesData> => {
  let rawTimings: Record<string, string> | null = null;
  let hijriDate = '';
  let readableDate = '';

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

  // Try Aladhan API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${methodId}&school=${schoolId}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.timings) {
        rawTimings = json.data.timings;
        if (json.data.date && json.data.date.hijri) {
          const h = json.data.date.hijri;
          const monthAr = h.month?.ar || h.month?.en || '';
          hijriDate = `${h.day} ${monthAr} ${h.year}ھ`;
        }
        if (json.data.date?.readable) {
          readableDate = json.data.date.readable;
        }
      }
    }
  } catch (err) {
    console.warn('Aladhan API fetch bypassed, using local calculation:', err);
  }

  // Fallback to local astronomical calculation if offline or rate-limited
  if (!rawTimings) {
    rawTimings = calculateAstronomicalTimes(lat, lng, now, schoolId === 1);
  }

  // Fallback dates if API didn't provide
  if (!readableDate) {
    readableDate = now.toLocaleDateString('ur-PK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  if (!hijriDate) {
    // Basic approximate Islamic date fallback
    try {
      hijriDate = new Intl.DateTimeFormat('ur-PK-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(now);
    } catch {
      hijriDate = 'تاریخِ اسلامی';
    }
  }

  // Clean time strings (e.g. remove timezone notes like " (PKT)")
  const clean = (val: string) => val ? val.split(' ')[0] : '00:00';
  const fajr24 = clean(rawTimings.Fajr);
  const sunrise24 = clean(rawTimings.Sunrise);
  const dhuhr24 = clean(rawTimings.Dhuhr);
  const asr24 = clean(rawTimings.Asr);
  const sunset24 = clean(rawTimings.Sunset || rawTimings.Maghrib);
  const maghrib24 = clean(rawTimings.Maghrib);
  const isha24 = clean(rawTimings.Isha);

  // Compute Nawafil & specific intervals:
  // 1. اشراق (Ishraq): ~15-20 mins after sunrise
  const ishraq24 = addMinutesToTime(sunrise24, 18);
  // 2. چاشت (Chasht / Salatul Duha): Mid-morning (approx halfway between sunrise and dhuhr)
  const sunriseToDhuhrDiff = getMinutesDiff(sunrise24, dhuhr24);
  const chasht24 = addMinutesToTime(sunrise24, Math.max(45, Math.round(sunriseToDhuhrDiff / 2.5)));
  // 3. زوال و استواء (Zawal / Prohibited): 15 minutes before Dhuhr until Dhuhr
  const zawal24 = addMinutesToTime(dhuhr24, -15);
  // 4. تہجد (Tahajjud): Last 3rd of the night (between Sunset and Fajr)
  const sunsetToFajrDiff = getMinutesDiff(sunset24, fajr24);
  const tahajjud24 = addMinutesToTime(sunset24, Math.round(sunsetToFajrDiff * 0.67));

  // Build items array
  const items: PrayerTimeItem[] = [
    {
      id: 'fajr',
      name: 'نمازِ فجر',
      arabicName: 'الفجر',
      type: 'fard',
      raw24Time: fajr24,
      time: format12Hour(fajr24),
      endTime: format12Hour(sunrise24),
      rakatDesc: '2 سنتِ مؤکدہ، 2 فرض',
      virtue: 'صبح صادق کے وقت کی نماز جس کی سنتیں دنیا اور اس کی تمام چیزوں سے افضل ہیں۔',
      voiceAlertText: 'نماز فجر کا وقت ہو گیا ہے'
    },
    {
      id: 'ishraq',
      name: 'نمازِ اشراق',
      arabicName: 'الإشراق',
      type: 'nafl',
      raw24Time: ishraq24,
      time: format12Hour(ishraq24),
      endTime: format12Hour(chasht24),
      rakatDesc: '2 یا 4 رکعت نفل',
      virtue: 'طلوعِ آفتاب کے 15 تا 20 منٹ بعد۔ حدیث میں اس پر ایک مکمل حج و عمرے کا ثواب وارد ہے۔',
      voiceAlertText: 'نماز اشراق کا وقت ہو گیا ہے'
    },
    {
      id: 'chasht',
      name: 'نمازِ چاشت (صلوٰۃ الضحیٰ)',
      arabicName: 'الضحى',
      type: 'nafl',
      raw24Time: chasht24,
      time: format12Hour(chasht24),
      endTime: format12Hour(zawal24),
      rakatDesc: '2، 4 یا 8 رکعت نفل',
      virtue: 'جسم کے تمام جوڑوں کا صدقہ ادا کرنے کا بہترین ذریعہ اور رزق میں برکت کا سبب۔',
      voiceAlertText: 'نماز چاشت کا وقت ہو گیا ہے'
    },
    {
      id: 'zawal',
      name: 'مکروہ وقت (نصف النہار / زوال)',
      arabicName: 'وقت الكراهة',
      type: 'prohibited',
      raw24Time: zawal24,
      time: format12Hour(zawal24),
      endTime: format12Hour(dhuhr24),
      rakatDesc: 'اس دوران ہر قسم کی نماز اور سجدہ مکروہِ تحریمی ہے',
      virtue: 'سورج عین سر پر ہونے کا وقت۔ ظہر کی اذان و وقت شروع ہونے تک نماز ادا نہ کریں۔',
      voiceAlertText: 'نماز کا مکروہ وقت ہو گیا ہے'
    },
    {
      id: 'dhuhr',
      name: 'نمازِ ظہر',
      arabicName: 'الظهر',
      type: 'fard',
      raw24Time: dhuhr24,
      time: format12Hour(dhuhr24),
      endTime: format12Hour(asr24),
      rakatDesc: '4 سنتِ مؤکدہ، 4 فرض، 2 سنتِ مؤکدہ، 2 نفل',
      virtue: 'زوالِ آفتاب کے فوراً بعد کی نماز، جب آسمان کے دروازے کھولے جاتے ہیں۔',
      voiceAlertText: 'نماز ظہر کا وقت ہو گیا ہے'
    },
    {
      id: 'asr',
      name: 'نمازِ عصر',
      arabicName: 'العصر',
      type: 'fard',
      raw24Time: asr24,
      time: format12Hour(asr24),
      endTime: format12Hour(sunset24),
      rakatDesc: '4 سنتِ غیر مؤکدہ، 4 فرض',
      virtue: 'قرآن کریم کی صلوٰۃ وسطیٰ، اس کی حفاظت پر خصوصی تاکید اور عظیم اجر ہے۔',
      voiceAlertText: 'نماز عصر کا وقت ہو گیا ہے'
    },
    {
      id: 'maghrib',
      name: 'نمازِ مغرب',
      arabicName: 'المغرب',
      type: 'fard',
      raw24Time: maghrib24,
      time: format12Hour(maghrib24),
      endTime: format12Hour(isha24),
      rakatDesc: '3 فرض، 2 سنتِ مؤکدہ، 2 نفل (اوابین 6 نفل)',
      virtue: 'غروبِ آفتاب کے فوراً بعد کی نماز۔ دعاؤں کی قبولیت اور روزہ دار کے افطار کا وقت۔',
      voiceAlertText: 'نماز مغرب کا وقت ہو گیا ہے'
    },
    {
      id: 'isha',
      name: 'نمازِ عشاء',
      arabicName: 'العشاء',
      type: 'fard',
      raw24Time: isha24,
      time: format12Hour(isha24),
      endTime: format12Hour(fajr24),
      rakatDesc: '4 سنتِ غیر مؤکدہ، 4 فرض، 2 سنتِ مؤکدہ، 2 نفل، 3 وتر، 2 نفل',
      virtue: 'عشاء باجماعت ادا کرنے والے کو آدھی رات کے قیام کا ثواب ملتا ہے۔',
      voiceAlertText: 'نماز عشاء کا وقت ہو گیا ہے'
    },
    {
      id: 'tahajjud',
      name: 'نمازِ تہجد',
      arabicName: 'التهجد',
      type: 'nafl',
      raw24Time: tahajjud24,
      time: format12Hour(tahajjud24),
      endTime: format12Hour(fajr24),
      rakatDesc: '2 سے 12 رکعت نفل',
      virtue: 'رات کے آخری تہائی حصے کا نفل، قربِ الہیٰ اور قبولیتِ دعا کا سب سے افضل وقت۔',
      voiceAlertText: 'نماز تہجد کا وقت ہو گیا ہے'
    }
  ];

  // Determine current active and next prayer
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Helper to convert raw24 to minutes from start of day
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  // Only consider main prayers + nawafil for current/next
  const scheduleTimes = items
    .filter((x) => x.type !== 'prohibited')
    .map((item) => ({
      item,
      min: toMin(item.raw24Time)
    }))
    .sort((a, b) => a.min - b.min);

  let currentItem: PrayerTimeItem | null = null;
  let nextItem: PrayerTimeItem | null = null;
  let remainingMin = 0;

  for (let i = 0; i < scheduleTimes.length; i++) {
    const cur = scheduleTimes[i];
    const nxt = scheduleTimes[(i + 1) % scheduleTimes.length];

    if (nowMin >= cur.min && (nowMin < nxt.min || nxt.min < cur.min)) {
      currentItem = cur.item;
      nextItem = nxt.item;
      if (nxt.min > nowMin) {
        remainingMin = nxt.min - nowMin;
      } else {
        remainingMin = (24 * 60 - nowMin) + nxt.min;
      }
      break;
    }
  }

  // Edge case (before first prayer of the day)
  if (!currentItem && scheduleTimes.length > 0) {
    nextItem = scheduleTimes[0].item;
    remainingMin = scheduleTimes[0].min - nowMin;
    if (remainingMin < 0) remainingMin += 24 * 60;
    currentItem = scheduleTimes[scheduleTimes.length - 1].item;
  }

  // Mark items
  items.forEach((it) => {
    it.isCurrent = currentItem?.id === it.id;
    it.isNext = nextItem?.id === it.id;
  });

  const hoursRem = Math.floor(remainingMin / 60);
  const minsRem = remainingMin % 60;
  const remainingFormatted = hoursRem > 0 
    ? `${hoursRem} گھنٹہ ${minsRem} منٹ`
    : `${minsRem} منٹ`;

  return {
    city: cityName,
    latitude: lat,
    longitude: lng,
    readableDate,
    hijriDate,
    items,
    currentPrayer: currentItem,
    nextPrayer: nextItem ? {
      id: nextItem.id,
      name: nextItem.name,
      time: nextItem.time,
      remainingMinutes: remainingMin,
      remainingFormatted
    } : null
  };
};

// Play an Islamic alert chime synthesized via Web Audio API
export const playAdhanChime = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        resolve();
        return;
      }
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Gentle 3-note harmonic chime (F4 -> A4 -> C5)
      const notes = [349.23, 440.0, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.22);

        gain.gain.setValueAtTime(0, now + idx * 0.22);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.22 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.22 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.22);
        osc.stop(now + idx * 0.22 + 0.85);
      });

      setTimeout(() => {
        try {
          ctx.close();
        } catch {}
        resolve();
      }, 1000);
    } catch {
      resolve();
    }
  });
};

// Speak the voice alert in a distinct male voice (مرد کی آواز) in Urdu
export const speakPrayerAnnouncement = async (text: string): Promise<void> => {
  // 1. Play soft harmonic chime first
  await playAdhanChime();

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment');
    return;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any active queue

    const utterance = new SpeechSynthesisUtterance(text);
    // Setting lower pitch (0.70) and calm deliberate rate (0.85) ensures a dignified male voice
    utterance.rate = 0.85;
    utterance.pitch = 0.70;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();

    const isFemale = (voice: SpeechSynthesisVoice) => {
      const str = (voice.name + ' ' + (voice.voiceURI || '')).toLowerCase();
      return (
        str.includes('female') ||
        str.includes('woman') ||
        str.includes('girl') ||
        str.includes('zira') ||
        str.includes('noor') ||
        str.includes('hoda') ||
        str.includes('salma') ||
        str.includes('laila') ||
        str.includes('fatima') ||
        str.includes('maryam') ||
        str.includes('zeina') ||
        str.includes('susan') ||
        str.includes('hazel') ||
        str.includes('catherine') ||
        str.includes('samantha') ||
        str.includes('victoria') ||
        str.includes('karen') ||
        str.includes('anna') ||
        str.includes('-urf-') ||
        str.includes('female1')
      );
    };

    const isMale = (voice: SpeechSynthesisVoice) => {
      const str = (voice.name + ' ' + (voice.voiceURI || '')).toLowerCase();
      return (
        str.includes('male') ||
        str.includes('man') ||
        str.includes('david') ||
        str.includes('george') ||
        str.includes('mark') ||
        str.includes('richard') ||
        str.includes('james') ||
        str.includes('tariq') ||
        str.includes('naeem') ||
        str.includes('salman') ||
        str.includes('asif') ||
        str.includes('hamza') ||
        str.includes('zayd') ||
        str.includes('majed') ||
        str.includes('-urm-')
      );
    };

    // Filter Urdu voices
    const urduVoices = voices.filter((v) =>
      v.lang.toLowerCase().startsWith('ur') ||
      v.name.toLowerCase().includes('urdu')
    );

    // 1. Explicit male Urdu voice
    let selectedVoice = urduVoices.find((v) => isMale(v));

    // 2. Or Urdu voice that is not explicitly female
    if (!selectedVoice) {
      selectedVoice = urduVoices.find((v) => !isFemale(v));
    }

    // 3. Or Arabic male voice
    if (!selectedVoice) {
      const arabicVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('ar'));
      selectedVoice = arabicVoices.find((v) => isMale(v) || !isFemale(v));
    }

    // 4. Or general male voice
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => isMale(v));
    }

    // 5. Fallback to any Urdu voice
    if (!selectedVoice && urduVoices.length > 0) {
      selectedVoice = urduVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || 'ur-PK';
      // If the available voice is female, significantly lower the pitch so it sounds male
      if (isFemale(selectedVoice)) {
        utterance.pitch = 0.60;
      }
    } else {
      utterance.lang = 'ur-PK';
      utterance.pitch = 0.70;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis warning:', err);
  }
};
