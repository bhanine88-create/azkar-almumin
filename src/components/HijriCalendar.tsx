import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment-hijri';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Info, 
  Sparkles, 
  Clock, 
  Compass, 
  Star, 
  BookOpen, 
  AlertCircle, 
  ArrowRight,
  Bookmark,
  Heart,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { BackButton } from './ui/BackButton';
import { useAppContext } from '../AppContext';
import { cn } from '../lib/utils';
import { useSmartNavigation } from "../lib/navigation";

// Define a structured event interface
interface IslamicEvent {
  id: string;
  name: string;
  month: number; // 1-indexed (1-12)
  day?: number;  // Specific day (if undefined, matches whole month)
  dayRange?: [number, number]; // Optional day range
  description: string;
  recommendation?: string;
  type: 'holiday' | 'fasting' | 'spiritual';
  colorClass: string;
}

// Full list of key Islamic calendar events
const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    id: 'hijri_new_year',
    name: 'رأس السنة الهجرية',
    month: 1,
    day: 1,
    description: 'بداية العام الهجري الجديد وذكرى هجرة النبي ﷺ من مكة إلى المدينة المنورة.',
    recommendation: 'التفكر والتدبر في العبر المستفادة من الهجرة النبوية المباركة وتجديد النية للعام الجديد.',
    type: 'spiritual',
    colorClass: 'bg-indigo-500'
  },
  {
    id: 'ashura_eve',
    name: 'تاسوعاء (٩ محرم)',
    month: 1,
    day: 9,
    description: 'اليوم التاسع من شهر محرم الحرام ويستحب صيامه مع يوم عاشوراء مخالفة لليهود.',
    recommendation: 'صيام تاسوعاء وعاشوراء كفارة لذنوب سنة ماضية.',
    type: 'fasting',
    colorClass: 'bg-emerald-500'
  },
  {
    id: 'ashura',
    name: 'يوم عاشوراء (١٠ محرم)',
    month: 1,
    day: 10,
    description: 'اليوم الذي نجى الله فيه موسى عليه السلام وقومه من فرعون وجنوده، ويعد صيامه كفارة لسنة ماضية.',
    recommendation: 'يُسن صيام هذا اليوم شكراً لله تعالى واقتداءً بالرسول ﷺ.',
    type: 'fasting',
    colorClass: 'bg-emerald-600'
  },
  {
    id: 'prophets_birthday',
    name: 'المولد النبوي الشريف',
    month: 3,
    day: 12,
    description: 'ذكرى ميلاد خاتم الأنبياء والمرسلين نبينا محمد ﷺ.',
    recommendation: 'كثرة الصلاة والسلام على النبي ﷺ، ودراسة سيرته العطرة والتخلق بأخلاقه الفاضلة.',
    type: 'spiritual',
    colorClass: 'bg-indigo-500'
  },
  {
    id: 'isra_miraj',
    name: 'ليلة الإسراء والمعراج',
    month: 7,
    day: 27,
    description: 'الرحلة الإعجازية للنبي ﷺ من المسجد الحرام إلى المسجد الأقصى ثم عروجه إلى السماوات العلا وفرض الصلاة.',
    recommendation: 'تعظيم شأن الصلاة المكتوبة، والمحافظة عليها في أوقاتها بخشوع وحضور قلب.',
    type: 'spiritual',
    colorClass: 'bg-indigo-500'
  },
  {
    id: 'shaban_mid',
    name: 'ليلة النصف من شعبان',
    month: 8,
    day: 15,
    description: 'ليلة مباركة تم فيها تحويل القبلة من بيت المقدس إلى الكعبة المشرفة في مكة المكرمة.',
    recommendation: 'الاستغفار، والدعاء، وتصفية القلوب من الشحناء والبغضاء تهيئة لاستقبال رمضان.',
    type: 'spiritual',
    colorClass: 'bg-purple-500'
  },
  {
    id: 'ramadan_start',
    name: 'بداية شهر رمضان المبارك',
    month: 9,
    day: 1,
    description: 'بداية شهر الصيام والقيام والقرآن، وهو أفضل شهور السنة وفيه تفتح أبواب الجنان وتغلق أبواب النيران.',
    recommendation: 'صيام نهار رمضان، قيام ليله، تلاوة القرآن بكثرة، وتجنب اللغو والمعاصي.',
    type: 'fasting',
    colorClass: 'bg-teal-600'
  },
  {
    id: 'badr_battle',
    name: 'غزوة بدر الكبرى (١٧ رمضان)',
    month: 9,
    day: 17,
    description: 'المعركة الحاسمة الأولى في الإسلام والتي انتصر فيها الحق على الباطل بفضل الله وتأييده بنزول الملائكة.',
    recommendation: 'استذكار الصبر والثبات وجهاد الصحابة لنشر الهدى والإيمان.',
    type: 'spiritual',
    colorClass: 'bg-blue-500'
  },
  {
    id: 'laylat_al_qadr',
    name: 'العشر الأواخر من رمضان وتحري ليلة القدر',
    month: 9,
    dayRange: [21, 30],
    description: 'أعظم ليالي العام على الإطلاق، وفيها ليلة القدر التي هي خير من ألف شهر والتي نزل فيها القرآن.',
    recommendation: 'الاجتهاد في العبادة، إحياء الليل بالصلاة والدعاء والذكر، وتلاوة قوله تعالى: "اللهم إنك عفو تحب العفو فاعف عني".',
    type: 'spiritual',
    colorClass: 'bg-rose-500'
  },
  {
    id: 'eid_fitr_eve',
    name: 'ليلة عيد الفطر وتكبيرات العيد',
    month: 9,
    day: 30,
    description: 'آخر ليلة في رمضان، يستحب فيها إخراج زكاة الفطر وتكبير الله والتهيؤ لعيد الفطر المبارك.',
    recommendation: 'أداء زكاة الفطر قبل صلاة العيد، وإحياء الليلة بالتكبير والشكر لله على تمام الصيام.',
    type: 'spiritual',
    colorClass: 'bg-amber-500'
  },
  {
    id: 'eid_fitr',
    name: 'عيد الفطر المبارك',
    month: 10,
    day: 1,
    description: 'يوم الجائزة والبهجة للمسلمين بعد إتمام صيام شهر رمضان المبارك. يحرم صيام هذا اليوم.',
    recommendation: 'التكبير والتهليل، الاغتسال والتطيب ولبس الجديد، شهود صلاة العيد، وتوطيد صلة الأرحام والتبسم في وجوه الناس.',
    type: 'holiday',
    colorClass: 'bg-amber-600'
  },
  {
    id: 'shawwal_six',
    name: 'أيام الست من شوال',
    month: 10,
    dayRange: [2, 7],
    description: 'يُندب صيام ستة أيام من شهر شوال، فمن صام رمضان ثم أتبعه بست من شوال كان كصيام الدهر.',
    recommendation: 'المبادرة لصيام الست لمضاعفة الأجر، ويمكن صيامها متفرقة أو متتالية طوال الشهر.',
    type: 'fasting',
    colorClass: 'bg-emerald-500'
  },
  {
    id: 'hajj_ten',
    name: 'عشر ذي الحجة',
    month: 12,
    dayRange: [1, 9],
    description: 'أفضل أيام الدنيا، العمل الصالح فيها أحب إلى الله من جهاد في سبيله، وهي أيام مباركة يُضاعف فيها الأجر.',
    recommendation: 'الإكثار من التهليل والتكبير والتحميد، الصيام لمن يستطيع، والصدقة والعمل الصالح.',
    type: 'spiritual',
    colorClass: 'bg-yellow-600'
  },
  {
    id: 'arafah',
    name: 'يوم عرفة (٩ ذو الحجة)',
    month: 12,
    day: 9,
    description: 'أعظم أيام الحج وركنه الأكبر، وصيامه لغير الحاج يكفر ذنوب السنة الماضية والسنة القادمة وهو يوم إجابة الدعوات وعتق الرقاب.',
    recommendation: 'صيام هذا اليوم العظيم والإكثار من الدعاء وقول: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير".',
    type: 'fasting',
    colorClass: 'bg-emerald-700'
  },
  {
    id: 'eid_adha',
    name: 'عيد الأضحى المبارك (يوم النحر)',
    month: 12,
    day: 10,
    description: 'يوم النحر وأعظم الأيام عند الله، ذكرى امتثال الخليل إبراهيم عليه السلام لأمر ربه وذبح الأضحية فداء لإسماعيل عليه السلام.',
    recommendation: 'شهود صلاة العيد، الإكثار من التكبير، ذبح الأضاحي وتوزيعها على الفقراء والمحتاجين، وصلة الأرحام.',
    type: 'holiday',
    colorClass: 'bg-amber-600'
  },
  {
    id: 'tashreeq_days',
    name: 'أيام التشريق الثلاثة',
    month: 12,
    dayRange: [11, 13],
    description: 'الأيام الثلاثة التالية لعيد الأضحى (١١، ١٢، ١٣ ذو الحجة)، وهي أيام أكل وشرب وذكر لله تعالى ولا يجوز صيامها.',
    recommendation: 'الإكثار من التكبير المقيد دبر الصلوات المكتوبة، وتوسيع العطاء على الأهل والأولاد بالمعروف.',
    type: 'spiritual',
    colorClass: 'bg-orange-500'
  }
];

