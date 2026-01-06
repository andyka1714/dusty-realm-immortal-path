import { MajorRealm } from '../types';
import { REALM_NAMES } from '../constants';

export const getRealmLabel = (major: MajorRealm, minor: number): string => {
  const baseName = REALM_NAMES[major];
  
  // 1. Immortal Emperor (Max Level, No Minor)
  if (major === MajorRealm.ImmortalEmperor) {
    return baseName;
  }

  // 2. Immortal Realm (Custom Split: Human -> Earth -> Heaven -> Golden)
  if (major === MajorRealm.Immortal) {
      if (minor <= 2) return `人仙 (${minor + 1}重)`; // 0,1,2 -> 1,2,3
      if (minor <= 5) return `地仙 (${minor - 2}重)`; // 3,4,5 -> 1,2,3
      if (minor <= 8) return `天仙 (${minor - 5}重)`; // 6,7,8 -> 1,2,3
      return `金仙`; // 9
  }

  // 3. Standard Realms (Early, Mid, Late, Peak)
  // Mapping 0..9 -> 1..10
  // 0-2: Early (初期)
  // 3-5: Mid (中期)
  // 6-8: Late (後期)
  // 9: Peak (圓滿)
  
  let prefix = '';
  if (minor <= 2) prefix = '初期';
  else if (minor <= 5) prefix = '中期';
  else if (minor <= 8) prefix = '後期';
  else prefix = '圓滿';

  return `${baseName}${prefix}`;
};
