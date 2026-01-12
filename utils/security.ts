
/**
 * Simple hash function to generate a numeric value from a string
 */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Generates a 6-digit Request Code based on device fingerprints
 * Improved for mobile WebView compatibility
 */
export const getRequestCode = (): string => {
  // Safely gather fingerprint data
  const data = {
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    sw: typeof screen !== 'undefined' ? screen.width : 0,
    sh: typeof screen !== 'undefined' ? screen.height : 0,
    lang: typeof navigator !== 'undefined' ? navigator.language : 'en',
    mem: typeof (navigator as any).deviceMemory !== 'undefined' ? (navigator as any).deviceMemory : 0,
    cores: typeof navigator.hardwareConcurrency !== 'undefined' ? navigator.hardwareConcurrency : 0
  };

  const fingerprint = Object.values(data).join('|');
  const hash = hashCode(fingerprint);
  
  // Ensure it's a 6-digit number between 100000 and 999999
  const code = (hash % 899999) + 100000;
  return code.toString();
};

/**
 * Secret algorithm to validate the key.
 * Formula: Key = ((RequestCode + 786) * 313) % 899999 + 100000
 */
export const validateActivationKey = (requestCode: string, inputKey: string): boolean => {
  if (!requestCode || !inputKey) return false;
  const reqNum = parseInt(requestCode);
  if (isNaN(reqNum)) return false;
  
  const expectedKey = ((reqNum + 786) * 313) % 899999 + 100000;
  return inputKey.trim() === expectedKey.toString();
};
