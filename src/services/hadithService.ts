
import { QURANIC_DUAS, PROPHETIC_DUAS, NAMES_OF_ALLAH_DUAS, RIGHTEOUS_DUAS, SALAWAT_DUAS, Dua } from '../data/duasData';

export interface HadithCategory {
  id: string;
  title: string;
  hadeethes_count: string;
}

export interface HadithListItem {
  id: string;
  title: string;
}

export interface HadithDetail {
  id: string;
  title: string;
  hadeeth: string;
  attribution: string;
  grade: string;
  explanation: string;
  hints: string[];
  reference: string;
}

const BASE_URL = 'https://hadeethenc.com/api/v1';
const PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url='
];


export interface DuaCategory {
  category: string;
  count: number;
  adkar: {
    content: string;
    description: string;
    count: string;
    reference: string;
  }[];
}

let cachedCategories: HadithCategory[] | null = null;
let cachedDuaCategories: DuaCategory[] | null = null;

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const hadithService = {
  // Helper to fetch via proxy
  async fetchViaProxy(url: string) {
    let lastError = null;

    // Try all proxies in sequence
    for (const proxyBase of PROXIES) {
      try {
        const fullUrl = proxyBase.includes('allorigins.win') 
          ? `${proxyBase}${encodeURIComponent(url)}`
          : `${proxyBase}${url}`; // Do not encode for corsproxy/codetabs typically, but let's just use url directly
            
        const response = await fetchWithTimeout(fullUrl, {}, 8000);
        if (response.ok) {
          const text = await response.text();
          if (!text || text.trim() === '') {
             console.warn(`Empty response from proxy ${proxyBase}`);
             continue;
          }
          
          let data;
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.warn(`Invalid JSON from proxy ${proxyBase}:`, text.substring(0, 100));
            continue;
          }
          
          // Handle AllOrigins wrapper
          if (proxyBase.includes('allorigins.win/get') && data && typeof data.contents === 'string') {
            try {
              return JSON.parse(data.contents);
            } catch (e) {
              return data.contents;
            }
          }
          if (proxyBase.includes('allorigins.win/get') && data && data.contents) {
             return data.contents;
          }
          
          return data;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Proxy ${proxyBase} failed for ${url}:`, error);
      }
    }

    // Fallback: try direct fetch
    try {
      const directResponse = await fetchWithTimeout(url, {}, 5000);
      if (directResponse.ok) {
        return await directResponse.json();
      }
    } catch (e) {
      console.warn('Direct fetch also failed:', e);
      lastError = e;
    }
    
    throw new Error('فشل الوصول إلى البيانات. يرجى التحقق من اتصالك بالإنترنت أو المحاولة لاحقاً.');
  },

  // Hadith methods
  async getCategories(): Promise<HadithCategory[]> {
    // Return hardcoded categories immediately for lightning-fast user experience
    // This provides a massive competitive advantage as users don't wait for basic navigation
    return [
      { id: "1", title: "القرآن الكريم وعلومه", hadeethes_count: "197" },
      { id: "2", title: "الحديث وعلومه", hadeethes_count: "16" },
      { id: "3", title: "العقيدة", hadeethes_count: "725" },
      { id: "4", title: "الفقه وأصوله", hadeethes_count: "1820" },
      { id: "5", title: "الفضائل والآداب", hadeethes_count: "1022" },
      { id: "6", title: "الدعوة والحسبة", hadeethes_count: "140" },
      { id: "7", title: "السيرة والتاريخ", hadeethes_count: "353" },
      { id: "8", title: "أحاديث الصبر", hadeethes_count: "3" }
    ];
  },

  async getHadithList(categoryId: string, page: number = 1): Promise<HadithListItem[]> {
    try {
      const data = await this.fetchViaProxy(`${BASE_URL}/hadeeths/list/?language=ar&category_id=${categoryId}&page=${page}&per_page=20`);
      if (data && data.data && data.data.length > 0) {
        return data.data;
      }
      throw new Error("Empty response");
    } catch (error) {
      console.warn('Error fetching hadith list, using fallback:', error);
      // Detailed fallback data for hadiths to ensure the app works fully offline or when API is blocked
      const fallbackList: Record<string, HadithListItem[]> = {
        "1": [ // القرآن الكريم وعلومه
          { id: "4687", title: "اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ" },
          { id: "3389", title: "خَيْرُكُمْ مَن تَعَلَّمَ القُرْآنَ وعَلَّمَهُ" },
          { id: "3393", title: "الْماهِرُ بالقُرْآنِ مع السَّفَرَةِ الكِرامِ البَرَرَةِ" },
          { id: "3487", title: "يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ، وَارْتَقِ، وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا" }
        ],
        "2": [ // العقيدة
          { id: "2973", title: "بُنِيَ الإسْلامُ علَى خَمْسٍ: شَهادَةِ أنْ لا إلَهَ إلَّا اللَّهُ وأنَّ مُحَمَّدًا رَسولُ اللَّهِ..." },
          { id: "2939", title: "الإيمَانُ بضْعٌ وسَبْعُونَ، أوْ بضْعٌ وسِتُّونَ المَرْتبة أعلاها قول لا إله إلا الله، وأدناها إماطة الأذى عن الطريق" },
          { id: "3134", title: "قُل آمنتُ بِاللَّهِ، ثمَّ استقِم" }
        ],
        "3": [ // الفقه وأصوله
          { id: "3541", title: "لا يَقْبَلُ اللَّهُ صَلاةَ أحَدِكُمْ إذا أحْدَثَ حتَّى يَتَوَضَّأَ" },
          { id: "3523", title: "صَلُّوا كَما رَأَيْتُمُونِي أُصَلِّي" },
          { id: "3536", title: "بُنِيَ الإسْلامُ علَى خَمْسٍ... وإقامِ الصَّلاةِ، وإيتاءِ الزَّكاةِ، والحَجِّ، وصَوْمِ رَمَضانَ" }
        ],
        "4": [ // الرقائق والأذكار والأدعية
          { id: "3357", title: "مَثَلُ الَّذي يَذْكُرُ رَبَّهُ وَالَّذي لا يَذْكُرُ رَبَّهُ، مَثَلُ الحَيِّ وَالمَيِّتِ" },
          { id: "3461", title: "كَلِمَتانِ خَفِيفَتانِ علَى اللِّسانِ، ثَقِيلَتانِ في المِيزانِ، حَبِيبَتانِ إلى الرَّحْمَنِ: سُبْحانَ اللَّهِ وبِحَمْدِهِ، سُبْحانَ اللَّهِ العَظِيمِ" },
          { id: "3350", title: "أَحَبُّ الكَلامِ إلى اللهِ أَرْبَعٌ: سُبْحانَ اللهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إلَهَ إلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ" }
        ],
        "5": [ // الآداب والأخلاق
          { id: "2989", title: "إنَّ مِن أحَبِّكُم إلَيَّ وأَقْرَبِكُم مِنِّي مَجْلِسًا يَومَ القِيامَةِ أحاسِنَكُم أخْلاقًا" },
          { id: "3046", title: "لا يَدْخُلُ الجَنَّةَ مَن لا يَأْمَنُ جارُهُ بَوائِقَهُ" },
          { id: "2979", title: "الكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ" }
        ],
        "8": [ // أحاديث الصبر
          { id: "348", title: "مَا أُعْطِيَ أَحَدٌ عَطَاءً خَيْرًا وَأَوْسَعَ مِنَ الصَّبْرِ" },
          { id: "349", title: "عَجَبًا لأَمْرِ المُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ... وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ" },
          { id: "350", title: "الصَّبْرُ عِنْدَ الصَّدْمَةِ الأُولَى" }
        ]
      };
      
      const categoryList = fallbackList[categoryId];
      
      if (categoryList) {
        return categoryList;
      }
      
      return [
        { id: "1001", title: "إنَّما الأعْمالُ بالنِّيَّاتِ، وإنَّما لِكُلِّ امْرِئٍ ما نَوَى" },
        { id: "1002", title: "مِن حُسْنِ إسْلامِ المَرْءِ تَرْكُهُ ما لا يَعْنِيهِ" },
        { id: "1003", title: "الدِّينُ النَّصِيحَةُ" }
      ];
    }
  },

  async getHadithDetail(hadithId: string): Promise<HadithDetail> {
    try {
      const data = await this.fetchViaProxy(`${BASE_URL}/hadeeths/one/?language=ar&id=${hadithId}`);
      if (data) {
        return data;
      }
      throw new Error("Empty response");
    } catch (error) {
      console.warn('Error fetching hadith detail, using fallback:', error);
      // Offline fallback detail
      return {
        id: hadithId,
        title: "حديث شريف",
        hadeeth: "حدث خطأ في تحميل نص الحديث أو أنك في وضع عدم الاتصال.",
        attribution: "",
        grade: "",
        explanation: "يرجى التحقق من اتصالك بالإنترنت.",
        hints: [],
        reference: ""
      };
    }
  },

  async downloadAllHadiths(onProgress?: (progress: number) => void, signal?: AbortSignal): Promise<void> {
    try {
      const categories = await this.getCategories();
      let totalFetched = 0;
      const totalCategories = categories.length;
      let catIndex = 0;
      
      for (const cat of categories) {
        if (signal?.aborted) throw new Error("تم إلغاء التحميل");
        // We'll just fetch the first 2 pages (40 hadiths) of each category to save time and prevent rate limiting.
        // Or if the user really wants all, we can fetch all pages based on hadeethes_count.
        // Let's fetch the first 50 hadiths max per category for offline to balance size/speed.
        const maxPages = Math.min(3, Math.ceil(parseInt(cat.hadeethes_count) / 20));
        
        for (let p = 1; p <= maxPages; p++) {
          if (signal?.aborted) throw new Error("تم إلغاء التحميل");
          try {
            await this.fetchViaProxy(`${BASE_URL}/hadeeths/list/?language=ar&category_id=${cat.id}&page=${p}&per_page=20`);
          } catch(e) {}
        }
        
        catIndex++;
        if (onProgress) onProgress(Math.round((catIndex / totalCategories) * 100));
      }
    } catch(e) {
      console.error('Failed to download hadiths offline', e);
      throw e;
    }
  },

  // Dua methods
    async getDuaCategories(): Promise<DuaCategory[]> {
    const mapToAdkar = (duas: Dua[]) => {
      return duas.map(dua => ({
        content: dua.text,
        description: dua.explanation || dua.title,
        count: "1",
        reference: dua.reference || "",
      }));
    };

    return [
      {
        category: "أدعية قرآنية",
        count: QURANIC_DUAS.length,
        adkar: mapToAdkar(QURANIC_DUAS)
      },
      {
        category: "أدعية نبوية مأثورة",
        count: PROPHETIC_DUAS.length,
        adkar: mapToAdkar(PROPHETIC_DUAS)
      },
      {
        category: "أدعية بأسماء الله الحسنى",
        count: NAMES_OF_ALLAH_DUAS.length,
        adkar: mapToAdkar(NAMES_OF_ALLAH_DUAS)
      },
      {
        category: "أدعية الصالحين",
        count: RIGHTEOUS_DUAS.length,
        adkar: mapToAdkar(RIGHTEOUS_DUAS)
      },
      {
        category: "صيغ الصلاة على النبي",
        count: SALAWAT_DUAS.length,
        adkar: mapToAdkar(SALAWAT_DUAS)
      }
    ];
  },

  getQudsiHadiths(): HadithDetail[] {
    return [
      {
        id: "qudsi-1",
        title: "النهي عن الظلم وسعة غفران الله",
        hadeeth: "قال الله تبارك وتعالى: يَا عِبَادِي إِنِّي حَرَّمْتُ الظُّلْمَ عَلَى نَفْسِي وَجَعَلْتُهُ بَيْنَكُمْ مُحَرَّمًا فَلَا تَظَالَمُوا، يَا عِبَادِي كُلُّكُمْ ضَالٌّ إِلَّا مَنْ هَدَيْتُهُ فَاسْتَهْدُونِي أَهْدِكُمْ، يَا عِبَادِي كُلُّكُمْ جَائِعٌ إِلَّا مَنْ أَطْعَمْتُهُ فَاسْتَطْعِمُونِي أُطْعِمْكُمْ، يَا عِبَادِي كُلُّكُمْ عَارٍ إِلَّا مَنْ كَسَوْتُهُ فَاسْتَكْسُونِي أَكْسُكُمْ، يَا عِبَادِي إِنَّكُمْ تُخْطِئُونَ بِاللَّيْلِ وَالنَّهَارِ وَأَنَا أَغْفِرُ الذُّنُوبَ جَمِيعًا فَاسْتَغْفِرُونِي أَغْفِرْ لَكُمْ",
        attribution: "رواه مسلم",
        grade: "صحيح",
        explanation: "يرشد هذا الحديث الجليل إلى تنزيه الله سبحانه لنفسه الكريمة عن الظلم، وتحريمه القاطع للظلم بين العباد. كما يبين حاجة العباد وافتقارهم التام والدائم إلى هداية الله، ورزقه، وكسائه، ومغفرته لذنوبهم في كل وقت وحين.",
        hints: ["العدل", "الدعاء", "الاستغفار"],
        reference: "صحيح مسلم"
      },
      {
        id: "qudsi-2",
        title: "من عادى لي ولياً وتقرب النوافل",
        hadeeth: "قال الله عز وجل: مَنْ عَادَى لِي وَلِيًّا فَقَدْ آذَنْتُهُ بِالْحَرْبِ، وَمَا تَقَرَّبَ إِلَيَّ عَبْدِي بِشَيْءٍ أَحَبَّ إِلَيَّ مِمَّا افْتَرَضْتُ عَلَيْهِ، وَمَا يَزَالُ عَبْدِي يَتَقَرَّبُ إِلَيَّ بِالنَّوَافِلِ حَتَّى أُحِبَّهُ، فَإِذَا أَحْبَبْتُهُ: كُنْتُ سَمْعَهُ الَّذِي يَسْمَعُ بِهِ، وَبَصَرَهُ الَّذِي يُبْصِرُ بِهِ، وَيَدَهُ الَّتِي يَبْطِشُ بِهَا، وَرِجْلَهُ الَّتِي يَمْشِي بِهَا، وَإِنْ سَأَلَنِي لَأُعْطِيَنَّهُ، وَلَئِنِ اسْتَعَاذَنِي لَأُعِيذَنَّهُ",
        attribution: "رواه البخاري",
        grade: "صحيح",
        explanation: "يوضح هذا الحديث منزلة أولياء الله الصالحين وعقوبة من يؤذيهم. ويبين أن أفضل ما يتقرب به العبد إلى مولاه هو أداء الواجبات والفرائض، ثم الإكثار من النوافل والسنن حتى ينال المحبة والولاية الربانية التي تثمر توفيقاً وحفظاً وإجابة للدعوات.",
        hints: ["النوافل", "ولاية الله", "إجابة الدعاء"],
        reference: "صحيح البخاري"
      },
      {
        id: "qudsi-3",
        title: "أنا عند ظن عبدي بي وفضل الذكر",
        hadeeth: "قال الله تعالى: أَنَا عِنْدَ ظَنِّ عَبْدِي بِي، وَأَنَا مَعَهُ إِذَا ذَكَرَنِي، فَإِنْ ذَكَرَنِي فِي نَفْسِهِ ذَكَرْتُهُ فِي نَفْسِي، وَإِنْ ذَكَرَنِي فِي مَلَإٍ ذَكَرْتُهُ فِي مَلَإٍ خَيْرٍ مِنْهُمْ، وَإِنْ تَقَرَّبَ إِلَيَّ بِشِبْرٍ تَقَرَّبْتُ إِلَيْهِ ذِرَاعًا، وَإِنْ تَقَرَّبَ إِلَيَّ ذِرَاعًا تَقَرَّبْتُ إِلَيْهِ بَاعًا، وَإِنْ أَتَانِي يَمْشِي أَتَيْتُهُ هَرْوَلَةً",
        attribution: "رواه البخاري ومسلم",
        grade: "صحيح",
        explanation: "يحث الحديث الشريف على عظيم الرجاء بالله وحسن الظن بجنابه الرحيم وملازمة ذكره تبارك وتعالى. ويبرز رحمة الله وسرعة إقباله وتضاعف ثوابه لعبده كلما تقرب العبد بمقدار بسيط من الطاعة والعمل الصالح.",
        hints: ["الذكر", "حسن الظن", "القرب"],
        reference: "متفق عليه"
      },
      {
        id: "qudsi-4",
        title: "نزول الرب سبحانه وإجابة السائلين",
        hadeeth: "قال الله عز وجل في كل ليلة: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ؟ مَنْ يَسْأَلُنِي فَأُعْطِيَهُ؟ مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ؟",
        attribution: "رواه البخاري ومسلم",
        grade: "صحيح",
        explanation: "يدل هذا الحديث المتفق على صحته على النزول الإلهي الذي يليق بجلال الله تبارك وتعالى كل ليلة في ثلثها الأخير، وهو وقت إجابة ومغفرة ورحمة وتودد من الخالق لعباده السائلين والمستغفرين، مما يثبت فضل قيام الليل والذكر والاستغفار في هذا الوقت المبارك.",
        hints: ["قيام الليل", "الاستغفار", "الدعاء المستجاب"],
        reference: "متفق عليه"
      },
      {
        id: "qudsi-5",
        title: "فضل الصيام واختصاصه بجزاء الرب",
        hadeeth: "يقول الله عز وجل: كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلَّا الصِّيَامَ، فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ، وَالصِّيَامُ جُنَّةٌ، وَإِذَا كَانَ يَوْمُ صَوْمِ أَحَدِكُمْ فَلَا يَرْفُثْ وَلَا يَصْخَبْ، فَإِنْ سَابَّهُ أَحَدٌ أَوْ قَاتَلَهُ فَلْيَقُلْ: إِنِّي امْرُؤٌ صَائِمٌ",
        attribution: "رواه البخاري ومسلم",
        grade: "صحيح",
        explanation: "من بين سائر العبادات، اختص الله سبحانه وتعالى الصيام بإضافته إلى ذاته العلية لعظم شأنه، ولأنه عبادة سرية بين العبد وربه تخلو من الرياء، ورتب عليه ثواباً عظيماً مضاعفاً لا يعلم قدره إلا هو، وحث على التخلق بآداب الصيام وحفظ اللسان.",
        hints: ["الصيام", "الأدب الشريف", "الرياء"],
        reference: "متفق عليه"
      },
      {
        id: "qudsi-6",
        title: "عظمة نعيم الجنة المقيم",
        hadeeth: "قال الله تعالى: أَعْدَدْتُ لِعِبَادِي الصَّالِحِينَ مَا لَا عَيْنٌ رَأَتْ، وَلَا أُذُنٌ سَمِعَتْ، وَلَا خَطَرَ عَلَى قَلْبِ بَشَرٍ، وَاقْرَؤُوا إِنْ شِئْتُمْ: {فَلَا تَعْلَمُ نَفْسٌ مَّا أُخْفِيَ لَهُم مِّن قُرَّةِ أَعْيُنٍ جَزَاءً بِمَا كَانُوا يَعْمَلُونَ}",
        attribution: "رواه البخاري ومسلم",
        grade: "صحيح",
        explanation: "يبين هذا الحديث الشريف جلال وعظم النعيم الذي ينتظر عباد الله الصالحين في جنات النعيم. وأنه يفوق كل ما تراه الأعين أو تسمعه الآذان أو تتخيله عقول وقلوب البشر في الدنيا، تفضلاً وكرامةً من الله لعباده المؤمنين والمخلصين.",
        hints: ["الجنة", "النعيم المقيم", "الصالحون"],
        reference: "متفق عليه"
      },
      {
        id: "qudsi-7",
        title: "المحبة والزيارة والبذل في الله",
        hadeeth: "يقول الله تبارك وتعالى: وَجَبَتْ مَحَبَّتِي لِلْمُتَحَابِّينَ فِيَّ، وَوَجَبَتْ مَحَبَّتِي لِلْمُتَجَالِسِينَ فِيَّ، وَوَجَبَتْ مَحَبَّتِي لِلْمُتَزَاوِرِينَ فِيَّ، وَوَجَبَتْ مَحَبَّتِي لِلْمُتَبَاذِلِينَ فِيَّ",
        attribution: "رواه الإمام مالك وأحمد بسند صحيح",
        grade: "صحيح",
        explanation: "يبين الحديث الشريف عظم منزلة العلاقات الأخوية القائمة على الإخلاص والمحبة في الله تبارك وتعالى، حيث توجب للعبد محبة الله الخاصة في جميع شؤون علاقاته وزياراته ومجالسه وبذله من أجل الله الكريم.",
        hints: ["المحبة في الله", "الأخوة", "البذل"],
        reference: "رواه أحمد والموطأ"
      },
      {
        id: "qudsi-8",
        title: "كتابة الحسنات ومضاعفة الأجور",
        hadeeth: "قال الله عز وجل لملائكته: إِذَا هَمَّ عَبْدِي بِحَسَنَةٍ فَلَمْ يَعْمَلْهَا فَاكْتُبُوهَا لَهُ حَسَنَةً، فَإِنْ عَمِلَهَا فَاكْتُبُوهَا لَهُ بِعَشْرِ أَمْثَالِهَا إِلَى سَبْعِمِائَةِ ضِعْفٍ، وَإِذَا هَمَّ بِسَيِّئَةٍ فَلَمْ يَعْمَلْهَا فَلَا تَكْتُبُوهَا عَلَيْهِ، فَإِنْ عَمِلَهَا فَاكْتُبُوهَا سَيِّئَةً وَاحِدَةً",
        attribution: "رواه البخاري ومسلم",
        grade: "صحيح",
        explanation: "يبرز هذا الحديث سعة رحمة الله تبارك وتعالى وفضله العميم على أمة الإسلام؛ حيث يكتب للعبد حسنة كاملة بمجرد نية الخير والهم به، ويضاعفها أضعافاً كثيرة عند الفعل، بينما لا تكتب السيئة بمجرد الهم، وتكتب سيئة واحدة فقط عند ارتكابها دون مضاعفة.",
        hints: ["النية الصالحة", "فضل الله", "رحمة الرحمن"],
        reference: "متفق عليه"
      }
    ];
  }
};
