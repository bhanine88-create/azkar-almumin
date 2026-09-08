/**
 * Smart Arabic Search Utility
 * Normalizes Arabic text (tashkeel, hamza variations, alef maqsura, ta marbuta, honorific titles)
 * and performs multi-token matching for instant, responsive search.
 */

const OPTIONAL_ARABIC_TITLES = new Set([
  'الشيخ', 'شيخ',
  'الداعية', 'داعية',
  'الدكتور', 'دكتور', 'د', 'د.',
  'العلامة', 'علامة',
  'الأستاذ', 'أستاذ', 'استاذ',
  'القارئ', 'قارئ',
  'المهندس', 'مهندس',
  'الإمام', 'إمام', 'امام',
  'فضيلة', 'سماحة', 'معالي'
]);

/**
 * Normalizes Arabic string for robust, forgiving search matching
 */
export function normalizeArabicForSearch(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    // Remove diacritics (tashkeel & tatweel)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    // Normalize Alef forms (أ, إ, آ, ٱ) -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Hamza forms (ؤ, ئ, ء) -> ي
    .replace(/[ؤئء]/g, '')
    // Normalize Alef Maqsura (ى) -> ي
    .replace(/ى/g, 'ي')
    // Normalize Ta Marbuta (ة) -> ه
    .replace(/ة/g, 'ه')
    // Normalize "عبد " to "عبد" to unify "عبد الله" and "عبدالله"
    .replace(/عبد\s+/g, 'عبد')
    // Normalize "ابن " to "بن "
    .replace(/\bابن\s+/g, 'بن ')
    // Remove common punctuation & symbols
    .replace(/[.,/#!$%^&*;:{}=\-_`~()«»"'؟?]/g, ' ')
    // Collapse multiple whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a search query matches target text using token-based matching
 * with smart tolerance for honorific titles, 'ال' prefix, and substring matches.
 */
export function smartArabicMatch(targetText: string, searchQuery: string): boolean {
  if (!searchQuery || searchQuery.trim() === '') return true;
  if (!targetText) return false;

  const normalizedTarget = normalizeArabicForSearch(targetText);
  const normalizedQuery = normalizeArabicForSearch(searchQuery);

  if (!normalizedQuery) return true;

  // Split query into tokens
  const rawWords = normalizedQuery.split(' ').filter(Boolean);

  // Filter out optional titles if user typed actual names along with titles
  const meaningfulWords = rawWords.filter(word => !OPTIONAL_ARABIC_TITLES.has(word));
  const wordsToMatch = meaningfulWords.length > 0 ? meaningfulWords : rawWords;

  // Check if every token matches inside the target text
  return wordsToMatch.every(word => {
    // 1. Direct match
    if (normalizedTarget.includes(word)) return true;

    // 2. Prefix 'ال' tolerance:
    // If query word starts with 'ال', try matching without 'ال' (e.g. 'العريفي' query matches 'عريفي' target)
    if (word.startsWith('ال') && word.length > 3) {
      const withoutAl = word.substring(2);
      if (normalizedTarget.includes(withoutAl)) return true;
    }

    // If query word does not start with 'ال', try matching with 'ال' (e.g. 'عريفي' query matches 'العريفي' target)
    if (!word.startsWith('ال') && word.length >= 3) {
      const withAl = 'ال' + word;
      if (normalizedTarget.includes(withAl)) return true;
    }

    return false;
  });
}

/**
 * Helper to match Scholar including name, description, and series/lecture titles
 */
export function smartScholarMatch(scholar: any, searchQuery: string): boolean {
  if (!searchQuery || searchQuery.trim() === '') return true;
  
  // Direct match on scholar name or description
  if (smartArabicMatch(`${scholar.name || ''} ${scholar.description || ''}`, searchQuery)) {
    return true;
  }

  // Deep match on series titles or lecture titles belonging to this scholar
  if (scholar.series && Array.isArray(scholar.series)) {
    for (const s of scholar.series) {
      if (smartArabicMatch(s.title || '', searchQuery)) return true;
      if (s.lectures && Array.isArray(s.lectures)) {
        for (const l of s.lectures) {
          if (smartArabicMatch(l.title || '', searchQuery)) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Helper to match Reciter
 */
export function smartReciterMatch(reciter: any, searchQuery: string): boolean {
  if (!searchQuery || searchQuery.trim() === '') return true;
  const combined = `${reciter.name || ''} ${reciter.style || ''} ${reciter.bio || ''} ${reciter.rewayah || ''}`;
  return smartArabicMatch(combined, searchQuery);
}

/**
 * Helper to match Lecture
 */
export function smartLectureMatch(lecture: any, searchQuery: string): boolean {
  if (!searchQuery || searchQuery.trim() === '') return true;
  const combined = `${lecture.title || ''} ${lecture.scholarName || ''} ${lecture.description || ''}`;
  return smartArabicMatch(combined, searchQuery);
}
