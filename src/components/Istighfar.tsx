import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackButton } from './ui/BackButton';
import { 
  Droplets, 
  Heart, 
  Moon, 
  Sun, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  HeartHandshake, 
  Crown, 
  BookOpen, 
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Flame,
  Star,
  Compass,
  Layers,
  ArrowRight,
  BookMarked,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

interface IstighfarItem {
  id: string;
  category: 'all' | 'quranic' | 'prophetic' | 'major' | 'salat_tawbah';
  title: string;
  subtitle: string;
  source: string;
  virtue?: string;
  text: string;
  count: number;
  icon: any;
  color: string;
  bgGradient: string;
}

const ISTIGHFAR_ITEMS: IstighfarItem[] = [
  {
    id: 'sayyid',
    category: 'prophetic',
    title: 'سَيِّدُ الِاسْتِغْفَارِ',
    subtitle: 'أعظم صيغ الاستغفار وأشملها',
    source: 'صحيح البخاري (حديث شداد بن أوس رضي الله عنه)',
    virtue: 'من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، وكذلك إذا أصبح.',
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
    count: 1,
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    bgGradient: 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 text-amber-900 dark:text-amber-100'
  },
  {
    id: 'prophet_majlis',
    category: 'prophetic',
    title: 'استغفار النبي ﷺ في المجلس الواحد',
    subtitle: 'كان النبي ﷺ يعد له في المجلس الواحد مائة مرة',
    source: 'سنن أبي داود والترمذي (حديث ابن عمر رضي الله عنهما)',
    virtue: 'سنة نبوية مؤكدة لتطهير المجالس من اللغو والزلل.',
    text: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ.',
    count: 100,
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    bgGradient: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
  },
  {
    id: 'azim',
    category: 'major',
    title: 'الاستغفار العظيم لغفران الذنوب',
    subtitle: 'يُغفر به وإن كان فرّ من الزحف',
    source: 'سنن أبي داود والترمذي (حديث ابن مسعود رضي الله عنه)',
    virtue: 'من قاله غُفرت ذنوبه وإن كان قد فر من الزحف (من كبائر الذنوب).',
    text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ.',
    count: 3,
    icon: ShieldCheck,
    color: 'from-blue-500 to-cyan-600',
    bgGradient: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border-blue-500/30 text-blue-900 dark:text-blue-100'
  },
  {
    id: 'basic_100',
    category: 'prophetic',
    title: 'الاستغفار اليومي النبوي المائة',
    subtitle: 'ورد يومي ثابت عن رسول الله ﷺ',
    source: 'صحيح مسلم (حديث الأغر المزني رضي الله عنه)',
    virtue: 'قال ﷺ: «إنه ليغان على قلبي، وإني لأستغفر الله في اليوم مائة مرة».',
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.',
    count: 100,
    icon: Droplets,
    color: 'from-sky-500 to-blue-600',
    bgGradient: 'bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent border-sky-500/30 text-sky-900 dark:text-sky-100'
  },
  {
    id: 'sunnah_abubakr',
    category: 'prophetic',
    title: 'دعاء الصديق في الصلاة',
    subtitle: 'علمه النبي ﷺ لأبي بكر ليدعو به في صلاته',
    source: 'صحيح البخاري ومسلم (حديث أبي بكر الصديق رضي الله عنه)',
    virtue: 'دعاء عظيم جامع لطلب المغفرة والرحمة في الصلاة وخارجها.',
    text: 'اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ.',
    count: 3,
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent border-rose-500/30 text-rose-900 dark:text-rose-100'
  },
  {
    id: 'tawbah_sujood',
    category: 'salat_tawbah',
    title: 'استغفار وتضرع السجود النبوي',
    subtitle: 'دعاء النبي ﷺ في سجود التوبة والتضرع',
    source: 'صحيح مسلم (حديث أبي هريرة رضي الله عنه)',
    virtue: 'يستوعب جميع أنواع الذنوب الظاهرة والباطنة والصغيرة والكبيرة.',
    text: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ: دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ.',
    count: 3,
    icon: Moon,
    color: 'from-indigo-600 to-violet-700',
    bgGradient: 'bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border-indigo-500/30 text-indigo-900 dark:text-indigo-100'
  },
  {
    id: 'salat_tawbah_dua',
    category: 'salat_tawbah',
    title: 'دعاء صلاة التوبة بعد التسليم',
    subtitle: 'يُقال بعد أداء ركعتي التوبة بخشوع',
    source: 'مأثور ومستحب بعد صلاة ركعتي التوبة',
    virtue: 'تجديد العهد مع الله تعالى بالاعتراف بالذنب والعزم الصادق على الاستقامة.',
    text: 'اللَّهُمَّ إِنِّي أَسْتَغْفِرُكَ مِنْ كُلِّ ذَنْبٍ تُبْتُ إِلَيْكَ مِنْهُ ثُمَّ عُدْتُ فِيهِ، وَأَسْتَغْفِرُكَ مِنْ كُلِّ عَمَلٍ أَرَدْتُ بِهِ وَجْهَكَ فَخَالَطَنِي فِيهِ مَا لَيْسَ لَكَ، وَأَسْتَغْفِرُكَ مِنْ كُلِّ نِعْمَةٍ أَنْعَمْتَ بِهَا عَلَيَّ فَاسْتَعَنْتُ بِهَا عَلَى مَعْصِيَتِكَ.',
    count: 1,
    icon: ShieldCheck,
    color: 'from-teal-600 to-emerald-700',
    bgGradient: 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border-teal-500/30 text-teal-900 dark:text-teal-100'
  },
  {
    id: 'quran_anbiya',
    category: 'quranic',
    title: 'دعاء ذي النون (يونس عليه السلام)',
    subtitle: 'دعاء تفريج الكروب والهموم وغفران الظلمات',
    source: 'سورة الأنبياء، آية 87',
    virtue: 'قال ﷺ: «دعوة ذي النون إذ دعا وهو في بطن الحوت: لم يدعُ بها رجل مسلم في شيء قط إلا استجاب الله له».',
    text: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.',
    count: 7,
    icon: BookOpen,
    color: 'from-cyan-600 to-blue-700',
    bgGradient: 'bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent border-cyan-500/30 text-cyan-900 dark:text-cyan-100'
  },
  {
    id: 'quran_aaraf',
    category: 'quranic',
    title: 'توبة آدم وحواء عليهما السلام',
    subtitle: 'الكلمات التي تلقاها آدم من ربه فتاب عليه',
    source: 'سورة الأعراف، آية 23',
    virtue: 'أول دعاء توبة استجاب الله به في تاريخ البشرية.',
    text: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ.',
    count: 3,
    icon: BookOpen,
    color: 'from-violet-500 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent border-violet-500/30 text-violet-900 dark:text-violet-100'
  },
  {
    id: 'quran_musa',
    category: 'quranic',
    title: 'توبة كليم الله موسى عليه السلام',
    subtitle: 'دعاء الاعتراف بالذنب وسرعة الغفران',
    source: 'سورة القصص، آية 16',
    virtue: '﴿فَغَفَرَ لَهُ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ﴾.',
    text: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي.',
    count: 3,
    icon: BookOpen,
    color: 'from-emerald-500 to-green-600',
    bgGradient: 'bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-transparent border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
  },
  {
    id: 'quran_imran_1',
    category: 'quranic',
    title: 'دعاء عباد الرحمن المستغفرين بالأسحار',
    subtitle: 'من دعاء الصابرين والصادقين في آل عمران',
    source: 'سورة آل عمران، آية 16',
    virtue: 'من صفات أهل الجنة الذين يثني الله عليهم.',
    text: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ.',
    count: 3,
    icon: BookOpen,
    color: 'from-amber-600 to-yellow-700',
    bgGradient: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/30 text-amber-900 dark:text-amber-100'
  },
  {
    id: 'sunnah_jami',
    category: 'prophetic',
    title: 'الاستغفار النبوي الشامل لكل خطيئة',
    subtitle: 'دعاء النبي ﷺ الشامل لما علم وما لم يعلم',
    source: 'صحيح البخاري ومسلم (حديث أبي موسى الأشعري رضي الله عنه)',
    virtue: 'جامع لكل أنواع التقصير والهزل والجد والعمد والخطأ.',
    text: 'اللَّهُمَّ اغْفِرْ لِي خَطِيئَتِي وَجَهْلِي، وَإِسْرَافِي فِي أَمْرِي، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، اللَّهُمَّ اغْفِرْ لِي جِدِّي وَهَزْلِي، وَخَطَئِي وَعَمْدِي، وَكُلُّ ذٰلِكَ عِنْدِي، اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ وَمَا أَعْلَنْتُ، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي، أَنْتَ الْمُقَدِّمُ وَأَنْتَ الْمُؤَخِّرُ، وَأَنْتَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ.',
    count: 1,
    icon: Sparkles,
    color: 'from-fuchsia-600 to-pink-700',
    bgGradient: 'bg-gradient-to-br from-fuchsia-500/10 via-pink-500/5 to-transparent border-fuchsia-500/30 text-fuchsia-900 dark:text-fuchsia-100'
  },
  {
    id: 'parents_ummah',
    category: 'major',
    title: 'الاستغفار للوالدين وجميع المؤمنين',
    subtitle: 'لك بكل مؤمن ومؤمنة حسنة',
    source: 'المعجم الكبير للطبراني (حديث عبادة بن الصامت رضي الله عنه)',
    virtue: 'قال ﷺ: «من استغفر للمؤمنين والمؤمنات كتب الله له بكل مؤمن ومؤمنة حسنة».',
    text: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ، اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ، الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ.',
    count: 27,
    icon: HeartHandshake,
    color: 'from-rose-500 to-red-600',
    bgGradient: 'bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent border-rose-500/30 text-rose-900 dark:text-rose-100'
  },
  {
    id: 'post_prayer_istighfar',
    category: 'prophetic',
    title: 'استغفار ختام الصلاة المكتوبة',
    subtitle: 'أول ما ينطق به المصلي بعد السلام',
    source: 'صحيح مسلم (حديث ثوبان رضي الله عنه)',
    virtue: 'جبران لما قد يقع في الصلاة من سهو أو نقص أو غفلة.',
    text: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالإِكْرَامِ.',
    count: 3,
    icon: Sun,
    color: 'from-amber-500 to-teal-600',
    bgGradient: 'bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-transparent border-amber-500/30 text-amber-900 dark:text-amber-100'
  },
  {
    id: 'sunnah_majlis_kaffarah',
    category: 'prophetic',
    title: 'كفارة المجلس وخاتمة اللقاءات',
    subtitle: 'يمحو ما كان في المجلس من لغو أو زلل',
    source: 'سنن الترمذي (حديث أبي هريرة رضي الله عنه)',
    virtue: 'من جلس في مجلس فكثر فيه لغطه فقال هذا الذكر كُفّر له ما كان في مجلسه ذلك.',
    text: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ.',
    count: 1,
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-600',
    bgGradient: 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/30 text-indigo-900 dark:text-indigo-100'
  },
  {
    id: 'sunnah_afu',
    category: 'prophetic',
    title: 'دعاء العفو والمغفرة التامة',
    subtitle: 'وصية رسول الله ﷺ لأمنا عائشة رضي الله عنها',
    source: 'سنن الترمذي (حديث عائشة رضي الله عنها)',
    virtue: 'طلب العفو الذي يمحو الذنب ويسقط العقوبة ويبدل السيئات حسنات.',
    text: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.',
    count: 7,
    icon: Crown,
    color: 'from-amber-400 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-amber-400/10 via-orange-500/5 to-transparent border-amber-400/30 text-amber-900 dark:text-amber-100'
  },
  {
    id: 'rajaa_maghfirah',
    category: 'major',
    title: 'دعاء الرجاء في سعة رحمة الله',
    subtitle: 'دعاء حسن الظن بمغفرة الله الواسعة',
    source: 'مأثور عن السلف والصالحين',
    virtue: 'يبعث الأمل ويطرد اليأس والقنوط من رحمة الله.',
    text: 'اللَّهُمَّ مَغْفِرَتُكَ أَوْسَعُ مِنْ ذُنُوبِي، وَرَحْمَتُكَ أَرْجَى عِنْدِي مِنْ عَمَلِي، اللَّهُمَّ إِنْ لَمْ أَكُنْ أَهْلًا لِبُلُوغِ رَحْمَتِكَ فَرَحْمَتُكَ أَهْلٌ لِبُلُوغِي وَشُمُولِي.',
    count: 3,
    icon: Heart,
    color: 'from-purple-500 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border-purple-500/30 text-purple-900 dark:text-purple-100'
  }
];

export const Istighfar: React.FC = () => {
  const { settings } = useAppContext();
  const { isRtl } = useTranslation(settings.appLanguage);
  
  // Navigation tabs: 'athkar' (Supplications list & counter), 'salat_tawbah' (Salat al-Tawbah guide & prayers), 'virtues' (Virtues & Hadiths)
  const [mainView, setMainView] = useState<'athkar' | 'salat_tawbah' | 'virtues'>('athkar');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'quranic' | 'prophetic' | 'major' | 'salat_tawbah'>('all');
  
  // Counter & Active item
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [activeItemId, setActiveItemId] = useState<string>(ISTIGHFAR_ITEMS[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Salat al Tawbah Step completion tracker
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [tawbahPrayerLogged, setTawbahPrayerLogged] = useState<boolean>(false);

  // Time-based smart contextual reminder
  const [timeContext, setTimeContext] = useState<{ 
    id: string; 
    title: string; 
    message: string; 
    icon: any; 
    color: string; 
    bg: string; 
    recommendationId?: string 
  } | null>(null);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 5 = Friday

      if (day === 5) {
        setTimeContext({
          id: 'friday',
          title: 'يوم الجمعة المبارك',
          message: 'يوم الجمعة عيد الأسبوع وساعة الإجابة، أكثر فيه من الاستغفار وسؤال العفو والصلاة على النبي ﷺ.',
          icon: Heart,
          color: 'text-emerald-300',
          bg: 'bg-emerald-950 border-emerald-800/60 shadow-emerald-950/40',
          recommendationId: 'parents_ummah'
        });
      } else if (hour >= 2 && hour < 5) {
        setTimeContext({
          id: 'suhoor',
          title: 'وقت السَّحَر المبارك',
          message: 'أنت الآن في الثلث الأخير من الليل وقت النزول الإلهي: «وَبِالْأَسْحَارِ هُمْ يَسْتَغْفِرُونَ»، فرصة عظيمة لسيد الاستغفار وركعتي التوبة.',
          icon: Moon,
          color: 'text-indigo-300',
          bg: 'bg-indigo-950 border-indigo-800/60 shadow-indigo-950/40',
          recommendationId: 'sayyid'
        });
      } else if (hour >= 5 && hour < 9) {
        setTimeContext({
          id: 'morning',
          title: 'إشراقة الصباح وتجديد العهد',
          message: 'بدأ يومك، وخير ما تستفتح به صحيفتك هو سيد الاستغفار والتوبة الصادقة لتكون في حفظ الله.',
          icon: Sun,
          color: 'text-amber-300',
          bg: 'bg-amber-950 border-amber-800/60 shadow-amber-950/40',
          recommendationId: 'sayyid'
        });
      } else if (hour >= 16 && hour < 20) {
        setTimeContext({
          id: 'evening',
          title: 'أذكار المساء وختام اليوم',
          message: 'في المساء، حصّن روحك بالاستغفار العظيم واختم ساعات النهار بطلب المغفرة والرضوان.',
          icon: Clock,
          color: 'text-orange-300',
          bg: 'bg-orange-950 border-orange-800/60 shadow-orange-950/40',
          recommendationId: 'azim'
        });
      } else {
        setTimeContext(null);
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCount = (id: string, target: number) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current < target) {
        if ((window as any).navigator?.vibrate) {
          (window as any).navigator.vibrate(35);
        }
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  const resetCount = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  const handleCopyText = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNumber) ? prev.filter(s => s !== stepNumber) : [...prev, stepNumber]
    );
  };

  // Filter items
  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return ISTIGHFAR_ITEMS;
    return ISTIGHFAR_ITEMS.filter(item => item.category === categoryFilter);
  }, [categoryFilter]);

  const activeItem = useMemo(() => {
    return ISTIGHFAR_ITEMS.find(i => i.id === activeItemId) || filteredItems[0] || ISTIGHFAR_ITEMS[0];
  }, [activeItemId, filteredItems]);

  const currentCount = counts[activeItem.id] || 0;
  const isCompleted = currentCount >= activeItem.count;

  // Stats calculation
  const totalRecited = useMemo(() => {
    return Object.values(counts).reduce((sum, c) => sum + c, 0);
  }, [counts]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-right select-none" dir="rtl">
      
      {/* Top App Bar & Integrated Sticky Navigation Tabs */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 shadow-xs pt-3 pb-2.5 px-3 sm:px-4 transition-all">
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
          {/* Top Bar Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <BackButton />
              <div>
                <h1 className="text-base sm:text-xl font-black bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent leading-tight flex items-center gap-1.5 sm:gap-2">
                  <span>رُكْنُ التَّوْبَةِ وَالِاسْتِغْفَارِ</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                  أدعية الاستغفار المأثورة وصلاة التوبة خطوة بخطوة
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow-xs whitespace-nowrap">
                <Droplets size={14} className="text-emerald-500 animate-pulse" />
                <span>{totalRecited} استغفار</span>
              </div>
            </div>
          </div>

          {/* Main View Segmented Tabs */}
          <div className="bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/70 dark:border-slate-700/60 shadow-inner">
            <button
              onClick={() => setMainView('athkar')}
              className={cn(
                "flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                mainView === 'athkar'
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Sparkles size={15} />
              <span>صِيَغُ الِاسْتِغْفَارِ</span>
            </button>

            <button
              onClick={() => setMainView('salat_tawbah')}
              className={cn(
                "flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                mainView === 'salat_tawbah'
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Moon size={15} />
              <span>صَلَاةُ التَّوْبَةِ</span>
            </button>

            <button
              onClick={() => setMainView('virtues')}
              className={cn(
                "flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                mainView === 'virtues'
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm scale-[1.01]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Heart size={15} />
              <span>فَضَائِلُ التَّوْبَةِ</span>
            </button>
          </div>

          {/* Sub-Category Filter Chips (Sticky when in athkar view) */}
          {mainView === 'athkar' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
              {[
                { id: 'all', name: 'الكل' },
                { id: 'prophetic', name: 'السنة النبوية' },
                { id: 'quranic', name: 'القرآن الكريم' },
                { id: 'salat_tawbah', name: 'صلاة التوبة' },
                { id: 'major', name: 'الكبائر والوالدين' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={cn(
                    "shrink-0 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all border cursor-pointer whitespace-nowrap",
                    categoryFilter === cat.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-black"
                      : "bg-slate-100/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-3 space-y-6">

        {/* TIME CONTEXT BANNER */}
        <AnimatePresence>
          {timeContext && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.96 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.96 }}
              onClick={() => {
                if (timeContext.recommendationId) {
                  setMainView('athkar');
                  setActiveItemId(timeContext.recommendationId);
                }
              }}
              className={cn(
                "text-white rounded-3xl p-4 sm:p-5 shadow-lg overflow-hidden relative border cursor-pointer group transition-all",
                timeContext.bg
              )}
            >
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 bg-black/20 shadow-inner">
                  <timeContext.icon size={22} className={timeContext.color} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <span>{timeContext.title}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/15 text-white">
                        وقت فاضل
                      </span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-300 group-hover:underline">
                      انتقل للورد المقترح ←
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                    {timeContext.message}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* VIEW 1: ISTIGHFAR SUPPLICATIONS & INTERACTIVE COUNTER                      */}
        {/* ========================================================================= */}
        {mainView === 'athkar' && (
          <div className="space-y-5">
            {/* Supplications Quick Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem.id === item.id;
                const itemDone = (counts[item.id] || 0) >= item.count;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItemId(item.id)}
                    className={cn(
                      "snap-center shrink-0 px-3.5 py-2.5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-2 font-bold text-xs sm:text-sm cursor-pointer outline-none shadow-xs",
                      isActive 
                        ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-md scale-[1.02]" 
                        : "bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="relative">
                      <Icon size={16} className={cn(isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")} />
                      {itemDone && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </div>
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Card Interactive Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden flex flex-col justify-between min-h-[460px]",
                  "transition-all"
                )}
              >
                {/* Header of Active Item */}
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase">
                          {activeItem.category === 'quranic' ? 'آية قرآنية' : activeItem.category === 'salat_tawbah' ? 'صلاة التوبة' : 'سنة نبوية'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold">{activeItem.source}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {activeItem.title}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                        {activeItem.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleCopyText(activeItem.text, activeItem.id, e)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        title="نسخ نص الدعاء"
                      >
                        {copiedId === activeItem.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>

                      <button
                        onClick={(e) => resetCount(activeItem.id, e)}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        title="إعادة ضبط العداد"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Virtue notice if present */}
                  {activeItem.virtue && (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                      <Star size={14} className="text-amber-600 shrink-0" />
                      <span>{activeItem.virtue}</span>
                    </div>
                  )}
                </div>

                {/* Main Text in Arabic Font */}
                <div className="my-6 flex items-center justify-center">
                  <p 
                    className="text-2xl sm:text-3xl lg:text-4xl text-center leading-[2.2] sm:leading-[2.4] font-bold text-slate-800 dark:text-slate-100"
                    style={{ fontFamily: "'Amiri', serif" }}
                  >
                    {activeItem.text}
                  </p>
                </div>

                {/* Counter & Action Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      التكرار المطلوب: <span className="font-black text-slate-700 dark:text-slate-200">{activeItem.count} مرة</span>
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-baseline gap-1">
                      <span>{currentCount}</span>
                      <span className="text-xs text-slate-400 font-bold">/ {activeItem.count}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (currentCount / activeItem.count) * 100)}%` }}
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-300", activeItem.color)}
                    />
                  </div>

                  {/* Big Tap Button */}
                  <motion.button
                    whileTap={!isCompleted ? { scale: 0.97 } : {}}
                    onClick={() => handleCount(activeItem.id, activeItem.count)}
                    disabled={isCompleted}
                    className={cn(
                      "w-full py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg cursor-pointer",
                      isCompleted 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none cursor-default" 
                        : cn("text-white bg-gradient-to-r hover:opacity-95 active:shadow-sm", activeItem.color)
                    )}
                  >
                    {isCompleted ? (
                      <>
                        <ShieldCheck size={24} className="text-emerald-500" />
                        <span>تَمَّ الإِنْجَازُ بِحَمْدِ اللهِ</span>
                      </>
                    ) : (
                      <>
                        <Droplets size={22} className="opacity-90 animate-bounce" />
                        <span>اضْغَطْ لِلِاسْتِغْفَارِ ({currentCount + 1})</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* List of All Other Supplications Quick-Cards */}
            <div className="space-y-3 pt-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookMarked size={18} className="text-emerald-600" />
                <span>فهرس أدعية الاستغفار والتوبة المختارة</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ISTIGHFAR_ITEMS.map((item) => {
                  const isDone = (counts[item.id] || 0) >= item.count;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemId(item.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between gap-3 group",
                        activeItem.id === item.id 
                          ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 shadow-sm" 
                          : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br", item.color)}>
                            <item.icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold">{item.source}</p>
                          </div>
                        </div>

                        {isDone && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            مكتمل
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium" style={{ fontFamily: "'Amiri', serif" }}>
                        {item.text}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>العدد: {item.count}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                          فتح وتكرار ←
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SALAT AL-TAWBAH INTERACTIVE STEP-BY-STEP COMPANION                */}
        {/* ========================================================================= */}
        {mainView === 'salat_tawbah' && (
          <div className="space-y-6">
            
            {/* Hadith & Foundation Hero Banner */}
            <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300 border border-white/20">
                  <Moon size={24} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">صَلَاةُ التَّوْبَةِ وَسُنَّتُهَا</h2>
                  <p className="text-xs text-emerald-200/90 font-bold">ركعتان تغسلان الذنوب وتجددان العهد مع الغفور الرحيم</p>
                </div>
              </div>

              <div className="p-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                  <Sparkles size={14} />
                  <span>دليل مشروعيتها من السنة النبوية الشريفة:</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-semibold">
                  عَنْ عَلِيِّ بْنِ أَبِي طَالِبٍ رَضِيَ اللَّهُ عَنْهُ، عَنْ أَبِي بَكْرٍ الصِّدِّيقِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ:
                </p>
                <p className="text-sm sm:text-base text-amber-200 leading-relaxed font-black" style={{ fontFamily: "'Amiri', serif" }}>
                  «مَا مِنْ رَجُلٍ يُذْنِبُ ذَنْبًا، ثُمَّ يَقُومُ فَيَتَطَهَّرُ، ثُمَّ يُصَلِّي [رَكْعَتَيْنِ]، ثُمَّ يَسْتَغْفِرُ اللَّهَ، إِلَّا غَفَرَ اللَّهُ لَهُ»
                </p>
                <p className="text-[11px] text-emerald-200/70">
                  ثم قرأ قوله تعالى: ﴿وَالَّذِينَ إِذَا فَعَلُوا فَاحِشَةً أَوْ ظَلَمُوا أَنفُسَهُمْ ذَكَرُوا اللَّهَ فَاسْتَغْفَرُوا لِذُنُوبِهِمْ وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ﴾ [آل عمران: 135]. (رواه الترمذي وأبو داود وصححه الألباني).
                </p>
              </div>
            </div>

            {/* Conditions of True Repentance (شروط التوبة النصوح) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>أركان وشروط التوبة النصوح الصادقة</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { num: '١', title: 'الإِقْلَاعُ عَنِ الذَّنْبِ فَوْراً', desc: 'ترك المعصية ومجانبة أسبابها ودواعيها فوراً ابتغاء وجه الله.' },
                  { num: '٢', title: 'النَّدَمُ الصَّادِقُ عَلَى مَا فَاتَ', desc: 'استشعار عظمة الله والتحسر على التقصير ومخالفة أمره.' },
                  { num: '٣', title: 'العَزْمُ الأَكِيدُ عَلَى عَدَمِ العَوْدَةِ', desc: 'عقد نية جازمة وصادقة بعدم الرجوع إلى المعصية أبداً.' },
                  { num: '٤', title: 'رَدُّ المَظَالِمِ إِلَى أَهْلِهَا', desc: 'إذا كان الذنب متعلقاً بحقوق العباد (مال، عرض، مظلمة) فيجب إبراؤها.' },
                ].map(cond => (
                  <div key={cond.num} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-[10px]">
                        {cond.num}
                      </span>
                      <h4 className="font-black text-slate-900 dark:text-white">{cond.title}</h4>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      {cond.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Step-by-Step Prayer Companion */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-teal-600" />
                    <span>كيفية أداء صلاة التوبة (خطوة بخطوة)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    اضغط على كل خطوة لتأكيد إتمامها بخشوع
                  </p>
                </div>

                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                  {completedSteps.length} / 5 خطوات
                </span>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {[
                  {
                    step: 1,
                    title: 'الخطوة الأولى: الطهارة وإسباغ الوضوء',
                    desc: 'قم فتوضأ وضوءاً حسناً سابغاً بنية التطهر من الذنوب والخطايا، مستحضراً خروج الذنوب مع قطرات الماء.',
                    dua: '«أشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمداً عبده ورسوله، اللهم اجعلني من التوابين واجعلني من المتطهرين».'
                  },
                  {
                    step: 2,
                    title: 'الخطوة الثانية: صلاة ركعتين خاشعتين منفردتين',
                    desc: 'استقبل القبلة وانوِ صلاة ركعتي التوبة (نافلة مستحبة). صلّهما في خلوة وسكينة دون أن تُحدّث فيهما نفسك بشيء من أمور الدنيا.',
                    dua: 'تقرأ فيهما الفاتحة وما تيسر لك من القرآن الكريم بخشوع وتدبر.'
                  },
                  {
                    step: 3,
                    title: 'الخطوة الثالثة: إطالة السجود والدعاء بالندم',
                    desc: 'أقرب ما يكون العبد من ربه وهو ساجد. اعترف بضعفك وذنبك وابكِ أو تباكِ بين يدي الله معتذراً نادماً.',
                    dua: '«اللهم اغفر لي ذنبي كله دقه وجله وأوله وآخره وعلانيته وسره، ربي إني ظلمت نفسي ظلماً كثيراً فاغفر لي فإنه لا يغفر الذنوب إلا أنت».'
                  },
                  {
                    step: 4,
                    title: 'الخطوة الرابعة: التسليم والجلوس للاستغفار',
                    desc: 'بعد التسليم من الصلاة، الزم مصلاك واجلس مستقبلاً القبلة وادعُ بسيد الاستغفار وأدعية التوبة المأثورة.',
                    dua: '«اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت، أبوء لك بنعمتك علي وأبوء لك بذنبي فاغفر لي».'
                  },
                  {
                    step: 5,
                    title: 'الخطوة الخامسة: الصدقة والاستكثار من العمل الصالح',
                    desc: 'يُستحب للمصلي بعد صلاة التوبة أن يُعقّبها بصدقة ولو يسيرة وعمل صالح يمحو أثر الذنب (إن الحسنات يذهبن السيئات).',
                    dua: '«رب تقبل توبتي، واغسل حوبتي، وأجب دعوتي، وثبت حجتي، واهد قلبي، وسدد لساني، واسلل سخيمة قلبي».'
                  }
                ].map((item) => {
                  const isChecked = completedSteps.includes(item.step);
                  return (
                    <div
                      key={item.step}
                      onClick={() => toggleStep(item.step)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer space-y-2",
                        isChecked 
                          ? "bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white" 
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-colors",
                            isChecked ? "bg-emerald-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          )}>
                            {item.step}
                          </div>
                          <h4 className="text-sm font-black">{item.title}</h4>
                        </div>

                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center border transition-colors",
                          isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"
                        )}>
                          {isChecked && <Check size={12} />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-9">
                        {item.desc}
                      </p>

                      <div className="pr-9 pt-1">
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300" style={{ fontFamily: "'Amiri', serif" }}>
                          {item.dua}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Log Prayer Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setTawbahPrayerLogged(true);
                    setCompletedSteps([1, 2, 3, 4, 5]);
                    setTimeout(() => setTawbahPrayerLogged(false), 4000);
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
                >
                  <ShieldCheck size={20} />
                  <span>تَسْجِيلُ إِقَامَةِ صَلَاةِ التَّوْبَةِ الآن</span>
                </button>

                {tawbahPrayerLogged && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-black text-center"
                  >
                    تقبل الله توبتك وصالح عملك وغفر ذنبك ورزقك الثبات والسكينة!
                  </motion.div>
                )}
              </div>
            </div>

            {/* Questions & Fatawa about Salat al Tawbah */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-amber-500" />
                <span>مسائل وأحكام مهمة حول صلاة التوبة</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">س: هل لصلاة التوبة وقت محدد؟</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    ج: تُشرع صلاة التوبة في أي وقت ليلًا أو نهارًا بمجرد وقوع الذنب، وأفضل أوقاتها الثلث الأخير من الليل (وقت السحر).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white">س: هل تُعاد صلاة التوبة إذا تكرر الذنب؟</p>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    ج: نعم، كلما أذنب العبد شُرع له أن يتوب ويصلي ركعتين، فإن الله تعالى غفور رحيم لا يمل من المغفرة حتى يمل العبد من الاستغفار.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: VIRTUES, HADITHS & THE BLESSINGS OF REPENTANCE                    */}
        {/* ========================================================================= */}
        {mainView === 'virtues' && (
          <div className="space-y-5">
            
            {/* Top Ayat banner */}
            <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white rounded-3xl p-6 shadow-xl space-y-3 text-center border border-amber-400/30">
              <p className="text-xs uppercase tracking-widest text-amber-200 font-bold">نداء الله الكريم للتائبين</p>
              <h2 className="text-xl sm:text-2xl font-black leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
                ﴿قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ﴾
              </h2>
              <p className="text-[11px] text-amber-100/80 font-bold">[سورة الزمر: 53]</p>
            </div>

            {/* Virtues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: 'محبة الله تعالى للتائبين',
                  desc: '﴿إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ﴾ — توبة العبد تجلب له أعظم وسام وهو محبة خالق الكون.',
                  icon: Heart,
                  color: 'text-rose-500 bg-rose-500/10'
                },
                {
                  title: 'فرح الله العظيم بتوبة عبده',
                  desc: 'قال ﷺ: «لَلَّهُ أَشَدُّ فَرَحًا بِتَوْبَةِ عَبْدِهِ حِينَ يَتُوبُ إِلَيْهِ، مِنْ أَحَدِكُمْ كَانَ عَلَى رَاحِلَتِهِ بِأَرْضِ فَلَاةٍ فَانْفَلَتَتْ مِنْهُ...»',
                  icon: Sparkles,
                  color: 'text-amber-500 bg-amber-500/10'
                },
                {
                  title: 'تبديل السيئات حسنات',
                  desc: '﴿إِلَّا مَن تَابَ وَآمَنَ وَعَمِلَ عَمَلًا صَالِحًا فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ﴾ — فضل عظيم لا يتصوره عقل!',
                  icon: Star,
                  color: 'text-emerald-500 bg-emerald-500/10'
                },
                {
                  title: 'نزول البركات وسعة الأرزاق',
                  desc: '﴿فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا * يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا * وَيُمْدِدْكُم بِأَمْوَالٍ وَبَنِينَ﴾',
                  icon: Droplets,
                  color: 'text-sky-500 bg-sky-500/10'
                },
                {
                  title: 'تفريج الهموم ومخارج الضيق',
                  desc: 'قال ﷺ: «مَنْ لَزِمَ الِاسْتِغْفَارَ جَعَلَ اللَّهُ لَهُ مِنْ كُلِّ هَمٍّ فَرَجًا، وَمِنْ كُلِّ ضِيقٍ مَخْرَجًا، وَرَزَقَهُ مِنْ حَيْثُ لَا يَحْتَسِبُ».',
                  icon: ShieldCheck,
                  color: 'text-teal-500 bg-teal-500/10'
                },
                {
                  title: 'الأمان من العذاب وسكينة القلب',
                  desc: '﴿وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ﴾ — الاستغفار هو صمام الأمان الباقي للبشرية بعد وفاة النبي ﷺ.',
                  icon: Crown,
                  color: 'text-indigo-500 bg-indigo-500/10'
                }
              ].map((virtue, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", virtue.color)}>
                      <virtue.icon size={16} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{virtue.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {virtue.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Practical Advice for Ongoing Istighfar */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-lg">
              <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <Flame size={16} />
                <span>نصائح عملية للتائب والمستغفر</span>
              </h3>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed list-disc list-inside">
                <li>عاهد نفسك على الاستغفار 100 مرة على الأقل يومياً في طريقك أو فراغك.</li>
                <li>اجعل سيد الاستغفار وردك الصباحي والمسائي الذي لا تتركه أبداً.</li>
                <li>إذا زللت بذنب، فبادر مباشرة بركعتي التوبة ولا تسوّف، فالشيطان يرجو تأجيل توبتك.</li>
                <li>تذكر دائماً أن رحمة الله أوسع من كل ذنوبك، وأن التوبة تجبّ ما قبلها تماماً.</li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Istighfar;
