import { PlayCircle } from 'lucide-react';

export interface Lecture {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
}

export interface LectureSeries {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  lectures: Lecture[];
}

export interface Scholar {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  likes: number;
  series: LectureSeries[];
}

export const SCHOLARS: Scholar[] = [
  {
    id: "scholar-binbaz",
    name: "سماحة الشيخ عبد العزيز بن باز",
    description: "إمام وعلامة ومفتي عام المملكة العربية السعودية سابقاً، أحد كبار علماء أهل السنة والجماعة في العصر الحديث.",
    likes: 48900,
    series: [
      {
        id: "series-binbaz-aqeedah",
        title: "العقيدة والتوحيد والإيمان",
        description: "محاضرات إيمانية متفرقة في بيان التوحيد الشامل، عقيدة أهل السنة والجماعة، وتحصين الأمة من البدع والشبهات.",
        lectures: [
          {
            id: "l-binbaz-1",
            title: "التوحيد وحقيقة العبادة",
            duration: "56:12",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/009-_uP_bY_mUSLEm.mp3"
          },
          {
            id: "l-binbaz-2",
            title: "عقيدة أهل السنة والجماعة",
            duration: "59:34",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/019-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-3",
            title: "الإيمان قول وعمل",
            duration: "1:15:44",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/006-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-4",
            title: "عقائد الجاهلية وخطورتها",
            duration: "51:52",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/018-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-5",
            title: "التوحيد هو حقيقة العبادة",
            duration: "52:42",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/059-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-6",
            title: "العقيدة الصحيحة ودورها في بناء المجتمع",
            duration: "1:17:10",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/079-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-7",
            title: "أهمية العقيدة ومصدر تلقيها",
            duration: "1:18:52",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/090-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-8",
            title: "حقيقة التوحيد والشرك",
            duration: "52:24",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/100-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-9",
            title: "شرح وتوضيح نواقض الإسلام",
            duration: "1:07:26",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/165-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-10",
            title: "القوادح في العقيدة والتحذير منها",
            duration: "1:06:01",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/082-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-11",
            title: "وجوب الاعتصام بالكتاب والسنة",
            duration: "55:22",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/177-_up_by_muslem.mp3"
          }
        ]
      },
      {
        id: "series-binbaz-raqaeq",
        title: "الرقائق وأخلاق المؤمن والتربية",
        description: "دروس ومواعظ مؤثرة منفصلة تناقش صلاح القلوب، أخلاق المؤمنين، واستغلال الأوقات وتزكية النفوس.",
        lectures: [
          {
            id: "l-binbaz-12",
            title: "آفات اللسان وخطورتها",
            duration: "45:00",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/001-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-13",
            title: "أخلاق المؤمنين والمؤمنات",
            duration: "58:52",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/002-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-14",
            title: "أهمية الوقت في حياة المسلم",
            duration: "51:42",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/003-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-15",
            title: "اجتناب السبع الموبيقات",
            duration: "55:28",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/004-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-16",
            title: "أسباب الثبات أمام الفتن",
            duration: "59:19",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/040-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-17",
            title: "التقوى وآثارها في حياة الفرد والمجتمع",
            duration: "1:45:43",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/056-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-18",
            title: "الصدق ومنزلته العالية في الإسلام",
            duration: "27:48",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/074-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-19",
            title: "الظلم وعواقبه الوخيمة",
            duration: "46:12",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/076-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-20",
            title: "بر الوالدين وأحكام صلة الرحم",
            duration: "52:00",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/094-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-21",
            title: "شكر النعمة وحقيقته وعلاماته",
            duration: "1:16:33",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/116-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-22",
            title: "مجاهدة النفس وأسباب استقامتها",
            duration: "1:33:49",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/146-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-23",
            title: "مراحل الشباب أهم مراحل العمر",
            duration: "1:16:58",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/149-_up_by_muslem.mp3"
          }
        ]
      },
      {
        id: "series-binbaz-fiqh",
        title: "الفقه وأحكام العبادات والمعاملات",
        description: "محاضرات فقهية مستقلة توضح أحكام الصلاة، الطهارة، الحج والعمرة، الأمانة، وأحكام الأسرة.",
        lectures: [
          {
            id: "l-binbaz-24",
            title: "الصلاة وعظم شأنها في الإسلام",
            duration: "55:43",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/013-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-25",
            title: "فتاوى وأحكام الصلاة",
            duration: "1:07:02",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/021-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-26",
            title: "الحجاب وأحكامه في الشريعة",
            duration: "1:11:49",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/010-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-27",
            title: "أحكام الحج والعمرة مناسك وآداب",
            duration: "1:15:54",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/035-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-28",
            title: "وجوب أداء الأمانة ورعايتها",
            duration: "34:55",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/026-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-29",
            title: "إقامة الحدود وصيانة المجتمع",
            duration: "46:47",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/005-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-30",
            title: "الفتاوى والأحكام الفقهية الخاصة بالنساء",
            duration: "1:34:33",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/014-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-31",
            title: "فتاوى وأحكام السحر والعين والرقية الشرعية",
            duration: "1:04:42",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/127-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-32",
            title: "وجوب المحافظة على صلاة الجماعة",
            duration: "1:21:52",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/182-_up_by_muslem.mp3"
          }
        ]
      },
      {
        id: "series-binbaz-dawah-ilm",
        title: "طلب العلم والدعوة وإصلاح المجتمع",
        description: "توجيهات علمية ودعوية في فضل العلم الشرعي، آداب طالب العلم، ومسؤولية العلماء والمعلمين في الإصلاح.",
        lectures: [
          {
            id: "l-binbaz-33",
            title: "السنة ومكانتها في التشريع الإسلامي",
            duration: "46:12",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/012-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-34",
            title: "نصيحة جامعة لكل مسلم ومسلمة",
            duration: "1:10:49",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/024-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-35",
            title: "واجب المدرسين والطلاب في التعليم",
            duration: "59:26",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/025-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-36",
            title: "وجوب التعاون على البر والتقوى",
            duration: "31:07",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/027-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-37",
            title: "وسائل إصلاح المجتمع الإسلامي",
            duration: "40:57",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/029-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-38",
            title: "أخلاق العلماء وأثرها في الأمة",
            duration: "1:29:39",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/036-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-39",
            title: "الدعوة إلى الله تعالى وأخلاق الداعية",
            duration: "43:18",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/065-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-40",
            title: "أهمية طلب العلم والعمل به",
            duration: "58:58",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/093-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-41",
            title: "فضل العلم وآدابه وحملته",
            duration: "59:55",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/132-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-42",
            title: "واجب العلماء تجاه الدعوة إلى الله",
            duration: "1:12:10",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/169-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-43",
            title: "وجوب العمل بالسنة والتحذير من البدع",
            duration: "1:19:24",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/181-_up_by_muslem.mp3"
          }
        ]
      },
      {
        id: "series-binbaz-guidance",
        title: "توجيهات وفتاوى ومواعظ إيمانية",
        description: "لقاءات ومحاضرات توجيهية عامة تناقش قضايا الأمة، الفتن، أسباب النصر، وحقوق الأخوة الإيمانية.",
        lectures: [
          {
            id: "l-binbaz-44",
            title: "أسباب قوة المسلمين وضعفهم",
            duration: "1:17:51",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/042-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-45",
            title: "الأمر بالمعروف والنهي عن المنكر",
            duration: "43:08",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/053-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-46",
            title: "التحذير من الفتن والاعتصام بالشرع",
            duration: "1:20:50",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/055-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-47",
            title: "الغزو الفكري وأثره على الشباب والأمة",
            duration: "1:16:10",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/080-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-48",
            title: "خلق الجندي وأسباب النصر",
            duration: "1:03:14",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/105-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-49",
            title: "فتن آخر الزمان وكيفية الوقاية منها",
            duration: "1:17:16",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/130-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-50",
            title: "مفهوم العبادة الشامل في الإسلام",
            duration: "52:14",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/153-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-51",
            title: "مكانة الشريعة الإسلامية وشموليتها",
            duration: "1:22:25",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/154-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-52",
            title: "واجب المسلمين تجاه دينهم في العصر الحديث",
            duration: "1:17:41",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/171-_up_by_muslem.mp3"
          },
          {
            id: "l-binbaz-53",
            title: "وجوب الأخوة بين المؤمنين والتحذير من الفرقة",
            duration: "1:18:30",
            audioUrl: "https://archive.org/download/Ibn_Baz_uP_bY_mUSLEm/176-_up_by_muslem.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mishary",
    name: "الشيخ مشاري الخراز",
    description: "داعية كويتي، مهتم بالجانب الإيماني والرقائق والتلذذ بالعبادات.",
    likes: 15420,
    series: [
      {
        id: "series-mishary-misc",
        title: "محاضرات وخواطر منوعة",
        description: "مجموعة من المحاضرات والخواطر الإيمانية المنفصلة للشيخ مشاري الخراز.",
        lectures: [
          {
            id: "l-mishary-addict-1",
            title: "قصص المدمنين والتائبين (قصة لن أنساها)",
            duration: "63:59",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-mishary-addict-2",
            title: "قصة تائب من الإدمان (طعنة سيجارة)",
            duration: "68:04",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-mishary-tawba-1",
            title: "شواطئ التائبين",
            duration: "24:52",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-mishary-tawba-2",
            title: "التوبة الصادقة والرجوع إلى الله",
            duration: "77:34",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/tawbahsadeqah.mp3"
          },
          {
            id: "l-mishary-1",
            title: "أجمل نظرة في حياتك",
            duration: "12:33",
            audioUrl: "https://archive.org/download/way_552/%D8%A3%D8%AC%D9%85%D9%84%20%D9%86%D8%B8%D8%B1%D8%A9%20%D9%81%D9%8A%20%D8%AD%D9%8A%D8%A7%D8%AA%D9%83%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-2",
            title: "أكمل الطريق لتمحو ذنوبك كاملة",
            duration: "12:15",
            audioUrl: "https://archive.org/download/way_552/%D8%A3%D9%83%D9%85%D9%84%20%D8%A7%D9%84%D8%B7%D8%B1%D9%8A%D9%82%20%D9%84%D8%AA%D9%85%D8%AD%D9%88%20%D8%B0%D9%86%D9%88%D8%A8%D9%83%20%D9%83%D8%A7%D9%85%D9%84%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-3",
            title: "اجعل لحظة موتك هي الأجمل في حياتك",
            duration: "9:45",
            audioUrl: "https://archive.org/download/way_552/%D8%A7%D8%AC%D8%B9%D9%84%20%D9%84%D8%AD%D8%B8%D8%A9%20%D9%85%D9%88%D8%AA%D9%83%20%D9%87%D9%8A%20%D8%A7%D9%84%D8%A3%D8%AC%D9%85%D9%84%20%D9%81%D9%8A%20%D8%AD%D9%8A%D8%A7%D8%AA%D9%83%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-4",
            title: "العفو عمن ظلمك",
            duration: "9:42",
            audioUrl: "https://archive.org/download/way_552/%D8%A7%D9%84%D8%B9%D9%81%D9%88%20%D8%B9%D9%86%20%D9%85%D9%86%20%D8%B8%D9%84%D9%85%D9%83%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-5",
            title: "المصائب تكفر الخطايا",
            duration: "9:05",
            audioUrl: "https://archive.org/download/way_552/%D8%A7%D9%84%D9%85%D8%B5%D8%A7%D8%A6%D8%A8%20%D8%AA%D9%83%D9%81%D8%B1%20%D8%A7%D9%84%D8%AE%D8%B7%D8%A7%D9%8A%D8%A7%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-6",
            title: "ثلاثة أعمال قد تنقذك من النار",
            duration: "12:05",
            audioUrl: "https://archive.org/download/way_552/%D8%AB%D9%84%D8%A7%D8%AB%D8%A9%20%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20%D9%82%D8%AF%20%D8%AA%D9%86%D9%82%D8%B0%D9%83%20%D9%85%D9%86%20%D8%A7%D9%84%D9%86%D8%A7%D8%B1%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-7",
            title: "شدة القبر",
            duration: "10:48",
            audioUrl: "https://archive.org/download/way_552/%D8%B4%D8%AF%D8%A9%20%D8%A7%D9%84%D9%82%D8%A8%D8%B1%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-8",
            title: "فرصتك الأخيرة لدخول الجنة",
            duration: "10:05",
            audioUrl: "https://archive.org/download/way_552/%D9%81%D8%B1%D8%B5%D8%AA%D9%83%20%D8%A7%D9%84%D8%A3%D8%AE%D9%8A%D8%B1%D8%A9%20%D9%84%D8%AF%D8%AE%D9%88%D9%84%20%D8%A7%D9%84%D8%AC%D9%86%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-9",
            title: "قرار التوبة",
            duration: "11:26",
            audioUrl: "https://archive.org/download/way_552/%D9%82%D8%B1%D8%A7%D8%B1%20%D8%A7%D9%84%D8%AA%D9%88%D8%A8%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-10",
            title: "قم بمحو سيئاتك بهذه الأعمال البسيطة",
            duration: "12:55",
            audioUrl: "https://archive.org/download/way_552/%D9%82%D9%85%20%D8%A8%D9%85%D8%AD%D9%88%20%D8%B3%D9%8A%D8%A6%D8%A7%D8%AA%D9%83%20%D8%A8%D9%87%D8%B0%D9%87%20%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D8%A8%D8%B3%D9%8A%D8%B7%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-11",
            title: "كيف تكون من خاصة الخاصة",
            duration: "11:09",
            audioUrl: "https://archive.org/download/way_552/%D9%83%D9%8A%D9%81%20%D8%AA%D9%83%D9%88%D9%86%20%D9%85%D9%86%20%D8%AE%D8%A7%D8%B5%D8%A9%20%D8%A7%D9%84%D8%AE%D8%A7%D8%B5%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-12",
            title: "نعيم النظر إلى الله في الجنة",
            duration: "11:49",
            audioUrl: "https://archive.org/download/way_552/%D9%86%D8%B9%D9%8A%D9%85%20%D8%A7%D9%84%D9%86%D8%B8%D8%B1%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D9%84%D9%87%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%AC%D9%86%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-13",
            title: "هكذا تعلم أولادك الصلاة",
            duration: "11:08",
            audioUrl: "https://archive.org/download/way_552/%D9%87%D9%83%D8%B0%D8%A7%20%D8%AA%D8%B9%D9%84%D9%85%20%D8%A3%D9%88%D9%84%D8%A7%D8%AF%D9%83%20%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%A9%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-14",
            title: "سورة تدافع عنك في القبر",
            duration: "11:43",
            audioUrl: "https://archive.org/download/way_552/%D8%B3%D9%88%D8%B1%D8%A9%20%D8%AA%D8%AF%D8%A7%D9%81%D8%B9%20%D8%B9%D9%86%D9%83%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%82%D8%A8%D8%B1%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-15",
            title: "قضاء الدين وتفريج الكربات",
            duration: "12:16",
            audioUrl: "https://archive.org/download/way_552/%D9%82%D8%B6%D8%A7%D8%A1%20%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20-%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          },
          {
            id: "l-mishary-16",
            title: "فضل وأجر صلاة الفجر",
            duration: "05:40",
            audioUrl: "https://archive.org/download/way2llh22_20170702_2215/%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2%20l%20%D8%A3%D8%AC%D8%B1%20%D8%B5%D9%84%D8%A7%D8%A9%20%D8%A7%D9%84%D9%81%D8%AC%D8%B1.mp3"
          },
          {
            id: "l-mishary-17",
            title: "القرآن رسالة خاصة إليك من الله",
            duration: "14:22",
            audioUrl: "https://archive.org/download/ala_need_55_hotmail_20130911_0952/%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D9%86%20%D8%B1%D8%B3%D8%A7%D9%84%D8%A9%20%D8%A7%D9%84%D9%8A%D9%83%20%D9%85%D9%86%20%D8%A7%D9%84%D9%84%D9%87%20%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%20%D8%A7%D9%84%D8%AE%D8%B1%D8%A7%D8%B2.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-nabil",
    name: "الشيخ الدكتور نبيل العوضي",
    description: "داعية وإعلامي كويتي، يتميز بأسلوبه القصصي المؤثر.",
    likes: 12150,
    series: [
      {
        id: "series-nabil-misc",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات والخطب المستقلة في مواضيع إيمانية متنوعة.",
        lectures: [
          {
            id: "l-nabil-misc-1",
            title: "الإنابة إلى الله تعالى",
            duration: "34:10",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3",
          },
          {
            id: "l-nabil-misc-2",
            title: "الظلم وأثره في هلاك الأمم",
            duration: "40:25",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3",
          },
          {
            id: "l-nabil-misc-3",
            title: "الفتنة",
            duration: "38:15",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3",
          },
          {
            id: "l-nabil-misc-4",
            title: "تحدي الملحدين",
            duration: "52:10",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D8%AA%D8%AD%D8%AF%D9%8A-%D8%A7%D9%84%D9%85%D9%84%D8%AD%D8%AF%D9%8A%D9%86.mp3",
          },
          {
            id: "l-nabil-misc-5",
            title: "حال أصحاب القلوب السليمة",
            duration: "45:30",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D8%AD%D8%A7%D9%84-%D8%A3%D8%B5%D8%AD%D8%A7%D8%A8-%D8%A7%D9%84%D9%82%D9%84%D9%88%D8%A8-%D8%A7%D9%84%D8%B3%D9%84%D9%8A%D9%85%D8%A9.mp3",
          },
          {
            id: "l-nabil-misc-6",
            title: "فضل صيام يوم عاشوراء",
            duration: "25:40",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D9%81%D8%B6%D9%84-%D8%B5%D9%8A%D8%A7%D9%85-%D9%8A%D9%88%D9%85-%D8%B9%D8%A7%D8%B4%D9%88%D8%B1%D8%A7%D8%A1.mp3",
          },
          {
            id: "l-nabil-misc-7",
            title: "قصص وعبر",
            duration: "48:50",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D9%82%D8%B5%D8%B5-%D9%88%D8%B9%D8%A8%D8%B1.mp3",
          },
          {
            id: "l-nabil-misc-8",
            title: "كأنك ترى الرسول في بيته",
            duration: "55:20",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D9%83%D8%A3%D9%86%D9%83-%D8%AA%D8%B1%D9%89-%D8%A7%D9%84%D8%B1%D8%B3%D9%88%D9%84-%D9%81%D9%8A-%D8%A8%D9%8A%D8%AA%D9%87.mp3",
          },
          {
            id: "l-nabil-misc-9",
            title: "نقاء القلب للمسلمين",
            duration: "36:15",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D9%86%D9%82%D8%A7%D8%A1-%D8%A7%D9%84%D9%82%D9%84%D8%A8-%D9%84%D9%84%D9%85%D8%B3%D9%84%D9%85%D9%8A%D9%86.mp3",
          },
          {
            id: "l-nabil-misc-10",
            title: "هل تريد السعادة",
            duration: "41:05",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D9%87%D9%84-%D8%AA%D8%B1%D9%8A%D8%AF-%D8%A7%D9%84%D8%B3%D8%B9%D8%A7%D8%AF%D8%A9.mp3",
          },
          {
            id: "l-nabil-misc-11",
            title: "والكاظمين الغيظ",
            duration: "39:50",
            audioUrl: "https://archive.org/download/Lectures-by-Nabil-Al-Awadi/%D9%88%D8%A7%D9%84%D9%83%D8%A7%D8%B8%D9%85%D9%8A%D9%86-%D8%A7%D9%84%D8%BA%D9%8A%D8%B8.mp3",
          },
          {
            id: "l-nabil-misc-12",
            title: "أعظم الأجور دقيقة من حياتك",
            duration: "05:12",
            audioUrl: "https://archive.org/download/way_137/%D8%A3%D8%B9%D8%B8%D9%85%20%D8%A7%D9%84%D8%A3%D8%AC%D9%88%D8%B1%20%D8%AF%D9%82%D9%8A%D9%82%D8%A9%20%D9%85%D9%86%20%D8%AD%D9%8A%D8%A7%D8%AA%D9%83%20%D9%81%D9%82%D8%B7%20%D9%85%D9%86%20%D9%8A%D8%B1%D9%8A%D8%AF%20%D8%A3%D8%B9%D8%B8%D9%85%20%D8%A7%D9%84%D8%A3%D8%AC%D9%88%D8%B1%20%D9%88%20%D8%A7%D9%84%D8%AC%D9%86%D8%A9.mp3",
          },
          {
            id: "l-nabil-misc-13",
            title: "أهوال نار جهنم وأحوال الناس فيها",
            duration: "12:45",
            audioUrl: "https://archive.org/download/way_137/%D8%A3%D9%87%D9%88%D8%A7%D9%84%20%D9%86%D8%A7%D8%B1%20%D8%AC%D9%87%D9%86%D9%85%20%D9%88%D8%A3%D8%AD%D9%88%D8%A7%D9%84%20%D8%A7%D9%84%D9%86%D8%A7%D8%B3%20%D9%81%D9%8A%D9%87%D8%A7%20%D8%AE%D8%B0%20%D8%A7%D9%84%D8%B9%D8%A8%D8%B1%D8%A9%20%D8%A3%D8%AD%D8%AF%D8%A7%D8%AB%20%D9%85%D8%B1%D8%B9%D8%A8%D8%A9%20%D8%B3%D8%AA%D8%AD%D8%B5%D9%84%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%86%D8%A7%D8%B1%20%D9%88%D9%84%D8%A3%D9%87%D9%84%D9%87%D8%A7%20%D8%A3%D9%85%D8%B1%20%D9%85%D8%AD%D8%B2%D9%86%20%D8%B4%D8%A7%D9%87%D8%AF%D9%88%D8%A7%20%D8%A7%D9%84%D9%85%D9%82%D8%B7%D8%B9.mp3",
          },
          {
            id: "l-nabil-misc-14",
            title: "الأذكار أفضل وأحب الأعمال إلى الله",
            duration: "08:20",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A3%D8%B0%D9%83%D8%A7%D8%B1%20%D8%A3%D9%81%D8%B6%D9%84%20%D9%88%D8%A3%D8%AD%D8%A8%20%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B3%D8%A7%D8%B1%D8%B9%D9%88%20%D9%84%D9%86%D9%8A%D9%84%20%D9%85%D8%AD%D8%A8%D8%A9%20%D8%A7%D9%84%D9%84%D9%87.mp3",
          },
          {
            id: "l-nabil-misc-15",
            title: "العشق والحب وكيفة التخلص منه",
            duration: "15:30",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B9%D8%B4%D9%82%20%D9%88%D8%A7%D9%84%D8%AD%D8%A8%20%D9%88%D9%83%D9%8A%D9%81%D8%A9%20%D8%A7%D9%84%D8%AA%D8%AE%D9%84%D8%B5%20%D9%85%D9%86%D9%87%20%D9%88%20%D9%85%D9%86%20%D9%85%D8%B4%D8%A7%D9%83%D9%84%20%D9%88%20%D9%87%D9%85%D9%88%D9%85%20%D8%A7%D9%84%D8%AD%D8%A8%20%D9%82%D8%B5%D8%B5%20%D9%85%D8%A4%D8%AB%D8%B1%D8%A9%20%D9%86%D8%A8%D9%8A%D9%84%20%D8%A7%D9%84%D8%B9%D9%88%D8%B6%D9%8A.mp3",
          },
          {
            id: "l-nabil-misc-16",
            title: "الفتن و الدنيا سجن المؤمن وجنة الكافر",
            duration: "18:10",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%20%D9%88%20%D8%A7%D9%84%D8%AF%D9%86%D9%8A%D8%A7%20%D8%B3%D8%AC%D9%86%20%D8%A7%D9%84%D9%85%D8%A4%D9%85%D9%86%20%D9%88%D8%AC%D9%86%D8%A9%20%D8%A7%D9%84%D9%83%D8%A7%D9%81%D8%B1.mp3",
          },
          {
            id: "l-nabil-misc-17",
            title: "القبر البيت الحقيقي",
            duration: "21:05",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%82%D8%A8%D8%B1%D8%A7%D9%84%D8%A8%D9%8A%D8%AA%20%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D9%8A%20%D8%A7%D9%84%D9%85%D9%82%D8%B7%D8%B9%20%D8%A7%D9%84%D8%B0%D9%8A%20%D8%A3%D8%A8%D9%83%D8%A7%D9%86%D9%8A%20%D9%88%D8%AA%D8%A7%D8%A8%20%D8%A8%D8%B3%D8%A8%D8%A8%D9%87%20%D8%A7%D9%84%D9%83%D8%AB%D9%8A%D8%B1%20%D8%B3%D8%AA%D8%B9%D9%84%D9%85%20%D8%AD%D9%82%D9%8A%D9%82%D8%A9%20%D8%A7%D9%84%D8%AF%D9%86%D9%8A%D8%A7%20%D9%8A%D8%A7%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B9%D9%86%D8%AF%20%D8%A7%D9%84%D9%85%D8%B4%D8%A7%D9%87%D8%AF%D8%A9.mp3",
          },
          {
            id: "l-nabil-misc-18",
            title: "بعد وفاة الوالدين",
            duration: "10:50",
            audioUrl: "https://archive.org/download/way_137/%D8%A8%D8%B9%D8%AF%20%D9%88%D9%81%D8%A7%D8%A9%20%D8%A7%D9%84%D9%88%D8%A7%D9%84%D8%AF%D9%8A%D9%86%20%D8%B3%D8%AA%D8%A8%D9%83%D9%8A%20%D8%AD%D8%AA%D9%85%D8%A7%20%D8%B9%D9%86%D8%AF%20%D8%A7%D9%84%D9%85%D8%B4%D8%A7%D9%87%D8%AF%D8%A9%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%A8%D9%8A%D9%84%20%D8%A7%D9%84%D8%B9%D9%88%D8%B6%D9%8A.mp3",
          },
          {
            id: "l-nabil-misc-19",
            title: "صلاة التطوع وأجرها",
            duration: "09:15",
            audioUrl: "https://archive.org/download/way_137/%D8%B5%D9%84%D8%A7%D8%A9%20%D8%A7%D9%84%D8%AA%D8%B7%D9%88%D8%B9%20%D9%88%D8%A3%D8%AC%D8%B1%D9%87%D8%A7%20%D9%87%D8%A7%D9%85%20%D8%AC%D8%AF%D8%A7%D8%A7%D8%A7.mp3",
          },
          {
            id: "l-nabil-misc-20",
            title: "فضل الصف الأول في الصلاة والإبكار إلى المساجد",
            duration: "11:25",
            audioUrl: "https://archive.org/download/way_137/%D9%81%D8%B6%D9%84%20%D8%A7%D9%84%D8%B5%D9%81%20%D8%A7%D9%84%D8%A3%D9%88%D9%84%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%A9%20%D9%88%D8%A7%D9%84%D8%A5%D8%A8%D9%83%D8%A7%D8%B1%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%AC%D8%AF%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%A8%D9%8A%D9%84%20%D8%A7%D9%84%D8%B9%D9%88%D8%B6%D9%8A%E2%80%AC.mp3",
          },
          {
            id: "l-nabil-misc-21",
            title: "الزائر الأخير",
            duration: "13:40",
            audioUrl: "https://archive.org/download/way_137/%D9%85%D9%82%D8%B7%D8%B9%20%D9%8A%D9%82%D8%B4%D8%B9%D8%B1%20%D9%84%D9%87%20%D8%A7%D9%84%D8%A3%D8%A8%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%B2%D8%A7%D8%A6%D8%B1%20%D8%A7%D9%84%D8%A3%D8%AE%D9%8A%D8%B1%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%A8%D9%8A%D9%84%20%D8%A7%D9%84%D8%B9%D9%88%D8%B6%D9%8A.mp3",
          },
          {
            id: "l-nabil-misc-22",
            title: "كيف تقوي ايمانك و التخلص من الوسواس",
            duration: "20:30",
            audioUrl: "https://archive.org/download/way_137/%E2%80%AB%20%E2%80%AB%D9%83%D9%8A%D9%81%20%D8%AA%D9%82%D9%88%D9%8A%20%D8%A7%D9%8A%D9%85%D8%A7%D9%86%D9%83%20%D9%88%20%D8%A7%D9%84%D8%AA%D8%AE%D9%84%D8%B5%20%D9%85%D9%86%20%D8%A7%D9%84%D9%88%D8%B3%D9%88%D8%A7%D8%B3.mp3",
          },
          {
            id: "l-nabil-misc-23",
            title: "حسن الخاتمة",
            duration: "08:05",
            audioUrl: "https://archive.org/download/way_137/%E2%80%AB%D8%AD%D8%B3%D9%86%20%D8%A7%D9%84%D8%AE%D8%A7%D8%AA%D9%85%D8%A9%20%D8%B3%D8%A8%D8%AD%D8%A7%D9%86%20%D8%A7%D9%84%D9%84%D9%87%E2%80%AC%20YouTube.mp3",
          },
          {
            id: "l-nabil-misc-24",
            title: "أبشر أيها العاصي برحمة الرحمن والله رائعة",
            duration: "08:36",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0001.mp3",
          },
          {
            id: "l-nabil-misc-25",
            title: "اجتهاد السلف في العبادة",
            duration: "89:16",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0002-.mp3",
          },
          {
            id: "l-nabil-misc-26",
            title: "أحداث اليمن ليبيا بلد الأبطال سوريا تغلي",
            duration: "55:32",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0003-.mp3",
          },
          {
            id: "l-nabil-misc-27",
            title: "احذر الصغائر",
            duration: "32:29",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0004-.mp3",
          },
          {
            id: "l-nabil-misc-28",
            title: "أحسنكم أخلاقا",
            duration: "28:04",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0005-.mp3",
          },
          {
            id: "l-nabil-misc-29",
            title: "أحوال الناس يوم الحساب",
            duration: "42:31",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0006-.mp3",
          },
          {
            id: "l-nabil-misc-30",
            title: "أخبار المحبين",
            duration: "50:44",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0007-.mp3",
          },
          {
            id: "l-nabil-misc-31",
            title: "أخطاء في الولائم والأعراس",
            duration: "21:30",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0009-.mp3",
          },
          {
            id: "l-nabil-misc-32",
            title: "أسباب هلاك الأمم",
            duration: "24:52",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0017-.mp3",
          },
          {
            id: "l-nabil-misc-33",
            title: "استثمار الأوقات",
            duration: "32:51",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0018-.mp3",
          },
          {
            id: "l-nabil-misc-34",
            title: "أسراب الحجيج",
            duration: "58:49",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0019-.mp3",
          },
          {
            id: "l-nabil-misc-35",
            title: "أغلى الدموع",
            duration: "63:57",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0029-.mp3",
          },
          {
            id: "l-nabil-misc-49",
            title: "الإسراء والمعراج",
            duration: "47:30",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0044-.mp3",
          },
          {
            id: "l-nabil-misc-50",
            title: "الإخلاص",
            duration: "43:40",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0045-.mp3",
          },
          {
            id: "l-nabil-misc-51",
            title: "الأخلاق المحمدية 1",
            duration: "51:20",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0046-1.mp3",
          },
          {
            id: "l-nabil-misc-52",
            title: "الأخلاق المحمدية",
            duration: "47:39",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0047-2.mp3",
          },
          {
            id: "l-nabil-misc-53",
            title: "الأخلاق المحمدية 3",
            duration: "47:18",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0048-3.mp3",
          },
          {
            id: "l-nabil-misc-54",
            title: "الأرض المباركة",
            duration: "19:25",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0049-.mp3",
          },
          {
            id: "l-nabil-misc-55",
            title: "الأرقام تتكلم",
            duration: "49:16",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0050-.mp3",
          },
          {
            id: "l-nabil-misc-56",
            title: "الاستعداد لرمضان",
            duration: "01:30",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0051-.mp3",
          },
          {
            id: "l-nabil-misc-57",
            title: "الأسرى",
            duration: "59:50",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0052-.mp3",
          },
          {
            id: "l-nabil-misc-58",
            title: "الأسئلة الأخيرة",
            duration: "45:10",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0053-.mp3",
          },
          {
            id: "l-nabil-misc-59",
            title: "الافتقار إلى الله",
            duration: "26:48",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0054-.mp3",
          },
          {
            id: "l-nabil-misc-60",
            title: "الأقصى يحتضر والهيكل يكتمل",
            duration: "32:22",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0055-.mp3",
          },
          {
            id: "l-nabil-misc-61",
            title: "الأقليات الإسلامية في بلاد الغرب",
            duration: "51:13",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0056-.mp3",
          },
          {
            id: "l-nabil-misc-62",
            title: "الأم نواة الأسرة",
            duration: "37:22",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0057-.mp3",
          },
          {
            id: "l-nabil-misc-63",
            title: "الأمر بالمعروف والنهي عن المنكر",
            duration: "22:43",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0058-.mp3",
          },
          {
            id: "l-nabil-misc-64",
            title: "الإنتفاضة الفلسطنية الثالثة العلاقات الأسرية",
            duration: "52:52",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0059-.mp3",
          },
          {
            id: "l-nabil-misc-65",
            title: "الأنفاس الأخيرة",
            duration: "46:24",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0060-.mp3",
          },
          {
            id: "l-nabil-misc-66",
            title: "البدار البدار",
            duration: "38:12",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0061-.mp3",
          },
          {
            id: "l-nabil-misc-68",
            title: "البشارة العظيمة",
            duration: "60:53",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0063-.mp3",
          },
          {
            id: "l-nabil-misc-69",
            title: "البيت الحرام",
            duration: "45:24",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0064-.mp3",
          },
          {
            id: "l-nabil-misc-70",
            title: "البيت السعيد",
            duration: "27:18",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0065-.mp3",
          },
          {
            id: "l-nabil-misc-71",
            title: "البيوت السعيدة",
            duration: "61:39",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0066-.mp3",
          },
          {
            id: "l-nabil-misc-73",
            title: "التحذير من الشرك",
            duration: "20:59",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0069-.mp3",
          },
          {
            id: "l-nabil-misc-74",
            title: "التربية العبادية للنفس",
            duration: "30:16",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0070-.mp3",
          },
          {
            id: "l-nabil-misc-75",
            title: "الترشيد طاعة",
            duration: "14:14",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0071-.mp3",
          },
          {
            id: "l-nabil-misc-76",
            title: "الترغيب بالحج",
            duration: "21:50",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0072-.mp3",
          },
          {
            id: "l-nabil-misc-77",
            title: "التعدي على حرمات المسلمين",
            duration: "47:59",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0073-.mp3",
          },
          {
            id: "l-nabil-misc-78",
            title: "التعريف بالإسلام",
            duration: "31:45",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0074-.mp3",
          },
          {
            id: "l-nabil-misc-79",
            title: "التقاعس عن الدعوة",
            duration: "17:49",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0075-.mp3",
          },
          {
            id: "l-nabil-misc-80",
            title: "التكنلوجيا نعمة أو نقمة",
            duration: "32:06",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0076-.mp3",
          },
          {
            id: "l-nabil-misc-81",
            title: "التوبة",
            duration: "32:15",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0077-.mp3",
          },
          {
            id: "l-nabil-misc-82",
            title: "التوحيد",
            duration: "24:16",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0078-.mp3",
          },
          {
            id: "l-nabil-misc-84",
            title: "الثبات عند الملمات",
            duration: "27:49",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0080-.mp3",
          },
          {
            id: "l-nabil-misc-97",
            title: "الحياة الطيبة 1",
            duration: "31:00",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0093-1.mp3",
          },
          {
            id: "l-nabil-misc-98",
            title: "الحياة الطيبة",
            duration: "29:38",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0094-2.mp3",
          },
          {
            id: "l-nabil-misc-99",
            title: "الحياة الطيبة أحلى حياة",
            duration: "25:46",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0095-.mp3",
          },
          {
            id: "l-nabil-misc-100",
            title: "الخلوات",
            duration: "25:06",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0096-.mp3",
          },
          {
            id: "l-nabil-misc-101",
            title: "الخليفة الرابع علي بن أبي طالب",
            duration: "66:11",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0097-.mp3",
          },
          {
            id: "l-nabil-misc-102",
            title: "الخليفة عثمان بن عفان رضي الله عنه",
            duration: "57:08",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0098-.mp3",
          },
          {
            id: "l-nabil-misc-103",
            title: "الخوف من الله عز وجل  1",
            duration: "20:56",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0099-1.mp3",
          },
          {
            id: "l-nabil-misc-104",
            title: "الخوف من الله عز وجل",
            duration: "22:04",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0100-2.mp3",
          },
          {
            id: "l-nabil-misc-105",
            title: "الخوف من الله",
            duration: "27:01",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0101-.mp3",
          },
          {
            id: "l-nabil-misc-106",
            title: "الدانمارك مرة أخرى!!",
            duration: "27:00",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0102-.mp3",
          },
          {
            id: "l-nabil-misc-107",
            title: "الدقائق الغالية",
            duration: "57:56",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0103-.mp3",
          },
          {
            id: "l-nabil-misc-108",
            title: "الدموع الغالية",
            duration: "63:02",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0104-.mp3",
          },
          {
            id: "l-nabil-misc-109",
            title: "الدين نصفان",
            duration: "24:04",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0105-.mp3",
          },
          {
            id: "l-nabil-misc-110",
            title: "الذكر والأنثى",
            duration: "43:32",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0106-.mp3",
          },
          {
            id: "l-nabil-misc-111",
            title: "الرحمة المهداة",
            duration: "36:51",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0107-.mp3",
          },
          {
            id: "l-nabil-misc-112",
            title: "الرحمة  1",
            duration: "41:39",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0108-1.mp3",
          },
          {
            id: "l-nabil-misc-113",
            title: "الرحمة",
            duration: "28:37",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0109-.mp3",
          },
          {
            id: "l-nabil-misc-114",
            title: "الرحيق",
            duration: "63:38",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0110-.mp3",
          },
          {
            id: "l-nabil-misc-115",
            title: "الرد على بابا الفاتيكان",
            duration: "08:30",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0111-.mp3",
          },
          {
            id: "l-nabil-misc-116",
            title: "الرشوة في الانتخابات",
            duration: "17:41",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0112-.mp3",
          },
          {
            id: "l-nabil-misc-117",
            title: "الرشوة",
            duration: "43:03",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0113-.mp3",
          },
          {
            id: "l-nabil-misc-118",
            title: "الرقية الشرعية",
            duration: "56:01",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0114-.mp3",
          },
          {
            id: "l-nabil-misc-119",
            title: "الساعي",
            duration: "25:52",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0115-.mp3",
          },
          {
            id: "l-nabil-misc-120",
            title: "السحر والشعوذة بين الشرك والكفر",
            duration: "26:23",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0117-.mp3",
          },
          {
            id: "l-nabil-misc-121",
            title: "السحر والشعوذة",
            duration: "46:08",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0118-.mp3",
          },
          {
            id: "l-nabil-misc-122",
            title: "السر المكنون",
            duration: "61:47",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0119-.mp3",
          },
          {
            id: "l-nabil-misc-123",
            title: "الشباب المسلم والتحديات المعاصرة",
            duration: "60:41",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0120-.mp3",
          },
          {
            id: "l-nabil-misc-124",
            title: "الشباب والقرآن الكريم",
            duration: "32:21",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0121-.mp3",
          },
          {
            id: "l-nabil-misc-125",
            title: "الشبهات وأصحاب السبت",
            duration: "26:21",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0122-.mp3",
          },
          {
            id: "l-nabil-misc-126",
            title: "الشجاعة",
            duration: "23:17",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0123-.mp3",
          },
          {
            id: "l-nabil-misc-127",
            title: "الشقق المفروشة",
            duration: "49:58",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0124-.mp3",
          },
          {
            id: "l-nabil-misc-128",
            title: "الشهوات الزائفة",
            duration: "24:21",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0125-.mp3",
          },
          {
            id: "l-nabil-misc-129",
            title: "الصابرون على الحق",
            duration: "33:52",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0126-.mp3",
          },
          {
            id: "l-nabil-misc-130",
            title: "الصائمون السائحون الذاكرون",
            duration: "28:47",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0127-.mp3",
          },
          {
            id: "l-nabil-misc-131",
            title: "الصبر على الطاعة",
            duration: "23:22",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0128-.mp3",
          },
          {
            id: "l-nabil-misc-132",
            title: "الصدقة في رمضان",
            duration: "19:08",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0130-.mp3",
          },
          {
            id: "l-nabil-misc-133",
            title: "رجال الفجر",
            duration: "48:50",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/RejalAlfajr.mp3",
          },
          {
            id: "l-nabil-misc-134",
            title: "كيف أسلموا؟",
            duration: "82:56",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/KaifaAslamo.mp3",
          },
          {
            id: "l-nabil-misc-135",
            title: "هذا الحبيب صلى الله عليه وسلم",
            duration: "59:06",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/Nabil_HathAl7abib.mp3",
          },
          {
            id: "l-nabil-misc-136",
            title: "متى نصر الله؟",
            duration: "25:36",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/Nabil_MataNaserAllah.mp3",
          },
          {
            id: "l-nabil-misc-137",
            title: "همسات إيمانية",
            duration: "34:22",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/nabil_Hamasat_emanyah.mp3",
          },
          {
            id: "l-nabil-misc-138",
            title: "تقلب الإيمان بين الزيادة والنقصان",
            duration: "29:59",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/Nabil_TaqalobAleman.mp3",
          },
          {
            id: "l-nabil-misc-139",
            title: "ثبات حتى الممات",
            duration: "20:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/Nabil_Thabat7ataAlmamat.mp3",
          },
          {
            id: "l-nabil-misc-155",
            title: "الغلاء",
            duration: "28:27",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0146-.mp3",
          },
          {
            id: "l-nabil-misc-158",
            title: "الفرج بعد الشدة",
            duration: "20:38",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0149-.mp3",
          },
          {
            id: "l-nabil-misc-162",
            title: "القلوب القاسية",
            duration: "28:25",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0154-.mp3",
          },
          {
            id: "l-nabil-misc-163",
            title: "القناعة كنز السعداء",
            duration: "35:35",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0155-.mp3",
          },
          {
            id: "l-nabil-misc-167",
            title: "المخدرات والشباب",
            duration: "21:25",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0159-.mp3",
          },
          {
            id: "l-nabil-misc-177",
            title: "النار رؤية من الداخل",
            duration: "29:31",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0169-.mp3",
          },
          {
            id: "l-nabil-misc-184",
            title: "إلى كل مريض",
            duration: "24:08",
            audioUrl: "https://archive.org/download/Nabil-3awadi_Mawsoa-mp3/0176-.mp3",
          },
          
        ]
      }
    ]
  },
  {
    id: "scholar-arefe",
    name: "الشيخ الدكتور محمد العريفي",
    description: "داعية إسلامي سعودي، أستاذ العقيدة والأديان والمذاهب المعاصرة.",
    likes: 35000,
    series: [
      {
        id: "series-arefe-misc",
        title: "محاضرات منوعة",
        description: "مجموعة من المحاضرات والخطب المتنوعة والمؤثرة للشيخ محمد العريفي.",
        lectures: [
          {
            id: "l-arefe-01",
            title: "القابضات على الجمر",
            duration: "45:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/alqabedat_ala_aljmr.mp3"
          },
          {
            id: "l-arefe-02",
            title: "المشتاقون إلى الجنة",
            duration: "50:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/almushtaqoon_ela_algana.mp3"
          },
          {
            id: "l-arefe-03",
            title: "رحلة المشتاق",
            duration: "42:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/rehlt_almoshtaq.mp3"
          },
          {
            id: "l-arefe-04",
            title: "القرار الشجاع",
            duration: "38:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/alqrar_alshogha3.mp3"
          },
          {
            id: "l-arefe-05",
            title: "التوبة الصادقة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/tawbahsadeqah.mp3"
          },
          {
            id: "l-arefe-06",
            title: "مفتاح الجنة",
            duration: "46:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/meftah_alganna.mp3"
          },
          {
            id: "l-arefe-07",
            title: "على قمم الجبال",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qemm_aljebal.mp3"
          },
          {
            id: "l-arefe-08",
            title: "دموع المآذن",
            duration: "30:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/domoo3_alm3azen.mp3"
          },
          {
            id: "l-arefe-09",
            title: "ألحان وأشجان",
            duration: "58:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/alhan_w_ashjan.mp3"
          },
          {
            id: "l-arefe-10",
            title: "ذكريات تائب",
            duration: "48:00",
            audioUrl: "https://archive.org/download/Lessons_Dr_Mohammad_Arifi_up-by-muslem/zekratotaeb.mp3"
          },
          {
            id: "l-arefe-11",
            title: "طاعة الله والرسول",
            duration: "52:00",
            audioUrl: "https://archive.org/download/Dr-Mohammad-Arifi_Mawsoaa_uP_bY_mUSLEm/068--.mp3"
          },
          {
            id: "l-arefe-12",
            title: "كن بطلا",
            duration: "45:00",
            audioUrl: "https://archive.org/download/Dr-Mohammad-Arifi_Mawsoaa_uP_bY_mUSLEm/088--.mp3"
          },
          {
            id: "l-arefe-13",
            title: "التطاول على كتاب الله",
            duration: "42:00",
            audioUrl: "https://archive.org/download/Dr-Mohammad-Arifi_Mawsoaa_uP_bY_mUSLEm/016--.mp3"
          },
          {
            id: "l-arefe-14",
            title: "دلوني على قبرها",
            duration: "55:00",
            audioUrl: "https://archive.org/download/Lessons_Dr_Mohammad_Arifi_up-by-muslem/delone-alaqbreha.mp3"
          },
          {
            id: "l-arefe-15",
            title: "حراس السفينة",
            duration: "50:00",
            audioUrl: "https://archive.org/download/Al-erfe_Mawsoa-mp3/0302-_Horras_Assafinah.mp3"
          },
          {
            id: "l-arefe-16",
            title: "لو رآك لأحبك",
            duration: "46:00",
            audioUrl: "https://archive.org/download/Dr-Mohammad-Arifi_Mawsoaa_uP_bY_mUSLEm/095--.mp3"
          },
          {
            id: "l-arefe-17",
            title: "بيت النبوة",
            duration: "58:00",
            audioUrl: "https://archive.org/download/Dr-Mohammad-Arifi_Mawsoaa_uP_bY_mUSLEm/045--.mp3"
          },
          {
            id: "l-arefe-18",
            title: "تمشي على استحياء",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Al-erfe_Mawsoa-mp3/0341-_TamshyShyOrafy.mp3"
          },
          {
            id: "l-arefe-19",
            title: "النصح والنصيحة",
            duration: "38:00",
            audioUrl: "https://archive.org/download/Al-erfe_Mawsoa-mp3/0333-_NoshOrafy.mp3"
          },
          {
            id: "l-arefe-20",
            title: "الشجاعة",
            duration: "38:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/alqrar_alshogha3.mp3"
          },
          {
            id: "l-arefe-21",
            title: "أبشر فرحمة الله واسعة",
            duration: "42:00",
            audioUrl: "https://archive.org/download/abshr_ferhma_Orafy/abshr_ferhma_Orafy.mp3"
          },
          {
            id: "l-arefe-22",
            title: "عجائب الملائكة",
            duration: "50:00",
            audioUrl: "https://archive.org/download/Ajayeb_Al-malayqa_Orafy/Ajayeb_Al-malayqa_Orafy.mp3"
          },
          {
            id: "l-arefe-23",
            title: "الإخلاص",
            duration: "45:00",
            audioUrl: "https://archive.org/download/aleklas_Orafy/aleklas_Orafy.mp3"
          },
          {
            id: "l-arefe-24",
            title: "اقرأ",
            duration: "43:00",
            audioUrl: "https://archive.org/download/eqra_Orafy/eqra_Orafy.mp3"
          },
          {
            id: "l-arefe-25",
            title: "الأمانة",
            duration: "37:00",
            audioUrl: "https://archive.org/download/alamana_Orafy/alamana_Orafy.mp3"
          },
          {
            id: "l-arefe-26",
            title: "قصة موسى والخضر",
            duration: "48:00",
            audioUrl: "https://media.islamway.net/lessons/249/78382_Mosa_Arefy.mp3"
          },
          {
            id: "l-arefe-27",
            title: "قصة أصحاب الكهف",
            duration: "46:00",
            audioUrl: "https://archive.org/download/dr.m.alarefe/3581.mp3"
          },
          {
            id: "l-arefe-28",
            title: "حسن الظن بالله",
            duration: "43:00",
            audioUrl: "https://archive.org/download/hsn-alzn/hsn_alzn_Orafy.mp3"
          },
          {
            id: "l-arefe-29",
            title: "الثبات على الدين",
            duration: "52:00",
            audioUrl: "https://archive.org/download/Thbat_Orafy/Thbat_Orafy.mp3"
          },
          {
            id: "l-arefe-30",
            title: "التحذير من الكذب",
            duration: "39:00",
            audioUrl: "https://archive.org/download/dr.m.alarefe/3582.mp3"
          },
          {
            id: "l-arefe-31",
            title: "طريق النجاح",
            duration: "41:00",
            audioUrl: "https://archive.org/download/tryq-alnajah/tryq_alnajah.mp3"
          },
          {
            id: "l-arefe-32",
            title: "لا تيأس",
            duration: "35:00",
            audioUrl: "https://archive.org/download/la_tays_Orafy/la_tays_Orafy.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-qarni",
    name: "الشيخ الدكتور عائض القرني",
    description: "داعية إسلامي وكاتب سعودي، صاحب كتاب لا تحزن.",
    likes: 28400,
    series: [
      {
        id: "series-qarni-misc",
        title: "محاضرات وخطب مستقلة",
        description: "مجموعة من المحاضرات والخطب الإيمانية والتربوية المنفصلة للشيخ الدكتور عائض القرني.",
        lectures: [
          {
            id: "l-qarni-1",
            title: "عظمة الله جل في علاه",
            duration: "60:55",
            audioUrl: "https://archive.org/download/3aedAlqrni1/3dmtAllah.mp3"
          },
          {
            id: "l-qarni-2",
            title: "علم العظماء",
            duration: "45:00",
            audioUrl: "https://archive.org/download/3aedAlqrni1/3elmAl3olma.mp3"
          },
          {
            id: "l-qarni-3",
            title: "علامات محبة الله",
            duration: "42:15",
            audioUrl: "https://archive.org/download/3aedAlqrni1/3lamatMh7btAllah.mp3"
          },
          {
            id: "l-qarni-4",
            title: "علو الهمة",
            duration: "53:40",
            audioUrl: "https://archive.org/download/3aedAlqrni1/3oloAlhemh.mp3"
          },
          {
            id: "l-qarni-5",
            title: "أبو هريرة رضي الله عنه",
            duration: "64:20",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AboHoryrah.mp3"
          },
          {
            id: "l-qarni-6",
            title: "العادات السبع",
            duration: "38:50",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Al3adatAlsb3.mp3"
          },
          {
            id: "l-qarni-7",
            title: "العدوان الشرس على غزة",
            duration: "41:10",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Al3dwan3laGHzh.mp3"
          },
          {
            id: "l-qarni-8",
            title: "الخير في هذه الأمة",
            duration: "47:30",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Al5eerViHadiAlomh.mp3"
          },
          {
            id: "l-qarni-9",
            title: "الحسن والحسين رضي الله عنهما",
            duration: "58:15",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Al7snWaAl7osen.mp3"
          },
          {
            id: "l-qarni-10",
            title: "الدعوة علم وأصول",
            duration: "52:40",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Ald3wh3elmWaOsol.mp3"
          },
          {
            id: "l-qarni-11",
            title: "الدعوة إلى الله",
            duration: "49:20",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Ald3whEaAllah.mp3"
          },
          {
            id: "l-qarni-12",
            title: "الإنجاز العلمي",
            duration: "35:10",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AlenjazAl3lmi.mp3"
          },
          {
            id: "l-qarni-13",
            title: "الجنة تحت أقدام الأمهات",
            duration: "54:30",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AljnhT7tAqdamAlomhat.mp3"
          },
          {
            id: "l-qarni-14",
            title: "النصر وأسبابه",
            duration: "48:15",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Alnasr.mp3"
          },
          {
            id: "l-qarni-15",
            title: "القول السديد",
            duration: "51:00",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AlqolAlsaded.mp3"
          },
          {
            id: "l-qarni-16",
            title: "القرآن العظيم",
            duration: "62:40",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AlquranAl3dem.mp3"
          },
          {
            id: "l-qarni-17",
            title: "الرسالة والرسول",
            duration: "27:51",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AlresalhWaAlrasol.mp3"
          },
          {
            id: "l-qarni-18",
            title: "الصحابي عبد الله السهمي",
            duration: "28:19",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Als7aby3bdallhAlshmi.mp3"
          },
          {
            id: "l-qarni-19",
            title: "التجسس وتتبع العورات",
            duration: "45:06",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Altjsos.mp3"
          },
          {
            id: "l-qarni-20",
            title: "التوبة إلى الله",
            duration: "05:42",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Altobh.mp3"
          },
          {
            id: "l-qarni-21",
            title: "أمانة التعليم",
            duration: "37:18",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AmantAlj3lem.mp3"
          },
          {
            id: "l-qarni-22",
            title: "أقبلت يا رمضان",
            duration: "12:09",
            audioUrl: "https://archive.org/download/3aedAlqrni1/AqbltYaRamadan.mp3"
          },
          {
            id: "l-qarni-23",
            title: "بر الوالدين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/3aedAlqrni1/BerAlwalden.mp3"
          },
          {
            id: "l-qarni-24",
            title: "بل الرفيق الأعلى",
            duration: "74:03",
            audioUrl: "https://archive.org/download/3aedAlqrni1/BlAlrafeqAla3la.mp3"
          },
          {
            id: "l-qarni-25",
            title: "بطولات الصحابة",
            duration: "31:42",
            audioUrl: "https://archive.org/download/3aedAlqrni1/BotolatAls7abh.mp3"
          },
          {
            id: "l-qarni-26",
            title: "بريطانيا التي رأيت",
            duration: "72:22",
            audioUrl: "https://archive.org/download/3aedAlqrni1/BretanyaAltyRaeet.mp3"
          },
          {
            id: "l-qarni-27",
            title: "دروس وعبر",
            duration: "24:20",
            audioUrl: "https://archive.org/download/3aedAlqrni1/DorosWa3ebr.mp3"
          },
          {
            id: "l-qarni-28",
            title: "إخلاص النية",
            duration: "49:54",
            audioUrl: "https://archive.org/download/3aedAlqrni1/E5lasAlnyh.mp3"
          },
          {
            id: "l-qarni-29",
            title: "ففروا إلى الله",
            duration: "48:35",
            audioUrl: "https://archive.org/download/3aedAlqrni1/FaferoElaAllah.mp3"
          },
          {
            id: "l-qarni-30",
            title: "فضل الصدقات",
            duration: "05:42",
            audioUrl: "https://archive.org/download/3aedAlqrni1/FdlAlsdqat.mp3"
          },
          {
            id: "l-qarni-31",
            title: "فتنة المسيح الدجال",
            duration: "61:14",
            audioUrl: "https://archive.org/download/3aedAlqrni1/FetntAlmasee7.mp3"
          },
          {
            id: "l-qarni-32",
            title: "غسيل القلوب",
            duration: "76:08",
            audioUrl: "https://archive.org/download/3aedAlqrni1/GHaseelAlqolob.mp3"
          },
          {
            id: "l-qarni-33",
            title: "غفرانك",
            duration: "60:18",
            audioUrl: "https://archive.org/download/3aedAlqrni1/GHofrank.mp3"
          },
          {
            id: "l-qarni-34",
            title: "همم العلماء",
            duration: "25:11",
            audioUrl: "https://archive.org/download/3aedAlqrni1/HemmAl3olma.mp3"
          },
          {
            id: "l-qarni-35",
            title: "مع الرسول صلى الله عليه وسلم",
            duration: "67:15",
            audioUrl: "https://archive.org/download/3aedAlqrni1/M3Alrasol.mp3"
          },
          {
            id: "l-qarni-36",
            title: "معالم الثبات في الفتن",
            duration: "46:30",
            audioUrl: "https://archive.org/download/3aedAlqrni1/M3alemAlthbatViAlfetn.mp3"
          },
          {
            id: "l-qarni-37",
            title: "محبة الكتاب",
            duration: "38:44",
            audioUrl: "https://archive.org/download/3aedAlqrni1/M7btAlketab.mp3"
          },
          {
            id: "l-qarni-38",
            title: "ما أوسع المغفرة",
            duration: "40:13",
            audioUrl: "https://archive.org/download/3aedAlqrni1/MaAws3Almghfrh.mp3"
          },
          {
            id: "l-qarni-39",
            title: "من أسرار الصلاة",
            duration: "53:54",
            audioUrl: "https://archive.org/download/3aedAlqrni1/MenAsrarAlsalah.mp3"
          },
          {
            id: "l-qarni-40",
            title: "نبي الرحمة",
            duration: "69:08",
            audioUrl: "https://archive.org/download/3aedAlqrni1/NbyAlr7mh.mp3"
          },
          {
            id: "l-qarni-41",
            title: "قصتي مع الكتاب",
            duration: "40:16",
            audioUrl: "https://archive.org/download/3aedAlqrni1/QesatyM3Alketab.mp3"
          },
          {
            id: "l-qarni-42",
            title: "رحمة الله الواسعة",
            duration: "59:35",
            audioUrl: "https://archive.org/download/3aedAlqrni1/R7mtAllhAlwase3h.mp3"
          },
          {
            id: "l-qarni-43",
            title: "تعال بنا نؤمن ساعة",
            duration: "75:28",
            audioUrl: "https://archive.org/download/3aedAlqrni1/T3alBenaNomenSa3h.mp3"
          },
          {
            id: "l-qarni-44",
            title: "تعظيم الباري",
            duration: "66:06",
            audioUrl: "https://archive.org/download/3aedAlqrni1/T3demAlbary.mp3"
          },
          {
            id: "l-qarni-45",
            title: "تحديد الهدف",
            duration: "27:58",
            audioUrl: "https://archive.org/download/3aedAlqrni1/T7dedAlhdf.mp3"
          },
          {
            id: "l-qarni-46",
            title: "وقفات مع كتاب لا تحزن",
            duration: "23:37",
            audioUrl: "https://archive.org/download/3aedAlqrni1/WqfatM3KetabLaT7zn.mp3"
          },
          {
            id: "l-qarni-47",
            title: "يا رب",
            duration: "59:49",
            audioUrl: "https://archive.org/download/3aedAlqrni1/Yarb.mp3"
          },
          {
            id: "l-qarni-48",
            title: "احفظ الله يحفظك",
            duration: "72:30",
            audioUrl: "https://archive.org/download/Ayed_Al-Qarni_458_Lectures_Mp3_up-by-muslem/015-.mp3"
          },
          {
            id: "l-qarni-49",
            title: "أبو بكر في عصر الذرة",
            duration: "81:10",
            audioUrl: "https://archive.org/download/Ayed_Al-Qarni_458_Lectures_Mp3_up-by-muslem/002-.mp3"
          },
          {
            id: "l-qarni-50",
            title: "أبو ذر في عصر الكمبيوتر",
            duration: "77:45",
            audioUrl: "https://archive.org/download/Ayed_Al-Qarni_458_Lectures_Mp3_up-by-muslem/003-.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-munajjid",
    name: "الشيخ محمد صالح المنجد",
    description: "عالم وداعية سوري نشأ في السعودية، والمشرف العام على موقع الإسلام سؤال وجواب.",
    likes: 19800,
    series: [
      {
        id: "series-munajjid-quloob",
        title: "سلسلة أعمال القلوب",
        description: "سلسلة شاملة تتناول أعمال القلوب وتزكية النفس لفضيلة الشيخ محمد صالح المنجد، تشمل الإخلاص، المحبة، الخوف، الصبر، وعلاج أمراض القلوب.",
        lectures: [
          {
            id: "l-munaj-qul-01",
            title: "حاجتنا إلى الإخلاص",
            duration: "53:15",
            audioUrl: "https://archive.org/download/mezan-3laqat/hajtona-ela-aleklas.mp3"
          },
          {
            id: "l-munaj-qul-02",
            title: "الخوف من الله",
            duration: "48:20",
            audioUrl: "https://archive.org/download/mezan-3laqat/alkawf-men-allah.mp3"
          },
          {
            id: "l-munaj-qul-03",
            title: "الصبر على طاعة الله",
            duration: "51:10",
            audioUrl: "https://archive.org/download/mezan-3laqat/alsabr-ala-taeatallah.mp3"
          },
          {
            id: "l-munaj-qul-04",
            title: "المسلم بين الزهد والورع",
            duration: "44:30",
            audioUrl: "https://archive.org/download/mezan-3laqat/almoslim-zohd-waraa.mp3"
          },
          {
            id: "l-munaj-qul-05",
            title: "فوائد أعمال القلوب",
            duration: "55:00",
            audioUrl: "https://archive.org/download/mezan-3laqat/fawaed-aamal-golob.mp3"
          },
          {
            id: "l-munaj-qul-06",
            title: "أعمال القلوب في الشدة",
            duration: "52:40",
            audioUrl: "https://archive.org/download/mezan-3laqat/aamal-qoloob-shedah.mp3"
          },
          {
            id: "l-munaj-qul-07",
            title: "كيف نجدد إيماننا",
            duration: "49:15",
            audioUrl: "https://archive.org/download/mezan-3laqat/kayf-nojadded-emaan.mp3"
          },
          {
            id: "l-munaj-qul-08",
            title: "اللذة بالعبادة",
            duration: "47:30",
            audioUrl: "https://archive.org/download/mezan-3laqat/allathah.mp3"
          },
          {
            id: "l-munaj-qul-09",
            title: "ظاهرة ضعف الإيمان",
            duration: "50:20",
            audioUrl: "https://archive.org/download/mezan-3laqat/daaf-eman-daherah.mp3"
          },
          {
            id: "l-munaj-qul-10",
            title: "الانطلاق في طريق الاستقامة",
            duration: "54:40",
            audioUrl: "https://archive.org/download/mezan-3laqat/alentalq-tareeq-isteqamah.mp3"
          },
          {
            id: "l-munaj-qul-11",
            title: "الرياء وأثره على القلب",
            duration: "46:50",
            audioUrl: "https://archive.org/download/mezan-3laqat/alreyaa-l.mp3"
          },
          {
            id: "l-munaj-qul-12",
            title: "الحسد وأسبابه وعلاجه",
            duration: "42:30",
            audioUrl: "https://archive.org/download/mezan-3laqat/alhassad-l.mp3"
          },
          {
            id: "l-munaj-qul-13",
            title: "محبة الله والتعلق به",
            duration: "56:20",
            audioUrl: "https://archive.org/download/mezan-3laqat/mahabt-allah-l.mp3"
          },
          {
            id: "l-munaj-qul-14",
            title: "مفسدات القلوب",
            duration: "48:45",
            audioUrl: "https://archive.org/download/mezan-3laqat/mofsedat-algoloob.mp3"
          },
          {
            id: "l-munaj-qul-15",
            title: "تحريك القلوب",
            duration: "52:10",
            audioUrl: "https://archive.org/download/mezan-3laqat/tahreek-algoloob.mp3"
          },
          {
            id: "l-munaj-qul-16",
            title: "لذة الأعمال الصالحة",
            duration: "50:30",
            audioUrl: "https://archive.org/download/mezan-3laqat/ladt-alamal-alsalehah.mp3"
          },
          {
            id: "l-munaj-qul-17",
            title: "التوبة إلى الله",
            duration: "45:15",
            audioUrl: "https://archive.org/download/mezan-3laqat/toba-qorabaa-l.mp3"
          },
          {
            id: "l-munaj-qul-18",
            title: "الوقاية من همزات الشياطين",
            duration: "49:50",
            audioUrl: "https://archive.org/download/mezan-3laqat/weqayah-hamazat-shayateen.mp3"
          },
          {
            id: "l-munaj-qul-19",
            title: "كونوا ربانيين",
            duration: "51:25",
            audioUrl: "https://archive.org/download/mezan-3laqat/kono-rabbanyeen.mp3"
          },
          {
            id: "l-munaj-qul-20",
            title: "علاج الهوى",
            duration: "48:15",
            audioUrl: "https://archive.org/download/mezan-3laqat/elag-alhawa.mp3"
          },
          {
            id: "l-munaj-qul-21",
            title: "الصراع مع الشيطان",
            duration: "54:30",
            audioUrl: "https://archive.org/download/mezan-3laqat/alseraa-alshytaan.mp3"
          },
          {
            id: "l-munaj-qul-22",
            title: "فاستمسك بالذي أوحي إليك",
            duration: "52:10",
            audioUrl: "https://archive.org/download/mezan-3laqat/fastamsek-ballathi.mp3"
          },
          {
            id: "l-munaj-qul-23",
            title: "كيف نكتسب الأخلاق",
            duration: "46:40",
            audioUrl: "https://archive.org/download/mezan-3laqat/kyaf-takteseb-aklaaq.mp3"
          },
          {
            id: "l-munaj-qul-24",
            title: "مصاحبة الصالحين",
            duration: "50:20",
            audioUrl: "https://archive.org/download/mezan-3laqat/mosahbt-alsalheen.mp3"
          },
          {
            id: "l-munaj-qul-25",
            title: "كيف نعالج ذنوبنا",
            duration: "49:55",
            audioUrl: "https://archive.org/download/mezan-3laqat/no3alej-thonob.mp3"
          },
          {
            id: "l-munaj-qul-26",
            title: "الأخوة في الله",
            duration: "53:15",
            audioUrl: "https://archive.org/download/mezan-3laqat/okhowwah-fee-allah.mp3"
          },
          {
            id: "l-munaj-qul-27",
            title: "مكائد تلبيس إبليس",
            duration: "55:40",
            audioUrl: "https://archive.org/download/mezan-3laqat/makaaed-talbis-eblees.mp3"
          },
          {
            id: "l-munaj-qul-28",
            title: "معالم طريق العبودية - 1",
            duration: "51:10",
            audioUrl: "https://archive.org/download/mezan-3laqat/maalem-tareeq-obodyah01.mp3"
          },
          {
            id: "l-munaj-qul-29",
            title: "معالم طريق العبودية - 2",
            duration: "48:45",
            audioUrl: "https://archive.org/download/mezan-3laqat/maalem-tareeq-obodyah02.mp3"
          },
          {
            id: "l-munaj-qul-30",
            title: "الصراع مع الشهوات",
            duration: "52:15",
            audioUrl: "https://archive.org/download/mezan-3laqat/serah-alshahwaat.mp3"
          },
          {
            id: "l-munaj-qul-31",
            title: "تحديات النفس",
            duration: "48:50",
            audioUrl: "https://archive.org/download/mezan-3laqat/ta7dyat-nafs.mp3"
          },
          {
            id: "l-munaj-qul-32",
            title: "تحسين النفوس",
            duration: "50:10",
            audioUrl: "https://archive.org/download/mezan-3laqat/ta7sen-nfos.mp3"
          },
          {
            id: "l-munaj-qul-33",
            title: "الترقي في مراتب الكمال",
            duration: "54:20",
            audioUrl: "https://archive.org/download/mezan-3laqat/traqqi-kamal.mp3"
          },
          {
            id: "l-munaj-qul-34",
            title: "ربنا لا تجعلنا فتنة",
            duration: "47:35",
            audioUrl: "https://archive.org/download/mezan-3laqat/rabbana-la-taj3alna.mp3"
          },
          {
            id: "l-munaj-qul-35",
            title: "رفع المعنويات",
            duration: "51:40",
            audioUrl: "https://archive.org/download/mezan-3laqat/rafa-manweyat.mp3"
          },
          {
            id: "l-munaj-qul-36",
            title: "المسلم بين الخوف والرجاء",
            duration: "49:25",
            audioUrl: "https://archive.org/download/Mohammed_saleh_munajjid_mp3/262-.mp3"
          },
          {
            id: "l-munaj-qul-37",
            title: "النصر مع الصبر",
            duration: "53:10",
            audioUrl: "https://archive.org/download/Mohammed_saleh_munajjid_mp3/671-.mp3"
          },
          {
            id: "l-munaj-qul-38",
            title: "التوكل على الله في الأزمات",
            duration: "50:45",
            audioUrl: "https://archive.org/download/Mohammed_saleh_munajjid_mp3/160-.mp3"
          },
          {
            id: "l-munaj-qul-39",
            title: "أعقلها وتوكل",
            duration: "46:20",
            audioUrl: "https://archive.org/download/Mohammed_saleh_munajjid_mp3/075-.mp3"
          },
          {
            id: "l-munaj-qul-40",
            title: "كلمة الإخلاص وتحقيق معناها",
            duration: "55:10",
            audioUrl: "https://archive.org/download/Mohammed_saleh_munajjid_mp3/591-.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-maghamsi",
    name: "الشيخ صالح المغامسي",
    description: "داعية إسلامي سعودي، إمام وخطيب مسجد قباء سابقاً، يتميز بوقفاته وتأملاته القرآنية.",
    likes: 22600,
    series: [
      {
        id: "series-maghamsi-misc",
        title: "محاضرات وخطب مستقلة",
        description: "مجموعة من المحاضرات والدروس الإيمانية لفضيلة الشيخ صالح المغامسي، تتميز بالتدبر القرآني والرقائق والفوائد العقدية والتربوية.",
        lectures: [
          {
            id: "l-maghamsi-1",
            title: "حياة القلوب",
            duration: "52:14",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/2ayatalqolob.mp3"
          },
          {
            id: "l-maghamsi-2",
            title: "طبت حياً وميتاً",
            duration: "68:04",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/6ebta_hayan.mp3"
          },
          {
            id: "l-maghamsi-3",
            title: "حالنا في رمضان",
            duration: "60:00",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/7alonafiramadan.mp3"
          },
          {
            id: "l-maghamsi-4",
            title: "أعظم نعيم",
            duration: "55:06",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/aazmalnaem.mp3"
          },
          {
            id: "l-maghamsi-5",
            title: "أهل الله وخاصته",
            duration: "58:57",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/ahloalahwakhastho.mp3"
          },
          {
            id: "l-maghamsi-6",
            title: "العبد الصالح",
            duration: "56:31",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/alabd-alsaleh.mp3"
          },
          {
            id: "l-maghamsi-7",
            title: "الإيمان وأثره في حياة الإنسان",
            duration: "72:16",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/aleman.mp3"
          },
          {
            id: "l-maghamsi-8",
            title: "الحبيب وساعات الرحيل",
            duration: "72:22",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/alhabebwasa3atalrahel.mp3"
          },
          {
            id: "l-maghamsi-9",
            title: "الحسد الداء القاتل",
            duration: "20:44",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/alhasd-alda-alkatel.mp3"
          },
          {
            id: "l-maghamsi-10",
            title: "الراسخون في العلم",
            duration: "25:09",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/alrasekhoun.mp3"
          },
          {
            id: "l-maghamsi-11",
            title: "الشرف العظيم",
            duration: "44:39",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/alsharf-alazem.mp3"
          },
          {
            id: "l-maghamsi-12",
            title: "الوسطية في الكتاب والسنة",
            duration: "19:46",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/alwstia-fealketabwasonna.mp3"
          },
          {
            id: "l-maghamsi-13",
            title: "أسماء ومعالم في السيرة النبوية العطرة",
            duration: "27:10",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/asmawamalem.mp3"
          },
          {
            id: "l-maghamsi-14",
            title: "آيات وعظات",
            duration: "62:52",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/ayatwaezat.mp3"
          },
          {
            id: "l-maghamsi-15",
            title: "بيت آل عمران",
            duration: "19:25",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/bito-aleemran.mp3"
          },
          {
            id: "l-maghamsi-16",
            title: "دموع وتأملات",
            duration: "58:58",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/demo3watamolat.mp3"
          },
          {
            id: "l-maghamsi-17",
            title: "إضاءات من سراج النبوة",
            duration: "19:56",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/edaat-mnserag-alnobwwa.mp3"
          },
          {
            id: "l-maghamsi-18",
            title: "إذا الشمس كورت",
            duration: "57:45",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/ezaalshmskwert.mp3"
          },
          {
            id: "l-maghamsi-19",
            title: "إذا وقعت الواقعة",
            duration: "49:25",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/ezawaketalwakea.mp3"
          },
          {
            id: "l-maghamsi-20",
            title: "فاجعة الفجر",
            duration: "52:54",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/fage3toalfgr.mp3"
          },
          {
            id: "l-maghamsi-21",
            title: "قصة موسى والخضر",
            duration: "31:26",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/kestomousawakhdr.mp3"
          },
          {
            id: "l-maghamsi-22",
            title: "ختامها مسك",
            duration: "54:20",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/khetamomesk.mp3"
          },
          {
            id: "l-maghamsi-23",
            title: "نور التوحيد",
            duration: "56:08",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/nou-altwhed.mp3"
          },
          {
            id: "l-maghamsi-24",
            title: "علماء المدينة",
            duration: "59:52",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/olamaa.mp3"
          },
          {
            id: "l-maghamsi-25",
            title: "تاج الخشية",
            duration: "63:11",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/tag-alkhashia.mp3"
          },
          {
            id: "l-maghamsi-26",
            title: "وإن عدتم عدنا",
            duration: "61:58",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/waen3odtm3odna.mp3"
          },
          {
            id: "l-maghamsi-27",
            title: "وقفات مع نبي الله سليمان",
            duration: "80:54",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/wakfatma-nbialah.mp3"
          },
          {
            id: "l-maghamsi-28",
            title: "وصايا وتوجيهات لطلاب العلم",
            duration: "63:04",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/wasaiawatowgehat.mp3"
          },
          {
            id: "l-maghamsi-29",
            title: "وما قدروا الله حق قدره",
            duration: "49:30",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/wmakdroalahhkakdrh.mp3"
          },
          {
            id: "l-maghamsi-30",
            title: "ذواتا أفنان",
            duration: "55:40",
            audioUrl: "https://archive.org/download/saleh_____---almaghamsy----mp3----droos---khotab---mo7adarat/zwataafnan.mp3"
          },
          {
            id: "l-maghamsi-31",
            title: "حسن الظن بالله",
            duration: "02:46",
            audioUrl: "https://archive.org/download/way_954/7sn%20Az-Zn%20bAllah.mp3"
          },
          {
            id: "l-maghamsi-32",
            title: "الحزن في الدنيا",
            duration: "03:24",
            audioUrl: "https://archive.org/download/way_954/Al-7zn%20fee%20Ad-Dnya.mp3"
          },
          {
            id: "l-maghamsi-33",
            title: "الخلوة مع الله",
            duration: "07:18",
            audioUrl: "https://archive.org/download/way_954/Al-Khlut%20m3%20Allah.mp3"
          },
          {
            id: "l-maghamsi-34",
            title: "الله نور السموات والأرض",
            duration: "05:54",
            audioUrl: "https://archive.org/download/way_954/Allah%20nur%20As-Smwat%20walard.mp3"
          },
          {
            id: "l-maghamsi-35",
            title: "أهل الليل",
            duration: "06:16",
            audioUrl: "https://archive.org/download/way_954/Ash-Sheekh%20sal7%20Al-Mghamsee%20%20%20ahl%20Al-Layl.mp3"
          },
          {
            id: "l-maghamsi-36",
            title: "ادخر لنفسك يدخر لك",
            duration: "06:54",
            audioUrl: "https://archive.org/download/way_954/adkhr%20lnfsk%20ydkhr%20lk.mp3"
          },
          {
            id: "l-maghamsi-37",
            title: "استشعر لذة السجود",
            duration: "08:31",
            audioUrl: "https://archive.org/download/way_954/astsh3r%20lzt%20As-Sgud.mp3"
          },
          {
            id: "l-maghamsi-38",
            title: "دنت بشائره",
            duration: "50:18",
            audioUrl: "https://archive.org/download/way_954/dnt%20bsha'erh%20%20%20Ash-Sheekh%20sal7%20Al-Mghamsee.mp3"
          },
          {
            id: "l-maghamsi-39",
            title: "كيف تعرف حب الله لك",
            duration: "05:59",
            audioUrl: "https://archive.org/download/way_954/keef%20t3rf%207b%20Allah%20lk.mp3"
          },
          {
            id: "l-maghamsi-40",
            title: "كيف تخشع في الصلاة",
            duration: "03:13",
            audioUrl: "https://archive.org/download/way_954/keef%20tkhsh3%20fee%20As-Slat.mp3"
          },
          {
            id: "l-maghamsi-41",
            title: "خطبة في مسجد الراشد بالكويت",
            duration: "27:51",
            audioUrl: "https://archive.org/download/way_954/khtbt%20Ash-Sheekh%20sal7%20Al-Mghamsee%20fee%20msgd%20Ar-Rashd%20balkweet%20gdeed.mp3"
          },
          {
            id: "l-maghamsi-42",
            title: "لبيك يا أماه",
            duration: "41:04",
            audioUrl: "https://archive.org/download/way_954/lbeek%20ya%20amah%20%20%20Ash-Sheekh%20sal7%20Al-Mghamsee.mp3"
          },
          {
            id: "l-maghamsi-43",
            title: "من أسباب الستر يوم القيامة",
            duration: "02:16",
            audioUrl: "https://archive.org/download/way_954/mn%20asbab%20As-Str%20yum%20Al-Qiyama.mp3"
          },
          {
            id: "l-maghamsi-44",
            title: "نصيحة لكل من يستعمل الإنترنت",
            duration: "07:29",
            audioUrl: "https://archive.org/download/way_954/nsee7t%20lkl%20mn%20yst3ml%20Al-Antrnt.mp3"
          },
          {
            id: "l-maghamsi-45",
            title: "وجل القلوب من علام الغيوب",
            duration: "05:14",
            audioUrl: "https://archive.org/download/way_954/wgl%20Al-Qlub%20mn%203lam%20Al-Gheewb.mp3"
          },
          {
            id: "l-maghamsi-46",
            title: "وصف عرش الرحمن عز وجل",
            duration: "03:22",
            audioUrl: "https://archive.org/download/hob20140625/wasf%20alarsh.mp3"
          },
          {
            id: "l-maghamsi-47",
            title: "وصية قبل رمضان",
            duration: "07:38",
            audioUrl: "https://archive.org/download/ala_need_55_hotmail_20130617/%D9%88%D8%B5%D9%8A%D8%A9%20%D9%82%D8%A8%D9%84%20%D8%B1%D9%85%D8%B6%D8%A7%D9%86%20-%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%85%D8%BA%D8%A7%D9%85%D8%B3%D9%8A.mp3"
          },
          {
            id: "l-maghamsi-48",
            title: "فضل صيام يوم عرفة",
            duration: "08:51",
            audioUrl: "https://archive.org/download/syam_3arfa_me3macy/syam_3arfa_me3macy.mp3"
          },
          {
            id: "l-maghamsi-49",
            title: "أعظم الخذلان",
            duration: "03:53",
            audioUrl: "https://archive.org/download/mh3664_20130629/%D8%A7%D8%B9%D8%B8%D9%85%20%D8%A7%D9%84%D8%AE%D8%B0%D9%84%D8%A7%D9%86%20%D9%80%D9%80%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%85%D8%BA%D8%A7%D9%85%D8%B3%D9%8A.mp3"
          },
          {
            id: "l-maghamsi-50",
            title: "الظلم لا يأتي من الله",
            duration: "03:06",
            audioUrl: "https://archive.org/download/hazazinawaf_outlook_20131226/%D8%A7%D9%84%D8%B8%D9%84%D9%85%20%D9%84%D8%A7%20%D9%8A%D8%A3%D8%AA%D9%8A%20%D9%85%D9%86%20%D8%A7%D9%84%D9%84%D9%87%20%D9%80%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%85%D8%BA%D8%A7%D9%85%D8%B3%D9%8A.mp3"
          },
          {
            id: "l-maghamsi-51",
            title: "من نام وقد أوتر",
            duration: "01:42",
            audioUrl: "https://archive.org/download/sultan0o0o/%D9%85%D9%86%20%D9%86%D8%A7%D9%85%20%D9%88%D9%82%D8%AF%20%D8%A7%D9%88%D8%AA%D8%B1%20%20%D9%80%D9%80%20%D9%85%D9%85%D9%8A%D8%B2%20%D9%80%D9%80%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%85%D8%BA%D8%A7%D9%85%D8%B3%D9%8A.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-omar-nasser",
    name: "الشيخ الدكتور ناصر العمر",
    description: "عالم وداعية إسلامي سعودي، والأمين العام السابق لرابطة علماء المسلمين.",
    likes: 8500,
    series: [
      {
        id: "series-scholar-omar-nasser-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-omar-nasser-gen1-0",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-omar-nasser-gen1-1",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-omar-nasser-gen1-2",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-omar-nasser-gen1-3",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-omar-nasser-gen1-4",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          }
        ]
      },
      {
        id: "series-scholar-omar-nasser-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-omar-nasser-gen2-0",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-omar-nasser-gen2-1",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-omar-nasser-gen2-2",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-omar-nasser-gen2-3",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-omar-nasser-gen2-4",
            title: "التوبة والرجوع إلى الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-awda",
    name: "الشيخ الدكتور سلمان العودة",
    description: "مفكر وداعية إسلامي سعودي، مهتم بالقضايا الفكرية والتربوية والتربية الإيمانية.",
    likes: 31200,
    series: [
      {
        id: "series-awda-standalone",
        title: "محاضرات وخطب إيمانية (مستقلة)",
        description: "مجموعة من المحاضرات والخطب والدروس الإيمانية والتربوية المستقلة لفضيلة الشيخ الدكتور سلمان العودة.",
        lectures: [
          {
            id: "l-awda-1",
            title: "الشدة تقود إلى عوالم جميلة",
            duration: "25:40",
            audioUrl: "https://archive.org/download/alsheda_taqood_ela_a3walem_jamela_aloda/alsheda_taqood_ela_a3walem_jamela_aloda.mp3",
          },
          {
            id: "l-awda-2",
            title: "الدعاء بقلب صافٍ لا يرد بإذن الله",
            duration: "18:15",
            audioUrl: "https://archive.org/download/aldaa_beqalb_safy_la_yord_salman_aloda/aldaa_beqalb_safy_la_yord_salman_aloda.mp3",
          },
          {
            id: "l-awda-3",
            title: "القرآن أعظم الذكر",
            duration: "32:10",
            audioUrl: "https://archive.org/download/alquran_a3sam_alzekr_salman_ala3oda/alquran_a3sam_alzekr_salman_ala3oda.mp3",
          },
          {
            id: "l-awda-4",
            title: "مع القرآن - تدبر وإشراقات",
            duration: "45:20",
            audioUrl: "https://archive.org/download/Islamic_Tape-694_uP_bY_mUSLEm/01.mp3",
          },
          {
            id: "l-awda-5",
            title: "وقفات تربوية وإيمانية مع شهر رمضان",
            duration: "41:12",
            audioUrl: "https://archive.org/download/way2sona_20160309_2222/022-%D9%88%D9%82%D9%81%D8%A7%D8%AA%20%D9%85%D8%B9%20%D8%B4%D9%87%D8%B1%20%D8%B1%D9%85%D8%B6%D8%A7%D9%86-%D8%A7%D9%84%D8%AF%D9%83%D8%AA%D9%88%D8%B1%20%D8%B3%D9%84%D9%85%D8%A7%D9%86%20%D8%A8%D9%86%20%D9%81%D9%87%D8%AF%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9.mp3",
          },
          {
            id: "l-awda-14",
            title: "محاضرة حول الأحداث الأخيرة والتوجيهات الإيمانية",
            duration: "48:30",
            audioUrl: "https://archive.org/download/7wl-ALa7dath-Alakerh/7wl-ALa7dath-Alakerh.mp3",
          },
          {
            id: "l-awda-54",
            title: "صناعة النجاح والتميز",
            duration: "34:25",
            audioUrl: "https://archive.org/download/senat_alnajah_salman_aloda/senat_alnajah_salman_aloda.mp3",
          },
          {
            id: "l-awda-55",
            title: "شبابنا والهمم العالية",
            duration: "29:50",
            audioUrl: "https://archive.org/download/shababna_wa_alhemam_salman_aloda/shababna_wa_alhemam_salman_aloda.mp3",
          },
          {
            id: "l-awda-56",
            title: "رحلة إلى الدار الآخرة",
            duration: "42:15",
            audioUrl: "https://archive.org/download/rehla_ela_aldar_alakhira_salman_aloda/rehla_ela_aldar_alakhira_salman_aloda.mp3",
          },
          {
            id: "l-awda-57",
            title: "الرضا بالله وبأقدار الله عز وجل",
            duration: "27:10",
            audioUrl: "https://archive.org/download/alreda_belah_wa_aqdareh_salman_aloda/alreda_belah_wa_aqdareh_salman_aloda.mp3",
          }
        ]
      },
      {
        id: "series-awda-eshraqat",
        title: "سلسلة إشراقات قرآنية",
        description: "سلسلة تأملات وإشراقات قرآنية لفضيلة الشيخ الدكتور سلمان العودة تتناول تفسير ومواعظ سور جزء عم المبارك.",
        lectures: [
          {
            id: "l-awda-6",
            title: "إشراقات قرآنية: سورة الضحى",
            duration: "15:30",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AdDuha.mp3",
          },
          {
            id: "l-awda-7",
            title: "إشراقات قرآنية: سورة الإخلاص والتصديق",
            duration: "18:45",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlEkhlaas.mp3",
          },
          {
            id: "l-awda-8",
            title: "إشراقات قرآنية: سورة العصر وأهمية الوقت",
            duration: "16:10",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlAsr.mp3",
          },
          {
            id: "l-awda-9",
            title: "إشراقات قرآنية: سورة البلد والتكافل",
            duration: "22:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlBalad.mp3",
          },
          {
            id: "l-awda-10",
            title: "إشراقات قرآنية: سورة الانشقاق",
            duration: "19:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlEnshqaq.mp3",
          },
          {
            id: "l-awda-11",
            title: "إشراقات قرآنية: سورة البروج",
            duration: "21:05",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlBorog1.mp3",
          },
          {
            id: "l-awda-52",
            title: "إشراقات قرآنية: سورة البروج والجزاء (الجزء الثاني)",
            duration: "18:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlBorog2.mp3",
          },
          {
            id: "l-awda-12",
            title: "إشراقات قرآنية: سورة العاديات",
            duration: "14:50",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlAadiyat.mp3",
          },
          {
            id: "l-awda-13",
            title: "إشراقات قرآنية: سورة الفلق والتأمل في المعاني",
            duration: "17:25",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlFalaq.mp3",
          },
          {
            id: "l-awda-15",
            title: "إشراقات قرآنية: سورة الغاشية واليوم الآخر",
            duration: "20:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlGhashiyah.mp3",
          },
          {
            id: "l-awda-16",
            title: "إشراقات قرآنية: سورة الكافرون والبراءة من الشرك",
            duration: "16:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlKafirun.mp3",
          },
          {
            id: "l-awda-17",
            title: "إشراقات قرآنية: سورة القدر وفضل ليلة القدر",
            duration: "18:20",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlQadr.mp3",
          },
          {
            id: "l-awda-18",
            title: "إشراقات قرآنية: سورة الشمس وتزكية النفس",
            duration: "21:10",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AshShams.mp3",
          },
          {
            id: "l-awda-19",
            title: "إشراقات قرآنية: سورة التين وخلق الإنسان",
            duration: "19:05",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AtTin.mp3",
          },
          {
            id: "l-awda-20",
            title: "إشراقات قرآنية: سورة الزلزلة وحساب الأعمال",
            duration: "15:55",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AzZalzalah.mp3",
          },
          {
            id: "l-awda-21",
            title: "إشراقات قرآنية: سورة الليل والسعي المقبول",
            duration: "23:00",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlLail.mp3",
          },
          {
            id: "l-awda-22",
            title: "إشراقات قرآنية: سورة الأعلى والتسبيح",
            duration: "17:50",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlA3laa1.mp3",
          },
          {
            id: "l-awda-53",
            title: "إشراقات قرآنية: سورة الأعلى والآخرة (الجزء الثاني)",
            duration: "19:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlA3laa2.mp3",
          },
          {
            id: "l-awda-23",
            title: "إشراقات قرآنية: سورة القارعة والأهوال",
            duration: "16:30",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlQariah.mp3",
          },
          {
            id: "l-awda-24",
            title: "إشراقات قرآنية: سورة عبس (الجزء الأول)",
            duration: "18:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Abasa1.mp3",
          },
          {
            id: "l-awda-25",
            title: "إشراقات قرآنية: سورة عبس (الجزء الثاني)",
            duration: "19:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Abasa2.mp3",
          },
          {
            id: "l-awda-26",
            title: "إشراقات قرآنية: سورة البينة والتصديق",
            duration: "21:30",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlBainh.mp3",
          },
          {
            id: "l-awda-27",
            title: "إشراقات قرآنية: سورة الانفطار وإيمان القلب",
            duration: "17:45",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlEnftar.mp3",
          },
          {
            id: "l-awda-28",
            title: "إشراقات قرآنية: سورة الفيل والدروس المستفادة",
            duration: "14:20",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlFil.mp3",
          },
          {
            id: "l-awda-29",
            title: "إشراقات قرآنية: سورة الهمزة والتحذير من الأخلاق السيئة",
            duration: "15:10",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlHumazah.mp3",
          },
          {
            id: "l-awda-30",
            title: "إشراقات قرآنية: سورة الكوثر ونعم الله",
            duration: "13:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlKauthar.mp3",
          },
          {
            id: "l-awda-31",
            title: "إشراقات قرآنية: سورة المسد وعاقبة الإعراض",
            duration: "12:55",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlMasad.mp3",
          },
          {
            id: "l-awda-32",
            title: "إشراقات قرآنية: سورة الماعون والتكافل الاجتماعي",
            duration: "16:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlMaun.mp3",
          },
          {
            id: "l-awda-33",
            title: "إشراقات قرآنية: سورة التكاثر والتحذير من الغفلة",
            duration: "18:50",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlTakathr.mp3",
          },
          {
            id: "l-awda-34",
            title: "إشراقات قرآنية: سورة التكوير واليوم الموعود",
            duration: "20:30",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AlTakweer.mp3",
          },
          {
            id: "l-awda-35",
            title: "إشراقات قرآنية: سورة العلق وبداية الوحي (الجزء الأول)",
            duration: "19:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Alalaq1.mp3",
          },
          {
            id: "l-awda-36",
            title: "إشراقات قرآنية: سورة العلق والمعرفة (الجزء الثاني)",
            duration: "18:25",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Alalaq2.mp3",
          },
          {
            id: "l-awda-37",
            title: "إشراقات قرآنية: سورة الفجر والابتلاء والنعيم (الجزء الأول)",
            duration: "21:05",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Alfajr1.mp3",
          },
          {
            id: "l-awda-38",
            title: "إشراقات قرآنية: سورة الفجر والنفس المطمئنة (الجزء الثاني)",
            duration: "22:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Alfajr2.mp3",
          },
          {
            id: "l-awda-39",
            title: "إشراقات قرآنية: سورة المطففين والعدل (الجزء الأول)",
            duration: "17:50",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Almutaffifin1.mp3",
          },
          {
            id: "l-awda-40",
            title: "إشراقات قرآنية: سورة المطففين والأبرار (الجزء الثاني)",
            duration: "16:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Almutaffifin2.mp3",
          },
          {
            id: "l-awda-41",
            title: "إشراقات قرآنية: سورة المطففين والجزاء (الجزء الثالث)",
            duration: "18:10",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Almutaffifin3.mp3",
          },
          {
            id: "l-awda-42",
            title: "إشراقات قرآنية: سورة الناس والمعوذتين",
            duration: "15:45",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AnNas.mp3",
          },
          {
            id: "l-awda-43",
            title: "إشراقات قرآنية: سورة النصر والفتح المبين",
            duration: "14:50",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AnNasr.mp3",
          },
          {
            id: "l-awda-44",
            title: "إشراقات قرآنية: سورة النبأ والبعث (الجزء الأول)",
            duration: "20:05",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Annaba1.mp3",
          },
          {
            id: "l-awda-45",
            title: "إشراقات قرآنية: سورة النبأ والمتقين (الجزء الثاني)",
            duration: "19:55",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Annaba2.mp3",
          },
          {
            id: "l-awda-46",
            title: "إشراقات قرآنية: سورة النبأ والاليوم الآخر (الجزء الثالث)",
            duration: "18:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Annaba3.mp3",
          },
          {
            id: "l-awda-47",
            title: "إشراقات قرآنية: سورة النازعات والبعث (الجزء الأول)",
            duration: "21:30",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Annaziat1.mp3",
          },
          {
            id: "l-awda-48",
            title: "إشراقات قرآنية: سورة النازعات والخشية (الجزء الثاني)",
            duration: "22:10",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Annaziat2.mp3",
          },
          {
            id: "l-awda-49",
            title: "إشراقات قرآنية: سورة الشرح ويسر ما بعد العسر",
            duration: "13:20",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AshSharh.mp3",
          },
          {
            id: "l-awda-50",
            title: "إشراقات قرآنية: سورة الطارق والشهاب الثاقب",
            duration: "16:45",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/AtTariq.mp3",
          },
          {
            id: "l-awda-51",
            title: "إشراقات قرآنية: سورة قريش والأمن الغذائي والروحي",
            duration: "15:25",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/Quraish.mp3",
          }
        ]
      },
      {
        id: "series-awda-mousa-khidr",
        title: "سلسلة موسى والخضر عليهما السلام",
        description: "سلسلة قيمة من البرامج والدروس لفضيلة الشيخ الدكتور سلمان العودة يتناول فيها قصة نبي الله موسى مع العبد الصالح الخضر والدروس والفوائد والعبر المستفادة منها.",
        lectures: [
          {
            id: "l-awda-mousa-1",
            title: "قصة موسى والخضر (الجزء الأول): بداية الرحلة والطلب",
            duration: "24:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/MousaKhidr1.mp3",
          },
          {
            id: "l-awda-mousa-2",
            title: "قصة موسى والخضر (الجزء الثاني): ركوب السفينة وخرقها",
            duration: "22:40",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/MousaKhidr2.mp3",
          },
          {
            id: "l-awda-mousa-3",
            title: "قصة موسى والخضر (الجزء الثالث): لقاء الغلام وقتله",
            duration: "25:10",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/MousaKhidr3.mp3",
          },
          {
            id: "l-awda-mousa-4",
            title: "قصة موسى والخضر (الجزء الرابع): الجدار واليتيمين والكنز",
            duration: "23:05",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/MousaKhidr4.mp3",
          },
          {
            id: "l-awda-mousa-5",
            title: "قصة موسى والخضر (الجزء الخامس): كشف الأسرار والتأويل",
            duration: "26:30",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/MousaKhidr5.mp3",
          },
          {
            id: "l-awda-mousa-6",
            title: "قصة موسى والخضر (الجزء السادس): العبر التربوية والفوائد الإيمانية",
            duration: "28:15",
            audioUrl: "https://archive.org/download/EshraqatQuraaneihSalmanAlodah/MousaKhidr6.mp3",
          }
        ]
      }
    ]
  },
  {
    id: "scholar-hassan",
    name: "الشيخ الدكتور محمد حسان",
    description: "داعية إسلامي مصري، متميز بأسلوبه الوعظي المؤثر.",
    likes: 27500,
    series: [
      {
        id: "series-hassan-misc",
        title: "محاضرات منوعة (مستقلة)",
        description: "مجموعة من المحاضرات والخطب المستقلة لفضيلة الشيخ محمد حسان.",
        lectures: [
          {
            id: "l-hassan-1",
            title: "أبناؤنا بين البر والعقوق",
            duration: "58:29",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/002-.mp3",
          },
          {
            id: "l-hassan-2",
            title: "آثار الذنوب والمعاصي",
            duration: "1:05:02",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/003--.mp3",
          },
          {
            id: "l-hassan-3",
            title: "أثر الذنوب على الأمة",
            duration: "1:07:21",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/004-.mp3",
          },
          {
            id: "l-hassan-4",
            title: "أختاه ماذا تقولي لربك غدا",
            duration: "55:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/005-.mp3",
          },
          {
            id: "l-hassan-5",
            title: "إخلاف الوعد",
            duration: "33:12",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/006-.mp3",
          },
          {
            id: "l-hassan-6",
            title: "أدب الخلاف",
            duration: "1:16:37",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/007-.mp3",
          },
          {
            id: "l-hassan-7",
            title: "ارفع راية الخير",
            duration: "55:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/008-.mp3",
          },
          {
            id: "l-hassan-8",
            title: "أسير في قيد .. دروس وعبر",
            duration: "47:06",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/009-...mp3",
          },
          {
            id: "l-hassan-9",
            title: "أفى الله شك",
            duration: "54:23",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/013-.mp3",
          },
          {
            id: "l-hassan-10",
            title: "اقترب ظهور المهدي",
            duration: "58:29",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/014-.mp3",
          },
          {
            id: "l-hassan-11",
            title: "أقسام التوحيد",
            duration: "57:59",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/015-.mp3",
          },
          {
            id: "l-hassan-12",
            title: "أكل مال اليتيم",
            duration: "38:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/016-.mp3",
          },
          {
            id: "l-hassan-13",
            title: "الأزمة السكانية والحلول الغائب",
            duration: "55:40",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/019-.mp3",
          },
          {
            id: "l-hassan-14",
            title: "الاستقامة على الطاعة بعد رمضان",
            duration: "41:05",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/020-.mp3",
          },
          {
            id: "l-hassan-15",
            title: "الإسلام قادم .. تعليق على الأح",
            duration: "1:01:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/021-...mp3",
          },
          {
            id: "l-hassan-16",
            title: "الإسلام كل لا يتجزأ",
            duration: "41:02",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/022-.mp3",
          },
          {
            id: "l-hassan-17",
            title: "الإسلام وسعادة البشرية",
            duration: "1:25:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/023-.mp3",
          },
          {
            id: "l-hassan-18",
            title: "الآمن و الأمان",
            duration: "33:41",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/024-.mp3",
          },
          {
            id: "l-hassan-19",
            title: "الأمن والأمان",
            duration: "33:44",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/025-.mp3",
          },
          {
            id: "l-hassan-20",
            title: "الإيمان الزائف",
            duration: "1:00:41",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/026-.mp3",
          },
{
            id: "l-hassan-21",
            title: "الإيمان الزائف",
            duration: "1:00:41",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/026-.mp3",
          },
          {
            id: "l-hassan-22",
            title: "الباحثين عن السعادة",
            duration: "47:09",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/027-.mp3",
          },
          {
            id: "l-hassan-23",
            title: "البعث و النشور",
            duration: "33:33",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/028-.mp3",
          },
          {
            id: "l-hassan-24",
            title: "التبرج و السفور",
            duration: "53:48",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/029-.mp3",
          },
          {
            id: "l-hassan-25",
            title: "التبرج والسفور",
            duration: "53:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/030-.mp3",
          },
          {
            id: "l-hassan-26",
            title: "الترغيب في الزواج",
            duration: "43:30",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/031-.mp3",
          },
          {
            id: "l-hassan-27",
            title: "التضحية والفداء",
            duration: "28:39",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/032-.mp3",
          },
          {
            id: "l-hassan-28",
            title: "التعبئة الإيمانية قبل التعبئة",
            duration: "19:14",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/033-.mp3",
          },
          {
            id: "l-hassan-29",
            title: "التوبة",
            duration: "1:03:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/034-.mp3",
          },
          {
            id: "l-hassan-30",
            title: "الثبات حتى الممات",
            duration: "49:19",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/035-.mp3",
          },
          {
            id: "l-hassan-31",
            title: "الثبات على الفتن",
            duration: "54:42",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/036-.mp3",
          },
          {
            id: "l-hassan-32",
            title: "الثقة في الله",
            duration: "40:14",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/037-.mp3",
          },
          {
            id: "l-hassan-33",
            title: "الجهاد سلعة ثمنها الجنة",
            duration: "1:00:52",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/038-.mp3",
          },
          {
            id: "l-hassan-34",
            title: "الحجاب يا أختاه!",
            duration: "56:39",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/040-.mp3",
          },
          {
            id: "l-hassan-35",
            title: "الحرب على الثوابت - دفاع عن ال",
            duration: "59:48",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/041--.mp3",
          },
          {
            id: "l-hassan-36",
            title: "الحصاد المر",
            duration: "51:26",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/046-.mp3",
          },
          {
            id: "l-hassan-37",
            title: "الحمل بالمسيح",
            duration: "58:12",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/047-.mp3",
          },
          {
            id: "l-hassan-38",
            title: "الحياء كله خير",
            duration: "53:09",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/048-.mp3",
          },
          {
            id: "l-hassan-39",
            title: "الخطبة العصماء",
            duration: "52:34",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/049-.mp3",
          },
          {
            id: "l-hassan-40",
            title: "الخلوة والاختلاط",
            duration: "43:17",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/050-.mp3",
          },
          {
            id: "l-hassan-41",
            title: "الخلوة والإختلاط",
            duration: "45:18",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/051-.mp3",
          },
          {
            id: "l-hassan-42",
            title: "الخوف ثمرة الإيمان",
            duration: "58:04",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/052-.mp3",
          },
          {
            id: "l-hassan-43",
            title: "الخوف من الله",
            duration: "1:00:33",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/053-.mp3",
          },
          {
            id: "l-hassan-44",
            title: "الخوف والرجاء",
            duration: "40:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/054-.mp3",
          },
          {
            id: "l-hassan-45",
            title: "الدر المنثور في الذود عن أصحاب",
            duration: "1:00:07",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/055-.mp3",
          },
          {
            id: "l-hassan-46",
            title: "الرزق ثمرة التوكل",
            duration: "1:10:26",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/057-.mp3",
          },
          {
            id: "l-hassan-47",
            title: "الرياء",
            duration: "39:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/058-.mp3",
          },
          {
            id: "l-hassan-48",
            title: "الزاد الثمين للحجاج والمعتمرين",
            duration: "1:46:25",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/059-.mp3",
          },
          {
            id: "l-hassan-49",
            title: "الزلزال",
            duration: "44:53",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/060-.mp3",
          },
          {
            id: "l-hassan-50",
            title: "الزواج العرفي",
            duration: "1:20:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/061-.mp3",
          },
{
            id: "l-hassan-51",
            title: "السحر والعلاج",
            duration: "41:02",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/062-.mp3",
          },
          {
            id: "l-hassan-52",
            title: "السعادة الزوجية",
            duration: "1:28:12",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/063-.mp3",
          },
          {
            id: "l-hassan-53",
            title: "الشهوات والملذات",
            duration: "59:25",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/064-.mp3",
          },
          {
            id: "l-hassan-54",
            title: "الشهوات",
            duration: "55:24",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/065-.mp3",
          },
          {
            id: "l-hassan-55",
            title: "الشياطين حول جهنم",
            duration: "57:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/066-.mp3",
          },
          {
            id: "l-hassan-56",
            title: "الشيعة والسنة",
            duration: "54:25",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/067-.mp3",
          },
          {
            id: "l-hassan-57",
            title: "الصبر على الأذى فى العلم",
            duration: "1:10:39",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/070-.mp3",
          },
          {
            id: "l-hassan-58",
            title: "الصدق فى العمل والحكمه فى الدع",
            duration: "1:07:00",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/071-.mp3",
          },
          {
            id: "l-hassan-59",
            title: "الطريق الأقوم",
            duration: "52:05",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/072-.mp3",
          },
          {
            id: "l-hassan-60",
            title: "الطريق إلى الدار الآخرة",
            duration: "31:36",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/073-.mp3",
          },
          {
            id: "l-hassan-61",
            title: "الطريق إلى السعادة الزوجية",
            duration: "1:28:00",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/074-.mp3",
          },
          {
            id: "l-hassan-62",
            title: "الطريق إلى القدس",
            duration: "1:09:24",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/075-.mp3",
          },
          {
            id: "l-hassan-63",
            title: "الطريق إلى الله",
            duration: "53:08",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/076-.mp3",
          },
          {
            id: "l-hassan-64",
            title: "العقل البشري ومنهج الله",
            duration: "51:30",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/077-.mp3",
          },
          {
            id: "l-hassan-65",
            title: "الغفلة",
            duration: "53:09",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/078-.mp3",
          },
          {
            id: "l-hassan-66",
            title: "الغيبة و النميمة",
            duration: "46:16",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/079-.mp3",
          },
          {
            id: "l-hassan-67",
            title: "الفجر الصادق والكاذب",
            duration: "53:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/080-.mp3",
          },
          {
            id: "l-hassan-68",
            title: "الفوز العظيم",
            duration: "59:21",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/081-.mp3",
          },
          {
            id: "l-hassan-69",
            title: "القدس مدينة السلام",
            duration: "53:29",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/082-.mp3",
          },
          {
            id: "l-hassan-70",
            title: "القرن القادم للإسلام",
            duration: "1:02:23",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/083-.mp3",
          },
          {
            id: "l-hassan-71",
            title: "الكاسيات العاريات",
            duration: "47:42",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/084-.mp3",
          },
          {
            id: "l-hassan-72",
            title: "المخدرات",
            duration: "55:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/085-.mp3",
          },
          {
            id: "l-hassan-73",
            title: "المداومة على العمل الصالح شعار",
            duration: "54:23",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/086-.mp3",
          },
          {
            id: "l-hassan-74",
            title: "المرأة المسلمة فى وجه الطوفان",
            duration: "1:04:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/087-.mp3",
          },
          {
            id: "l-hassan-75",
            title: "المستقبل لهذا الدين",
            duration: "45:04",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/088-.mp3",
          },
          {
            id: "l-hassan-76",
            title: "الملحمة العمرية",
            duration: "56:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/089-.mp3",
          },
          {
            id: "l-hassan-77",
            title: "المؤامرة",
            duration: "55:31",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/090-.mp3",
          },
          {
            id: "l-hassan-78",
            title: "الموت والقبر",
            duration: "58:55",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/091-.mp3",
          },
          {
            id: "l-hassan-79",
            title: "النبى على عرفات",
            duration: "20:56",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/093-.mp3",
          },
          {
            id: "l-hassan-80",
            title: "النبي القدوة",
            duration: "51:51",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/094-.mp3",
          },
{
            id: "l-hassan-81",
            title: "النفاق",
            duration: "59:15",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/095-.mp3",
          },
          {
            id: "l-hassan-82",
            title: "النقاب",
            duration: "1:30:32",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/096-.mp3",
          },
          {
            id: "l-hassan-83",
            title: "الهجرة عطاء متجدد",
            duration: "55:26",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/097-.mp3",
          },
          {
            id: "l-hassan-84",
            title: "الهداية وعبادة الله",
            duration: "1:24:29",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/098-.mp3",
          },
          {
            id: "l-hassan-85",
            title: "الهزيمة النفسية",
            duration: "1:15:27",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/099-.mp3",
          },
          {
            id: "l-hassan-86",
            title: "الهمز واللمز وسوء الظن والغيبة",
            duration: "42:27",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/100-.mp3",
          },
          {
            id: "l-hassan-87",
            title: "الهموم بقدر الهمم",
            duration: "1:23:16",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/101-.mp3",
          },
          {
            id: "l-hassan-88",
            title: "الوصية الخالدة",
            duration: "1:09:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/102-.mp3",
          },
          {
            id: "l-hassan-89",
            title: "الوفاء بالعهد",
            duration: "50:39",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/103-.mp3",
          },
          {
            id: "l-hassan-90",
            title: "الوقت هو الحياة",
            duration: "1:10:16",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/104-.mp3",
          },
          {
            id: "l-hassan-91",
            title: "إلى الباحثين عن السعادة",
            duration: "47:09",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/105-.mp3",
          },
          {
            id: "l-hassan-92",
            title: "إلى الجنة بغير حساب",
            duration: "58:51",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/106-.mp3",
          },
          {
            id: "l-hassan-93",
            title: "إلى الشباب",
            duration: "1:10:42",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/107-.mp3",
          },
          {
            id: "l-hassan-94",
            title: "أمة تحتاج إلى يقين",
            duration: "1:00:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/109-.mp3",
          },
          {
            id: "l-hassan-95",
            title: "أمة لا تعرف قدر نبيها",
            duration: "1:07:34",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/110-.mp3",
          },
          {
            id: "l-hassan-96",
            title: "أميرة القصر، وقضية العصر",
            duration: "58:14",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/112-.mp3",
          },
          {
            id: "l-hassan-97",
            title: "إن أكرمكم عند الله أتقاكم",
            duration: "41:17",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/113-.mp3",
          },
          {
            id: "l-hassan-98",
            title: "أنت الذي تؤخر النصر عن الأمة",
            duration: "20:59",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/114-.mp3",
          },
          {
            id: "l-hassan-99",
            title: "انتبه فالموت قادم!",
            duration: "57:47",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/115-.mp3",
          },
          {
            id: "l-hassan-100",
            title: "إنما المؤمنون إخوة",
            duration: "57:12",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/116-.mp3",
          },
          {
            id: "l-hassan-101",
            title: "آه ...آه يا مسلمون!",
            duration: "59:35",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/117-....mp3",
          },
          {
            id: "l-hassan-102",
            title: "أهمية العلم والعمل به",
            duration: "1:16:16",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/118-.mp3",
          },
          {
            id: "l-hassan-103",
            title: "أهوال وعذاب القبر",
            duration: "50:32",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/119-.mp3",
          },
          {
            id: "l-hassan-104",
            title: "أيها العاصي تب إلى ربك",
            duration: "53:25",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/120-.mp3",
          },
          {
            id: "l-hassan-105",
            title: "بشرى وأمل!",
            duration: "1:31:30",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/121-.mp3",
          },
          {
            id: "l-hassan-106",
            title: "بشريات من الشيشان",
            duration: "1:02:54",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/122-.mp3",
          },
          {
            id: "l-hassan-107",
            title: "بشريات من أمريكا",
            duration: "56:12",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/123-.mp3",
          },
          {
            id: "l-hassan-108",
            title: "بل هم الخنازير",
            duration: "1:10:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/124-.mp3",
          },
          {
            id: "l-hassan-109",
            title: "بل هم الخنزير",
            duration: "1:09:50",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/125-.mp3",
          },
          {
            id: "l-hassan-110",
            title: "تارك الصلاة",
            duration: "43:00",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/126-.mp3",
          },
{
            id: "l-hassan-111",
            title: "تبعية ثقيلة",
            duration: "32:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/127-.mp3",
          },
          {
            id: "l-hassan-112",
            title: "تجرد و عدل و إنصاف",
            duration: "40:18",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/128-.mp3",
          },
          {
            id: "l-hassan-113",
            title: "تحذير الأحباب ممن حرم النقاب",
            duration: "1:30:48",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/129-.mp3",
          },
          {
            id: "l-hassan-114",
            title: "تذكرة الموت",
            duration: "57:28",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/130-.mp3",
          },
          {
            id: "l-hassan-115",
            title: "تعظيم حرمات المسلمين",
            duration: "44:56",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/133-.mp3",
          },
          {
            id: "l-hassan-116",
            title: "تفسير سورة ق",
            duration: "47:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/134-.mp3",
          },
          {
            id: "l-hassan-117",
            title: "تفسير سورة يوسف",
            duration: "36:48",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/135-.mp3",
          },
          {
            id: "l-hassan-118",
            title: "تقوى و إخلاص",
            duration: "42:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/136-.mp3",
          },
          {
            id: "l-hassan-119",
            title: "تلقين الميت الشهادة",
            duration: "51:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/137-.mp3",
          },
          {
            id: "l-hassan-120",
            title: "تلك حدود الله",
            duration: "58:35",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/138-.mp3",
          },
          {
            id: "l-hassan-121",
            title: "توحيد الربوبية - الخلق والرزق",
            duration: "1:15:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/139--.mp3",
          },
          {
            id: "l-hassan-122",
            title: "جرائم بشعة",
            duration: "56:05",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/140-.mp3",
          },
          {
            id: "l-hassan-123",
            title: "حادثة الإفك",
            duration: "45:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/141-.mp3",
          },
          {
            id: "l-hassan-124",
            title: "حبيبة رسول الله",
            duration: "50:49",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/142-.mp3",
          },
          {
            id: "l-hassan-125",
            title: "حجاب المراة المسلمة",
            duration: "57:23",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/143-.mp3",
          },
          {
            id: "l-hassan-126",
            title: "حجاب المرأة المسلمة",
            duration: "57:11",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/144-.mp3",
          },
          {
            id: "l-hassan-127",
            title: "حدثني أبي",
            duration: "1:28:11",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/145-.mp3",
          },
          {
            id: "l-hassan-128",
            title: "حديث الركب",
            duration: "1:03:02",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/146-.mp3",
          },
          {
            id: "l-hassan-129",
            title: "حسن الخلق",
            duration: "1:13:00",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/147-.mp3",
          },
          {
            id: "l-hassan-130",
            title: "حصاد اللسان",
            duration: "57:05",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/148-.mp3",
          },
          {
            id: "l-hassan-131",
            title: "حضارة العبيد",
            duration: "59:19",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/149-.mp3",
          },
          {
            id: "l-hassan-132",
            title: "حق الأمانة",
            duration: "1:02:52",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/150-.mp3",
          },
          {
            id: "l-hassan-133",
            title: "حق التقوى",
            duration: "1:00:31",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/151-.mp3",
          },
          {
            id: "l-hassan-134",
            title: "حق الرضا",
            duration: "1:05:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/152-.mp3",
          },
          {
            id: "l-hassan-135",
            title: "حق الفهم عن الله ورسوله",
            duration: "58:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/153-.mp3",
          },
          {
            id: "l-hassan-136",
            title: "حق القدس",
            duration: "56:21",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/154-.mp3",
          },
          {
            id: "l-hassan-137",
            title: "حق القرآن و سبيل العزة",
            duration: "59:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/155-.mp3",
          },
          {
            id: "l-hassan-138",
            title: "حق القرآن وسبيل العزة",
            duration: "59:41",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/156-.mp3",
          },
          {
            id: "l-hassan-139",
            title: "حق الله على العباد",
            duration: "1:26:16",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/157-.mp3",
          },
          {
            id: "l-hassan-140",
            title: "حق الموالاة والمعاداة",
            duration: "52:59",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/159-.mp3",
          },
          {
            id: "l-hassan-141",
            title: "حق الوالدين",
            duration: "57:52",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/160-.mp3",
          },
          {
            id: "l-hassan-142",
            title: "حقوق الأبناء",
            duration: "1:24:32",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/161-.mp3",
          },
          {
            id: "l-hassan-143",
            title: "حقيقة الدنيا",
            duration: "59:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/162-.mp3",
          },
          {
            id: "l-hassan-144",
            title: "حول آيات من سورة ق",
            duration: "47:06",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/163-.mp3",
          },
          {
            id: "l-hassan-145",
            title: "خطبة الجمعة بعنوان-لم الخوف م",
            duration: "1:17:26",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/164--.mp3",
          },
          {
            id: "l-hassan-146",
            title: "خطر الفراغ على الشباب",
            duration: "59:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/165-.mp3",
          },
          {
            id: "l-hassan-147",
            title: "خطورة الكلمة",
            duration: "1:04:09",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/166-.mp3",
          },
          {
            id: "l-hassan-148",
            title: "خواطر حول سورة الزلزلة",
            duration: "55:15",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/167-.mp3",
          },
          {
            id: "l-hassan-149",
            title: "خير الزاد",
            duration: "30:07",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/168-.mp3",
          },
          {
            id: "l-hassan-150",
            title: "دروس من الأحداث الأمريكية",
            duration: "1:06:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/169-.mp3",
          },
          {
            id: "l-hassan-151",
            title: "دعاء زكريا عليه السلام",
            duration: "37:50",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/170-.mp3",
          },
          {
            id: "l-hassan-152",
            title: "دعاة لا أدعياء",
            duration: "1:10:42",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/171-.mp3",
          },
          {
            id: "l-hassan-153",
            title: "دفاع عن السنة للرد على مصطفى م",
            duration: "1:02:27",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/172-.mp3",
          },
          {
            id: "l-hassan-154",
            title: "دور المرأة في استقامة الأسرة",
            duration: "1:01:25",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/173-.mp3",
          },
          {
            id: "l-hassan-155",
            title: "ربانيون لا رمضانيون",
            duration: "1:02:18",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/174-.mp3",
          },
          {
            id: "l-hassan-156",
            title: "رحلتي إلى أمريكا",
            duration: "37:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/175-.mp3",
          },
          {
            id: "l-hassan-157",
            title: "ردة ولا أبا بكر لها",
            duration: "1:02:22",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/176-.mp3",
          },
          {
            id: "l-hassan-158",
            title: "رسالة إلى أصحاب الأسرة البيضاء",
            duration: "49:11",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/177-.mp3",
          },
          {
            id: "l-hassan-159",
            title: "رسالة إلى الشباب",
            duration: "56:34",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/178-.mp3",
          },
          {
            id: "l-hassan-160",
            title: "رسالة يحيى عليه السلام",
            duration: "34:28",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/179-.mp3",
          },
{
            id: "l-hassan-161",
            title: "رمضان تجارة رابحة",
            duration: "39:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/180-.mp3",
          },
          {
            id: "l-hassan-162",
            title: "سعادة البشرية",
            duration: "36:21",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/183-.mp3",
          },
          {
            id: "l-hassan-163",
            title: "سكرات الموت",
            duration: "56:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/184-.mp3",
          },
          {
            id: "l-hassan-164",
            title: "سماحة الإسلام وإرهاب الغرب",
            duration: "1:01:48",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/185-.mp3",
          },
          {
            id: "l-hassan-165",
            title: "سوء الخاتمة",
            duration: "1:09:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/186-.mp3",
          },
          {
            id: "l-hassan-166",
            title: "سؤال وجواب لماذا يترك الله ال",
            duration: "39:13",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/187-.mp3",
          },
          {
            id: "l-hassan-167",
            title: "سيف الله المسلول - خالد بن الو",
            duration: "1:04:43",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/188--.mp3",
          },
          {
            id: "l-hassan-168",
            title: "شباب كأس العالم وشباب علّم الع",
            duration: "56:27",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/189-.mp3",
          },
          {
            id: "l-hassan-169",
            title: "شبابنا أمل وألم",
            duration: "1:16:09",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/190-.mp3",
          },
          {
            id: "l-hassan-170",
            title: "شعلة توقد شموس الحياة",
            duration: "49:58",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/191-.mp3",
          },
          {
            id: "l-hassan-171",
            title: "صبر أيوب",
            duration: "51:55",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/192-.mp3",
          },
          {
            id: "l-hassan-172",
            title: "صرخات من القدس الجريح",
            duration: "54:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/193-.mp3",
          },
          {
            id: "l-hassan-173",
            title: "صفحات سود من تاريخ يهود",
            duration: "1:07:54",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/194-.mp3",
          },
          {
            id: "l-hassan-174",
            title: "صور وعبر من أخبار السلف",
            duration: "1:27:33",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/195-.mp3",
          },
          {
            id: "l-hassan-175",
            title: "طهارة السيدة مريم عليه السلام",
            duration: "39:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/196-.mp3",
          },
          {
            id: "l-hassan-176",
            title: "طوبى للغرباء",
            duration: "1:13:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/197-.mp3",
          },
          {
            id: "l-hassan-177",
            title: "عاقبة الزنا",
            duration: "44:04",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/198-.mp3",
          },
          {
            id: "l-hassan-178",
            title: "عبادة الشيطان",
            duration: "1:12:19",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/199-.mp3",
          },
          {
            id: "l-hassan-179",
            title: "عبدة الشيطان",
            duration: "1:07:43",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/200-.mp3",
          },
          {
            id: "l-hassan-180",
            title: "عذاب القبر",
            duration: "58:02",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/201-.mp3",
          },
          {
            id: "l-hassan-181",
            title: "عرش الرحمن",
            duration: "56:12",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/202-.mp3",
          },
          {
            id: "l-hassan-182",
            title: "عندما ترعى الذئاب الغنم",
            duration: "55:33",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/203-.mp3",
          },
          {
            id: "l-hassan-183",
            title: "عوائق فى طريق التوبة",
            duration: "1:19:31",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/204-.mp3",
          },
          {
            id: "l-hassan-184",
            title: "عيسى بن مريم والميلاد المعجز",
            duration: "1:02:11",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/205-.mp3",
          },
          {
            id: "l-hassan-185",
            title: "غاية غالية",
            duration: "56:37",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/206-.mp3",
          },
          {
            id: "l-hassan-186",
            title: "غربة الإسلام",
            duration: "59:37",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/207-.mp3",
          },
          {
            id: "l-hassan-187",
            title: "فبهت الذي كفر",
            duration: "44:28",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/208-.mp3",
          },
          {
            id: "l-hassan-188",
            title: "فتاوى حاخامية",
            duration: "1:09:36",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/209-.mp3",
          },
          {
            id: "l-hassan-189",
            title: "فتح مكة",
            duration: "43:38",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/213-.mp3",
          },
          {
            id: "l-hassan-190",
            title: "فصبر جميل",
            duration: "35:40",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/214-.mp3",
          },
          {
            id: "l-hassan-191",
            title: "فضل الدعاء",
            duration: "42:55",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/215-.mp3",
          },
          {
            id: "l-hassan-192",
            title: "فضل الصيام",
            duration: "39:13",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/216-.mp3",
          },
          {
            id: "l-hassan-193",
            title: "فضل العلم والعلماء",
            duration: "53:29",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/217-.mp3",
          },
          {
            id: "l-hassan-194",
            title: "فضل بناء المساجد و فضل صلاة ال",
            duration: "35:01",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/218-.mp3",
          },
          {
            id: "l-hassan-195",
            title: "فضل بناء المساجد وفضل صلاة الج",
            duration: "35:02",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/219-.mp3",
          },
          {
            id: "l-hassan-196",
            title: "ففروا إلى الله",
            duration: "52:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/220-.mp3",
          },
          {
            id: "l-hassan-197",
            title: "في ساحة الحساب",
            duration: "57:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/221-.mp3",
          },
          {
            id: "l-hassan-198",
            title: "في ظلال الإسراء والمعراج",
            duration: "51:03",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/222-.mp3",
          },
          {
            id: "l-hassan-199",
            title: "في مثل هذا اليوم الجمعة 10من",
            duration: "1:21:52",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/223-10.mp3",
          },
          {
            id: "l-hassan-200",
            title: "قانون الأحوال الشخصية في ميزان",
            duration: "1:01:52",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/224-.mp3",
          },
          {
            id: "l-hassan-201",
            title: "قبل أن تغرق السفينة",
            duration: "1:00:21",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/225-.mp3",
          },
          {
            id: "l-hassan-202",
            title: "قدر النبي عند الله",
            duration: "1:00:47",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/226-.mp3",
          },
          {
            id: "l-hassan-203",
            title: "قذف المحصنات",
            duration: "43:46",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/227-.mp3",
          },
          {
            id: "l-hassan-204",
            title: "قصة الصليب",
            duration: "1:12:25",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/228-.mp3",
          },
          {
            id: "l-hassan-205",
            title: "قضية العصر و أمير القصر",
            duration: "56:10",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/229-.mp3",
          },
          {
            id: "l-hassan-206",
            title: "قل آمنت بالله ثم استقم",
            duration: "36:29",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/230-.mp3",
          },
          {
            id: "l-hassan-207",
            title: "قلوب الصالحين",
            duration: "1:04:13",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/231-.mp3",
          },
          {
            id: "l-hassan-208",
            title: "قواعد الدين عند النصارى",
            duration: "36:57",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/232-.mp3",
          },
          {
            id: "l-hassan-209",
            title: "قواعد منهجية لترشيد الصحوة الإ",
            duration: "33:31",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/233-.mp3",
          },
          {
            id: "l-hassan-210",
            title: "كلام المسيح فى المهد",
            duration: "35:14",
            audioUrl: "https://archive.org/download/M-HaSSeN_428_Lectures_Mp3_up-by-muslem/234-.mp3",
          },
        ]
      }
    ]
  },
  {
    id: "scholar-heweni",
    name: "الشيخ أبو إسحاق الحويني",
    description: "عالم ومحدث مصري، مهتم بعلم الحديث وتخريجه وتحقيقه.",
    likes: 18900,
    series: [
      {
        id: "series-heweni-general",
        title: "محاضرات عامة ودروس مستقلة",
        description: "باقة من أقوى وأشهر المحاضرات والخطب الدعوية والتربوية لفضيلة الشيخ أبي إسحاق الحويني.",
        lectures: [
          {
            id: "l-heweni-1",
            title: "ليلة في بيت النبي صلى الله عليه وسلم",
            duration: "2:08:10",
            audioUrl: "https://archive.org/download/Al-Alheweny/001-.mp3"
          },
          {
            id: "l-heweni-2",
            title: "ابن تيمية",
            duration: "1:15:37",
            audioUrl: "https://archive.org/download/Al-Alheweny/002-.mp3"
          },
          {
            id: "l-heweni-3",
            title: "اتقوا الله في الصحابة",
            duration: "52:04",
            audioUrl: "https://archive.org/download/Al-Alheweny/004-.mp3"
          },
          {
            id: "l-heweni-4",
            title: "أحوال النفس",
            duration: "1:27:10",
            audioUrl: "https://archive.org/download/Al-Alheweny/009-.mp3"
          },
          {
            id: "l-heweni-5",
            title: "اختيار الزوجة الصالحة",
            duration: "1:17:29",
            audioUrl: "https://archive.org/download/Al-Alheweny/010-.mp3"
          },
          {
            id: "l-heweni-6",
            title: "أدب الخلاف",
            duration: "58:23",
            audioUrl: "https://archive.org/download/Al-Alheweny/012-.mp3"
          },
          {
            id: "l-heweni-7",
            title: "إذا ضيعت الأمانة",
            duration: "53:48",
            audioUrl: "https://archive.org/download/Al-Alheweny/013-.mp3"
          },
          {
            id: "l-heweni-8",
            title: "أسباب النصر والهزيمة",
            duration: "48:34",
            audioUrl: "https://archive.org/download/Al-Alheweny/014-.mp3"
          },
          {
            id: "l-heweni-9",
            title: "استثمار الوقت عند العلماء",
            duration: "1:25:53",
            audioUrl: "https://archive.org/download/Al-Alheweny/015-.mp3"
          },
          {
            id: "l-heweni-10",
            title: "استجيبوا لله وللرسول",
            duration: "1:20:45",
            audioUrl: "https://archive.org/download/Al-Alheweny/016-.mp3"
          },
          {
            id: "l-heweni-11",
            title: "اسم الله العزيز",
            duration: "37:28",
            audioUrl: "https://archive.org/download/Al-Alheweny/017-.mp3"
          },
          {
            id: "l-heweni-12",
            title: "الابتلاء",
            duration: "53:23",
            audioUrl: "https://archive.org/download/Al-Alheweny/026-.mp3"
          },
          {
            id: "l-heweni-13",
            title: "الاستقامة",
            duration: "1:39:18",
            audioUrl: "https://archive.org/download/Al-Alheweny/036-.mp3"
          },
          {
            id: "l-heweni-14",
            title: "الأمر بالمعروف",
            duration: "38:38",
            audioUrl: "https://archive.org/download/Al-Alheweny/043-.mp3"
          },
          {
            id: "l-heweni-15",
            title: "الانتكاس",
            duration: "53:10",
            audioUrl: "https://archive.org/download/Al-Alheweny/045-.mp3"
          },
          {
            id: "l-heweni-16",
            title: "البحث عن الرجال",
            duration: "1:20:47",
            audioUrl: "https://archive.org/download/Al-Alheweny/047-.mp3"
          },
          {
            id: "l-heweni-17",
            title: "التقرب بالنوافل",
            duration: "47:49",
            audioUrl: "https://archive.org/download/Al-Alheweny/050-.mp3"
          },
          {
            id: "l-heweni-18",
            title: "التوبة والإيمان بالقدر",
            duration: "1:06:15",
            audioUrl: "https://archive.org/download/Al-Alheweny/051-.mp3"
          },
          {
            id: "l-heweni-19",
            title: "التوكل",
            duration: "58:44",
            audioUrl: "https://archive.org/download/Al-Alheweny/053-.mp3"
          },
          {
            id: "l-heweni-20",
            title: "الحاجة إلى العلماء الربانيين",
            duration: "1:19:45",
            audioUrl: "https://archive.org/download/Al-Alheweny/054-.mp3"
          },
          {
            id: "l-heweni-21",
            title: "الحياء",
            duration: "54:51",
            audioUrl: "https://archive.org/download/Al-Alheweny/056-.mp3"
          },
          {
            id: "l-heweni-22",
            title: "الخوف",
            duration: "1:32:06",
            audioUrl: "https://archive.org/download/Al-Alheweny/058-.mp3"
          },
          {
            id: "l-heweni-23",
            title: "الرجل الأمة",
            duration: "1:50:05",
            audioUrl: "https://archive.org/download/Al-Alheweny/063-.mp3"
          },
          {
            id: "l-heweni-24",
            title: "الرجولة الحقيقية",
            duration: "1:47:28",
            audioUrl: "https://archive.org/download/Al-Alheweny/064-.mp3"
          },
          {
            id: "l-heweni-25",
            title: "الرحلة في طلب العلم",
            duration: "1:22:08",
            audioUrl: "https://archive.org/download/Al-Alheweny/065-.mp3"
          },
          {
            id: "l-heweni-26",
            title: "الطريق إلى الجنة",
            duration: "36:38",
            audioUrl: "https://archive.org/download/Al-Alheweny/080-.mp3"
          },
          {
            id: "l-heweni-27",
            title: "القلب ملك البدن",
            duration: "35:26",
            audioUrl: "https://archive.org/download/Al-Alheweny/093-.mp3"
          },
          {
            id: "l-heweni-28",
            title: "الوصايا الخمس",
            duration: "1:34:45",
            audioUrl: "https://archive.org/download/Al-Alheweny/096-.mp3"
          },
          {
            id: "l-heweni-29",
            title: "أندى العالمين",
            duration: "1:12:44",
            audioUrl: "https://archive.org/download/Al-Alheweny/100-.mp3"
          },
          {
            id: "l-heweni-30",
            title: "إنما الدنيا لأربعة نفر",
            duration: "1:25:57",
            audioUrl: "https://archive.org/download/Al-Alheweny/101-.mp3"
          },
          {
            id: "l-heweni-31",
            title: "أنواع الصدقات",
            duration: "1:15:43",
            audioUrl: "https://archive.org/download/Al-Alheweny/102-.mp3"
          },
          {
            id: "l-heweni-32",
            title: "أي الغاديين أنت؟!",
            duration: "52:02",
            audioUrl: "https://archive.org/download/Al-Alheweny/104-.mp3"
          },
          {
            id: "l-heweni-33",
            title: "أيها العاصي أقبل!",
            duration: "1:32:09",
            audioUrl: "https://archive.org/download/Al-Alheweny/109-.mp3"
          },
          {
            id: "l-heweni-34",
            title: "براءة الكرام من صفات اللئام",
            duration: "49:20",
            audioUrl: "https://archive.org/download/Al-Alheweny/111-.mp3"
          },
          {
            id: "l-heweni-35",
            title: "تأملات في سورة ق",
            duration: "1:32:57",
            audioUrl: "https://archive.org/download/Al-Alheweny/116-.mp3"
          },
          {
            id: "l-heweni-36",
            title: "تذكير الأبرار بأهمية الأذكار",
            duration: "45:15",
            audioUrl: "https://archive.org/download/Al-Alheweny/121-.mp3"
          },
          {
            id: "l-heweni-37",
            title: "تزوجوا الودود الولود",
            duration: "57:51",
            audioUrl: "https://archive.org/download/Al-Alheweny/125-.mp3"
          },
          {
            id: "l-heweni-38",
            title: "جريج العابد",
            duration: "50:19",
            audioUrl: "https://archive.org/download/Al-Alheweny/136-.mp3"
          },
          {
            id: "l-heweni-39",
            title: "حسن الظن بالله",
            duration: "1:32:34",
            audioUrl: "https://archive.org/download/Al-Alheweny/148-.mp3"
          }
        ]
      }
    ]
  },
    {
    id: "scholar-yaqoub",
    name: "الشيخ محمد حسين يعقوب",
    description: "داعية إسلامي مصري، مهتم بالرقائق وتزكية النفوس.",
    likes: 21400,
    series: [
      {
        id: "series-yaqoub-misc",
        title: "المحاضرات الكبرى والخطب الخالدة",
        description: "أقوى المحاضرات العامة والمؤثرة للشيخ محمد حسين يعقوب.",
        lectures: [
          {
            id: "l-yaqoub-1",
            title: "يا تارك الصلاة .. لماذا لا تصلي؟",
            duration: "1:36:12",
            audioUrl: "https://archive.org/download/20250819_20250819_0816/%D9%8A%D8%A7%20%D8%AA%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%B5%D9%84%D8%A7%D8%A9%20..%20%D9%84%D9%85%D8%A7%D8%B0%D8%A7%20%D9%84%D8%A7%20%D8%AA%D8%B5%D9%84%D9%8A%D9%8F%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%85%D8%AD%D9%85%D8%AF%20%D8%AD%D8%B3%D9%8I%D9%86%20%D9%8E%D9%8A%D8%B9%D9%82%D9%88%D8%A8.mp3"
          },
          {
            id: "l-yaqoub-2",
            title: "فتنة النساء وعلاجها",
            duration: "1:36:29",
            audioUrl: "https://archive.org/download/Ftnt-elnsaa-shekh-Y3qoob-hiq/Ftnt-elnsaa-shekh-Y3qoob-hiq.mp3"
          },
          {
            id: "l-yaqoub-3",
            title: "صلاح القلوب وتزكيتها",
            duration: "1:19:44",
            audioUrl: "https://archive.org/download/salah-el-q/salahulqolooob.mp3"
          }
        ]
      },
      {
        id: "series-yaqoub-popular",
        title: "رقائق ومواعظ دعوية مستقلة",
        description: "مواعظ بليغة ودروس دعوية مفردة ومتنوعة تخاطب القلوب والنفوس.",
        lectures: [
          {
            id: "l-yaqoub-pop-1",
            title: "شريط دنيا الميكروباص الأكثر شهرة",
            duration: "1:08:27",
            audioUrl: "https://archive.org/download/yakobloloah8/yakob.mp3"
          },
          {
            id: "l-yaqoub-pop-2",
            title: "إلى عشاق كرة القدم - الساحرة المستديرة",
            duration: "1:07:30",
            audioUrl: "https://archive.org/download/Koora_al-kadam/01-%20salassil_koora_al-la3eb.mp3"
          },
          {
            id: "l-yaqoub-pop-3",
            title: "يا تارك الصلاة (موعظة وجيزة خاشعة)",
            duration: "08:26",
            audioUrl: "https://archive.org/download/ya3kob.al_salah/Al-salah.mp3"
          }
        ]
      },
      {
        id: "series-yaqoub-heart",
        title: "دروس التزكية وإصلاح القلوب",
        description: "مجموعة متميزة من محاضرات الشيخ محمد حسين يعقوب حول الاستقامة، التوحيد، وأمراض النفوس.",
        lectures: [
          {
            id: "l-yaqoub-heart-1",
            title: "أثار الذنوب والمعاصي",
            duration: "54:06",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/001-.mp3"
          },
          {
            id: "l-yaqoub-heart-2",
            title: "أخي العاصي",
            duration: "1:20:12",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/007-.mp3"
          },
          {
            id: "l-yaqoub-heart-3",
            title: "اختبار القلوب",
            duration: "1:11:38",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/004-.mp3"
          },
          {
            id: "l-yaqoub-heart-4",
            title: "أزمة أخلاق",
            duration: "54:36",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/010-.mp3"
          },
          {
            id: "l-yaqoub-heart-5",
            title: "أساس الإيمان",
            duration: "52:23",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/011-.mp3"
          },
          {
            id: "l-yaqoub-heart-6",
            title: "أصحاب الأخدود (1)",
            duration: "1:02:49",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/020-1.mp3"
          },
          {
            id: "l-yaqoub-heart-7",
            title: "أصحاب الأخدود (2)",
            duration: "1:03:31",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/021-2.mp3"
          },
          {
            id: "l-yaqoub-heart-8",
            title: "آفات اللسان",
            duration: "1:16:01",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/026-.mp3"
          },
          {
            id: "l-yaqoub-heart-9",
            title: "الاستقامة",
            duration: "54:40",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/039-.mp3"
          },
          {
            id: "l-yaqoub-heart-10",
            title: "الإسلام قادم",
            duration: "1:25:43",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/043-.mp3"
          },
          {
            id: "l-yaqoub-heart-11",
            title: "الأمن من مكر الله",
            duration: "45:05",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/048-.mp3"
          },
          {
            id: "l-yaqoub-heart-12",
            title: "الأنس بالله",
            duration: "1:09:25",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/049-.mp3"
          },
          {
            id: "l-yaqoub-heart-13",
            title: "التوبة وذكر الله",
            duration: "1:12:41",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/062-.mp3"
          },
          {
            id: "l-yaqoub-heart-14",
            title: "الجهل بالدين",
            duration: "1:00:39",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/070-.mp3"
          },
          {
            id: "l-yaqoub-heart-15",
            title: "الخشوع في الصلاة",
            duration: "52:27",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/076-.mp3"
          },
          {
            id: "l-yaqoub-heart-16",
            title: "الخشية",
            duration: "55:01",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/077-.mp3"
          },
          {
            id: "l-yaqoub-heart-17",
            title: "الخوف والرجاء",
            duration: "49:17",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/080-.mp3"
          },
          {
            id: "l-yaqoub-heart-18",
            title: "الرضا بالقضاء والقدر",
            duration: "1:30:13",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/090-.mp3"
          },
          {
            id: "l-yaqoub-heart-19",
            title: "الصبر",
            duration: "1:31:20",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/100-.mp3"
          },
          {
            id: "l-yaqoub-heart-20",
            title: "الطريق الى الله",
            duration: "1:14:22",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/103-.mp3"
          },
          {
            id: "l-yaqoub-new-1",
            title: "الطريق الى الجنه",
            duration: "1:16:18",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/102-.mp3"
          },
          {
            id: "l-yaqoub-new-2",
            title: "القبر يتكلم",
            duration: "1:22:34",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/111-.mp3"
          },
          {
            id: "l-yaqoub-new-3",
            title: "القرآن يصنعك",
            duration: "1:37:40",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/115-.mp3"
          },
          {
            id: "l-yaqoub-new-4",
            title: "النفاق",
            duration: "53:10",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/130-.mp3"
          },
          {
            id: "l-yaqoub-new-5",
            title: "اليقين بالله",
            duration: "39:24",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/139-.mp3"
          },
          {
            id: "l-yaqoub-new-6",
            title: "اليقظة",
            duration: "1:19:59",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/138-.mp3"
          },
          {
            id: "l-yaqoub-new-7",
            title: "انتبه الموت قادم",
            duration: "1:25:52",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/145-.mp3"
          },
          {
            id: "l-yaqoub-new-8",
            title: "أنواع القلوب",
            duration: "1:00:42",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/149-.mp3"
          },
          {
            id: "l-yaqoub-new-9",
            title: "اهدنا الصراط المستقيم",
            duration: "1:30:59",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/150-.mp3"
          },
          {
            id: "l-yaqoub-new-21",
            title: "حبوط الأعمال",
            duration: "1:15:53",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/184-.mp3"
          },
          {
            id: "l-yaqoub-new-22",
            title: "حرب التدخين",
            duration: "1:20:11",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/186-.mp3"
          },
          {
            id: "l-yaqoub-new-23",
            title: "حسن الخاتمة",
            duration: "1:27:20",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/188-.mp3"
          },
          {
            id: "l-yaqoub-new-24",
            title: "حصاد اللسان",
            duration: "1:39:22",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/189-.mp3"
          },
          {
            id: "l-yaqoub-new-25",
            title: "خطورة الكبر",
            duration: "1:02:33",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/196-.mp3"
          },
          {
            id: "l-yaqoub-new-26",
            title: "رقائق القلوب",
            duration: "1:19:13",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/205-.mp3"
          },
          {
            id: "l-yaqoub-new-27",
            title: "صرخات وهمسات",
            duration: "1:19:35",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/225-.mp3"
          },
          {
            id: "l-yaqoub-new-28",
            title: "صفات المنافقين",
            duration: "1:25:47",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/230-.mp3"
          },
          {
            id: "l-yaqoub-new-29",
            title: "صلاح القلوب",
            duration: "1:25:20",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/232-.mp3"
          },
          {
            id: "l-yaqoub-new-30",
            title: "صلة الرحم",
            duration: "0:52:37",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/233-.mp3"
          },
          {
            id: "l-yaqoub-new-31",
            title: "آثار الذنوب والمعاصي",
            duration: "0:54:06",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/001-.mp3"
          },
          {
            id: "l-yaqoub-new-32",
            title: "طاعات القلوب",
            duration: "1:22:06",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/237-.mp3"
          },
          {
            id: "l-yaqoub-new-33",
            title: "طوفان الموت",
            duration: "0:40:07",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/239-.mp3"
          },
          {
            id: "l-yaqoub-new-34",
            title: "عجائب القلوب",
            duration: "0:58:35",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/241-.mp3"
          },
          {
            id: "l-yaqoub-new-35",
            title: "علاج الوسوسة",
            duration: "1:22:16",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/246-.mp3"
          },
          {
            id: "l-yaqoub-new-36",
            title: "علل التوبة",
            duration: "1:18:07",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/251-.mp3"
          },
          {
            id: "l-yaqoub-new-37",
            title: "فتنة المال",
            duration: "1:14:12",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/255-.mp3"
          },
          {
            id: "l-yaqoub-new-38",
            title: "فساد القلوب",
            duration: "1:27:11",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/262-.mp3"
          },
          {
            id: "l-yaqoub-new-39",
            title: "فوائد غض البصر",
            duration: "1:24:01",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/267-.mp3"
          },
          {
            id: "l-yaqoub-new-41",
            title: "كن ربانيا",
            duration: "1:02:59",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/287-.mp3"
          },
          {
            id: "l-yaqoub-new-42",
            title: "كيف أتوب",
            duration: "1:11:28",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/288-.mp3"
          },
          {
            id: "l-yaqoub-new-43",
            title: "لذة العبادة",
            duration: "1:16:45",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/304-.mp3"
          },
          {
            id: "l-yaqoub-new-44",
            title: "ماهو الهدف",
            duration: "0:41:59",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/313-.mp3"
          },
          {
            id: "l-yaqoub-new-45",
            title: "مراقبة النفس",
            duration: "1:25:53",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/321-.mp3"
          },
          {
            id: "l-yaqoub-new-46",
            title: "معاصي القلوب",
            duration: "1:21:23",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/325-.mp3"
          },
          {
            id: "l-yaqoub-new-47",
            title: "مفسدات القلوب",
            duration: "1:02:40",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/328-.mp3"
          },
          {
            id: "l-yaqoub-new-48",
            title: "منزلة الصدق",
            duration: "0:56:53",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/336-.mp3"
          },
          {
            id: "l-yaqoub-new-49",
            title: "مواجهة الإبتلاء",
            duration: "1:00:38",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/338-.mp3"
          },
          {
            id: "l-yaqoub-new-50",
            title: "نعمة الشكر",
            duration: "1:00:19",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/353-.mp3"
          },
          {
            id: "l-yaqoub-new-51",
            title: "نكون أو لا نكون",
            duration: "1:00:57",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/354-.mp3"
          },
          {
            id: "l-yaqoub-new-52",
            title: "هذا هو البلاء",
            duration: "0:48:46",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/356-.mp3"
          },
          {
            id: "l-yaqoub-new-53",
            title: "هل تعرف ربك",
            duration: "0:25:26",
            audioUrl: "https://archive.org/download/M-Houssain_Ya3koub_498_Lectures_Mp3_up-by-muslem/358-.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdullah-alsulami",
    name: "الشيخ الدكتور عبد الله السلمي",
    description: "عالم وداعية إسلامي.",
    likes: 11200,
    series: [
      {
        id: "series-sulami-general",
        title: "محاضرات عامة ودورات علمية",
        description: "مجموعة من المحاضرات والدورات العلمية المتميزة لفضيلة الشيخ أ.د. عبد الله بن ناصر السلمي.",
        lectures: [
          {
            id: "l-sulami-general-1",
            title: "الروض المربع للبهوتي - قيمته ومنهجه وكيف يستفيد منه طالب العلم",
            duration: "1:37:03",
            audioUrl: "https://archive.org/download/ALI141586_GMAIL_20161005/%D8%A7%D9%84%D8%B1%D9%88%D8%B6%20%D8%A7%D9%84%D9%85%D8%B1%D8%A8%D8%B9%20%D9%84%D9%84%D8%A8%D9%87%D9%88%D8%AA%D9%8A%20-%20%D9%82%D9%8A%D9%85%D8%AA%D9%87%20%D9%88%D9%85%D9%86%D9%87%D8%AC%D9%87%20%D9%88%D9%83%D9%8A%D9%81%20%D9%8A%D8%B3%D8%AA%D9%81%D9%8A%D8%AF%20%D9%85%D9%86%D9%87%20%D8%B7%D8%A7%D9%84%D8%A8%20%D8%A7%D9%84%D8%B9%D9%84%D9%85%20-%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D3%81%D8%AF.%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%B3%D9%84%D9%85%D9%82.mp3"
          },
          {
            id: "l-sulami-general-2",
            title: "اليوم العلمي في شرح كتاب التحقيق والإيضاح لفضيلة الشيخ عبدالله بن ناصر السلمي",
            duration: "5:12:14",
            audioUrl: "https://archive.org/download/eng_165/%23%D8%AC%D8%A7%D9%85%D8%B9_%D8%A7%D9%84%D9%86%D8%A7%D8%B5%D8%B1%20%20%D8%A7%D9%84%D9%8A%D9%88%D9%85%20%D8%A7%D9%84%D8%B9%D9%84%D9%85%D9%8A%20%D9%81%D9%8A%20%D8%B4%D8%B1%D8%AD%20%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D8%AA%D8%AD%D9%82%D9%8A%D9%82%20%D9%88%D8%A7%D9%84%D8%A5%D9%8A%D8%B6%D8%A7%D8%AD%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%B3%D9%84%D9%85%D9%8A.mp3"
          }
        ]
      },
      {
        id: "series-sulami-transactions",
        title: "دورة فقه المعاملات المالية المعاصرة",
        description: "شرح فقه المعاملات المالية المعاصرة لفضيلة الشيخ أ.د. عبد الله بن ناصر السلمي.",
        lectures: [
          {
            id: "l-sulami-trans-1",
            title: "فقه المعاملات المالية المعاصرة - المجلس الأول",
            duration: "1:59:05",
            audioUrl: "https://archive.org/download/eng_04_1/01-%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%85%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%A7%D9%84%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%B5%D8%B1%D8%A9%20%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D3%81%D8%AF.%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%B3%D9%84%D9%85%D9%8A%20%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20%D8%A7%D9%84%D8%A3%D9%88%D9%84.mp3"
          },
          {
            id: "l-sulami-trans-2",
            title: "فقه المعاملات المالية المعاصرة - المجلس الثاني",
            duration: "1:27:22",
            audioUrl: "https://archive.org/download/eng_04_1/02-%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%85%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%A7%D9%84%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%B5%D8%B1%D8%A9%20%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D3%81%D8%AF.%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%B3%D9%84%D9%85%D9%8A%20%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%82.mp3"
          },
          {
            id: "l-sulami-trans-3",
            title: "فقه المعاملات المالية المعاصرة - المجلس الثالث",
            duration: "1:48:29",
            audioUrl: "https://archive.org/download/eng_04_1/04-%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%85%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%A7%D9%84%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%B5%D8%B1%D8%A9%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D3%81%D8%AF.%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%B3%D9%84%D9%85%D9%8A%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20%D8%A7%D9%84%D8%AB%D8%A7%D9%84%D8%AB.mp3"
          },
          {
            id: "l-sulami-trans-4",
            title: "فقه المعاملات المالية المعاصرة - المجلس الرابع",
            duration: "55:13",
            audioUrl: "https://archive.org/download/eng_04_1/03-%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D9%85%D9%84%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D8%A7%D9%84%D9%8A%D8%A9%20%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%B5%D8%B1%D8%A9%20%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D3%81%D8%AF.%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%B3%D9%84%D9%85%D9%8A%20%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20%D8%A7%D9%84%D8%B1%D8%A7%D8%A8%D8%B9.mp3"
          }
        ]
      },
      {
        id: "series-sulami-fatawa",
        title: "برنامج يستفتونك وفتاوى منوعة",
        description: "مجموعة من الفتاوى والإجابات الفقهية المتميزة لفضيلة الشيخ أ.د. عبد الله بن ناصر السلمي عبر برنامج يستفتونك على قناة دليل الفضائية.",
        lectures: [
          {
            id: "l-sulami-fatawa-1",
            title: "فتاوى وإجابات فقهية متميزة - المجلس الأول (09-01-2012)",
            duration: "36:48",
            audioUrl: "https://archive.org/download/xboxgamer-3265/fatawa-Daleel-09012012.mp3"
          },
          {
            id: "l-sulami-fatawa-2",
            title: "فتاوى وإجابات فقهية متميزة - المجلس الثاني (11-01-2012)",
            duration: "49:35",
            audioUrl: "https://archive.org/download/xboxgamer-3265/fatawa-Daleel-11012012.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-nasser-mohammed-alahmad",
    name: "الشيخ ناصر محمد الأحمد",
    description: "عالم وداعية إسلامي.",
    likes: 9800,
    series: [
      {
        id: "series-alahmed-battles",
        title: "سلسلة معارك الإسلام الخالدة",
        description: "محاضرات عن أبرز المعارك في التاريخ الإسلامي للشيخ ناصر محمد الأحمد.",
        lectures: [
          {
            id: "l-alahmad-1",
            title: "معركة أحد",
            duration: "1:14:48",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/01%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%A3%D8%AD%D8%AF.m4a"
          },
          {
            id: "l-alahmad-2",
            title: "معركة القادسية",
            duration: "51:04",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/02%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%A7%D9%84%D9%82%D8%A7%D8%AF%D8%B3%D9%8A%D8%A9.m4a"
          },
          {
            id: "l-alahmad-3",
            title: "معركة اليرموك",
            duration: "1:18:45",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/03%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%A7%D9%84%D9%8A%D8%B1%D9%85%D9%88%D9%83.m4a"
          },
          {
            id: "l-alahmad-4",
            title: "معركة نهاوند",
            duration: "1:10:14",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/04%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D9%86%D9%87%D8%A7%D9%88%D9%86%D8%AF.m4a"
          },
          {
            id: "l-alahmad-5",
            title: "معركة شقحب",
            duration: "46:36",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/05%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%B4%D9%82%D8%AD%D8%A8.m4a"
          },
          {
            id: "l-alahmad-6",
            title: "معركة ذات الصواري",
            duration: "1:01:30",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/06%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%B0%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B5%D9%88%D8%A7%D8%B1%D9%8A.m4a"
          },
          {
            id: "l-alahmad-7",
            title: "معركة الزلاقة",
            duration: "49:39",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/07%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%A7%D9%84%D8%B2%D9%84%D8%A7%D9%82%D8%A9.m4a"
          },
          {
            id: "l-alahmad-8",
            title: "معركة الأرك",
            duration: "53:47",
            audioUrl: "https://archive.org/download/04_20210713_202107/%D8%B3%D9%84%D8%B3%D8%A9%20%D9%85%D8%B9%D8%A7%D8%B1%D9%83%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D8%A9/08%20%D9%85%D8%B9%D8%B1%D9%83%D8%A9%20%D8%A7%D9%84%D8%A3%D8%B1%D9%83.m4a"
          }
        ]
      },
      {
        id: "series-alahmed-misc",
        title: "محاضرات منوعة متميزة",
        description: "مجموعة من المحاضرات والدروس المنتقاة للشيخ ناصر محمد الأحمد.",
        lectures: [
          {
            id: "l-alahmad-misc-1",
            title: "محاضرة الجنة",
            duration: "59:54",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/alganah.mp3"
          },
          {
            id: "l-alahmad-misc-2",
            title: "جيل قرآني فريد",
            duration: "45:30",
            audioUrl: "https://archive.org/download/JeelFareed/Jeel_Fareed.mp3"
          },
          {
            id: "l-alahmad-misc-3",
            title: "بين القوة والضعف",
            duration: "27:53",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_8441/Tabsera08-10-2015.mp3"
          },
          {
            id: "l-alahmad-misc-4",
            title: "استقبال شعبان",
            duration: "31:12",
            audioUrl: "https://archive.org/download/NaserAlAhmad-IstiqbalShaaban.mp3/NaserAlAhmad-IstiqbalShaaban.mp3"
          },
          {
            id: "l-alahmad-misc-5",
            title: "الظلم ظلمات",
            duration: "06:12",
            audioUrl: "https://archive.org/download/Azzollm/%D8%A7%D9%84%D8%B8%D9%84%D9%85%20%D8%B8%D9%84%D9%85%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D9%86%D8%A7%D8%B5%D8%B1%20%D8%A7%D9%84%D8%A3%D8%AD%D9%85%D8%AF.mp3"
          },
          {
            id: "l-alahmad-misc-6",
            title: "محاضرة الملك (مالك الملك)",
            duration: "55:20",
            audioUrl: "https://archive.org/download/Islamic_Tape-681_uP_bY_mUSLEm/muslem.ettounsi-012.mp3"
          }
        ]
      },
      {
        id: "series-alahmed-seera",
        title: "السيرة النبوية",
        description: "دروس ومقتطفات في السيرة للشيخ ناصر محمد الأحمد.",
        lectures: [
          {
            id: "l-alahmad-seera-1",
            title: "مقدمة في السيرة النبوية",
            duration: "50:00",
            audioUrl: "https://archive.org/download/way2Allah.com0498/Seera_2_12.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-ibrahim-aldowish",
    name: "الشيخ الدكتور إبراهيم الدويش",
    description: "عالم وداعية إسلامي.",
    likes: 14500,
    series: [
      {
        id: "series-aldowish-general",
        title: "محاضرات عامة",
        description: "محاضرات ودروس مفردة ومتنوعة",
        lectures: [
          {
            id: "aldowish-general-1",
            title: "دمعة تائب",
            duration: "1:33:51",
            audioUrl: "https://archive.org/download/487IDwaishDam3atta2eb_201504/487_I_Dwaish_dam3atta2eb.mp3"
          },
          {
            id: "aldowish-general-2",
            title: "مقطع مؤثر: دمعة تائب",
            duration: "08:46",
            audioUrl: "https://archive.org/download/xboxgamer-4083/dam3at-taeb-27092012.mp3"
          },
          {
            id: "aldowish-general-3",
            title: "حياة الأرواح والأبدان",
            duration: "50:32",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5947/Ebrahem18-11-2014.mp3"
          },
          {
            id: "aldowish-general-4",
            title: "يوم عرفة",
            duration: "06:34",
            audioUrl: "https://archive.org/download/A_rafaT/Arafah__Rowea.blogspot.com.mp3"
          },
          {
            id: "aldowish-general-5",
            title: "فتش في نفسك (مقطع مؤثر)",
            duration: "06:48",
            audioUrl: "https://archive.org/download/aa_647/%D9%81%D8%AA%D8%B4%20%D9%81%D9%8A%20%D9%86%D9%81%D8%B3%D9%83%20...mp3"
          },
          {
            id: "aldowish-general-6",
            title: "المحرومون",
            duration: "1:31:18",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/alma7romoon.mp3"
          },
          {
            id: "aldowish-general-7",
            title: "قلائد الحمد",
            duration: "45:00",
            audioUrl: "https://archive.org/download/khottab_Dwish-ibrahim-mp3_201506/13-1..22-2-1434.mp3"
          },
          {
            id: "aldowish-general-8",
            title: "غثاء الألسنة",
            duration: "45:00",
            audioUrl: "https://archive.org/download/khottab_Dwish-ibrahim-mp3_201506/20-2_1811435.mp3"
          },
          {
            id: "aldowish-general-9",
            title: "المفتاح",
            duration: "45:00",
            audioUrl: "https://archive.org/download/khottab_Dwish-ibrahim-mp3_201506/22-2_6121434.mp3"
          },
          {
            id: "aldowish-general-10",
            title: "فن التعامل مع الزوجة",
            duration: "45:00",
            audioUrl: "https://archive.org/download/khottab_Dwish-ibrahim-mp3_201506/49-5_7-7-1434.mp3"
          },
          {
            id: "aldowish-general-11",
            title: "السحر الحلال",
            duration: "45:00",
            audioUrl: "https://archive.org/download/khottab_Dwish-ibrahim-mp3_201506/54-5_1111435.mp3"
          },
          {
            id: "aldowish-general-12",
            title: "التوحيد وأثره في النفوس",
            duration: "52:57",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/altwheedwathrofealnefos.mp3"
          },
          {
            id: "aldowish-general-13",
            title: "الهدف (مقطع مؤثر)",
            duration: "04:47",
            audioUrl: "https://archive.org/download/doc_2016-05-13_04-08-44/doc_2016-05-13_04-08-44.mp3"
          },
          {
            id: "aldowish-general-14",
            title: "الرجل الألف",
            duration: "1:09:36",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/aragolal1000.mp3"
          },
          {
            id: "aldowish-general-15",
            title: "طريقنا للقلوب",
            duration: "1:31:52",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/tareqonalelqolob.mp3"
          },
          {
            id: "aldowish-general-16",
            title: "تعال نتعاتب",
            duration: "1:15:59",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/tal-ntatb.mp3"
          },
          {
            id: "aldowish-general-17",
            title: "الأنقياء",
            duration: "1:28:32",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/alanqeya2.mp3"
          },
          {
            id: "aldowish-general-18",
            title: "الأتقياء",
            duration: "1:28:28",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/alatqeya2h.mp3"
          },
          {
            id: "aldowish-general-19",
            title: "الأخفياء",
            duration: "1:07:44",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/alakfeia2.mp3"
          },
          {
            id: "aldowish-general-20",
            title: "جاري العزيز",
            duration: "28:30",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/garial3azez.mp3"
          },
          {
            id: "aldowish-general-21",
            title: "بشائر ومبشرات",
            duration: "1:23:13",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh_compile-up-by-muslem/bash2erwamobasherat.mp3"
          },
          {
            id: "aldowish-general-22",
            title: "أهلكتني",
            duration: "1:07:57",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/ahlakatni.mp3"
          },
          {
            id: "aldowish-general-23",
            title: "الدعاء",
            duration: "1:16:16",
            audioUrl: "https://archive.org/download/islami-262/الدعاء.mp3"
          },
          {
            id: "aldowish-general-24",
            title: "بوابة الهلاك",
            duration: "1:33:29",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/bawabatalhalak.mp3"
          },
          {
            id: "aldowish-general-25",
            title: "سكرات الموت",
            duration: "25:28",
            audioUrl: "https://archive.org/download/islami-262/الموت.mp3"
          },
          {
            id: "aldowish-general-26",
            title: "رجال الفجر",
            duration: "49:14",
            audioUrl: "https://archive.org/download/Islamic_Tape-140_uP_bY_mUSLEm/regalalfagr_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "aldowish-general-27",
            title: "ياحبذا الجنة",
            duration: "59:24",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/ya7abazaalganah.mp3"
          },
          {
            id: "aldowish-general-28",
            title: "الكنز المفقود",
            duration: "1:20:43",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/alknoalmfkod.mp3"
          },
          {
            id: "aldowish-general-29",
            title: "السهم المسموم",
            duration: "1:08:57",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/amasmom.mp3"
          },
          {
            id: "aldowish-general-30",
            title: "روائع الأسحار",
            duration: "1:02:41",
            audioUrl: "https://archive.org/download/islami-262/رَوائعُ الأسحار.mp3"
          },
          {
            id: "aldowish-general-31",
            title: "الرجل الصفر",
            duration: "1:26:02",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/zerooman.mp3"
          },
          {
            id: "aldowish-general-32",
            title: "الشباب والتحديات",
            duration: "1:14:51",
            audioUrl: "https://archive.org/download/islami-262/الشبابُ والتحديات.mp3"
          },
          {
            id: "aldowish-general-33",
            title: "أعراسنا",
            duration: "1:06:34",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/a3rasona.mp3"
          },
          {
            id: "aldowish-general-34",
            title: "رسالة إلى مدمن",
            duration: "1:24:26",
            audioUrl: "https://archive.org/download/islami-262/رسالةٌ إلى مُدمِن.mp3"
          },
          {
            id: "aldowish-general-35",
            title: "40 وسيلة لاستغلال الإجازة الصيفية",
            duration: "1:00:56",
            audioUrl: "https://archive.org/download/islami-262/40%20%D9%88%D8%B3%D9%8A%D9%84%D9%8E%D8%A9%D9%8B%20%D9%84%D9%90%D8%A7%D8%B3%D9%92%D8%AA%D9%90%D8%BA%D9%91%D9%84%D8%A7%D9%84%D9%90%20%D8%A7%D9%84%D8%A5%D8%AC%D8%A7%D8%B2%D9%8E%D8%A9%D9%90%20%D8%A7%D9%84%D8%B5%D9%8A%D9%81%D9%8A%D9%8E%D8%A9.mp3"
          },
          {
            id: "aldowish-general-36",
            title: "وانطفأ السراج",
            duration: "1:06:56",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/wantafaserag.mp3"
          },
          {
            id: "aldowish-general-37",
            title: "إنه الله جل جلاله",
            duration: "43:13",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/enahoallah.mp3"
          },
          {
            id: "aldowish-general-38",
            title: "لا إله إلا الله",
            duration: "52:57",
            audioUrl: "https://archive.org/download/islami-262/التوْحيدُ وأثرُهُ في النُّفوس.mp3"
          },
          {
            id: "aldowish-general-39",
            title: "يا سامعاً لكل شكوى",
            duration: "47:10",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/yasame3lekolshakwa.mp3"
          },
          {
            id: "aldowish-general-40",
            title: "صفحات من ذهب",
            duration: "1:14:14",
            audioUrl: "https://archive.org/download/islami-262/صفحاتٌ مِن ذهب.mp3"
          },
          {
            id: "aldowish-general-41",
            title: "موعظة السبع البواقي",
            duration: "19:56",
            audioUrl: "https://archive.org/download/My_up_hassan_da2imdikr_douich/موعظة السبع البواقي.mp3"
          },
          {
            id: "aldowish-general-42",
            title: "جدد حياتك",
            duration: "50:19",
            audioUrl: "https://archive.org/download/islami-262/جَدِّدْ.mp3"
          },
          {
            id: "aldowish-general-43",
            title: "حينما تكون الهمة رجلاً",
            duration: "46:57",
            audioUrl: "https://archive.org/download/IbrahimBinAbdullahDaweesh.mawsoaa-up-by-muslem/endematakonalhemaragola.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdullah-alojairi",
    name: "الشيخ عبد الله العجيري",
    description: "كاتب وباحث ومفكر إسلامي، مدير مركز نماء للبحوث والدراسات، متخصص في القضايا الفكرية والعقدية المعاصرة.",
    likes: 13200,
    series: [
      {
        id: "series-alojairi-standalone",
        title: "محاضرات وندوات فكرية ومفردة",
        description: "مجموعة من المحاضرات والندوات المستقلة والمنفردة للشيخ عبد الله العجيري في الفكر والعقيدة والإيمانيات.",
        lectures: [
          {
            id: "l-alojairi-1",
            title: "مركزية القرآن الكريم في السجال الفكري المعاصر",
            duration: "53:30",
            audioUrl: "https://archive.org/download/Media-way2Allah_1819/mhadra___mrkzea_alkran_alkrem_fe_alsgal_alfkre_alm3asr__llshekh__3bdallh_al3gere.mp3"
          },
          {
            id: "l-alojairi-2",
            title: "تفكيك النزعة العلموية",
            duration: "1:13:20",
            audioUrl: "https://archive.org/download/Media-way2Allah_1819/tfkek_alnz3a_al3lmwea_-_3bdallh_al3gere.mp3"
          },
          {
            id: "l-alojairi-3",
            title: "السر الأعظم",
            duration: "50:35",
            audioUrl: "https://archive.org/download/Media-way2Allah_1819/alsr_ala3zm_-_3bdallh_al3gere.mp3"
          },
          {
            id: "l-alojairi-4",
            title: "وصية النبي ﷺ للصديق رضي الله عنه",
            duration: "54:05",
            audioUrl: "https://archive.org/download/Media-way2Allah_1819/wsea_alnbe_sle_allh_3leh_wslm_llsdek_-_3bdallh_al3gere.mp3"
          },
          {
            id: "l-alojairi-5",
            title: "أدلة وجود الله تعالى",
            duration: "2:00:16",
            audioUrl: "https://archive.org/download/zainab14_201902/%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A9%20%D8%A3%D8%AF%D9%84%D8%A9%20%D9%88%D8%AC%D9%88%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D8%AA%D8%B9%D8%A7%D9%84%D9%89%20-%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20-%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D8%B9%D8%AC%D9%8A%D8%B1%D9%8A.mp3"
          },
          {
            id: "l-alojairi-6",
            title: "ينبوع الانحراف الفكري",
            duration: "58:46",
            audioUrl: "https://archive.org/download/20190823_20190823_2150/%D9%8A%D9%86%D8%A8%D9%88%D8%B9%20%D8%A7%D9%84%D8%A7%D9%86%D8%AD%D8%B1%D8%A7%D9%81%20%D8%A7%D9%84%D9%81%D9%83%D8%B1%D9%8A%20_%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D8%B9%D8%AC%D9%8A%D8%B1%D9%8A.mp3"
          },
          {
            id: "l-alojairi-7",
            title: "منهج الاستدلال عند أهل السنة والجماعة",
            duration: "2:27:27",
            audioUrl: "https://archive.org/download/kh_896/%D9%85%D9%86%D9%87%D8%AC%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AF%D9%84%D8%A7%D9%84%20%D8%B9%D9%86%D8%AF%20%D8%A3%D9%87%D9%84%20%D8%A7%D9%84%D8%B3%D9%86%D8%A9%20%D9%88%D8%A7%D9%84%D8%AC%D9%85%D8%A7%D8%B9%D8%A9.mp3"
          },
          {
            id: "l-alojairi-8",
            title: "هكذا تألق جيل الصحابة",
            duration: "46:35",
            audioUrl: "https://archive.org/download/media-way2allah_1818_202002/mhadra___hkza_talk_gel_alshaba__llshekh__3bdallh_bn_salh_al3gere.mp3"
          },
          {
            id: "l-alojairi-9",
            title: "الخوارج وقراءة المفهوم والتاريخ والواقع",
            duration: "52:18",
            audioUrl: "https://archive.org/download/media-way2allah_1818_202002/mhadra_alkhwarg_wkraaa_almfhwm_waltarekh_alwak3.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdullah-alqaseer",
    name: "الشيخ عبد الله بن صالح القصير",
    description: "عالم وداعية إسلامي سعودي رحمه الله، عضو الإفتاء سابقاً وله العديد من المحاضرات والخطب والكلمات التوجيهية.",
    likes: 12400,
    series: [
      {
        id: "series-alqaseer-standalone",
        title: "محاضرات وخطب مفردة",
        description: "مجموعة من المحاضرات والخطب والكلمات التوجيهية المستقلة لفضيلة الشيخ عبد الله بن صالح القصير رحمه الله.",
        lectures: [
          {
            id: "l-alqaseer-1",
            title: "شأن الإسلام وحقيقته وشيء من محاسنه",
            duration: "27:15",
            audioUrl: "https://archive.org/download/BluexArts/%D8%B4%D8%A3%D9%86%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D9%88%D8%AD%D9%82%D9%8A%D9%82%D8%AA%D9%87%20%D9%88%D8%B4%D9%8A%D8%A1%20%D9%85%D9%86%20%D9%85%D8%AD%D8%A7%D8%B3%D9%86%D9%87.mp3"
          },
          {
            id: "l-alqaseer-2",
            title: "الإيمان والعمل الصالح",
            duration: "17:58",
            audioUrl: "https://archive.org/download/BxANDO_Gmail_201403/%D8%A7%D9%84%D8%A5%D9%8A%D9%85%D8%A7%D9%86%20%D9%88%D8%A7%D9%84%D8%B9%D9%85%D9%84%20%D8%A7%D9%84%D8%B5%D8%A7%D9%84%D8%AD.mp3"
          },
          {
            id: "l-alqaseer-3",
            title: "اتقوا النار وحقيقة التقوى",
            duration: "23:15",
            audioUrl: "https://archive.org/download/20231224_20231224_2320/%D8%A7%D8%AA%D9%82%D9%88%D8%A7%20%D8%A7%D9%84%D9%86%D8%A7%D8%B1%20-%20%D8%AE%D8%B7%D8%A8%D8%A9%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20%D9%88%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%84%D9%87.mp3"
          },
          {
            id: "l-alqaseer-4",
            title: "التحذير من الكبائر وبيان الأحكام المتعلقة بها",
            duration: "28:34",
            audioUrl: "https://archive.org/download/20231224_20231224_2320/%D8%A7%D9%84%D8%AA%D8%AD%D8%B0%D9%8A%D8%B1%20%D9%85%D9%86%20%D8%A7%D9%84%D9%83%D8%A8%D8%A7%D8%A6%D8%B1%20%D9%88%D8%A8%D9%8A%D8%A7%D9%86%20%D8%A7%D9%84%D9%83%D8%A8%D9%8A%D8%B1%D8%A9%20%D9%88%D8%A7%D9%84%D8%A3%D8%AD%D9%83%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D8%AA%D8%B9%D9%84%D9%82%D8%A9%20%D8%A8%D9%87%D8%A7%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%B9%D8%A7%D8%AC%D9%84%D8%A9%20%D9%88%D8%A7%D9%84%D8%A2%D8%AC%D9%84%D8%A9%20-%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-5",
            title: "التحذير من الفتن ودعاتها والوقاية منها",
            duration: "21:22",
            audioUrl: "https://archive.org/download/20231224_20231224_2320/%28%28%D8%A7%D9%84%D8%AA%D8%AD%D8%B0%D9%8A%D8%B1%20%D9%85%D9%86%20%D8%A7%D9%84%D9%81%D8%AA%D9%86%20%D9%88%D8%AF%D8%B9%D8%A7%D8%AA%D9%90%D9%87%D8%A7%20%D9%88%D8%B5%D9%81%D8%A9%20%D8%A7%D9%84%D8%B3%D8%A7%D8%B9%D9%8A%D9%86%20%D9%81%D9%8A%D9%87%D8%A7%20%D9%88%D8%A7%D9%84%D8%A4%D9%8A%D8%AF%D9%8A%D9%86%20%D9%84%D9%87%D8%A7%29%29%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20%20-%D9%88%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%84%D9%87-.mp3"
          },
          {
            id: "l-alqaseer-6",
            title: "الإسراف معناه وشؤمه في الشريعة",
            duration: "14:59",
            audioUrl: "https://archive.org/download/20231224_20231224_2320/%D8%A7%D9%84%D8%A5%D8%B3%D9%81%D8%A7%D9%85%20%D9%85%D8%B9%D9%86%D8%A7%D9%87%20%D9%88%D8%B4%D8%A3%D9%85%D9%87%20%D8%AE%D8%B7%D8%A8%D8%A9%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20%D9%88%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%84%D9%87.mp3"
          },
          {
            id: "l-alqaseer-7",
            title: "نعمة الأمن وواجب شكرها وحمايتها",
            duration: "25:18",
            audioUrl: "https://archive.org/download/20231224_20231224_2320/%D8%A7%D9%84%D8%A3%D9%85%D9%86%20%D9%85%D9%86%20%D8%AC%D9%84%D8%A7%D8%A6%D9%84%20%D8%A7%D9%84%D9%86%D8%B9%D9%85%20%D8%A7%D9%84%D8%AA%D9%8A%20%D9%8A%D8%AC%D8%A8%20%D8%B4%D9%83%D8%B1%D9%87%D8%A7%D9%80%D8%8C%20%D9%88%D8%A7%D9%84%D8%AD%D8%B0%D8%B1%20%D9%88%D8%A7%D9%84%D8%AA%D8%AD%D8%B0%D9%8A%D8%B1%20%D9%85%D9%86%20%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%B3%20%D8%A8%D9%87%D8%A7%20%20%2C%D8%AE%D8%B7%D8%A8%D8%A9%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D9%91%D9%90%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-8",
            title: "حقيقة الإرهاب المذموم وسوء مآلاته",
            duration: "21:13",
            audioUrl: "https://archive.org/download/20231224_20231224_2320/%D8%A7%D9%84%D8%A5%D8%B1%D9%87%D8%A7%D8%A8%20%D8%A7%D9%84%D9%85%D8%B0%D9%85%D9%88%D9%85%EF%BC%9A%20%D8%AD%D9%82%D9%8A%D9%82%D8%AA%D9%87%20%D9%88%D8%B4%D9%8A%D8%A1%20%D9%85%D9%86%20%D9%85%D8%AD%D8%A7%D8%B3%D9%86%D9%87%20%D9%88%D8%B3%D9%88%D8%A1%20%D9%85%D8%A2%D9%84%D8%AA%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%20%D9%88%D8%A3%D9%87%D9%84%D9%87%20-%20%D8%AE%D8%B7%D8%A8%D8%A9%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-9",
            title: "خطبة الاستسقاء والتضرع إلى الله",
            duration: "12:51",
            audioUrl: "https://archive.org/download/20240207_20240207_2059/%D8%AE%D8%B7%D8%A8%D8%A9%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%B3%D9%82%D8%A7%D8%A1%20%20%20%D9%A2%D9%A0%20%20%D8%B1%D8%AC%D8%A8%20%D9%A1%D9%84%D9%A4%D9%A4%D9%A5%D9%87%D9%80%20%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-10",
            title: "فوائد وتأملات من سورة الفاتحة",
            duration: "23:42",
            audioUrl: "https://archive.org/download/drose_ralqssar/alfath.mp3"
          },
          {
            id: "l-alqaseer-11",
            title: "معنى لا إله إلا الله وحقيقتها",
            duration: "1:00:47",
            audioUrl: "https://archive.org/download/drose_ralqssar/1538.mp3"
          },
          {
            id: "l-alqaseer-12",
            title: "فضل طلب العلم الشرعي وآدابه",
            duration: "11:30",
            audioUrl: "https://archive.org/download/qosair_al3lm/Audio%20from%20Abdulilah_01.mp3"
          },
          {
            id: "l-alqaseer-13",
            title: "توجيهات ونصائح هامة ومؤثرة للمؤمنين",
            duration: "15:08",
            audioUrl: "https://archive.org/download/islami-295_202406/%28%D9%83%D9%84%D9%85%D8%A9%20%D8%AA%D9%88%D8%AC%D9%8A%D9%87%D9%8A%D8%A9%20%D8%B1%D8%A7%D8%A6%D8%B9%D8%A9%20%D8%AC%D8%AF%D9%8B%D8%A7%2915%D8%AF%D9%82%D9%8A%D9%82%D8%A9%20%20%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8E%D9%91%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20%D9%88%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%84%D9%87.mp3"
          },
          {
            id: "l-alqaseer-14",
            title: "التذكير بأصول وجوامع العمل الصالح",
            duration: "18:31",
            audioUrl: "https://archive.org/download/islami-295_202406/%7B%7B%D8%A7%D9%84%D8%AA%D8%B0%D9%83%D9%8A%D8%B1%20%D8%A8%D8%A3%D8%B5%D9%88%D9%84%20%D9%88%D8%AC%D9%88%D8%A7%D9%85%D8%B9%20%D9%84%D9%84%D8%B9%D9%85%D9%84%20%D8%A7%D9%84%D8%B5%D8%A7%D9%84%D8%AD%7D%7D%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1-%D8%AD%D9%81%D8%B8%D9%87%20%D8%A7%D9%84%D9%84%D9%87-19%20%D8%B1%D8%AC%D8%A8%201436%D9%87%D9%80.mp3"
          },
          {
            id: "l-alqaseer-15",
            title: "الدعاء شأنه ومنزلته وما ينبغي له",
            duration: "18:36",
            audioUrl: "https://archive.org/download/islami-295_202406/%7B%7B%D8%A7%D9%84%D8%AF%D8%B9%D8%A7%D8%A1%20%20%D8%B4%D8%A3%D9%86%D9%8F%D9%87%20%D9%88%D9%85%D9%86%D8%B2%D9%84%D8%AA%D9%8F%D9%87%20%D9%88%D9%85%D8%A7%20%D9%8A%D9%86%D8%A8%D8%BA%D9%8A%20%D9%84%D9%87%20%20%7D%7D%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D9%8E%D8%A8%D9%92%D8%AF%D9%90%D8%A7%D9%92%D9%84%D9%84%D9%91%D9%87%20%D8%A7%D9%84%D9%82%D9%8F%D8%B5%D9%8E%D9%11%D9%80%D9%80%D9%80%D8%B1%20-%D8%AD%D9%80%D9%80%D9%81%D8%B8%D9%87%20%D8%A7%D9%84%D9%84%D9%87-.mp3"
          },
          {
            id: "l-alqaseer-16",
            title: "فضل الشتاء ومهمات من أحكامه وآدابه",
            duration: "25:56",
            audioUrl: "https://archive.org/download/islami-295_202406/%7B%7B%D9%81%D8%B6%D9%84%20%20%D8%A7%D9%84%D8%B4%D8%AA%D8%A7%D8%A1%20%D9%88%D9%85%D9%87%D9%85%D8%A7%D8%AA%20%D9%85%D9%86%20%D8%A3%D8%AD%D9%83%D8%A5%D9%85%20%D8%AA%D8%AF%D8%B9%D9%88%20%D8%A7%D9%84%D8%AD%D8%A7%D8%AC%D8%A9%20%D8%A5%D9%84%D9%8A%D9%87%D8%A7%20%D9%81%D9%8A%D9%87%7D%7D%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%20%D8%B9%D9%8E%D8%A8%D9%92%D8%AF%D9%90%D8%A7%D9%92%D9%84%D9%84%D9%91%D9%87%20%D8%A8%D9%86%D9%90%20%D8%B5%D9%8E%D8%A7%D9%84%D9%8E%D8%AD%D9%8D%20%D8%A7%D9%84%D9%82%D9%8F%D8%B5%D9%8E%D9%11%D9%80%D9%80%D9%80%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-17",
            title: "آداب الذكر والدعاء وآثارهما الإيمانية",
            duration: "16:54",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A2%D8%AF%D8%A7%D8%A8%20%D8%A7%D9%84%D8%B0%D9%83%D8%B1%20%D9%88%D8%A7%D9%84%D8%AF%D8%B9%D8%A7%D8%A1%20-%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20-%20%D8%B1%D9%85%D8%B6%D8%A7%D9%86%201433.mp3"
          },
          {
            id: "l-alqaseer-18",
            title: "موقف المسلم من أهل الفسق والفجور",
            duration: "3:27",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A3%D9%87%D9%84%20%D8%A7%D9%84%D9%81%D8%B3%D9%82%20%D9%88%D8%A7%D9%84%D9%81%D8%AC%D9%88%D8%B1%20%20%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20%D9%88%D9%81%D9%82%D9%87%20%D8%A7%D9%84%D9%84%D9%87.mp3"
          },
          {
            id: "l-alqaseer-19",
            title: "أهمية الاحتساب وفضله في الشريعة",
            duration: "7:01",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A3%D9%87%D9%85%D9%8A%D8%A9%20%D8%A7%D9%84%D8%A5%D8%AD%D8%AA%D8%B3%D8%A7%D8%A8%20%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D8%B5%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-20",
            title: "أهمية العبادة والذكر لطالب العلم الشرعي",
            duration: "55:52",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A3%D9%87%D9%85%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B9%D8%A8%D8%A7%D8%AF%D8%A9%20%D9%88%D8%A7%D9%84%D8%B0%D9%83%D8%B1%20%D9%84%D8%B7%D8%A7%D9%84%D8%A8%20%D8%A7%D9%84%D8%B9%D9%84%D9%85%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20%D8%A7%D9%84%D8%B4%D9%87%D8%B1%D9%8A%20%D9%85%D8%B9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-21",
            title: "شريعة الإسلام وحكمة إقامة الحدود الشرعية",
            duration: "20:56",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A5%D9%86%D8%B9%D8%A7%D9%85%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B9%D8%A8%D8%A7%D8%AF%20%D8%A8%D8%B4%D8%B1%D9%8A%D8%B9%D8%A9%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85%D8%8C%20%D9%88%D9%85%D8%A7%D9%81%D9%8A%20%D8%A5%D9%82%D8%A7%D9%85%D8%A9%20%D8%A7%D9%84%D8%AD%D8%AF%D9%88%D8%AF%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20-%20%D8%AD%D9%81%D8%B8%D9%87%20%D8%A7%D9%84%D9%84%D9%87-.mp3"
          },
          {
            id: "l-alqaseer-22",
            title: "أمير المؤمنين أبو بكر الصديق رضي الله عنه",
            duration: "17:48",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A7%D8%A8%D9%88%20%D8%A8%D9%83%D8%B1%20%D8%A7%D9%84%D8%B5%D8%AF%D9%8A%D9%82%20%20-%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20-%20%D8%B1%D9%85%D8%B6%D8%A7%D9%86%201433.mp3"
          },
          {
            id: "l-alqaseer-23",
            title: "العمل الصالح الممحو للذنوب: أتبع السيئة الحسنة",
            duration: "21:31",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A7%D8%AA%D8%A8%D8%B9%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A6%D8%A9%20%D8%A7%D9%84%D8%AD%D8%B3%D9%86%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-24",
            title: "الحذر من مكدّرات ومصدّعات البيوت الأسرية",
            duration: "24:15",
            audioUrl: "https://archive.org/download/islami-295_202406/%D8%A7%D8%AD%D8%B0%D8%B1%D9%88%D8%A7%20%20%20%20%D9%85%D9%83%D8%AF%D9%91%D8%B1%D8%A7%D8%AA%20%D9%88%D9%85%D8%B5%D8%AF%D9%91%D8%B9%D8%A7%D8%AA%20%D8%A7%D9%84%D8%A8%D9%8A%D9%88%D8%AA.%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-25",
            title: "وصايا ذهبية وتوجيهات شرعية نافعة للمسلم",
            duration: "27:07",
            audioUrl: "https://archive.org/download/islami-295_202406/%D9%88%D8%B5%D8%A7%D9%8A%D8%A7%20%D8%B0%D9%87%D8%A8%D9%8A%D8%A9%20%D9%84%D8%A7%20%D8%AA%D9%81%D9%88%D8%AA%D9%87%D8%A7%20%E2%9C%A8%20%20%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1%20%D8%AD%D9%81%D8%B8%D9%87%20%D8%A7%D9%84%D9%84%D9%87.mp3"
          },
          {
            id: "l-alqaseer-26",
            title: "يا عبد الله.. لكي يحبك الله سبحانه كن محسنًا",
            duration: "14:41",
            audioUrl: "https://archive.org/download/islami-295_202406/%D9%8A%D8%A7%D8%B9%D8%A8%D9%80%D8%AF%20%D8%A7%D9%84%D9%84%D9%87%20%D9%84%D9%8A%D8%AD%D8%A8%D9%83%20%D8%A7%D9%84%D9%84%D9%87%20%D9%83%D9%86%20%D9%85%D8%AD%D8%B3%D9%86%D8%A7.mp3"
          },
          {
            id: "l-alqaseer-27",
            title: "الحض على الإخلاص لله والاتباع للنبي ﷺ في القول والعمل",
            duration: "24:16",
            audioUrl: "https://archive.org/download/islami-295_202406/%E2%80%8F%D8%A7%D9%84%D8%AD%D8%B6%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%A5%D8%AE%D9%84%D8%A7%D8%B5%20%D9%84%D9%84%D9%87%20%D8%AA%D8%B9%D8%A7%D9%84%D9%89%20%D9%88%D8%A7%D9%84%D8%A7%D8%AA%D8%A8%D8%A7%D8%B9%20%D9%84%D9%84%D9%86%D8%A8%D9%8A%20%EF%B7%BA%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%82%D9%88%D9%84%20%D9%88%D8%A7%D9%84%D8%B9%D9%85%D9%84%20%D8%A7%D9%84%D8%AA%D8%B9%D8%A7%D9%85%D9%84%20%20%20%D9%84%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A7%D9%84%D9%82%D8%B5%D9%8A%D8%B1.mp3"
          },
          {
            id: "l-alqaseer-28",
            title: "موعظة بليغة للتذكير والوعظ المؤثر والرجوع لله",
            duration: "32:46",
            audioUrl: "https://archive.org/download/islami-295_202406/%E2%9E%96%D9%85%D9%86%20%D8%A3%D8%B1%D9%88%D8%B9%20%D8%A7%D9%84%D9%85%D8%AD%D8%A7%D8%B6%D8%B1%D8%A7%D8%AA%20%D8%A7%D9%84%D9%88%D8%B9%D8%B8%D9%8A%D8%A9%E2%9E%96%D9%84%D9%81%D8%B6%D9%8A%D9%84%D8%A9%20%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%20%D8%B9%D8%A8%D9%80%D8%AF%D8%A7%D9%84%D9%84%D9%87%20%D8%A8%D9%86%20%D8%B5%D9%80%D8%A7%D9%84%D8%AD%20%D8%A7%D9%84%D9%82%D9%80%D8%B5%D9%80%D9%8A%D8%B1.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdullah-almutlaq",
    name: "الشيخ الدكتور عبد الله المطلق",
    description: "عالم وداعية إسلامي، عضو هيئة كبار العلماء ومستشار بالديوان الملكي.",
    likes: 18400,
    series: [
      {
        id: "series-mutlaq-khuluq",
        title: "برنامج خلق عظيم",
        description: "سلسلة من المحاضرات والدروس الإيمانية المتميزة للشيخ عبد الله المطلق تتناول محاسن الأخلاق والآداب الإسلامية.",
        lectures: [
          {
            id: "l-mutlaq-1",
            title: "التيسير والسماحة في الإسلام",
            duration: "07:01",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_4960/Kholq_05.mp3"
          },
          {
            id: "l-mutlaq-2",
            title: "الأخوة في الله وحقوقها الشرعية",
            duration: "06:59",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5000/Kholq_06.mp3"
          },
          {
            id: "l-mutlaq-3",
            title: "السعي في قضاء حوائج الناس وتيسير كرباتهم",
            duration: "06:30",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5000/Kholq_07.mp3"
          },
          {
            id: "l-mutlaq-4",
            title: "المنافسة والمسارعة في أعمال الآخرة",
            duration: "06:27",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5000/Kholq_08.mp3"
          },
          {
            id: "l-mutlaq-5",
            title: "الخشوع في الصلاة والعبادات وأثره على القلب",
            duration: "06:40",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_10.mp3"
          },
          {
            id: "l-mutlaq-6",
            title: "التحذير من الدين وخطره وأهمية السداد والمبادرة",
            duration: "08:50",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_11.mp3"
          },
          {
            id: "l-mutlaq-7",
            title: "أهمية الاستشارة وتبادل الآراء في الإسلام",
            duration: "07:05",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_12.mp3"
          },
          {
            id: "l-mutlaq-8",
            title: "خلق الحياء وفضله وأثره البالغ في سلوك المسلم",
            duration: "06:28",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_13.mp3"
          },
          {
            id: "l-mutlaq-9",
            title: "أجر وفضل النفقة على العيال ورعاية الأسرة",
            duration: "06:40",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_14.mp3"
          },
          {
            id: "l-mutlaq-10",
            title: "الوصية الشرعية وأحكامها وضوابط كتابتها",
            duration: "06:45",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_15.mp3"
          },
          {
            id: "l-mutlaq-11",
            title: "أهمية الاستفادة من الوقت وإدارته في طاعة الله",
            duration: "08:40",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5082/Kholq_16.mp3"
          },
          {
            id: "l-mutlaq-12",
            title: "خلق الصدق ومكانة الصادقين في الدنيا والآخرة",
            duration: "07:12",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5151/Kholq_20.mp3"
          },
          {
            id: "l-mutlaq-13",
            title: "الإحسان إلى الوالدين وبرهما وعظيم حقهما",
            duration: "07:22",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5151/Kholq_21.mp3"
          },
          {
            id: "l-mutlaq-14",
            title: "حقيقة التوكل على الله والاعتماد الصادق عليه",
            duration: "07:02",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5151/Kholq_22.mp3"
          },
          {
            id: "l-mutlaq-15",
            title: "فضل الإصلاح بين الناس ونبذ الخلافات والخصومات",
            duration: "08:18",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5151/Kholq_23.mp3"
          },
          {
            id: "l-mutlaq-16",
            title: "طاعة ولي الأمر بالمعروف وأهمية الجماعة والائتلاف",
            duration: "07:28",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5151/Kholq_24.mp3"
          },
          {
            id: "l-mutlaq-17",
            title: "خلق الصبر ومنزلة الصابرين وبشرى الله لهم",
            duration: "06:02",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5151/Kholq_25.mp3"
          },
          {
            id: "l-mutlaq-18",
            title: "الحب في الله وعظيم منزلة المتحابين فيه سبحانه",
            duration: "06:11",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5181/Kholq_26.mp3"
          },
          {
            id: "l-mutlaq-19",
            title: "التوسط والاقتصاد في المعيشة ومحاربة الإسراف",
            duration: "06:48",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5181/Kholq_27.mp3"
          },
          {
            id: "l-mutlaq-20",
            title: "فضل كفالة اليتيم ورعايته والإحسان إليه",
            duration: "06:57",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_5181/Kholq_28.mp3"
          }
        ]
      },
      {
        id: "series-mutlaq-lectures",
        title: "محاضرات وندوات منوعة",
        description: "مجموعة من المحاضرات والندوات الإيمانية المتميزة للشيخ الدكتور عبد الله المطلق في موضوعات مختلفة تهم المسلم.",
        lectures: [
          {
            id: "l-mutlaq-will",
            title: "برنامج كرسي العلماء - قوة الإرادة",
            duration: "50:04",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_1371/KorseyAl3olma26-03-2013.mp3"
          },
          {
            id: "l-mutlaq-drugs",
            title: "محاضرة خطر المخدرات والوقاية منها",
            duration: "44:59",
            audioUrl: "https://archive.org/download/all-islamic-2839/Almajd-mo7-28-03-12_.mp3"
          },
          {
            id: "l-mutlaq-da3wa",
            title: "محاضرة الدعوة إلى الله وضوابطها الشرعية",
            duration: "27:20",
            audioUrl: "https://archive.org/download/xboxgamer-722/da3wa-to-Allah.mp3"
          },
          {
            id: "l-mutlaq-istikhara",
            title: "خطبة أحكام صلاة الاستخارة وفقهها",
            duration: "29:49",
            audioUrl: "https://archive.org/download/all-islamic-1727/majd-5ottabaa2-22-12-10.mp3"
          }
        ]
      },
      {
        id: "series-mutlaq-qa",
        title: "برنامج سؤال وجواب (فتاوى منوعة)",
        description: "لقاءات متميزة من برنامج سؤال وجواب مع معالي الشيخ الدكتور عبد الله المطلق عبر إذاعة نداء الإسلام، يجيب فيها على أسئلة المستمعين الفقهية والحياتية.",
        lectures: [
          {
            id: "l-mutlaq-qa-408",
            title: "برنامج سؤال وجواب - الحلقة 408",
            duration: "08:12",
            audioUrl: "https://archive.org/download/arch-772008-04-soalwjwab-411/Arch_772008_01-soalwjwab408.mp3"
          },
          {
            id: "l-mutlaq-qa-409",
            title: "برنامج سؤال وجواب - الحلقة 409",
            duration: "07:48",
            audioUrl: "https://archive.org/download/arch-772008-04-soalwjwab-411/Arch_772008_02-soalwjwab409.mp3"
          },
          {
            id: "l-mutlaq-qa-410",
            title: "برنامج سؤال وجواب - الحلقة 410",
            duration: "08:10",
            audioUrl: "https://archive.org/download/arch-772008-04-soalwjwab-411/Arch_772008_03-soalwjwab410.mp3"
          },
          {
            id: "l-mutlaq-qa-411",
            title: "برنامج سؤال وجواب - الحلقة 411",
            duration: "09:23",
            audioUrl: "https://archive.org/download/arch-772008-04-soalwjwab-411/Arch_772008_04-soalwjwab411.mp3"
          },
          {
            id: "l-mutlaq-qa-412",
            title: "برنامج سؤال وجواب - الحلقة 412",
            duration: "07:59",
            audioUrl: "https://archive.org/download/arch-772008-04-soalwjwab-411/Arch_772008_05-soalwjwab412.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdullah-alfawzan",
    name: "الشيخ الدكتور عبد الله بن صالح الفوزان",
    description: "عالم وفقيه سعودي، وأستاذ الفقه وأصوله بجامعة الإمام محمد بن سعود الإسلامية سابقاً، صاحب الشروح والمصنفات الفقهية النافعة.",
    likes: 17200,
    series: [
      {
        id: "series-fawzan-adab",
        title: "شرح فصول في الآداب ومكارم الأخلاق",
        description: "شرح كتاب فصول في الآداب ومكارم الأخلاق المشروعة لأبي الوفاء ابن عقيل الحنبلي، دروس متميزة في تهذيب النفس والتحلي بمحاسن الآداب والشيم الإسلامية.",
        lectures: [
          {
            id: "l-fawzan-adab-1",
            title: "شرح فصول في الآداب - الدرس الأول",
            duration: "55:55",
            audioUrl: "https://archive.org/download/FossolFeAlAdabAlfozan1-6/01.mp3"
          },
          {
            id: "l-fawzan-adab-2",
            title: "شرح فصول في الآداب - الدرس الثاني",
            duration: "59:31",
            audioUrl: "https://archive.org/download/FossolFeAlAdabAlfozan1-6/02.mp3"
          },
          {
            id: "l-fawzan-adab-3",
            title: "شرح فصول في الآداب - الدرس الثالث",
            duration: "51:46",
            audioUrl: "https://archive.org/download/FossolFeAlAdabAlfozan1-6/03.mp3"
          },
          {
            id: "l-fawzan-adab-4",
            title: "شرح فصول في الآداب - الدرس الرابع",
            duration: "52:08",
            audioUrl: "https://archive.org/download/FossolFeAlAdabAlfozan1-6/04.mp3"
          },
          {
            id: "l-fawzan-adab-5",
            title: "شرح فصول في الآداب - الدرس الخامس",
            duration: "58:48",
            audioUrl: "https://archive.org/download/FossolFeAlAdabAlfozan1-6/05.mp3"
          },
          {
            id: "l-fawzan-adab-6",
            title: "شرح فصول في الآداب - الدرس السادس والأخير",
            duration: "1:13:07",
            audioUrl: "https://archive.org/download/FossolFeAlAdabAlfozan1-6/06.mp3"
          }
        ]
      },
      {
        id: "series-fawzan-kabair",
        title: "شرح منظومة الكبائر للحجاوي",
        description: "شرح ميسر ونافع لمنظومة الكبائر للعلامة موسى الحجاوي رحمه الله، يستعرض فيه حدود الكبائر وتفصيل عقوباتها الشرعية وآثارها على دين المرء.",
        lectures: [
          {
            id: "l-fawzan-kabair-intro",
            title: "شرح منظومة الكبائر - مقدمة الشرح",
            duration: "02:05",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/00.mp3"
          },
          {
            id: "l-fawzan-kabair-1",
            title: "شرح منظومة الكبائر - الجزء الأول",
            duration: "28:51",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/01.mp3"
          },
          {
            id: "l-fawzan-kabair-2",
            title: "شرح منظومة الكبائر - الجزء الثاني",
            duration: "11:15",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/03.mp3"
          },
          {
            id: "l-fawzan-kabair-3",
            title: "شرح منظومة الكبائر - الجزء الثالث",
            duration: "35:14",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/04.mp3"
          },
          {
            id: "l-fawzan-kabair-4",
            title: "شرح منظومة الكبائر - الجزء الرابع",
            duration: "2:58:24",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/05.mp3"
          },
          {
            id: "l-fawzan-kabair-5",
            title: "شرح منظومة الكبائر - الجزء الخامس",
            duration: "20:25",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/06.mp3"
          },
          {
            id: "l-fawzan-kabair-6",
            title: "شرح منظومة الكبائر - الجزء السادس والأخير",
            duration: "46:05",
            audioUrl: "https://archive.org/download/ManzomatAlkpaerAlfozan1-7/07.mp3"
          }
        ]
      },
      {
        id: "series-fawzan-daris",
        title: "شرح رسالة آداب الدارس والمدرس للقاسمي",
        description: "شرح خلاصة آداب الدارس والمدرس للعلامة جمال الدين القاسمي (المختصرة من مقدمة الإمام النووي في المجموع)، تتضمن توجيهات إيمانية وسلوكية لطالب العلم والمعلم.",
        lectures: [
          {
            id: "l-fawzan-daris-1",
            title: "شرح آداب الدارس والمدرس - الجزء الأول",
            duration: "1:28:39",
            audioUrl: "https://archive.org/download/fouzan-abd-adab-kasimi/01.mp3"
          },
          {
            id: "l-fawzan-daris-2",
            title: "شرح آداب الدارس والمدرس - الجزء الثاني",
            duration: "1:54:45",
            audioUrl: "https://archive.org/download/fouzan-abd-adab-kasimi/02.mp3"
          },
          {
            id: "l-fawzan-daris-3",
            title: "شرح آداب الدارس والمدرس - الجزء الثالث",
            duration: "1:07:28",
            audioUrl: "https://archive.org/download/fouzan-abd-adab-kasimi/03.mp3"
          },
          {
            id: "l-fawzan-daris-4",
            title: "شرح آداب الدارس والمدرس - الجزء الرابع",
            duration: "1:19:02",
            audioUrl: "https://archive.org/download/fouzan-abd-adab-kasimi/04.mp3"
          },
          {
            id: "l-fawzan-daris-5",
            title: "شرح آداب الدارس والمدرس - الجزء الخامس",
            duration: "1:11:06",
            audioUrl: "https://archive.org/download/fouzan-abd-adab-kasimi/05.mp3"
          },
          {
            id: "l-fawzan-daris-6",
            title: "شرح آداب الدارس والمدرس - الجزء السادس والأخير",
            duration: "2:00:05",
            audioUrl: "https://archive.org/download/fouzan-abd-adab-kasimi/06.mp3"
          }
        ]
      },
      {
        id: "series-fawzan-waraqat",
        title: "شرح نظم الورقات في أصول الفقه",
        description: "دروس علمية متميزة للشيخ الفوزان في شرح نظم الورقات في أصول الفقه للعمريطي بالتعاون مع ثلة من فحول العلماء، تشمل دلالات الألفاظ والقياس والأدلة الشرعية.",
        lectures: [
          {
            id: "l-fawzan-waraqat-1",
            title: "شرح نظم الورقات - الجزء الأول",
            duration: "1:10:30",
            audioUrl: "https://archive.org/download/Sharh-nadgmAlwrqat1-14/6.mp3"
          },
          {
            id: "l-fawzan-waraqat-2",
            title: "شرح نظم الورقات - الجزء الثاني",
            duration: "1:12:26",
            audioUrl: "https://archive.org/download/Sharh-nadgmAlwrqat1-14/7.mp3"
          },
          {
            id: "l-fawzan-waraqat-3",
            title: "شرح نظم الورقات - الجزء الثالث",
            duration: "1:05:53",
            audioUrl: "https://archive.org/download/Sharh-nadgmAlwrqat1-14/8.mp3"
          },
          {
            id: "l-fawzan-waraqat-4",
            title: "شرح نظم الورقات - الجزء الرابع والأخير",
            duration: "48:53",
            audioUrl: "https://archive.org/download/Sharh-nadgmAlwrqat1-14/9.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdulmohsen-alabbad",
    name: "الشيخ عبد المحسن العباد",
    description: "عالم وداعية إسلامي، والمحدث المعروف بالمسجد النبوي الشريف.",
    likes: 16500,
    series: [
      {
        id: "series-abbad-lectures",
        title: "محاضرات ولقاءات علمية متفرقة",
        description: "مجموعة من المحاضرات واللقاءات العلمية المتفرقة لفضيلة الشيخ عبد المحسن العباد، تتناول موضوعات عقدية وفقهية وتربوية.",
        lectures: [
          {
            id: "l-abbad-1",
            title: "صفحات من رحلتي العلمية",
            duration: "24:03",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad001.mp3"
          },
          {
            id: "l-abbad-2",
            title: "الشيخ ابن باز نموذج من الرعيل الأول (الجزء الأول)",
            duration: "46:20",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad037.mp3"
          },
          {
            id: "l-abbad-3",
            title: "الشيخ ابن باز نموذج من الرعيل الأول (الجزء الثاني)",
            duration: "45:44",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad038.mp3"
          },
          {
            id: "l-abbad-4",
            title: "الشيخ ابن عثيمين وشيء من سيرته ودعوته",
            duration: "1:19:41",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad039.mp3"
          },
          {
            id: "l-abbad-5",
            title: "طالب العلم والمصادر الحديثية",
            duration: "1:24:09",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad087.mp3"
          },
          {
            id: "l-abbad-6",
            title: "وصايا للدعاة إلى الله تعالى",
            duration: "51:59",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad145.mp3"
          },
          {
            id: "l-abbad-7",
            title: "الأماكن المشروع زيارتها بالمدينة",
            duration: "1:07:27",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad033.mp3"
          },
          {
            id: "l-abbad-8",
            title: "أحكام زيارة القبور",
            duration: "30:46",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad006.mp3"
          },
          {
            id: "l-abbad-9",
            title: "فضل شهر رمضان",
            duration: "32:00",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad104.mp3"
          },
          {
            id: "l-abbad-10",
            title: "قيام رمضان",
            duration: "31:23",
            audioUrl: "https://archive.org/download/Monawa3at-ElAbbad/Mo-Abbad105.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdulmohsen-alqasim",
    name: "الشيخ الدكتور عبد المحسن القاسم",
    description: "عالم وداعية إسلامي.",
    likes: 13800,
    series: [
      {
        id: "series-scholar-abdulmohsen-alqasim-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-abdulmohsen-alqasim-gen1-0",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen1-1",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen1-2",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen1-3",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen1-4",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          }
        ]
      },
      {
        id: "series-scholar-abdulmohsen-alqasim-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-abdulmohsen-alqasim-gen2-0",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen2-1",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen2-2",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen2-3",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-abdulmohsen-alqasim-gen2-4",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdulhadi-alfadhli",
    name: "الشيخ الدكتور عبد الهادي الفضلي",
    description: "عالم وداعية إسلامي.",
    likes: 7500,
    series: [
      {
        id: "series-scholar-abdulhadi-alfadhli-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-abdulhadi-alfadhli-gen1-0",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen1-1",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen1-2",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen1-3",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen1-4",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          }
        ]
      },
      {
        id: "series-scholar-abdulhadi-alfadhli-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-abdulhadi-alfadhli-gen2-0",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen2-1",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen2-2",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen2-3",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-abdulhadi-alfadhli-gen2-4",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-alawi-abbas-almaliki",
    name: "الشيخ علوي بن عباس المالكي",
    description: "عالم وداعية إسلامي.",
    likes: 6400,
    series: [
      {
        id: "series-scholar-alawi-abbas-almaliki-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-alawi-abbas-almaliki-gen1-0",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen1-1",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen1-2",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen1-3",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen1-4",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          }
        ]
      },
      {
        id: "series-scholar-alawi-abbas-almaliki-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-alawi-abbas-almaliki-gen2-0",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen2-1",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen2-2",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen2-3",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-alawi-abbas-almaliki-gen2-4",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-ali-alomari",
    name: "الدكتور علي العمري",
    description: "عالم وداعية إسلامي.",
    likes: 11500,
    series: [
      {
        id: "series-scholar-ali-alomari-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-ali-alomari-gen1-0",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen1-1",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen1-2",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen1-3",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen1-4",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          }
        ]
      },
      {
        id: "series-scholar-ali-alomari-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-ali-alomari-gen2-0",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-ali-alomari-gen2-1",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen2-2",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen2-3",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-ali-alomari-gen2-4",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-ali-alqarni",
    name: "الشيخ علي بن عبد الخالق القرني",
    description: "عالم وداعية إسلامي.",
    likes: 19800,
    series: [
      {
        id: "series-qarni-masterpieces",
        title: "من روائع المحاضرات",
        description: "مجموعة من أروع المحاضرات والخطب للشيخ علي بن عبد الخالق القرني.",
        lectures: [
          {
            id: "l-qarni-1",
            title: "أختاه هل تريدين السعادة؟",
            duration: "1:17:00",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A3%D8%AE%D8%AA%D8%A7%D9%87%20%D9%87%D9%84%20%D8%AA%D8%B1%D9%8A%D8%AF%D9%8A%D9%86%20%D8%A7%D9%84%D8%B3%D8%B9%D8%A7%D8%AF%D8%A9%D8%9F.mp3"
          },
          {
            id: "l-qarni-2",
            title: "أم العفاف",
            duration: "1:49:30",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A3%D9%85%20%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D9%81.mp3"
          },
          {
            id: "l-qarni-3",
            title: "كلنا ذوو خطأ",
            duration: "1:27:32",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%83%D9%84%D9%86%D8%A7%20%D8%B0%D9%88%D9%88%20%D8%AE%D8%B7%D8%A3.mp3"
          },
          {
            id: "l-qarni-4",
            title: "يا باغي الخير أقبل",
            duration: "1:28:16",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%8A%D8%A7%20%D8%A8%D8%A7%D8%BA%D9%8A%20%D8%A7%D9%84%D8%AE%D9%8A%D8%B1%20%D8%A3%D9%82%D8%A8%D9%84.mp3"
          },
          {
            id: "l-qarni-5",
            title: "أرعد وأبرق يا سخيف",
            duration: "0:53:20",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A3%D8%B1%D8%B9%D8%AF%20%D9%88%20%D8%A3%D8%A8%D8%B1%D9%82%20%D9%8A%D8%A7%20%D8%B3%D8%AE%D9%8A%D9%81.mp3"
          },
          {
            id: "l-qarni-6",
            title: "إياك والتلون",
            duration: "1:19:30",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A5%D9%8A%D8%A7%D9%83%20%D9%88%D8%A7%D9%84%D8%AA%D9%84%D9%88%D9%86.mp3"
          },
          {
            id: "l-qarni-7",
            title: "ابدأ من جديد",
            duration: "37:34",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D8%A8%D8%AF%D8%A3%20%D9%85%D9%86%20%D8%AC%D8%AF%D9%8A%D8%AF.mp3"
          },
          {
            id: "l-qarni-8",
            title: "اقصد البحر وخل القنوات",
            duration: "1:32:24",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%82%D8%B5%D8%AF%20%D8%A7%D9%84%D8%A8%D8%AD%D8%B1%20%D9%88%D8%AE%D9%84%20%D8%A7%D9%84%D9%82%D9%86%D9%88%D8%A7%D8%AA.mp3"
          },
          {
            id: "l-qarni-9",
            title: "الإيمان والحياة",
            duration: "1:24:15",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%A5%D9%8A%D9%85%D8%A7%D9%86%20%D9%88%D8%A7%D9%84%D8%AD%D9%8A%D8%A7%D8%A9.mp3"
          },
          {
            id: "l-qarni-10",
            title: "الجنة ونعيمها",
            duration: "1:27:03",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AC%D9%86%D8%A9%20%D9%88%D9%86%D8%B9%D9%8A%D9%85%D9%87%D8%A7.mp3"
          },
          {
            id: "l-qarni-11",
            title: "الحقيقة",
            duration: "41:00",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-12",
            title: "الرقابة لمن ؟",
            duration: "34:12",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%B1%D9%82%D8%A7%D8%A8%D8%A9%20%D9%84%D9%85%D9%86%20%D8%9F.mp3"
          },
          {
            id: "l-qarni-13",
            title: "السماء والسماوة",
            duration: "1:33:10",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%B3%D9%85%D8%A7%D8%A1%20%D9%88%D8%A7%D9%84%D8%B3%D9%85%D8%A7%D9%88%D8%A9.mp3"
          },
          {
            id: "l-qarni-14",
            title: "المضمار",
            duration: "1:21:11",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D9%85%D8%B6%D9%85%D8%A7%D8%B1.mp3"
          },
          {
            id: "l-qarni-15",
            title: "المواساة",
            duration: "46:38",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%B3%D8%A7%D8%A9.mp3"
          },
          {
            id: "l-qarni-16",
            title: "أي الغاديين أنت ؟",
            duration: "1:30:31",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A3%D9%8A%20%D8%A7%D9%84%D8%BA%D8%A7%D8%AF%D9%8A%D9%8A%D9%86%20%D8%A3%D9%86%D8%AA%20%D8%9F.mp3"
          },
          {
            id: "l-qarni-17",
            title: "أين المفر؟",
            duration: "35:08",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A3%D9%8A%D9%86%20%D8%A7%D9%84%D9%85%D9%81%D8%B1%D8%9F.mp3"
          },
          {
            id: "l-qarni-18",
            title: "إيماض البرق في شجاعة سيد الخلق ﷺ",
            duration: "1:36:26",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A5%D9%8A%D9%85%D8%A7%D8%B6%20%D8%A7%D9%84%D8%A8%D8%B1%D9%82%20%D9%81%D9%8A%20%D8%B4%D8%AC%D8%A7%D8%B9%D8%A9%20%D8%B3%D9%8A%D8%AF%20%D8%A7%D9%84%D8%AE%D9%84%D9%82%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-19",
            title: "الإكليل في حلم وأناة وصفح الخليل ﷺ",
            duration: "1:34:05",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%A5%D9%83%D9%84%D9%8A%D9%84%20%D9%81%D9%8A%20%D8%AD%D9%84%D9%85%20%D9%88%D8%A3%D9%86%D8%A7%D8%A9%20%D9%88%D8%B5%D9%81%D8%AD%20%D8%A7%D9%84%D8%AE%D9%84%D9%8A%D9%84%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-20",
            title: "الاختلاط وآثاره",
            duration: "32:41",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%A7%D8%AE%D8%AA%D9%84%D8%A7%D8%B7%20%D9%88%D8%A2%D8%AB%D8%A7%D8%B1%D9%87.mp3"
          },
          {
            id: "l-qarni-21",
            title: "النعيم لا يدرك بالنعيم",
            duration: "1:21:54",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D9%86%D8%B9%D9%8A%D9%85%20%D9%84%D8%A7%20%D9%8A%D8%AF%D8%B1%D9%83%20%D8%A8%D8%A7%D9%84%D9%86%D8%B9%D9%8A%D9%85.mp3"
          },
          {
            id: "l-qarni-22",
            title: "بادر قبل أن تبادر",
            duration: "52:00",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A8%D8%A7%D8%AF%D8%B1%20%D9%82%D8%A8%D9%84%20%D8%A3%D9%86%20%D8%AA%D8%A8%D8%A7%D8%AF%D8%B1.mp3"
          },
          {
            id: "l-qarni-23",
            title: "بلسم الحياة",
            duration: "53:54",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A8%D9%84%D8%B3%D9%85%20%D8%A7%D9%84%D8%AD%D9%8A%D8%A7%D8%A9.mp3"
          },
          {
            id: "l-qarni-24",
            title: "حاسبوا أنفسكم قبل أن تحاسبوا",
            duration: "1:28:45",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AD%D8%A7%D8%B3%D8%A8%D9%88%D8%A7%20%D8%A3%D9%86%D9%81%D8%B3%D9%83%D9%85%20%D9%82%D8%A8%D9%84%20%D8%A3%D9%86%20%D8%AA%D8%AD%D8%A7%D8%B3%D8%A8%D9%88%D8%A7.mp3"
          },
          {
            id: "l-qarni-25",
            title: "حروف تجر الحتوف",
            duration: "1:38:54",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AD%D8%B1%D9%88%D9%81%20%D8%AA%D8%AC%D8%B1%20%D8%A7%D9%84%D8%AD%D8%AA%D9%88%D9%81.mp3"
          },
          {
            id: "l-qarni-26",
            title: "الجادي المدوف في صبر النبي الرؤوف ﷺ",
            duration: "1:40:52",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AC%D8%A7%D8%AF%D9%8A%20%D8%A7%D9%84%D9%85%D8%AF%D9%88%D9%81%20%D9%81%D9%8A%20%D8%B5%D8%A8%D8%B1%20%D8%A7%D9%84%D9%86%D8%A8%D9%8A%20%D8%A7%D9%84%D8%B1%D8%A4%D9%88%D9%81%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-27",
            title: "الرضاب المعسول في جود الرسول ﷺ",
            duration: "1:41:42",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%B1%D8%B6%D8%A7%D8%A8%20%D8%A7%D9%84%D9%85%D8%B9%D8%B3%D9%88%D9%84%20%D9%81%D9%8A%20%D8%AC%D9%88%D8%AF%20%D8%A7%D9%84%D8%B1%D8%B3%D9%88%D9%84%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-28",
            title: "الزرياب الإبريز في وفاء النبي العزيز ﷺ",
            duration: "1:35:56",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%B2%D8%B1%D9%8A%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A5%D8%A8%D8%B1%D9%8A%D8%B2%20%D9%81%D9%8A%20%D9%88%D9%81%D8%A7%D8%A1%20%D8%A7%D9%84%D9%86%D8%A8%D9%8A%20%D8%A7%D9%84%D8%B9%D8%B2%D9%8A%D8%B2%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-29",
            title: "العرار المشتار في حسن تصرف المختار ﷺ",
            duration: "1:39:50",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%B9%D8%B1%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%A7%D8%B1%20%D9%81%D9%8A%20%D8%AD%D8%B3%D9%86%20%D8%AA%D8%B5%D8%B1%D9%81%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%A7%D8%B1%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-30",
            title: "المندلي الذكي في صدق خير مرسل ونبي ﷺ",
            duration: "1:32:58",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D9%85%D9%86%D8%AF%D9%84%D9%8A%20%D8%A7%D9%84%D8%B0%D9%83%D9%8A%20%D9%81%D9%8A%20%D8%B5%D8%AF%D9%82%20%D8%AE%D9%8A%D8%B1%20%D9%85%D8%B1%D8%B3%D9%84%20%D9%88%D9%86%D8%A8%D9%8A%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-31",
            title: "الوطفاء في رحمة خاتم الأنبياء ﷺ",
            duration: "1:44:56",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D9%88%D8%B7%D9%81%D8%A7%D8%A1%20%D9%81%D9%8A%20%D8%B1%D8%AD%D9%85%D8%A9%20%D8%AE%D8%A7%D8%AA%D9%85%20%D8%A7%D9%84%D8%A3%D9%86%D8%A8%D9%8A%D8%A7%D8%A1%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-32",
            title: "اليلنجوج الذكي في تعامل النبي ﷺ",
            duration: "1:39:13",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D9%8A%D9%84%D9%86%D8%AC%D9%88%D8%AC%20%D8%A7%D9%84%D8%B0%D9%83%D9%8A%20%D9%81%D9%8A%20%D8%AA%D8%B9%D8%A7%D9%85%D9%84%20%D8%A7%D9%84%D9%86%D8%A8%D9%8A%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-33",
            title: "جونة العطار في زهد وعدل المختار ﷺ",
            duration: "1:36:40",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AC%D9%88%D9%86%D8%A9%20%D8%A7%D9%84%D8%B9%D8%B7%D8%A7%D8%B1%20%D9%81%D9%8A%20%D8%B2%D9%87%D8%AF%20%D9%88%D8%B9%D8%AF%D9%84%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%A7%D8%B1%20%EF%B7%BA.mp3"
          },
          {
            id: "l-qarni-34",
            title: "حاجتنا إلى التمسك بالعقيدة",
            duration: "38:02",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AD%D8%A7%D8%AC%D8%AA%D9%86%D8%A7%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D8%AA%D9%85%D8%B3%D9%83%20%D8%A8%D8%A7%D9%84%D8%B9%D9%82%D9%8A%D8%AF%D8%A9.mp3"
          },
          {
            id: "l-qarni-35",
            title: "حسرات",
            duration: "41:00",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AD%D8%B3%D8%B1%D8%A7%D8%AA.mp3"
          },
          {
            id: "l-qarni-36",
            title: "حياض النجاة",
            duration: "54:33",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AD%D9%8A%D8%A7%D8%B6%20%D8%A7%D9%84%D9%86%D8%AC%D8%A7%D8%A9.mp3"
          },
          {
            id: "l-qarni-37",
            title: "دعوة للتأمل",
            duration: "1:21:13",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AF%D8%B9%D9%88%D8%A9%20%D9%84%D9%84%D8%AA%D8%A3%D9%85%D9%84.mp3"
          },
          {
            id: "l-qarni-38",
            title: "رجال صدقوا ما عاهدوا الله عليه",
            duration: "1:31:24",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B1%D8%AC%D8%A7%D9%84%20%D8%B5%D8%AF%D9%82%D9%88%D8%A7%20%D9%85%D8%A7%20%D8%B9%D8%A7%D9%87%D8%AF%D9%88%D8%A7%20%D8%A7%D9%84%D9%84%D9%87%20%D8%B9%D9%84%D9%8A%D9%87.mp3"
          },
          {
            id: "l-qarni-39",
            title: "رسالة إلى شاب",
            duration: "34:51",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B1%D8%B3%D8%A7%D9%84%D8%A9%20%D8%A5%D9%84%D9%89%20%D8%B4%D8%A7%D8%A8.mp3"
          },
          {
            id: "l-qarni-40",
            title: "صراع الدعاة مع المنافقين",
            duration: "39:41",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B5%D8%B1%D8%A7%D8%B9%20%D8%A7%D9%84%D8%AF%D8%B9%D8%A7%D8%A9%20%D9%85%D8%B9%20%D8%A7%D9%84%D9%85%D9%86%D8%A7%D9%81%D9%82%D9%8A%D9%86.mp3"
          },
          {
            id: "l-qarni-41",
            title: "صفة الجنة",
            duration: "1:28:31",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B5%D9%81%D8%A9%20%D8%A7%D9%84%D8%AC%D9%86%D8%A9.mp3"
          },
          {
            id: "l-qarni-42",
            title: "صفحات مطوية",
            duration: "1:30:21",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B5%D9%81%D8%AD%D8%A7%D8%AA%20%D9%85%D8%B7%D9%88%D9%8A%D8%A9.mp3"
          },
          {
            id: "l-qarni-43",
            title: "صفحة صدق",
            duration: "27:27",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B5%D9%81%D8%AD%D8%A9%20%D8%B5%D8%AF%D9%82.mp3"
          },
          {
            id: "l-qarni-44",
            title: "صور وعبر من حياة أبي بكر",
            duration: "1:24:41",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B5%D9%88%D8%B1%20%D9%88%D8%B9%D8%A8%D8%B1%20%D9%85%D9%86%20%D8%AD%D9%8A%D8%A7%D8%A9%20%D8%A3%D8%A8%D9%8A%20%D8%A8%D9%83%D8%B1.mp3"
          },
          {
            id: "l-qarni-45",
            title: "صور وعبر من حياة عمر بن الخطاب",
            duration: "1:21:14",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B5%D9%88%D8%B1%20%D9%88%D8%B9%D8%A8%D8%B1%20%D9%85%D9%86%20%D8%AD%D9%8A%D8%A7%D8%A9%20%D8%B9%D9%85%D8%B1%20%D8%A8%D9%86%20%D8%A7%D9%84%D8%AE%D8%B7%D8%A7%D8%A8.mp3"
          },
          {
            id: "l-qarni-46",
            title: "ضياع الأمة بين الترف والتميع",
            duration: "1:25:34",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-47",
            title: "عبير الوفاء",
            duration: "1:29:41",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-48",
            title: "عتبات",
            duration: "1:33:12",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-49",
            title: "غاية لا تدرك",
            duration: "1:20:15",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-50",
            title: "فبأي آلاء ربكما تكذبان",
            duration: "1:26:44",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-51",
            title: "في مدرسة يوسف عليه السلام",
            duration: "1:18:22",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-52",
            title: "قذائف الحق",
            duration: "51:04",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-53",
            title: "كواكب فلك",
            duration: "1:41:00",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-54",
            title: "كيف نكتسب الأخلاق",
            duration: "36:45",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-55",
            title: "ليلة في بيت النبي ﷺ",
            duration: "1:33:55",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-56",
            title: "ماذا بعد رمضان؟",
            duration: "1:22:45",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-57",
            title: "مدرسة محمد ﷺ",
            duration: "1:28:12",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-58",
            title: "مفاتيح الخير",
            duration: "1:31:05",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-59",
            title: "من أحوال المصطفى ﷺ",
            duration: "1:24:55",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-60",
            title: "نزهة المشتاقين",
            duration: "1:19:14",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-61",
            title: "هادم اللذات",
            duration: "1:27:33",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-62",
            title: "هكذا علمتني الحياة",
            duration: "1:45:02",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-63",
            title: "همسات للسائرين",
            duration: "1:23:41",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-64",
            title: "ومضات من السيرة",
            duration: "1:30:15",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-65",
            title: "ينابيع الرجاء",
            duration: "1:21:44",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%AD%D9%82%D9%8A%D9%82%D8%A9.mp3"
          },
          {
            id: "l-qarni-66",
            title: "الأمر بالمعروف",
            duration: "40:50",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%A7%D9%84%D8%A3%D9%85%D8%B1%20%D8%A8%D8%A7%D9%84%D9%85%D8%B9%D8%B1%D9%88%D9%81.mp3"
          },
          {
            id: "l-qarni-67",
            title: "حقيقة الكلمة",
            duration: "38:27",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%AD%D9%82%D9%8A%D9%82%D8%A9%20%D8%A7%D9%84%D9%83%D9%84%D9%85%D8%A9.mp3"
          },
          {
            id: "l-qarni-68",
            title: "على الطريق 1",
            duration: "1:23:46",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B7%D8%B1%D9%8A%D9%82%201.mp3"
          },
          {
            id: "l-qarni-69",
            title: "على الطريق 2",
            duration: "1:31:21",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%B7%D8%B1%D9%8A%D9%82%202.mp3"
          },
          {
            id: "l-qarni-70",
            title: "كل يغدو",
            duration: "1:18:18",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%83%D9%84%20%D9%8A%D8%BA%D8%AF%D9%88.mp3"
          },
          {
            id: "l-qarni-71",
            title: "كيف تبني نفسك؟",
            duration: "1:27:48",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%83%D9%8A%D9%81%20%D8%AA%D8%A8%D9%86%D9%8A%20%D9%86%D9%81%D8%B3%D9%83%D8%9F.mp3"
          },
          {
            id: "l-qarni-72",
            title: "ما حقيقة كخيال",
            duration: "1:21:06",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%85%D8%A7%20%D8%AD%D9%82%D9%8A%D9%82%D8%A9%20%D9%83%D8%AE%D9%8A%D8%A7%D9%84.mp3"
          },
          {
            id: "l-qarni-73",
            title: "مكانة المرأة في الإسلام",
            duration: "40:47",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%85%D9%83%D8%A7%D9%86%D8%A9%20%D8%A7%D9%84%D9%85%D8%B1%D8%A3%D8%A9%20%D9%81%D9%8A%20%D8%A7%D9%84%D8%A5%D8%B3%D9%84%D8%A7%D9%85.mp3"
          },
          {
            id: "l-qarni-74",
            title: "من أسباب تخلف المسلمين",
            duration: "32:48",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%85%D9%86%20%D8%A3%D8%B3%D8%A8%D8%A7%D8%A8%20%D8%AA%D8%AE%D9%84%D9%81%20%D8%A7%D9%84%D9%85%D8%B3%D9%84%D9%85%D9%8A%D9%86.mp3"
          },
          {
            id: "l-qarni-75",
            title: "منشورات من أخبار العلماء",
            duration: "48:37",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%85%D9%86%D8%B4%D9%88%D8%B1%D8%A7%D8%AA%20%D9%85%D9%86%20%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1%20%D8%A7%D9%84%D8%B9%D9%84%D9%85%D8%A7%D8%A1.mp3"
          },
          {
            id: "l-qarni-76",
            title: "مواقف من الصدق",
            duration: "30:28",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%85%D9%88%D8%A7%D9%82%D9%81%20%D9%85%D9%86%20%D8%A7%D9%84%D8%B5%D8%AF%D9%82.mp3"
          },
          {
            id: "l-qarni-77",
            title: "نظرات في غزوة تبوك",
            duration: "35:06",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%86%D8%B8%D8%B1%D8%A7%D8%AA%20%D9%81%D9%8A%20%D8%BA%D8%B2%D9%88%D8%A9%20%D8%AA%D8%A8%D9%88%D9%83%20-%20%D8%A7%D8%B3%D8%A3%D9%84%D9%88%D8%A7%20%D8%A7%D9%84%D8%AA%D8%A7%D8%B1%D9%8A%D8%AE.mp3"
          },
          {
            id: "l-qarni-78",
            title: "هلموا إلى القرآن",
            duration: "29:34",
            audioUrl: "https://archive.org/download/ali_alqarni1/%D9%87%D9%84%D9%85%D9%88%D8%A7%20%D8%A5%D9%84%D9%89%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-ali-badahdah",
    name: "الشيخ الدكتور علي بن عمر بادحدح",
    description: "عالم وداعية إسلامي.",
    likes: 8200,
    series: [
      {
        id: "series-scholar-ali-badahdah-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-ali-badahdah-gen1-0",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen1-1",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen1-2",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen1-3",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen1-4",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          }
        ]
      },
      {
        id: "series-scholar-ali-badahdah-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-ali-badahdah-gen2-0",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen2-1",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen2-2",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen2-3",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-ali-badahdah-gen2-4",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-ali-abulhasan",
    name: "الشيخ علي محمد أبو الحسن",
    description: "عالم وداعية إسلامي.",
    likes: 7100,
    series: [
      {
        id: "series-scholar-ali-abulhasan-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-ali-abulhasan-gen1-0",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-ali-abulhasan-gen1-1",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-ali-abulhasan-gen1-2",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-ali-abulhasan-gen1-3",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-ali-abulhasan-gen1-4",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          }
        ]
      },
      {
        id: "series-scholar-ali-abulhasan-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-ali-abulhasan-gen2-0",
            title: "كيف نجدد إيماننا؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-ali-abulhasan-gen2-1",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-ali-abulhasan-gen2-2",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-ali-abulhasan-gen2-3",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-ali-abulhasan-gen2-4",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-omar-almuqbil",
    name: "الشيخ الدكتور عمر المقبل",
    description: "عالم وداعية إسلامي.",
    likes: 14300,
    series: [
      {
        id: "series-scholar-omar-almuqbil-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-omar-almuqbil-gen1-0",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen1-1",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen1-2",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen1-3",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen1-4",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          }
        ]
      },
      {
        id: "series-scholar-omar-almuqbil-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-omar-almuqbil-gen2-0",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen2-1",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-omar-almuqbil-gen2-2",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen2-3",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-omar-almuqbil-gen2-4",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-omar-kamel",
    name: "الدكتور عمر عبد الله كامل",
    description: "عالم وداعية إسلامي.",
    likes: 6900,
    series: [
      {
        id: "series-scholar-omar-kamel-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-omar-kamel-gen1-0",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen1-1",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen1-2",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen1-3",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen1-4",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          }
        ]
      },
      {
        id: "series-scholar-omar-kamel-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-omar-kamel-gen2-0",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen2-1",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen2-2",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen2-3",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-omar-kamel-gen2-4",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-awadh-alqarni",
    name: "الشيخ الدكتور عوض القرني",
    description: "عالم وداعية إسلامي.",
    likes: 16800,
    series: [
      {
        id: "series-scholar-awadh-alqarni-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-awadh-alqarni-gen1-0",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen1-1",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen1-2",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen1-3",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen1-4",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          }
        ]
      },
      {
        id: "series-scholar-awadh-alqarni-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-awadh-alqarni-gen2-0",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen2-1",
            title: "كيف نجدد إيماننا؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen2-2",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen2-3",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-awadh-alqarni-gen2-4",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-gharm-albishy",
    name: "الداعية غرم البيشي",
    description: "داعية وإعلامي إسلامي.",
    likes: 10400,
    series: [
      {
        id: "series-scholar-gharm-albishy-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-gharm-albishy-gen1-0",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-gharm-albishy-gen1-1",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-gharm-albishy-gen1-2",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-gharm-albishy-gen1-3",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-gharm-albishy-gen1-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      },
      {
        id: "series-scholar-gharm-albishy-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-gharm-albishy-gen2-0",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-gharm-albishy-gen2-1",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-gharm-albishy-gen2-2",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-gharm-albishy-gen2-3",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-gharm-albishy-gen2-4",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-fayhan-alghamdi",
    name: "الداعية فيحان الغامدي",
    description: "عالم وداعية إسلامي.",
    likes: 5800,
    series: [
      {
        id: "series-scholar-fayhan-alghamdi-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-fayhan-alghamdi-gen1-0",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen1-1",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen1-2",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen1-3",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen1-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      },
      {
        id: "series-scholar-fayhan-alghamdi-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-fayhan-alghamdi-gen2-0",
            title: "مواقف من حياة الصحابة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen2-1",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen2-2",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen2-3",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-fayhan-alghamdi-gen2-4",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-manaa-aljuhani",
    name: "الدكتور مانع بن حماد الجهني",
    description: "عالم وداعية إسلامي.",
    likes: 7300,
    series: [
      {
        id: "series-scholar-manaa-aljuhani-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-manaa-aljuhani-gen1-0",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen1-1",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen1-2",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen1-3",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen1-4",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          }
        ]
      },
      {
        id: "series-scholar-manaa-aljuhani-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-manaa-aljuhani-gen2-0",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen2-1",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "40:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen2-2",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen2-3",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-manaa-aljuhani-gen2-4",
            title: "كيف نجدد إيماننا؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mohammed-alsaqqaf",
    name: "الداعية محمد السقاف",
    description: "عالم وداعية إسلامي.",
    likes: 9200,
    series: [
      {
        id: "series-scholar-mohammed-alsaqqaf-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mohammed-alsaqqaf-gen1-0",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen1-1",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen1-2",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen1-3",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen1-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mohammed-alsaqqaf-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mohammed-alsaqqaf-gen2-0",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen2-1",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen2-2",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen2-3",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-mohammed-alsaqqaf-gen2-4",
            title: "مواقف من حياة الصحابة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mohammed-bin-jamah",
    name: "الشيخ محمد بن علي بن جماح",
    description: "عالم وداعية إسلامي.",
    likes: 6100,
    series: [
      {
        id: "series-scholar-mohammed-bin-jamah-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mohammed-bin-jamah-gen1-0",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen1-1",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen1-2",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen1-3",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen1-4",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mohammed-bin-jamah-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mohammed-bin-jamah-gen2-0",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen2-1",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen2-2",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "40:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen2-3",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-mohammed-bin-jamah-gen2-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mohammed-alawi-almaliki",
    name: "الشيخ الدكتور محمد علوي المالكي",
    description: "عالم وداعية إسلامي.",
    likes: 8700,
    series: [
      {
        id: "series-scholar-mohammed-alawi-almaliki-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen1-0",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen1-1",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen1-2",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen1-3",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen1-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mohammed-alawi-almaliki-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen2-0",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen2-1",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen2-2",
            title: "مواقف من حياة الصحابة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen2-3",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-mohammed-alawi-almaliki-gen2-4",
            title: "كيف نجدد إيماننا؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mahmoud-alshinqiti",
    name: "الشيخ محمود بن محمد الشنقيطي",
    description: "عالم وداعية إسلامي.",
    likes: 11600,
    series: [
      {
        id: "series-scholar-mahmoud-alshinqiti-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mahmoud-alshinqiti-gen1-0",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen1-1",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen1-2",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen1-3",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen1-4",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mahmoud-alshinqiti-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mahmoud-alshinqiti-gen2-0",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen2-1",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen2-2",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen2-3",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-mahmoud-alshinqiti-gen2-4",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-muqbil-aldhakir",
    name: "الدكتور مقبل الذكير",
    description: "عالم وداعية إسلامي.",
    likes: 5400,
    series: [
      {
        id: "series-scholar-muqbil-aldhakir-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-muqbil-aldhakir-gen1-0",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen1-1",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen1-2",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen1-3",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen1-4",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          }
        ]
      },
      {
        id: "series-scholar-muqbil-aldhakir-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-muqbil-aldhakir-gen2-0",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "40:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen2-1",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen2-2",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen2-3",
            title: "التوبة والرجوع إلى الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-muqbil-aldhakir-gen2-4",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mousa-alqarni",
    name: "الشيخ الدكتور موسى القرني",
    description: "عالم وداعية إسلامي.",
    likes: 6800,
    series: [
      {
        id: "series-scholar-mousa-alqarni-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mousa-alqarni-gen1-0",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-mousa-alqarni-gen1-1",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-mousa-alqarni-gen1-2",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-mousa-alqarni-gen1-3",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-mousa-alqarni-gen1-4",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mousa-alqarni-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mousa-alqarni-gen2-0",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-mousa-alqarni-gen2-1",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-mousa-alqarni-gen2-2",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-mousa-alqarni-gen2-3",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-mousa-alqarni-gen2-4",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-yahya-alyahya",
    name: "الشيخ يحيى بن عبد العزيز اليحيى",
    description: "عالم وداعية إسلامي.",
    likes: 10500,
    series: [
      {
        id: "series-scholar-yahya-alyahya-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-yahya-alyahya-gen1-0",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen1-1",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen1-2",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen1-3",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen1-4",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          }
        ]
      },
      {
        id: "series-scholar-yahya-alyahya-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-yahya-alyahya-gen2-0",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "40:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen2-1",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen2-2",
            title: "التوبة والرجوع إلى الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen2-3",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-yahya-alyahya-gen2-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-yousef-alahmad",
    name: "الشيخ الدكتور يوسف الأحمد",
    description: "عالم وداعية إسلامي.",
    likes: 13400,
    series: [
      {
        id: "series-scholar-yousef-alahmad-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-yousef-alahmad-gen1-0",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-yousef-alahmad-gen1-1",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-yousef-alahmad-gen1-2",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-yousef-alahmad-gen1-3",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-yousef-alahmad-gen1-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      },
      {
        id: "series-scholar-yousef-alahmad-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-yousef-alahmad-gen2-0",
            title: "مواقف من حياة الصحابة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-yousef-alahmad-gen2-1",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-yousef-alahmad-gen2-2",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-yousef-alahmad-gen2-3",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-yousef-alahmad-gen2-4",
            title: "التوبة والرجوع إلى الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mishal-alotaibi",
    name: "الشيخ مشعل العتيبي",
    description: "عالم وداعية إسلامي.",
    likes: 9500,
    series: [
      {
        id: "series-mishal-1",
        title: "روائع المحاضرات",
        description: "مجموعة من المحاضرات المؤثرة والمقاطع الدعوية",
        lectures: [
          {
            id: "l-mishal-1",
            title: "العائدون",
            duration: "54:24",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/al3a2edoon_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-2",
            title: "التوبة",
            duration: "47:01",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/al_twba_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-3",
            title: "خلف أسوار البيوت المغلقة",
            duration: "06:15",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/aswaralbeout_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-4",
            title: "بدموعنا نناديكم",
            duration: "1:42:27",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/bedomoenaa_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-5",
            title: "دمعة أب",
            duration: "47:19",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/dam3ato-_abo_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-6",
            title: "دمعة رحيل",
            duration: "39:05",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/dam3atrahel_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-7",
            title: "دمعة منتكس",
            duration: "42:30",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/damatomountakes_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-8",
            title: "دمعة ملتزم",
            duration: "1:10:57",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/dmatomoltazem_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-9",
            title: "دمعة تائب",
            duration: "51:10",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/dmatotaeb_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-10",
            title: "إلا صلاتى",
            duration: "37:40",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/elaslate_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-11",
            title: "يا شباب إلا الصلاة",
            duration: "51:14",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/ella-alsalt_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-12",
            title: "فتيات الفردوس",
            duration: "1:02:43",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/ftiatalferdows_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-13",
            title: "حق الوالدين",
            duration: "44:56",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/haqoalwaledain_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-14",
            title: "قصص أبكتني",
            duration: "54:54",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/kessabktne_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-15",
            title: "صائم لم يصم",
            duration: "51:34",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/lamyasom_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-16",
            title: "نور الهداية",
            duration: "1:16:07",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/nour_al_hedaiaa_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-17",
            title: "عذرا امى",
            duration: "28:59",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/ozraamy_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-18",
            title: "ستندم",
            duration: "37:01",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/satandam_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-19",
            title: "شتان بين امراتين",
            duration: "1:16:21",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/shtan_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-20",
            title: "يصلون ولكن",
            duration: "57:54",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/youslounwlaken_uP_bY_mUSLEm.Ettounssi.mp3"
          },
          {
            id: "l-mishal-om-khaled",
            title: "قصة أم خالد المبكية كاملة",
            duration: "54:54",
            audioUrl: "https://archive.org/download/Islamic_Tape-100_uP_bY_mUSLEm/kessabktne_uP_bY_mUSLEm.Ettounssi.mp3"
          }
        ]
      },
      {
        id: "series-mishal-2",
        title: "مقاطع دعوية مؤثرة",
        description: "مقتطفات دعوية مؤثرة للشيخ مشعل العتيبي",
        lectures: [
          {
            id: "l-mishal-21",
            title: "أي طاعة ندعي",
            duration: "07:29",
            audioUrl: "https://archive.org/download/msah_il/Msah_il1.mp3"
          },
          {
            id: "l-mishal-22",
            title: "من لنا غير الله",
            duration: "00:58",
            audioUrl: "https://archive.org/download/msah_il/Msah_il10.mp3"
          },
          {
            id: "l-mishal-23",
            title: "نعمة الهداية",
            duration: "01:28",
            audioUrl: "https://archive.org/download/msah_il/Msah_il11.mp3"
          },
          {
            id: "l-mishal-24",
            title: "يا يمه",
            duration: "06:24",
            audioUrl: "https://archive.org/download/msah_il/Msah_il12.mp3"
          },
          {
            id: "l-mishal-25",
            title: "التوبة حال المؤمن",
            duration: "00:56",
            audioUrl: "https://archive.org/download/msah_il/Msah_il13.mp3"
          },
          {
            id: "l-mishal-26",
            title: "زوجة يتمناها كل رجل",
            duration: "11:20",
            audioUrl: "https://archive.org/download/msah_il/Msah_il2.mp3"
          },
          {
            id: "l-mishal-27",
            title: "فأذلهم الله",
            duration: "02:22",
            audioUrl: "https://archive.org/download/msah_il/Msah_il3.mp3"
          },
          {
            id: "l-mishal-28",
            title: "في كلية البنات",
            duration: "09:03",
            audioUrl: "https://archive.org/download/msah_il/Msah_il4.mp3"
          },
          {
            id: "l-mishal-29",
            title: "قصة موت شاب",
            duration: "06:31",
            audioUrl: "https://archive.org/download/msah_il/Msah_il5.mp3"
          },
          {
            id: "l-mishal-30",
            title: "قلب رباه القرآن",
            duration: "05:14",
            audioUrl: "https://archive.org/download/msah_il/Msah_il6.mp3"
          },
          {
            id: "l-mishal-31",
            title: "ماتت تحتضن المصحف",
            duration: "09:05",
            audioUrl: "https://archive.org/download/msah_il/Msah_il7.mp3"
          },
          {
            id: "l-mishal-32",
            title: "مأساة هند",
            duration: "25:45",
            audioUrl: "https://archive.org/download/msah_il/Msah_il8.mp3"
          },
          {
            id: "l-mishal-33",
            title: "مآسي خلف الجدران",
            duration: "09:08",
            audioUrl: "https://archive.org/download/msah_il/Msah_il9.mp3"
          },
          {
            id: "l-mishal-34",
            title: "أم فيصل المظلومة",
            duration: "10:14",
            audioUrl: "https://archive.org/download/msah_il/msah_il.mp3"
          }
        ]
      },
      {
        id: "series-mishal-3",
        title: "متفرقات مختارة",
        description: "محاضرات متفرقة مختارة لفضيلة الشيخ مشعل العتيبي",
        lectures: [
          {
            id: "l-mishal-35",
            title: "شتان بين امرأتين",
            duration: "1:15:11",
            audioUrl: "https://archive.org/download/shtan/shtan__rowea.blogspot.com.mp3"
          },
          {
            id: "l-mishal-36",
            title: "يالها من خاتمة",
            duration: "49:02",
            audioUrl: "https://archive.org/download/shtan/YaalhaMnkhatma.mp3"
          },
          {
            id: "l-mishal-37",
            title: "متى اخر صلاة صليتها",
            duration: "04:40",
            audioUrl: "https://archive.org/download/Mishal_Al_Otaibi/000001.mp3"
          },
          {
            id: "l-mishal-38",
            title: "الوالدين ما أعظمهما",
            duration: "06:09",
            audioUrl: "https://archive.org/download/Mishal_Al_Otaibi/000002.mp3"
          },
          {
            id: "l-mishal-39",
            title: "قصص أبكتني (نسخة كاملة)",
            duration: "54:44",
            audioUrl: "https://archive.org/download/Mishal_Al_Otaibi/000003.mp3"
          },
          {
            id: "l-mishal-40",
            title: "مناهل",
            duration: "1:25:38",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_4739/Mnahel09-06-2014.mp3"
          },
          {
            id: "l-mishal-41",
            title: "دموع الحب - ملتقى شباب الخبر",
            duration: "1:00:22",
            audioUrl: "https://archive.org/download/www.forsanhaq.com_6681/Moltqa09-02-2015_new.mp3"
          },
          {
            id: "l-mishal-42",
            title: "قصة مبكية ومحزنة أم خالـد",
            duration: "13:46",
            audioUrl: "https://archive.org/download/mohadrat_moasera/2.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-rashid-alzahrani",
    name: "الشيخ الدكتور راشد الزهراني",
    description: "عالم وداعية إسلامي سعودي.",
    likes: 12500,
    series: [
      {
        id: "series-scholar-rashid-alzahrani-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-rashid-alzahrani-gen1-0",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen1-1",
            title: "كيف نجدد إيماننا؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen1-2",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen1-3",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen1-4",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          }
        ]
      },
      {
        id: "series-scholar-rashid-alzahrani-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-rashid-alzahrani-gen2-0",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen2-1",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen2-2",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen2-3",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-rashid-alzahrani-gen2-4",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-abdulrahman-abdulkhaliq",
    name: "الشيخ عبد الرحمن عبد الخالق",
    description: "عالم وداعية إسلامي.",
    likes: 9200,
    series: [
      {
        id: "series-scholar-abdulrahman-abdulkhaliq-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen1-0",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen1-1",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen1-2",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "35:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen1-3",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen1-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      },
      {
        id: "series-scholar-abdulrahman-abdulkhaliq-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen2-0",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen2-1",
            title: "مواقف من حياة الصحابة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen2-2",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen2-3",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-abdulrahman-abdulkhaliq-gen2-4",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mohammed-ratib-alnabulsi",
    name: "الشيخ الدكتور محمد راتب النابلسي",
    description: "داعية إسلامي سوري معاصر.",
    likes: 15600,
    series: [
      {
        id: "series-scholar-mohammed-ratib-alnabulsi-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen1-0",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen1-1",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen1-2",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen1-3",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen1-4",
            title: "طريق الهداية والاستقامة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mohammed-ratib-alnabulsi-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen2-0",
            title: "الرضا بقضاء الله وقدره",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen2-1",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen2-2",
            title: "الصلاة عماد الدين وقرة العيون",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/5.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen2-3",
            title: "كيف نجدد إيماننا؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/01.mp3"
          },
          {
            id: "l-scholar-mohammed-ratib-alnabulsi-gen2-4",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-ibrahim-alruhaili",
    name: "الشيخ الدكتور إبراهيم الرحيلي",
    description: "عالم وداعية إسلامي.",
    likes: 11000,
    series: [
      {
        id: "series-scholar-ibrahim-alruhaili-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-ibrahim-alruhaili-gen1-0",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen1-1",
            title: "الرضا بقضاء الله وقدره",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen1-2",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "35:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen1-3",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen1-4",
            title: "شرح أسماء الله الحسنى - مختارات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D9%81%D8%AA%D9%86%D8%A9.mp3"
          }
        ]
      },
      {
        id: "series-scholar-ibrahim-alruhaili-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-ibrahim-alruhaili-gen2-0",
            title: "الدار الآخرة والاستعداد للرحيل",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Ali_Alqarni_3rf_al3abeer/Ali_Alqarni_3rf_al3abeer.mp3"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen2-1",
            title: "فضل الصدقة والإنفاق في سبيل الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/amrad_elqloob/02.mp3"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen2-2",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen2-3",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-ibrahim-alruhaili-gen2-4",
            title: "محاسبة النفس قبل الحساب",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-anwar-massad",
    name: "الشيخ أنور مسعد",
    description: "عالم وداعية إسلامي.",
    likes: 8500,
    series: [
      {
        id: "series-scholar-anwar-massad-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-anwar-massad-gen1-0",
            title: "التوبة والرجوع إلى الله",
            duration: "35:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen1-1",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen1-2",
            title: "قصص وعبر من سيرة الصالحين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%A5%D9%86%D8%A7%D8%A8%D8%A9-%D8%A5%D9%84%D9%89-%D8%A7%D9%84%D9%84%D9%87-%D8%AA%D8%B9%D8%A7%D9%84%D9%89.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen1-3",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen1-4",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          }
        ]
      },
      {
        id: "series-scholar-anwar-massad-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-anwar-massad-gen2-0",
            title: "الشباب والفتن - كيف نعتصم بالله؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/4.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen2-1",
            title: "طريق الهداية والاستقامة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/01.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen2-2",
            title: "محبة النبي ﷺ واتباع سنته",
            duration: "40:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-scholar-anwar-massad-gen2-3",
            title: "مواقف من حياة الصحابة",
            duration: "40:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-anwar-massad-gen2-4",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-mohamed-elsawy",
    name: "الشيخ محمد الصاوي",
    description: "داعية مصري متميز بمواعظه المؤثرة ورقائقه الإيمانية العميقة التي تلامس القلوب وتدعو للتوبة والإنابة.",
    likes: 19850,
    series: [
      {
        id: "series-scholar-mohamed-elsawy-single1",
        title: "محاضرات ودروس متفرقة",
        description: "مجموعة من المحاضرات المستقلة للشيخ.",
        lectures: [
          {
            id: "l-scholar-mohamed-elsawy-gen1-0",
            title: "محاسبة النفس قبل الحساب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mp-3-128-k_202112/01.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen1-1",
            title: "مواقف من حياة الصحابة",
            duration: "35:00",
            audioUrl: "https://archive.org/download/Doros-AbdulRahman-alHashemi/02.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen1-2",
            title: "الأسرة المسلمة في مواجهة التحديات",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/shwate3%20al%20ta2ebeen.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen1-3",
            title: "تزكية النفوس وتطهير القلوب",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/qess_ln_ansaha.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen1-4",
            title: "أخلاق المسلم في التعامل مع الآخرين",
            duration: "35:00",
            audioUrl: "https://archive.org/download/mohadrat_moasera/3.mp3"
          }
        ]
      },
      {
        id: "series-scholar-mohamed-elsawy-single2",
        title: "روائع الخطب والمواعظ",
        description: "مجموعة من المواعظ والخطب المنفصلة.",
        lectures: [
          {
            id: "l-scholar-mohamed-elsawy-gen2-0",
            title: "همسات للشباب - وقفات إيمانية",
            duration: "40:00",
            audioUrl: "https://archive.org/download/gazah_454/gazah_454.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen2-1",
            title: "فضل الذكر والدعاء في حياة المسلم",
            duration: "40:00",
            audioUrl: "https://archive.org/download/mohadarat-montaqat/ta3nt_segara.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen2-2",
            title: "تأملات قرآنية - آيات وعظات",
            duration: "40:00",
            audioUrl: "https://archive.org/download/14MSawyGhorba/14_MSawy_Ghorba.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen2-3",
            title: "التوبة والرجوع إلى الله",
            duration: "40:00",
            audioUrl: "https://archive.org/download/karni-ziriab/karni-ziriab.mp3"
          },
          {
            id: "l-scholar-mohamed-elsawy-gen2-4",
            title: "كيف نربي أبناءنا على الإيمان؟",
            duration: "40:00",
            audioUrl: "https://archive.org/download/way_137/%D8%A7%D9%84%D8%B8%D9%84%D9%85-%D9%88%D8%A3%D8%AB%D8%B1%D9%87-%D9%81%D9%8A-%D9%87%D9%84%D8%A7%D9%83-%D8%A7%D9%84%D8%A3%D9%85%D9%85.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "scholar-suwaidan",
    name: "الدكتور طارق السويدان",
    description: "مفكر وداعية إسلامي، اشتهر ببرامجه الإبداعية ومحاضراته في الإدارة والقيادة والتطوير الذاتي.",
    likes: 8520,
    series: [
      {
        id: "series-suwaidan-general",
        title: "محاضرات في القيادة وتطوير الذات",
        description: "مجموعة محاضرات مستقلة ومتفرقة في مجالات القيادة والتطوير الذاتي.",
        lectures: [
          {
            id: "l-suwaidan-leader-concept",
            title: "المفهوم الصحيح للقائد",
            duration: "31:41",
            audioUrl: "https://archive.org/download/02.-._202306/01.%20%D8%A7%D9%84%D9%85%D9%81%D9%87%D9%88%D9%85%20%D8%A7%D9%84%D8%B5%D8%AD%D9%8A%D8%AD%20%D9%84%D9%84%D9%82%D8%A7%D8%A6%D8%AF%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-leader-qualities",
            title: "صفات القائد الفعّال",
            duration: "30:22",
            audioUrl: "https://archive.org/download/02.-._202306/07.%20%D8%B5%D9%81%D8%A7%D8%AA%20%D8%A7%D9%84%D9%82%D8%A7%D8%A6%D8%AF%20%D8%A7%D9%84%D9%81%D8%B9%D9%91%D8%A7%D9%84%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-leader-vision",
            title: "أهمية الرؤية عند القائد",
            duration: "29:15",
            audioUrl: "https://archive.org/download/02.-._202306/13.%20%D8%A3%D9%87%D9%85%D9%8A%D8%A9%20%D8%A7%D9%84%D8%B1%D8%A4%D9%8A%D8%A9%20%D8%B9%D9%86%D8%AF%20%D8%A7%D9%84%D9%82%D8%A7%D8%A6%D8%AF%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-making-leaders",
            title: "كيف يُصنع القادة ؟",
            duration: "25:40",
            audioUrl: "https://archive.org/download/02.-._202306/20.%20%D9%83%D9%8A%D9%81%20%D9%8A%D9%8F%D8%B5%D9%86%D8%B9%20%D8%A7%D9%84%D9%82%D8%A7%D8%AF%D8%A9%20%D8%9F%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-leader-influence",
            title: "كيف أكون صاحب تأثير في الناس ؟",
            duration: "28:10",
            audioUrl: "https://archive.org/download/02.-._202306/02.%20%D9%83%D9%8A%D9%81%20%D8%A3%D9%83%D9%88%D9%86%20%D8%B5%D8%A7%D8%AD%D8%A8%20%D8%AA%D8%A3%D8%AB%D9%8A%D8%B1%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%86%D8%A7%D8%B3%20%D8%9F%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-leader-patterns",
            title: "الأنماط والسلوكيات القيادية",
            duration: "27:45",
            audioUrl: "https://archive.org/download/02.-._202306/05.%20%D8%A7%D9%84%D8%A3%D9%86%D9%85%D8%A7%D8%B7%20%D9%88%D8%A7%D9%84%D8%B3%D9%84%D9%88%D9%83%D9%8A%D8%A7%D8%AA%20%D8%A7%D9%84%D9%82%D9%8A%D8%A7%D8%AF%D9%8A%D8%A9%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-leader-test",
            title: "كيف تعرف إن كنت قائداً فعّالاً أم العكس",
            duration: "26:30",
            audioUrl: "https://archive.org/download/02.-._202306/08.%20%D9%83%D9%8A%D9%81%20%D8%AA%D8%B9%D8%B1%D9%81%20%D8%A5%D9%86%20%D9%83%D9%86%D8%AA%20%D9%82%D8%A7%D8%A6%D8%AF%D8%A7%D9%8B%20%D9%81%D8%B9%D9%91%D8%A7%D9%84%D8%A7%D9%8B%20%D8%A3%D9%85%20%D8%A7%D9%84%D8%B9%D9%83%D8%B3%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          },
          {
            id: "l-suwaidan-leader-21century",
            title: "مفهوم القيادة في القرن 21",
            duration: "29:55",
            audioUrl: "https://archive.org/download/02.-._202306/10.%20%D9%85%D9%81%D9%87%D9%88%D9%85%20%D8%A7%D9%84%D9%82%D9%8A%D8%A7%D8%AF%D8%A9%20%D9%81%D9%8A%20%D8%A7%D9%84%D9%82%D8%B1%D9%86%2021%20%20%D8%AF.%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86.mp3"
          }
        ]
      },
      {
        id: "series-suwaidan-general-misc",
        title: "محاضرات عامة متنوعة",
        description: "مجموعة محاضرات عامة في شتى مجالات الفكر والثقافة والحوار.",
        lectures: [
          {
            id: "l-suwaidan-dialogue",
            title: "الحوار وتطوير الفكر",
            duration: "45:00",
            audioUrl: "https://archive.org/download/sala_368/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%AD%D9%88%D8%A7%D8%B1.mp4"
          },
          {
            id: "l-suwaidan-reading",
            title: "أهمية القراءة وبناء العقل",
            duration: "40:30",
            audioUrl: "https://archive.org/download/sala_653/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A7%D8%A1%D8%A9.mp4"
          },
          {
            id: "l-suwaidan-quran",
            title: "القرآن الكريم وحياتنا",
            duration: "50:20",
            audioUrl: "https://archive.org/download/sala_899/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D9%82%D8%B1%D8%A2%D9%86.mp4"
          },
          {
            id: "l-suwaidan-sunnah",
            title: "السنة النبوية والتغيير",
            duration: "48:15",
            audioUrl: "https://archive.org/download/sala_678/%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B7%D8%A7%D8%B1%D9%82%20%D8%A7%D9%84%D8%B3%D9%88%D9%8A%D8%AF%D8%A7%D9%86%20%D8%A7%D9%84%D8%B3%D9%86%D8%A9.mp4"
          }
        ]
      }
    ]
  }
];