// Names of Hijri Months
const HIJRI_MONTHS = [
  "محرم", "صفر", "ربيع الأول", "ربيع الآخر", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

// Names of Gregorian Months
const GREGORIAN_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", 
  "مايو", "يونيو", "يوليو", "أغسطس", 
  "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

// Weekday Names starting from Sunday (الأحد)
const WEEKDAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Define the suggested athkar helper
interface OccasionDhikr {
  text: string;
  virtue: string;
  target: number;
}

const GET_OCCASION_ATHKAR = (eventId: string): OccasionDhikr[] => {
  switch (eventId) {
    case 'hijri_new_year':
      return [
        {
          text: "اللَّهُمَّ أَنْتَ الأَبَدِيُّ القَدِيمُ، وَهَذَا عَامٌ جَدِيدٌ، أَسْأَلُكَ فِيهِ العِصْمَةَ مِنَ الشَّيْطَانِ، وَالعَوْنَ عَلَى هَذِهِ النَّفْسِ الأَمَّارَةِ بِالسُّوءِ، وَالاشْتِغَالَ بِمَا يُقَرِّبُنِي إِلَيْكَ زُلْفَى.",
          virtue: "دعاء مأثور لاستقبال العام الهجري الجديد لتجديد العهد والنية الصالحة مع الله.",
          target: 3
        },
        {
          text: "أَسْتَغْفِرُ اللهَ العَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الحَيُّ القَيُّومُ وَأَتُوبُ إِلَيْهِ.",
          virtue: "الاستغفار لتطهير صحيفة العام الفائت وبداية صفحة جديدة نقية.",
          target: 100
        }
      ];
    case 'ashura_eve':
      return [
        {
          text: "اللَّهُمَّ يَا خَالِقَ كُلِّ شَيْءٍ، نَجَّيْتَ مُوسَى بِقُدْرَتِكَ، فَأَسْأَلُكَ أَنْ تُنَجِّيَنِي مِنَ الكُرُبَاتِ وَالضِّيقِ وَتَغْفِرَ لِي ذُنُوبِي.",
          virtue: "دعاء ليلة تاسوعاء المباركة لطلب النجاة والغفران.",
          target: 3
        },
        {
          text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
          virtue: "إحياء الليلة بالتوحيد والذكر العظيم.",
          target: 100
        }
      ];
    case 'ashura':
      return [
        {
          text: "الْحَمْدُ للهِ كَثِيرًا، وَالْحَمْدُ للهِ الَّذِي نَجَّى مُوسَى وَقَوْمَهُ وَأَذَلَّ فِرْعَوْنَ وَجُنُودَهُ، اللَّهُمَّ كَمَا نَجَّيْتَهُمْ فَانْصُرْنَا عَلَى أَنْفُسِنَا وَشَهَوَاتِنَا.",
          virtue: "دعاء يوم عاشوراء شكراً لله على النجاة والنصر والتمكين.",
          target: 7
        },
        {
          text: "سُبْحَانَ اللهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
          virtue: "تسبيح مضاعف الأجر في يوم عاشوراء العظيم.",
          target: 33
        }
      ];
    case 'prophets_birthday':
      return [
        {
          text: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي العَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ.",
          virtue: "الصلاة الإبراهيمية على صاحب الذكرى ﷺ لنيل شفاعته ومحبته وقرب المجلس منه يوم القيامة.",
          target: 100
        },
        {
          text: "اللَّهُمَّ اجْعَلْنَا مِمَّنْ يَقْتَفِي أَثَرَهُ، وَيَتَخَلَّقُ بِأَخْلَاقِهِ، وَيَرِدُ حَوْضَهُ، وَيَسْقِي مِنْ يَدِهِ الشَّرِيفَةِ شَرْبَةً لَا نَظْمَأُ بَعْدَهَا أَبَدًا.",
          virtue: "دعاء للمحبة والاتباع والثبات على سنته الشريفة ﷺ.",
          target: 10
        }
      ];
    case 'isra_miraj':
      return [
        {
          text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِعَظَمَةِ هَذِهِ اللَّيْلَةِ وَمَعْرِجِ نَبِيِّكَ ﷺ أَنْ تُعْلِيَ مَقَامِي، وَتَشْرَحَ صَدْرِي، وَتُيَسِّرَ أَمْرِي، وَتَجْعَلَ الصَّلَاةَ قُرَّةَ عَيْنِي فِي الدُّنْيَا وَالآخِرَةِ.",
          virtue: "دعاء ليلة المعراج المباركة لطلب الهداية وتعظيم قدر الصلاة المكتوبة.",
          target: 5
        },
        {
          text: "سُبْحَانَ اللهِ، وَالحَمْدُ للهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ العَلِيِّ العَظِيمِ.",
          virtue: "الباقيات الصالحات وغراس الجنة لتسبيح الخالق وعظمته.",
          target: 100
        }
      ];
    case 'shaban_mid':
      return [
        {
          text: "اللَّهُمَّ يَا ذَا المَنِّ وَلَا يُمَنُّ عَلَيْهِ، يَا ذَا الجَلَالِ وَالإِكْرَامِ، يَا ذَا الطَّوْلِ وَالإِنْعَامِ، لَا إِلَهَ إِلَّا أَنْتَ ظَهْرَ اللَّاجِئِينَ، وَجَارَ المُسْتَجِيرِينَ، وَأَمَانَ الخَائِفِينَ. اللَّهُمَّ اكْتُبْنَا عِنْدَكَ مِنَ السُّعَدَاءِ المَقْبُولِينَ.",
          virtue: "دعاء النصف من شعبان المشهور لطلب تحويل الأقدار وسعة الرزق والقبول الغامر.",
          target: 3
        },
        {
          text: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.",
          virtue: "دعاء ذي النون للاستغفار وتفريج الكربات في ليلة الرحمة والمغفرة.",
          target: 100
        }
      ];
    case 'ramadan_start':
      return [
        {
          text: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِاليُمْنِ وَالإِيمَانِ، وَالسَّلَامَةِ وَالإِسْلَامِ، هِلَالَ رُشْدٍ وَخَيْرٍ، رَبِّي وَرَبُّكَ اللهُ. اللَّهُمَّ سَلِّمْنَا لِرَمَضَانَ وَسَلِّمْ رَمَضَانَ لَنَا وَتَسَلَّمْهُ مِنَّا مُتَقَبَّلًا.",
          virtue: "دعاء رؤية الهلال ودخول شهر رمضان المبارك لاستجلاب البركة والسلامة.",
          target: 3
        },
        {
          text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
          virtue: "الاستغاثة بالله لطلب العون على الصيام والقيام وصالح الأعمال.",
          target: 10
        }
      ];
    case 'badr_battle':
      return [
        {
          text: "اللَّهُمَّ مُنْزِلَ الكِتَابِ، سَرِيعَ الحِسَابِ، اهْزِمِ الأَحْزَابَ، اللَّهُمَّ اهْزِمْهُمْ وَزَلْزِلْهُمْ، وَانْصُرْنَا عَلَى شَهَوَاتِنَا وَأَعْدَائِنَا كَمَا نَصَرْتَ أَهْلَ بَدْرٍ.",
          virtue: "دعاء النصر والثبات مستلهماً من يوم بدر الفارق.",
          target: 3
        },
        {
          text: "حَسْبُنَا اللهُ وَنَعِمَ الوَكِيلُ.",
          virtue: "كلمة المؤمنين للتوكل والتفويض الكامل لله في دفع الكروب والشدائد.",
          target: 100
        }
      ];
    case 'laylat_al_qadr':
      return [
        {
          text: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ العَفْوَ فَاعْفُ عَنِّي.",
          virtue: "أعظم دعاء في ليلة القدر علّمه النبي ﷺ لأم المؤمنين عائشة رضي الله عنها.",
          target: 100
        },
        {
          text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الرِّضَا وَالجَنَّةَ، وَأَعُوذُ بِكَ مِنْ سَخَطِكَ وَالنَّارِ، اللَّهُمَّ أَعْتِقْ رِقَابَنَا وَرِقَابَ آبَائِنَا مِنَ النَّارِ.",
          virtue: "دعاء العتق من النار والفوز بأعلى درجات الجنان في العشر الأواخر.",
          target: 10
        }
      ];
    case 'eid_fitr_eve':
      return [
        {
          text: "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَللهِ الحَمْدُ.",
          virtue: "صيغة التكبير المشروعة في ليلة العيد لإعلان تعظيم الله وشكره على إتمام العبادة.",
          target: 33
        },
        {
          text: "اللَّهُمَّ تَقَبَّلْ مِنَّا صِيَامَنَا وَقِيَامَنَا وَصَالِحَ أَعْمَالِنَا، وَلَا تَجْعَلْنَا مِنَ المَحْرُومِينَ مِنْ جَوَائِزِ هَذَا الشَّهْرِ الكَرِيمِ.",
          virtue: "دعاء الختام والقبول ليلة الجائزة.",
          target: 10
        }
      ];
    case 'eid_fitr':
      return [
        {
          text: "تَقَبَّلَ اللهُ مِنَّا وَمِنْكُمْ صَالِحَ الأَعْمَالِ، وَكُلُّ عَامٍ وَأَنْتُمْ إِلَى اللهِ أَقْرَبُ وَعَلَى طَاعَتِهِ أَدْوَمُ.",
          virtue: "تهنئة العيد المباركة والدعاء بالقبول المتبادل بين المؤمنين.",
          target: 10
        },
        {
          text: "الْحَمْدُ للهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ، الحَمْدُ للهِ عَلَى تَمَامِ النِّعْمَةِ وَبُلُوغِ المَغْفِرَةِ.",
          virtue: "حمد الله على إتمام الطاعة وبلوغ العيد في أتم صحة وعافية.",
          target: 33
        }
      ];
    case 'shawwal_six':
      return [
        {
          text: "اللَّهُمَّ أَعِنَّا عَلَى صِيَامِ الستِّ مِنْ شَوَّالٍ وَتَقَبَّلْهَا مِنَّا، وَاجْعَلْ صِيَامَنَا صِيَامَ الدَّهْرِ مَقْبُولًا عِنْدَكَ يَا أَرْحَمَ الرَّاحِمِينَ.",
          virtue: "دعاء تيسير صيام الست ومضاعفة الأجر كصيام سنة كاملة.",
          target: 3
        },
        {
          text: "يَا مُقَلِّبَ القُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.",
          virtue: "دعاء الثبات والمداومة على الطاعات والعبادات بعد رمضان.",
          target: 33
        }
      ];
    case 'hajj_ten':
      return [
        {
          text: "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَللهِ الحَمْدُ.",
          virtue: "التكبير المطلق المسنون في عشر ذي الحجة العظيمة لملء الكون تعظيماً لله.",
          target: 100
        },
        {
          text: "سُبْحَانَ اللهِ، وَالْحَمْدُ للهِ، وَلَا إِلَهَ إِلَّا اللهُ، وَاللهُ أَكْبَرُ.",
          virtue: "أحب الكلام إلى الله وأفضله عياراً في أفضل أيام الدنيا.",
          target: 100
        }
      ];
    case 'arafah':
      return [
        {
          text: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
          virtue: "أفضل الدعاء في يوم عرفة العظيم، وهو دعاء النبي ﷺ والأنبياء قبله.",
          target: 100
        },
        {
          text: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ، وَأَعْتِقْ رَقَبَتِي مِنَ النَّارِ.",
          virtue: "دعاء الاستغفار والعتق لطلب المغفرة والرحمة الشاملة في يوم التنزّل الإلهي.",
          target: 10
        }
      ];
    case 'eid_adha':
      return [
        {
          text: "اللَّهُمَّ هَذَا مِنْكَ وَإِلَيْكَ، اللَّهُمَّ تَقَبَّلْ ضَحَايَانَا وَصَالِحَ أَعْمَالِنَا، وَاجْعَلْهُ عِيدًا مَلِيئًا بِالرَّحْمَةِ وَالبَرَكَةِ.",
          virtue: "دعاء يوم النحر والتقرب لله بالذبح والنسك والصدقة والبهجة.",
          target: 3
        },
        {
          text: "اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، وَللهِ الحَمْدُ.",
          virtue: "تكبير العيد المبارك شكراً لله في يوم الحج الأكبر.",
          target: 33
        }
      ];
    case 'tashreeq_days':
      return [
        {
          text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.",
          virtue: "أفضل وأكثر دعاء كان يردده النبي ﷺ في أيام التشريق العظيمة.",
          target: 33
        },
        {
          text: "الْحَمْدُ للهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ كَمَا يُحِبُّ رَبُّنَا وَيَرْضَى.",
          virtue: "حمد الله وشكره في أيام الأكل والشرب والذكر والبهجة المسنونة.",
          target: 33
        }
      ];
    default:
      return [];
  }
};

// Component for single dhikr item with individual counter and copy button
const SingleDhikrCard: React.FC<{ dhikr: OccasionDhikr; index: number }> = ({ dhikr, index }) => {
  const [count, setCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleIncrement = () => {
    if (count < dhikr.target) {
      setCount(prev => prev + 1);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCount(0);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(dhikr.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCompleted = count >= dhikr.target;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative p-5 rounded-2xl border text-right transition-all select-none overflow-hidden",
        isCompleted 
          ? "bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/30 shadow-inner" 
          : "bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-500/20"
      )}
    >
      {/* Visual glowing aura for completed state */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      )}

      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-xl transition-all cursor-pointer",
              copied 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" 
                : "bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            )}
            title="نسخ النص"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          
          {count > 0 && (
            <button 
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              title="إعادة ضبط العداد"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
          العدد المستهدف: {dhikr.target}
        </span>
      </div>

      <p className="font-adhkar text-base text-slate-800 dark:text-slate-100 font-extrabold text-center leading-relaxed py-2" dir="rtl">
        {dhikr.text}
      </p>

      {dhikr.virtue && (
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 leading-normal border-t border-slate-50 dark:border-slate-800/60 pt-2.5 mt-2.5">
          💡 <span className="font-extrabold text-slate-500 dark:text-slate-400">فضل الذكر:</span> {dhikr.virtue}
        </p>
      )}

      {/* Interactive tap zone or completed checkmark */}
      <div className="mt-4 flex items-center justify-center">
        {isCompleted ? (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.1, 1] }}
            className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs bg-emerald-500/10 px-4 py-2 rounded-xl"
          >
            <Check size={16} className="stroke-[3]" />
            <span>تم إتمام الذكر، تقبل الله منك!</span>
          </motion.div>
        ) : (
          <button
            onClick={handleIncrement}
            className="w-full py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-between border cursor-pointer bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/80 border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 active:scale-[0.98]"
          >
            <span className="flex items-center gap-1.5">
              <span>📿</span>
              <span>اضغط للتسبيح</span>
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 min-w-[32px] text-left">
              {count} / {dhikr.target}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const EventAthkarSection: React.FC<{ eventId: string }> = ({ eventId }) => {
  const athkarList = useMemo(() => GET_OCCASION_ATHKAR(eventId), [eventId]);

  if (athkarList.length === 0) return null;

  return (
    <div className="mt-4 space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
        <h5 className="font-extrabold text-xs text-slate-700 dark:text-slate-300">أذكار وأدعية مسنونة ومستحبة في هذه المناسبة:</h5>
      </div>
      <div className="space-y-3">
        {athkarList.map((dhikr, idx) => (
          <SingleDhikrCard key={idx} dhikr={dhikr} index={idx} />
        ))}
      </div>
    </div>
  );
};

export const HijriCalendar: React.FC = () => {
  const { navigate } = useSmartNavigation();
  const { settings, updateSettings } = useAppContext();
  
  // View mode state
  const [viewMode, setViewMode] = useState<'hijri' | 'gregorian'>('hijri');

  // States for Hijri year and month
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const today = moment();
    if (settings.hijriOffset) today.add(settings.hijriOffset, 'days');
    return today.iYear();
  });
  
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const today = moment();
    if (settings.hijriOffset) today.add(settings.hijriOffset, 'days');
    return today.iMonth(); // 0-indexed
  });

  // States for Gregorian year and month
  const [gregorianYear, setGregorianYear] = useState<number>(() => {
    return new Date().getFullYear();
  });

  const [gregorianMonth, setGregorianMonth] = useState<number>(() => {
    return new Date().getMonth(); // 0-indexed (0-11)
  });
  
  // Selected day detail
  const [selectedDay, setSelectedDay] = useState<{
    hijriDay: number;
    hijriMonth: number;
    hijriYear: number;
    gregorianStr: string;
    dayOfWeekName: string;
    events: IslamicEvent[];
    isWhiteDay: boolean;
    isMondayOrThursday: boolean;
  } | null>(() => {
    const today = moment();
    if (settings.hijriOffset) today.add(settings.hijriOffset, 'days');
    
    const iDay = today.iDate();
    const iMonth = today.iMonth();
    const iYear = today.iYear();
    
    // Check if white day
    const isWhiteDay = [13, 14, 15].includes(iDay);
    
    // Check weekday
    const weekdayNum = today.day();
    const isMondayOrThursday = weekdayNum === 1 || weekdayNum === 4;
    
    // Match events
    const matchingEvents = ISLAMIC_EVENTS.filter(ev => {
      if (ev.month !== iMonth + 1) return false;
      if (ev.day !== undefined) return ev.day === iDay;
      if (ev.dayRange) return iDay >= ev.dayRange[0] && iDay <= ev.dayRange[1];
      return true;
    });

    return {
      hijriDay: iDay,
      hijriMonth: iMonth,
      hijriYear: iYear,
      gregorianStr: new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(today.toDate()),
      dayOfWeekName: WEEKDAYS[today.day()],
      events: matchingEvents,
      isWhiteDay,
      isMondayOrThursday
    };
  });

  // Today state for highlighting
  const todayMoment = useMemo(() => {
    const today = moment();
    if (settings.hijriOffset) {
      today.add(settings.hijriOffset, 'days');
    }
    return today;
  }, [settings.hijriOffset]);

  // Adjust Hijri offset settings helper
  const adjustOffset = (amount: number) => {
    const newOffset = (settings.hijriOffset || 0) + amount;
    updateSettings({ hijriOffset: newOffset });
  };

  // Generate calendar cells
  const calendarDays = useMemo(() => {
    const days = [];
    
    if (viewMode === 'hijri') {
      // 1. Get the 1st day of the selected Hijri month as a moment object
      const firstOfMonth = moment()
        .iYear(currentYear)
        .iMonth(currentMonth)
        .iDate(1);
        
      // Get its weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const firstWeekday = firstOfMonth.day();
      
      // 2. Add padding cells for weekdays before the first of this month
      for (let p = 0; p < firstWeekday; p++) {
        days.push({ isPadding: true, key: `pad-hijri-${p}` });
      }
      
      // 3. Populate all valid days for this Hijri month
      for (let d = 1; d <= 30; d++) {
        const dayMoment = moment()
          .iYear(currentYear)
          .iMonth(currentMonth)
          .iDate(d);
          
        // If the date wraps around (meaning the month has 29 days and we are at 30), break
        if (dayMoment.iMonth() !== currentMonth) {
          break;
        }
        
        const weekdayNum = dayMoment.day();
        const isWhiteDay = [13, 14, 15].includes(d);
        const isMondayOrThursday = weekdayNum === 1 || weekdayNum === 4;
        const isFriday = weekdayNum === 5;
        
        // Match events for this day
        const events = ISLAMIC_EVENTS.filter(ev => {
          if (ev.month !== currentMonth + 1) return false;
          if (ev.day !== undefined) return ev.day === d;
          if (ev.dayRange) return d >= ev.dayRange[0] && d <= ev.dayRange[1];
          return true;
        });
        
        const isToday = todayMoment.iYear() === currentYear &&
                        todayMoment.iMonth() === currentMonth &&
                        todayMoment.iDate() === d;
                        
        days.push({
          isPadding: false,
          key: `day-${d}`,
          dayNum: d,
          gregorianDay: dayMoment.date(),
          gregorianMonthName: dayMoment.locale('ar-SA').format('MMM'),
          gregorianStr: new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(dayMoment.toDate()),
          dayOfWeekName: WEEKDAYS[weekdayNum],
          isToday,
          isWhiteDay,
          isMondayOrThursday,
          isFriday,
          events,
          momentObj: dayMoment.clone()
        });
      }
    } else {
      // Gregorian View Mode
      // 1. Get the first day of the Gregorian month
      const firstOfMonth = new Date(gregorianYear, gregorianMonth, 1);
      const firstWeekday = firstOfMonth.getDay();
      
      // 2. Add padding cells for weekdays before the first of this month
      for (let p = 0; p < firstWeekday; p++) {
        days.push({ isPadding: true, key: `pad-greg-${p}` });
      }
      
      // 3. Get total days in this Gregorian month
      const daysInMonth = new Date(gregorianYear, gregorianMonth + 1, 0).getDate();
      
      // 4. Generate all days
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(gregorianYear, gregorianMonth, d);
        const weekdayNum = dateObj.getDay();
        
        // Convert to Hijri using moment-hijri
        const dayMoment = moment(dateObj);
        if (settings.hijriOffset) {
          dayMoment.add(settings.hijriOffset, 'days');
        }
        
        const hDay = dayMoment.iDate();
        const hMonth = dayMoment.iMonth(); // 0-11
        const hYear = dayMoment.iYear();
        
        const isWhiteDay = [13, 14, 15].includes(hDay);
        const isMondayOrThursday = weekdayNum === 1 || weekdayNum === 4;
        const isFriday = weekdayNum === 5;
        
        // Match events for this Hijri date
        const events = ISLAMIC_EVENTS.filter(ev => {
          if (ev.month !== hMonth + 1) return false;
          if (ev.day !== undefined) return ev.day === hDay;
          if (ev.dayRange) return hDay >= ev.dayRange[0] && hDay <= ev.dayRange[1];
          return true;
        });
        
        const isToday = new Date().getFullYear() === gregorianYear &&
                        new Date().getMonth() === gregorianMonth &&
                        new Date().getDate() === d;
                        
        days.push({
          isPadding: false,
          key: `greg-day-${d}`,
          dayNum: d, // main large number is Gregorian day
          hijriDay: hDay,
          hijriMonthName: HIJRI_MONTHS[hMonth],
          gregorianStr: new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj),
          dayOfWeekName: WEEKDAYS[weekdayNum],
          isToday,
          isWhiteDay,
          isMondayOrThursday,
          isFriday,
          events,
          dayDetails: {
            hijriDay: hDay,
            hijriMonth: hMonth,
            hijriYear: hYear,
            gregorianStr: new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(dateObj),
            dayOfWeekName: WEEKDAYS[weekdayNum],
            events,
            isWhiteDay,
            isMondayOrThursday
          }
        });
      }
    }
    
    return days;
  }, [currentYear, currentMonth, gregorianYear, gregorianMonth, todayMoment, viewMode, settings.hijriOffset]);

  // Handle month navigation
  const prevMonth = () => {
    if (viewMode === 'hijri') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (gregorianMonth === 0) {
        setGregorianMonth(11);
        setGregorianYear(gregorianYear - 1);
      } else {
        setGregorianMonth(gregorianMonth - 1);
      }
    }
  };

  const nextMonth = () => {
    if (viewMode === 'hijri') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else {
      if (gregorianMonth === 11) {
        setGregorianMonth(0);
        setGregorianYear(gregorianYear + 1);
      } else {
        setGregorianMonth(gregorianMonth + 1);
      }
    }
  };

  // Set to today
  const jumpToToday = () => {
    setCurrentYear(todayMoment.iYear());
    setCurrentMonth(todayMoment.iMonth());
    setGregorianYear(new Date().getFullYear());
    setGregorianMonth(new Date().getMonth());
    
    const matchingEvents = ISLAMIC_EVENTS.filter(ev => {
      if (ev.month !== todayMoment.iMonth() + 1) return false;
      if (ev.day !== undefined) return ev.day === todayMoment.iDate();
      if (ev.dayRange) return todayMoment.iDate() >= ev.dayRange[0] && todayMoment.iDate() <= ev.dayRange[1];
      return true;
    });

    setSelectedDay({
      hijriDay: todayMoment.iDate(),
      hijriMonth: todayMoment.iMonth(),
      hijriYear: todayMoment.iYear(),
      gregorianStr: new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(todayMoment.toDate()),
      dayOfWeekName: WEEKDAYS[todayMoment.day()],
      events: matchingEvents,
      isWhiteDay: [13, 14, 15].includes(todayMoment.iDate()),
      isMondayOrThursday: todayMoment.day() === 1 || todayMoment.day() === 4
    });
  };

  // Handle day click
  const handleDayClick = (day: any) => {
    if (day.isPadding) return;
    
    if (viewMode === 'hijri') {
      setSelectedDay({
        hijriDay: day.dayNum,
        hijriMonth: currentMonth,
        hijriYear: currentYear,
        gregorianStr: day.gregorianStr,
        dayOfWeekName: day.dayOfWeekName,
        events: day.events,
        isWhiteDay: day.isWhiteDay,
        isMondayOrThursday: day.isMondayOrThursday
      });
    } else {
      setSelectedDay(day.dayDetails);
    }
  };

  // Upcoming major occasions (relative to current date)
  const upcomingOccasionsList = useMemo(() => {
    const list: { event: IslamicEvent; countdownDays: number; formattedHijri: string }[] = [];
    
    // We calculate countdown for each occasion for the current or next year
    ISLAMIC_EVENTS.forEach(ev => {
      let evYear = todayMoment.iYear();
      
      // Calculate day. If it's a range, take the first day
      const evDay = ev.day !== undefined ? ev.day : (ev.dayRange ? ev.dayRange[0] : 1);
      
      let evMoment = moment()
        .iYear(evYear)
        .iMonth(ev.month - 1)
        .iDate(evDay);
        
      // If the occasion has already passed in the current Hijri year, we look at next Hijri year
      if (evMoment.isBefore(todayMoment, 'day')) {
        evYear += 1;
        evMoment = moment()
          .iYear(evYear)
          .iMonth(ev.month - 1)
          .iDate(evDay);
      }
      
      const diffMs = evMoment.toDate().getTime() - todayMoment.toDate().getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      list.push({
        event: ev,
        countdownDays: diffDays,
        formattedHijri: `${evDay} ${HIJRI_MONTHS[ev.month - 1]} ${evYear} هـ`
      });
    });
    
    // Sort by remaining days
    return list.sort((a, b) => a.countdownDays - b.countdownDays).slice(0, 4);
  }, [todayMoment]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 text-right" dir="rtl">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4 px-4 flex justify-between items-center border-b border-black/5 z-20">
        <div className="flex items-center gap-3">
          <BackButton forceFallback={true} />
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">التقويم الهجري الإسلامي</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">المناسبات والعبادات والمواقيت الإيمانية</p>
          </div>
        </div>
        <button 
          onClick={jumpToToday}
          className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-500/20 active:scale-95 duration-75"
        >
          العودة لليوم
        </button>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* Quick Calibration Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">هل تختلف رؤية الهلال في بلدك؟</h4>
              <p className="text-[10px] font-bold text-slate-400 leading-normal">تستطيع ضبط التقويم يدوياً بزيادة أو إنقاص الأيام ليتطابق تماماً.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-black/5">
            <button 
              onClick={() => adjustOffset(-1)} 
              className="w-8 h-8 font-black bg-white dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg flex items-center justify-center text-xs text-rose-500 shadow-sm cursor-pointer"
              title="تأخير يوم"
            >
              -١
            </button>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 px-2.5 min-w-[50px] text-center">
              {settings.hijriOffset > 0 ? `+${settings.hijriOffset}` : settings.hijriOffset === 0 ? 'مظبوط' : settings.hijriOffset} يوم
            </span>
            <button 
              onClick={() => adjustOffset(1)} 
              className="w-8 h-8 font-black bg-white dark:bg-slate-950 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg flex items-center justify-center text-xs text-emerald-600 shadow-sm cursor-pointer"
              title="تقديم يوم"
            >
              +١
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-black/5">
          <button
            onClick={() => {
              setViewMode('hijri');
              // Trigger lightweight vibration/haptic feedback if available
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className={cn(
              "flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer outline-none select-none",
              viewMode === 'hijri'
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            عرض بالتقويم الهجري
          </button>
          <button
            onClick={() => {
              setViewMode('gregorian');
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className={cn(
              "flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer outline-none select-none",
              viewMode === 'gregorian'
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            عرض بالتقويم الميلادي
          </button>
        </div>

        {/* Calendar Core Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md p-6 space-y-6">
          {/* Month Navigator Header */}
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-black/5">
            <button 
              onClick={nextMonth} 
              className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center shadow-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              title="الشهر القادم"
            >
              <ChevronRight size={22} />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                {viewMode === 'hijri' 
                  ? `${HIJRI_MONTHS[currentMonth]} ${currentYear} هـ` 
                  : `${GREGORIAN_MONTHS[gregorianMonth]} ${gregorianYear} م`
                }
              </h2>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                {viewMode === 'hijri' 
                  ? `الشهر الهجري رقم ${currentMonth + 1}` 
                  : `الشهر الميلادي رقم ${gregorianMonth + 1}`
                }
              </p>
            </div>

            <button 
              onClick={prevMonth} 
              className="w-10 h-10 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center shadow-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              title="الشهر السابق"
            >
              <ChevronLeft size={22} />
            </button>
          </div>

          {/* Weekdays Row */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-black/5 dark:border-white/5 pb-2">
            {WEEKDAYS.map(day => (
              <span 
                key={day} 
                className={cn(
                  "text-[10px] font-black text-slate-400 uppercase tracking-widest",
                  day === "الجمعة" && "text-rose-500/80 dark:text-rose-400/80"
                )}
              >
                {day.substring(0, 6)}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day.isPadding) {
                return (
                  <div key={day.key} className="aspect-square bg-slate-50/20 dark:bg-slate-950/10 rounded-xl pointer-events-none" />
                );
              }

              const hasEvents = day.events && day.events.length > 0;
              const isSelected = selectedDay && (
                viewMode === 'hijri' 
                  ? (selectedDay.hijriDay === day.dayNum && 
                     selectedDay.hijriMonth === currentMonth && 
                     selectedDay.hijriYear === currentYear)
                  : (selectedDay.gregorianStr === day.gregorianStr)
              );

              return (
                <button
                  key={day.key}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "aspect-square rounded-2xl relative flex flex-col justify-between p-1.5 transition-all outline-none border cursor-pointer",
                    day.isToday 
                      ? "bg-gradient-to-b from-emerald-500 to-teal-700 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 hover:opacity-95"
                      : isSelected
                      ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold"
                      : day.isWhiteDay
                      ? "bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/30 text-sky-800 dark:text-sky-400"
                      : "bg-slate-50/60 dark:bg-slate-800/20 border-black/5 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100",
                    day.isFriday && !day.isToday && !isSelected && "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {/* Event indicator dot */}
                  {hasEvents && (
                    <span className={cn(
                      "absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full ring-2",
                      day.isToday ? "bg-white ring-emerald-600" : `${day.events[0].colorClass} ring-white dark:ring-slate-900`
                    )} />
                  )}

                  {/* Day Number */}
                  <span className={cn(
                    "text-sm font-black text-right block self-end",
                    day.isToday ? "text-white" : "text-slate-800 dark:text-slate-100"
                  )}>
                    {day.dayNum}
                  </span>

                  {/* Small Hijri or Gregorian equivalent */}
                  <span className={cn(
                    "text-[8px] font-bold text-left self-start block w-full leading-none truncate opacity-60",
                    day.isToday ? "text-white/80" : "text-slate-400 dark:text-slate-500"
                  )}>
                    {viewMode === 'hijri' 
                      ? `${day.gregorianDay} ${day.gregorianMonthName}` 
                      : `${day.hijriDay} ${day.hijriMonthName}`
                    }
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day details section */}
        <AnimatePresence mode="wait">
          {selectedDay && (
            <motion.div
              key={`${selectedDay.hijriYear}-${selectedDay.hijriMonth}-${selectedDay.hijriDay}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md p-6 space-y-5"
            >
              {/* Card Title & Full Date */}
              <div className="flex justify-between items-start border-b border-black/5 dark:border-white/5 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-800 dark:text-slate-100">
                    يوم {selectedDay.dayOfWeekName}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {selectedDay.gregorianStr}م
                  </p>
                </div>
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-2xl text-sm font-black">
                  {selectedDay.hijriDay} {HIJRI_MONTHS[selectedDay.hijriMonth]} {selectedDay.hijriYear} هـ
                </div>
              </div>

              {/* White Days / Spiritual highlights */}
              {(selectedDay.isWhiteDay || selectedDay.isMondayOrThursday) && (
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 shrink-0">
                    <Heart size={16} className="fill-sky-500/10" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-sky-900 dark:text-sky-300">يُستحب صيام هذا اليوم المبارك!</h4>
                    <p className="text-[10px] font-bold text-sky-700/80 dark:text-sky-400/80 leading-normal mt-0.5">
                      {selectedDay.isWhiteDay ? 'هذا اليوم من الأيام البيض الثلاثة (١٣، ١٤، ١٥) لشهر قمري مبارك.' : 'صيام يومي الإثنين والخميس سنة مؤكدة عن نبينا محمد ﷺ ترفع فيها الأعمال.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Special Occasion Details */}
              {selectedDay.events.length > 0 ? (
                <div className="space-y-4">
                  {selectedDay.events.map(ev => (
                    <div key={ev.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-black/5 dark:border-white/5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full", ev.colorClass)} />
                        <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">{ev.name}</h4>
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                          مناسبة {ev.type === 'holiday' ? 'إجازة وعيد' : ev.type === 'fasting' ? 'موسم صيام' : 'نفحة روحانية'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        {ev.description}
                      </p>

                      {ev.recommendation && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-500">💫</span>
                          <div>
                            <span className="font-black text-[11px] block mb-0.5">التوصية الروحانية والعمل الصالح:</span>
                            {ev.recommendation}
                          </div>
                        </div>
                      )}

                      {/* Display relevant Athkar and Duas for this occasion with active counters */}
                      <EventAthkarSection eventId={ev.id} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
                    <Bookmark size={14} />
                    لا توجد مناسبات سنوية عامة في هذا اليوم المحدد، وهو فرصة طيبة للأذكار الدائمة والتقرب إلى الله بفضائل الأعمال.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Spiritual Occasions List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-md p-6 space-y-4">
          <h3 className="text-base font-black flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-600" />
            المناسبات والنفحات الإيمانية القادمة
          </h3>
          <p className="text-[10px] font-bold text-slate-400 leading-normal mb-3">
            ترقّب مواسم الخيرات واستعد لها روحانياً لتنال عظيم الأجر والمغفرة.
          </p>

          <div className="space-y-3">
            {upcomingOccasionsList.map(({ event, countdownDays, formattedHijri }) => (
              <div 
                key={event.id}
                className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-black/5 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={cn("w-3 h-3 rounded-full shrink-0", event.colorClass)} />
                  <div className="text-right">
                    <h4 className="font-black text-xs text-slate-800 dark:text-slate-100">{event.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formattedHijri}</p>
                  </div>
                </div>
                
                <div className="text-left shrink-0">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                    متبقي {countdownDays} يوم
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
