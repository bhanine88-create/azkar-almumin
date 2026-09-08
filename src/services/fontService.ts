import { safeLocalStorageGetItem, safeLocalStorageSetItem } from '../utils/storage';

export interface IslamicFont {
  id: string;
  name: string;
  fontFamily: string;
  category: 'quranic' | 'kufi' | 'naskh_ruqaa' | 'modern';
  categoryLabel: string;
  designer: string;
  description: string;
  sizeKb: number;
  googleFontCssUrl?: string;
  isBuiltIn?: boolean;
  sampleVerse: string;
  sampleDhikr: string;
}

export const CURATED_ISLAMIC_FONTS: IslamicFont[] = [
  {
    id: 'uthmanic-hafs',
    name: 'الرسم العثماني (حفص)',
    fontFamily: 'Uthmanic Hafs',
    category: 'quranic',
    categoryLabel: 'عثماني وقرآني',
    designer: 'مجمع الملك فهد لطباعة المصحف الشريف',
    description: 'الخط المصحفي المعتمد لرسم القرآن الكريم برواية حفص عن عاصم، متقن التشكيل والعلامات.',
    sizeKb: 340,
    isBuiltIn: true,
    sampleVerse: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾',
    sampleDhikr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ'
  },
  {
    id: 'amiri-quran',
    name: 'أميري قرآن (Amiri Quran)',
    fontFamily: 'Amiri Quran',
    category: 'quranic',
    categoryLabel: 'عثماني وقرآني',
    designer: 'د. خالد حسني / Bulaq Press',
    description: 'خط نسخي كلاسيكي أُعيد أحياؤه من المطبعة الأميلية ببولاق، مصمم خصيصاً لطباعة وقراءة الآيات القرآنية.',
    sizeKb: 520,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Amiri+Quran&display=swap',
    sampleVerse: 'وَقُل رَّبِّ زِدْنِي عِلْمًا ﴿١١٤﴾',
    sampleDhikr: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ'
  },
  {
    id: 'scheherazade-new',
    name: 'شهرزاد النسخي (Scheherazade)',
    fontFamily: 'Scheherazade New',
    category: 'quranic',
    categoryLabel: 'عثماني وقرآني',
    designer: 'SIL International',
    description: 'خط نسخي أصيل وممتد مخصص للترتيل والضبط التام للحركات وعلامات الوقف القرآنية.',
    sizeKb: 460,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap',
    isBuiltIn: true,
    sampleVerse: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ ۚ مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ',
    sampleDhikr: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ'
  },
  {
    id: 'amiri',
    name: 'الخط الأميري الأصيل (Amiri)',
    fontFamily: 'Amiri',
    category: 'naskh_ruqaa',
    categoryLabel: 'رقعة ونسخ',
    designer: 'المطبعة الأميرية / خالد حسني',
    description: 'خط عربي كلاسيكي رفيع المستوى مستوحي من خطوط النساخ الشراكسة، رائع للمتطوعين والأحرف العريضة.',
    sizeKb: 480,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap',
    isBuiltIn: true,
    sampleVerse: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
    sampleDhikr: 'لا إِلَهَ إِلا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ'
  },
  {
    id: 'aref-ruqaa',
    name: 'خط الرقعة الفني (Aref Ruqaa)',
    fontFamily: 'Aref Ruqaa',
    category: 'naskh_ruqaa',
    categoryLabel: 'رقعة ونسخ',
    designer: 'عبد الله عارف',
    description: 'خط رقعة عربي أصيل بتصميم خطي تقليدي كلاسيكي يعطي جمالاً وشعوراً بالخط اليدوي العربي الأصيل.',
    sizeKb: 380,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap',
    sampleVerse: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ',
    sampleDhikr: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ'
  },
  {
    id: 'reem-kufi',
    name: 'ريم كوفي الزخرفي (Reem Kufi)',
    fontFamily: 'Reem Kufi',
    category: 'kufi',
    categoryLabel: 'خطوط كوفية',
    designer: 'خالد حسني',
    description: 'خط كوفي زخرفي مستوحى من المخطوطات العربية القاطاطية القديمة في العصور الإسلامية الأولى.',
    sizeKb: 410,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400;600;700&display=swap',
    sampleVerse: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    sampleDhikr: 'اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا'
  },
  {
    id: 'noto-kufi',
    name: 'الخط الكوفي العريق (Noto Kufi)',
    fontFamily: 'Noto Kufi Arabic',
    category: 'kufi',
    categoryLabel: 'خطوط كوفية',
    designer: 'Google Fonts Team',
    description: 'خط كوفي ذو هيكل متناسق ومتماثل، ممتاز للعناوين الرئيسية والأذكار واللوحات الترحيبية.',
    sizeKb: 490,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;800&display=swap',
    sampleVerse: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    sampleDhikr: 'لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ'
  },
  {
    id: 'kfgqpc-kufi',
    name: 'الكوفي الفاخر (KFGQPC Kufi)',
    fontFamily: 'KFGQPC Kufi Stylistic Regular',
    category: 'kufi',
    categoryLabel: 'خطوط كوفية',
    designer: 'مجمع الملك فهد لطباعة المصحف الشريف',
    description: 'خط كوفي أسلوبي مميز صممه خبراء الخط العربي بمجمع الملك فهد لطباعة المصحف الشريف.',
    sizeKb: 320,
    isBuiltIn: true,
    sampleVerse: 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا',
    sampleDhikr: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ'
  },
  {
    id: 'katibeh',
    name: 'خط كتيبة التاريخي (Katibeh)',
    fontFamily: 'Katibeh',
    category: 'naskh_ruqaa',
    categoryLabel: 'رقعة ونسخ',
    designer: 'مطبعة السلسلة الخطية',
    description: 'مخطوطة كلاسيكية مستوحاة من خطوط الكتّاب والمجلّدين في العصور الإسلامية الذهبية.',
    sizeKb: 390,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Katibeh&display=swap',
    sampleVerse: 'وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا',
    sampleDhikr: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا'
  },
  {
    id: 'lateef',
    name: 'خط لطيف النسخي (Lateef)',
    fontFamily: 'Lateef',
    category: 'naskh_ruqaa',
    categoryLabel: 'رقعة ونسخ',
    designer: 'SIL International',
    description: 'خط نسخي واسع الانحناءات وسلس، يمنح قراءة مريحة للعين في نصوص المصحف الشريف والأذكار.',
    sizeKb: 430,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Lateef:wght@400;700&display=swap',
    sampleVerse: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    sampleDhikr: 'يا ذَا الْجَلالِ وَالإِكْرَامِ'
  },
  {
    id: 'el-messiri',
    name: 'خط المسيري الفني (El Messiri)',
    fontFamily: 'El Messiri',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'تيمور بوكايل',
    description: 'خط عربي منحني مستوحى من خطوط الزخرفة الإسلامية المعاصرة، يعطي طابعاً إيمانياً رائعاً.',
    sizeKb: 450,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;600;700&display=swap',
    sampleVerse: 'الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَا أَنْ هَدَانَا اللَّهُ',
    sampleDhikr: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلا إِلَهَ إِلا اللَّهُ وَاللَّهُ أَكْبَرُ'
  },
  {
    id: 'mirza',
    name: 'خط ميرزا الفارسي (Mirza)',
    fontFamily: 'Mirza',
    category: 'naskh_ruqaa',
    categoryLabel: 'رقعة ونسخ',
    designer: 'برنامج الخطوط التراثية',
    description: 'خط يدمج بين سلاسة النسخ وشاعرية خط النستعليق الفارسي الشائع في المخطوطات الإسلامية الشرقية.',
    sizeKb: 470,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Mirza:wght@400;600;700&display=swap',
    sampleVerse: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴿٢﴾ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ﴿٣﴾',
    sampleDhikr: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ'
  },
  {
    id: 'lalezar',
    name: 'خط لاليزار البارز (Lalezar)',
    fontFamily: 'Lalezar',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'برنا العتيقي',
    description: 'خط عريض وجريء ذو حضور قوي في البطاقات الدعوية والعبارات الترحيبية الهامة.',
    sizeKb: 360,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Lalezar&display=swap',
    sampleVerse: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ',
    sampleDhikr: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ'
  },
  {
    id: 'rakkas',
    name: 'خط رقاص التعبيري (Rakkas)',
    fontFamily: 'Rakkas',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'زهر الدين القاسمي',
    description: 'خط عربي استعراضي مستوحى من لافتات الخطاطين في المحاريب والمساجد.',
    sizeKb: 420,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Rakkas&display=swap',
    sampleVerse: 'وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا',
    sampleDhikr: 'الْحَمْدُ لِلَّهِ كَثِيرًا وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلاً'
  },
  {
    id: 'cairo',
    name: 'خط القاهرة العصري (Cairo)',
    fontFamily: 'Cairo',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Mohamed Gaber',
    description: 'خط هندسي عربي معاصر ممتاز وواضح يجمع بين العصرانية والأناقة في الواجهات.',
    sizeKb: 510,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap',
    isBuiltIn: true,
    sampleVerse: 'وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ',
    sampleDhikr: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى'
  },
  {
    id: 'tajawal',
    name: 'خط تجوال (Tajawal)',
    fontFamily: 'Tajawal',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Boutros Fonts',
    description: 'الخط الافتراضي المنظم والمتناسق الذي يوفر وضوحاً فائقاً عبر جميع الشاشات والأجهزة.',
    sizeKb: 440,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap',
    isBuiltIn: true,
    sampleVerse: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
    sampleDhikr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ'
  },
  {
    id: 'zain',
    name: 'خط زين الهندسي (Zain)',
    fontFamily: 'Zain',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Zain Typography',
    description: 'خط عربي حديث يتميز بزوايا هندسية ناعمة وقراءة انسيابية في بطاقات الأذكار.',
    sizeKb: 370,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Zain:wght@400;700;800;900&display=swap',
    sampleVerse: 'إِنَّ رَبِّي لَسَمِيعُ الدُّعَاءِ',
    sampleDhikr: 'يا حَيُّ يا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ'
  },
  {
    id: 'alexandria',
    name: 'خط الإسكندرية (Alexandria)',
    fontFamily: 'Alexandria',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Gaber & Team',
    description: 'خط راقٍ ومظهره ناصع وواضح جداً في قراءة التفاسير والنصوص الطويلة.',
    sizeKb: 480,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&display=swap',
    sampleVerse: 'اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾',
    sampleDhikr: 'سُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ'
  },
  {
    id: 'marhey',
    name: 'خط مرحي (Marhey)',
    fontFamily: 'Marhey',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Borna Izadpanah',
    description: 'خط عربي مرح وممتع ذو انحناءات ناعمة وغير رسمية.',
    sizeKb: 340,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Marhey:wght@400;600;700&display=swap',
    sampleVerse: 'فَتَبَسَّمَ ضَاحِكًا مِّن قَوْلِهَا',
    sampleDhikr: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ'
  },
  {
    id: 'lemonada',
    name: 'خط ليمونادة (Lemonada)',
    fontFamily: 'Lemonada',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Mohamed Gaber',
    description: 'خط معاصر ذو حواف دائرية ونسب مرنة يعطي انطباعاً لطيفاً وعصرياً.',
    sizeKb: 390,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Lemonada:wght@400;600;700&display=swap',
    sampleVerse: 'وَسِيقَ الَّذِينَ اتَّقَوْا رَبَّهُمْ إِلَى الْجَنَّةِ زُمَرًا',
    sampleDhikr: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ'
  },
  {
    id: 'changa',
    name: 'خط شانجا (Changa)',
    fontFamily: 'Changa',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Eduardo Tunni',
    description: 'خط صلب متين ذو زوايا شبه مربعة يبرز النصوص المهمة والكلمات القوية.',
    sizeKb: 420,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Changa:wght@400;600;700;800&display=swap',
    sampleVerse: 'فَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ',
    sampleDhikr: 'لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ'
  },
  {
    id: 'baloo-bhaijaan-2',
    name: 'خط بالو (Baloo Bhaijaan 2)',
    fontFamily: 'Baloo Bhaijaan 2',
    category: 'modern',
    categoryLabel: 'حديث وعرض',
    designer: 'Ek Type',
    description: 'خط عريض وناعم يخلو من الزوايا الحادة، يضفي مظهراً عصرياً جذاباً ومحبباً.',
    sizeKb: 410,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;600;700&display=swap',
    sampleVerse: 'يُبَشِّرُهُمْ رَبُّهُم بِرَحْمَةٍ مِّنْهُ وَرِضْوَانٍ',
    sampleDhikr: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ'
  },
  {
    id: 'markazi-text',
    name: 'المركزي (Markazi Text)',
    fontFamily: 'Markazi Text',
    category: 'naskh_ruqaa',
    categoryLabel: 'رقعة ونسخ',
    designer: 'Borna Izadpanah',
    description: 'خط كلاسيكي بأسلوب حديث، يمتاز بوضوحه وجماله في النصوص الطويلة والأحاديث.',
    sizeKb: 380,
    googleFontCssUrl: 'https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;600;700&display=swap',
    sampleVerse: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
    sampleDhikr: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي'
  }
];

