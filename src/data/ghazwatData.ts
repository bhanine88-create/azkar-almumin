import { Shield, Sword, Map, Users, Crosshair, Flag } from 'lucide-react';

export interface Ghazwa {
  id: string;
  name: string;
  year: string;
  location: string;
  parties: {
    muslims: { leader: string; count: string; icon: any };
    enemy: { name: string; leader: string; count: string; icon: any };
  };
  result: string;
  description: string;
  icon: any;
  color: string;
}

export const GHAZWAT_DATA: Ghazwa[] = [
  {
    id: 'badr',
    name: 'غزوة بدر الكبرى',
    year: '2 هـ',
    location: 'آبار بدر',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '313 مقاتلاً', icon: Shield },
      enemy: { name: 'قريش', leader: 'أبو جهل', count: '1000 مقاتل', icon: Users },
    },
    result: 'انتصار حاسم للمسلمين',
    description: 'أول معركة فاصلة في الإسلام. أمد الله فيها المسلمين بملائكة تقاتل معهم، وكانت نتيجتها استشهاد 14 مسلماً ومقتل 70 من المشركين وأسر 70 آخرين، مما رفع هيبة المسلمين في الجزيرة العربية.',
    icon: Sword,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'uhud',
    name: 'غزوة أحد',
    year: '3 هـ',
    location: 'جبل أحد',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '700 مقاتل', icon: Shield },
      enemy: { name: 'قريش', leader: 'أبو سفيان', count: '3000 مقاتل', icon: Users },
    },
    result: 'انسحاب تكتيكي للمسلمين',
    description: 'معركة فيها درس عظيم في الطاعة. انتصر المسلمون في البداية، لكن مخالفة الرماة للأوامر ونزولهم لجمع الغنائم أدى لالتفاف جيش قريش. استشهد 70 صحابياً أبرزهم حمزة بن عبد المطلب.',
    icon: Crosshair,
    color: 'from-rose-400 to-rose-600',
  },
  {
    id: 'khandaq',
    name: 'غزوة الخندق (الأحزاب)',
    year: '5 هـ',
    location: 'المدينة المنورة',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '3000 مقاتل', icon: Shield },
      enemy: { name: 'الأحزاب', leader: 'أبو سفيان', count: '10,000 مقاتل', icon: Users },
    },
    result: 'انتصار المسلمين بانسحاب الأحزاب',
    description: 'حصار خانق للمدينة. اقترح سلمان الفارسي حفر خندق لحمايتها. واجه المسلمون الجوع والبرد، فبعث الله ريحاً اقتلعت خيام المشركين وألقت الرعب في قلوبهم فانصرفوا خائبين.',
    icon: Map,
    color: 'from-amber-400 to-amber-600',
  },
  {
    id: 'khaybar',
    name: 'غزوة خيبر',
    year: '7 هـ',
    location: 'حصون خيبر',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '1400 مقاتل', icon: Shield },
      enemy: { name: 'اليهود', leader: 'مرحَب', count: '10,000 مقاتل', icon: Users },
    },
    result: 'فتح حصون خيبر',
    description: 'حصار وفتح حصون يهود خيبر المنيعة بعد نقضهم العهود المتكرر. برز فيها علي بن أبي طالب رضي الله عنه ببطولة نادرة حيث فتح الله على يديه أعظم حصونهم.',
    icon: Flag,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'fath_makkah',
    name: 'فتح مكة',
    year: '8 هـ',
    location: 'مكة المكرمة',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '10,000 مقاتل', icon: Shield },
      enemy: { name: 'قريش', leader: 'أبو سفيان', count: 'استسلام', icon: Users },
    },
    result: 'فتح مكة سلمياً',
    description: 'بعد نقض قريش لصلح الحديبية، دخل النبي مكة فاتحاً دون قتال يذكر. طهر الكعبة من الأصنام وأعلن العفو العام قائلاً مقولته الشهيرة "اذهبوا فأنتم الطلقاء".',
    icon: Shield,
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'hunayn',
    name: 'غزوة حنين',
    year: '8 هـ',
    location: 'وادي حنين',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '12,000 مقاتل', icon: Shield },
      enemy: { name: 'هوازن وثقيف', leader: 'مالك بن عوف', count: '20,000 مقاتل', icon: Users },
    },
    result: 'انتصار المسلمين بعد تراجع',
    description: 'اغتر بعض المسلمين بكثرتهم فكمن لهم العدو وتراجعوا في البداية، ثم ثبت النبي ﷺ ونادى في الناس، فعادوا وانتصروا نصراً كبيراً وغنموا غنائم عظيمة.',
    icon: Sword,
    color: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'tabuk',
    name: 'غزوة تبوك (جيش العسرة)',
    year: '9 هـ',
    location: 'تبوك',
    parties: {
      muslims: { leader: 'محمد ﷺ', count: '30,000 مقاتل', icon: Shield },
      enemy: { name: 'الروم', leader: 'هرقل', count: '40,000 مقاتل', icon: Users },
    },
    result: 'انسحاب الروم دون قتال',
    description: 'آخر غزوات النبي. تجهز المسلمون في وقت حرّ وقحط شديدين، فسمي بـ"جيش العسرة". بمجرد وصول المسلمين، ألقى الله الرعب في قلوب الروم فتفرقوا دون قتال.',
    icon: Map,
    color: 'from-teal-400 to-teal-600',
  }
];
