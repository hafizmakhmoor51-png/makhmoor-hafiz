
import { ABJAD_MAP, PLANET_VALUES } from '../constants';

/**
 * Calculates the total Abjad value of a string by summing mapped values of its characters.
 * Ignores spaces and unsupported characters.
 * Explicitly checks for undefined to ensure 0-value characters (like Standalone Hamza) are processed.
 */
export const calculateAbjad = (text: string): number => {
  if (!text) return 0;
  
  let total = 0;
  const normalized = text.replace(/\s+/g, '');
  
  for (const char of normalized) {
    const value = ABJAD_MAP[char];
    if (value !== undefined) {
      total += value;
    }
  }
  
  return total;
};

/**
 * Reduces a number to its Mufrad (single digit 1-9).
 */
export const calculateMufrad = (num: number): number => {
  if (num === 0) return 0;
  return ((num - 1) % 9) + 1;
};

/**
 * Gets the Islamic/Lunar day name. Shifting to next day at sunset.
 * Defaults to 6 PM if sunset is not provided.
 */
export const getIslamicDayInfo = (sunriseStr?: string, sunsetStr?: string) => {
  const now = new Date();
  const sr = sunriseStr ? new Date(sunriseStr) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
  const ss = sunsetStr ? new Date(sunsetStr) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
  
  let dayIndex = now.getDay();
  
  // If current time is past sunset, it's the next Islamic day
  if (now >= ss) {
    dayIndex = (dayIndex + 1) % 7;
  }
  
  const days = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return {
    name: days[dayIndex],
    index: dayIndex,
    isAfterSunset: now >= ss
  };
};

/**
 * Gets the current day name in Persian/Urdu (legacy bridge, uses Islamic logic).
 */
export const getCurrentDayName = (): string => {
  return getIslamicDayInfo().name;
};

/**
 * Chaldean sequence of planets
 */
export const PLANETS_SEQUENCE = ['زحل', 'مشتری', 'مریخ', 'شمس', 'زہرہ', 'عطارد', 'قمر'];

/**
 * Gets the regent planet of the day
 */
export const getDayRegent = (dayIndex: number): string => {
  const mapping: Record<number, string> = {
    0: 'شمس', // Sunday
    1: 'قمر', // Monday
    2: 'مریخ', // Tuesday
    3: 'عطارد', // Wednesday
    4: 'مشتری', // Thursday
    5: 'زہرہ', // Friday
    6: 'زحل'  // Saturday
  };
  return mapping[dayIndex];
};

/**
 * Robustly calculates the current planet based on current time.
 * Uses 6 AM / 6 PM approximation if sunrise/sunset not provided.
 */
export const calculateCurrentSaatInfo = (sunriseStr?: string, sunsetStr?: string) => {
  const now = new Date();
  
  // Sa'at logic always depends on the REGENT of the SUNRISE day.
  // Islamic day shifts at sunset, but Sa'at night sequence continues from the day's regent.
  const solarDayIndex = now.getDay(); 
  const regent = getDayRegent(solarDayIndex);
  
  let planetIdx = PLANETS_SEQUENCE.indexOf(regent);
  
  const sr = sunriseStr ? new Date(sunriseStr) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
  const ss = sunsetStr ? new Date(sunsetStr) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
  
  const isDay = now >= sr && now < ss;
  
  if (isDay) {
    const dayDuration = ss.getTime() - sr.getTime();
    const hourLength = dayDuration / 12;
    const elapsed = now.getTime() - sr.getTime();
    const hourIndex = Math.floor(elapsed / hourLength);
    const planetName = PLANETS_SEQUENCE[(planetIdx + hourIndex) % 7];
    return { planetName, value: PLANET_VALUES[planetName] || 0 };
  } else {
    // Night hours start from 12th hour of day + 1
    const nightRegentStartIdx = (planetIdx + 12) % 7;
    const nextSr = new Date(sr.getTime() + 24 * 60 * 60 * 1000);
    const nightDuration = nextSr.getTime() - ss.getTime();
    const hourLength = nightDuration / 12;
    const elapsed = now < sr ? (now.getTime() + 24 * 60 * 60 * 1000 - ss.getTime()) : (now.getTime() - ss.getTime());
    const hourIndex = Math.floor(elapsed / hourLength);
    const planetName = PLANETS_SEQUENCE[(nightRegentStartIdx + hourIndex) % 7];
    return { planetName, value: PLANET_VALUES[planetName] || 0 };
  }
};
