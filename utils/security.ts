
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
 */
export const getRequestCode = (): string => {
  const fingerprint = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    (navigator as any).deviceMemory || 4,
    navigator.hardwareConcurrency || 2
  ].join('|');
  
  const hash = hashCode(fingerprint);
  // Ensure it's a 6-digit number between 100000 and 999999
  const code = (hash % 899999) + 100000;
  return code.toString();
};

/**
 * Secret algorithm to validate the key.
 * Formula: Key = ((RequestCode + 786) * 313) % 899999 + 100000
 * 
 * ADMIN INSTRUCTIONS:
 * If a user sends Request Code '123456':
 * 1. Add 786: 123456 + 786 = 124242
 * 2. Multiply by 313: 124242 * 313 = 38887746
 * 3. Modulo 899999: 38887746 % 899999 = 187789
 * 4. Add 100000: 187789 + 100000 = 287789
 * 5. Activation Key is: 287789
 */
export const validateActivationKey = (requestCode: string, inputKey: string): boolean => {
  const reqNum = parseInt(requestCode);
  const expectedKey = ((reqNum + 786) * 313) % 899999 + 100000;
  return inputKey.trim() === expectedKey.toString();
};