const STORAGE_KEY_DOWNLOADED_FONTS = 'downloaded_islamic_fonts_v1';

export const getDownloadedFontIds = (): string[] => {
  try {
    const saved = safeLocalStorageGetItem(STORAGE_KEY_DOWNLOADED_FONTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Always include built-in fonts
        const builtInIds = CURATED_ISLAMIC_FONTS.filter(f => f.isBuiltIn).map(f => f.id);
        return Array.from(new Set([...builtInIds, ...parsed]));
      }
    }
  } catch (e) {
    console.warn('Failed to load downloaded fonts list:', e);
  }
  return CURATED_ISLAMIC_FONTS.filter(f => f.isBuiltIn).map(f => f.id);
};

export const saveDownloadedFontId = (fontId: string): void => {
  try {
    const current = getDownloadedFontIds();
    if (!current.includes(fontId)) {
      const updated = [...current, fontId];
      safeLocalStorageSetItem(STORAGE_KEY_DOWNLOADED_FONTS, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Failed to save downloaded font ID:', e);
  }
};

export const loadFontStylesheet = (font: IslamicFont): Promise<boolean> => {
  return new Promise((resolve) => {
    if (font.isBuiltIn || !font.googleFontCssUrl) {
      resolve(true);
      return;
    }

    const elementId = `font-style-${font.id}`;
    if (document.getElementById(elementId)) {
      resolve(true);
      return;
    }

    const link = document.createElement('link');
    link.id = elementId;
    link.rel = 'stylesheet';
    link.href = font.googleFontCssUrl;
    link.crossOrigin = 'anonymous';

    link.onload = () => {
      // Check if document.fonts is available to verify font rendering
      if ('fonts' in document) {
        document.fonts.ready.then(() => resolve(true)).catch(() => resolve(true));
      } else {
        resolve(true);
      }
    };

    link.onerror = () => {
      console.warn(`Failed to load font stylesheet for ${font.name}`);
      resolve(false);
    };

    document.head.appendChild(link);
  });
};

export const loadAllDownloadedFontsOnStartup = async (): Promise<void> => {
  const downloadedIds = getDownloadedFontIds();
  const fontObjects = CURATED_ISLAMIC_FONTS.filter(f => downloadedIds.includes(f.id));
  
  await Promise.all(fontObjects.map(font => loadFontStylesheet(font)));
};

export const downloadFontWithProgress = async (
  font: IslamicFont,
  onProgress?: (percent: number) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    let progress = 0;
    onProgress?.(10);

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 25) + 15;
      if (progress >= 90) {
        clearInterval(interval);
        loadFontStylesheet(font).then((success) => {
          onProgress?.(100);
          if (success) {
            saveDownloadedFontId(font.id);
          }
          resolve(success);
        });
      } else {
        onProgress?.(progress);
      }
    }, 150);
  });
};
