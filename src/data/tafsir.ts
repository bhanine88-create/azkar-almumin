import { PlayCircle } from "lucide-react";

export interface TafsirTrack {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
}

export interface SurahTafsir {
  id: string;
  surahName: string;
  description: string;
  tracks: TafsirTrack[];
}

export interface TafsirScholar {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  likes: number;
  surahs: SurahTafsir[];
}

import { SURAH_NAMES as surahNames } from '../utils/quranUtils';

const MUKHTASAR_DURATIONS = ["3:14","4:24:19","2:35:43","2:41:23","2:00:03","2:17:39","2:34:15","58:11","1:52:07","1:17:12","1:21:34","1:14:45","40:15","39:05","30:16","1:22:27","1:08:11","1:08:34","42:41","57:03","54:59","55:12","48:58","57:43","41:02","1:03:35","49:36","1:00:47","46:17","37:19","22:47","16:46","58:60","38:34","34:21","37:05","47:52","35:15","52:12","53:17","36:29","37:42","38:43","17:48","22:25","27:35","25:33","25:14","16:28","17:24","17:52","16:07","17:30","18:02","20:12","20:50","25:48","21:02","20:45","15:33","10:04","8:22","8:31","11:39","12:56","11:41","14:35","14:35","12:53","11:28","10:42","12:27","8:59","13:23","8:42","12:22","11:07","10:11","9:59","7:50","5:55","4:20","8:49","5:32","5:53","3:59","4:35","5:53","7:56","4:22","3:47","4:32","2:37","1:53","2:39","4:36","1:56","4:30","2:13","2:42","2:26","2:07","1:12","2:12","1:36","1:26","1:43","1:15","1:34","1:29","1:40","1:15","1:26","1:37"];

const asmariHakamSurahs: SurahTafsir[] = surahNames.map((name, i) => {
  const numStr = (i + 1).toString().padStart(3, '0');
  return {
    id: `asmari-hakam-surah-${i + 1}`,
    surahName: `سورة ${name}`,
    description: `تفسير سورة ${name} من كتاب المختصر في التفسير`,
    tracks: [
      {
        id: `asmari-hakam-track-${i + 1}`,
        title: `تفسير سورة ${name} كاملاً`,
        duration: MUKHTASAR_DURATIONS[i] || '5:00',
        audioUrl: `https://archive.org/download/Mukhtasar_fi_Tafsir/${numStr}.mp3`
      }
    ]
  };
});

export const TAFSIR_SCHOLARS: TafsirScholar[] = [
  {
    id: "tafsir-saadi",
    name: "تيسير الكريم الرحمن (تفسير السعدي)",
    description: "قراءة صوتية لتفسير العلامة عبد الرحمن السعدي",
    likes: 38000,
    surahs: [
      {
        id: "saadi-fatiha",
        surahName: "سورة الفاتحة",
        description: "التفسير الصوتي لسورة الفاتحة",
        tracks: [
          {
            id: "saadi-f1",
            title: "تفسير سورة الفاتحة كاملاً",
            duration: "07:42",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/001.mp3"
          }
        ]
      },
      {
        id: "saadi-baqarah",
        surahName: "سورة البقرة",
        description: "التفسير الصوتي لسورة البقرة",
        tracks: [
          {
            id: "saadi-s2",
            title: "تفسير سورة البقرة كاملاً",
            duration: "08:03:55",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/002.mp3"
          }
        ]
      },
      {
        id: "saadi-imran",
        surahName: "سورة آل عمران",
        description: "التفسير الصوتي لسورة آل عمران",
        tracks: [
          {
            id: "saadi-s3",
            title: "تفسير سورة آل عمران كاملاً",
            duration: "04:15:42",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/003.mp3"
          }
        ]
      },
      {
        id: "saadi-nisa",
        surahName: "سورة النساء",
        description: "التفسير الصوتي لسورة النساء",
        tracks: [
          {
            id: "saadi-s4",
            title: "تفسير سورة النساء كاملاً",
            duration: "05:17:24",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/004.mp3"
          }
        ]
      },
      {
        id: "saadi-maidah",
        surahName: "سورة المائدة",
        description: "التفسير الصوتي لسورة المائدة",
        tracks: [
          {
            id: "saadi-s5",
            title: "تفسير سورة المائدة كاملاً",
            duration: "03:19:55",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/005.mp3"
          }
        ]
      },
      {
        id: "saadi-anam",
        surahName: "سورة الأنعام",
        description: "التفسير الصوتي لسورة الأنعام",
        tracks: [
          {
            id: "saadi-s6",
            title: "تفسير سورة الأنعام كاملاً",
            duration: "03:23:32",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/006.mp3"
          }
        ]
      },
      {
        id: "saadi-araf",
        surahName: "سورة الأعراف",
        description: "التفسير الصوتي لسورة الأعراف",
        tracks: [
          {
            id: "saadi-s7",
            title: "تفسير سورة الأعراف كاملاً",
            duration: "03:30:18",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/007.mp3"
          }
        ]
      },
      {
        id: "saadi-anfal",
        surahName: "سورة الأنفال",
        description: "التفسير الصوتي لسورة الأنفال",
        tracks: [
          {
            id: "saadi-s8",
            title: "تفسير سورة الأنفال كاملاً",
            duration: "01:24:18",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/008.mp3"
          }
        ]
      },
      {
        id: "saadi-tawbah",
        surahName: "سورة التوبة",
        description: "التفسير الصوتي لسورة التوبة",
        tracks: [
          {
            id: "saadi-s9",
            title: "تفسير سورة التوبة كاملاً",
            duration: "02:55:12",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/009.mp3"
          }
        ]
      },
      {
        id: "saadi-yunus",
        surahName: "سورة يونس",
        description: "التفسير الصوتي لسورة يونس",
        tracks: [
          {
            id: "saadi-s10",
            title: "تفسير سورة يونس كاملاً",
            duration: "01:55:34",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/010.mp3"
          }
        ]
      },
      {
        id: "saadi-hud",
        surahName: "سورة هود",
        description: "التفسير الصوتي لسورة هود",
        tracks: [
          {
            id: "saadi-s11",
            title: "تفسير سورة هود كاملاً",
            duration: "01:43:34",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/011.mp3"
          }
        ]
      },
      {
        id: "saadi-yusuf",
        surahName: "سورة يوسف",
        description: "التفسير الصوتي لسورة يوسف",
        tracks: [
          {
            id: "saadi-s12",
            title: "تفسير سورة يوسف كاملاً",
            duration: "02:00:18",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/012.mp3"
          }
        ]
      },
      {
        id: "saadi-rad",
        surahName: "سورة الرعد",
        description: "التفسير الصوتي لسورة الرعد",
        tracks: [
          {
            id: "saadi-s13",
            title: "تفسير سورة الرعد كاملاً",
            duration: "01:02:19",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/013.mp3"
          }
        ]
      },
      {
        id: "saadi-ibrahim",
        surahName: "سورة إبراهيم",
        description: "التفسير الصوتي لسورة إبراهيم",
        tracks: [
          {
            id: "saadi-s14",
            title: "تفسير سورة إبراهيم كاملاً",
            duration: "00:56:01",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/014.mp3"
          }
        ]
      },
      {
        id: "saadi-hijr",
        surahName: "سورة الحجر",
        description: "التفسير الصوتي لسورة الحجر",
        tracks: [
          {
            id: "saadi-s15",
            title: "تفسير سورة الحجر كاملاً",
            duration: "00:41:08",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/015.mp3"
          }
        ]
      },
      {
        id: "saadi-nahl",
        surahName: "سورة النحل",
        description: "التفسير الصوتي لسورة النحل",
        tracks: [
          {
            id: "saadi-s16",
            title: "تفسير سورة النحل كاملاً",
            duration: "01:49:00",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/016.mp3"
          }
        ]
      },
      {
        id: "saadi-isra",
        surahName: "سورة الإسراء",
        description: "التفسير الصوتي لسورة الإسراء",
        tracks: [
          {
            id: "saadi-s17",
            title: "تفسير سورة الإسراء كاملاً",
            duration: "01:44:38",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/017.mp3"
          }
        ]
      },
      {
        id: "saadi-kahf",
        surahName: "سورة الكهف",
        description: "تفسير سورة الكهف",
        tracks: [
          {
            id: "saadi-k1",
            title: "تفسير سورة الكهف كاملاً",
            duration: "1:58:31",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/018.mp3"
          }
        ]
      },
      {
        id: "saadi-maryam",
        surahName: "سورة مريم",
        description: "التفسير الصوتي لسورة مريم",
        tracks: [
          {
            id: "saadi-s19",
            title: "تفسير سورة مريم كاملاً",
            duration: "01:24:27",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/019.mp3"
          }
        ]
      },
      {
        id: "saadi-taha",
        surahName: "سورة طه",
        description: "التفسير الصوتي لسورة طه",
        tracks: [
          {
            id: "saadi-s20",
            title: "تفسير سورة طه كاملاً",
            duration: "01:46:04",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/020.mp3"
          }
        ]
      },
      {
        id: "saadi-anbiya",
        surahName: "سورة الأنبياء",
        description: "التفسير الصوتي لسورة الأنبياء",
        tracks: [
          {
            id: "saadi-s21",
            title: "تفسير سورة الأنبياء كاملاً",
            duration: "01:38:23",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/021.mp3"
          }
        ]
      },
      {
        id: "saadi-hajj",
        surahName: "سورة الحج",
        description: "التفسير الصوتي لسورة الحج",
        tracks: [
          {
            id: "saadi-s22",
            title: "تفسير سورة الحج كاملاً",
            duration: "01:31:30",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/022.mp3"
          }
        ]
      },
      {
        id: "saadi-muminun",
        surahName: "سورة المؤمنون",
        description: "التفسير الصوتي لسورة المؤمنون",
        tracks: [
          {
            id: "saadi-s23",
            title: "تفسير سورة المؤمنون كاملاً",
            duration: "01:28:55",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/023.mp3"
          }
        ]
      },
      {
        id: "saadi-nur",
        surahName: "سورة النور",
        description: "التفسير الصوتي لسورة النور",
        tracks: [
          {
            id: "saadi-s24",
            title: "تفسير سورة النور كاملاً",
            duration: "01:48:41",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/024.mp3"
          }
        ]
      },
      {
        id: "saadi-furqan",
        surahName: "سورة الفرقان",
        description: "التفسير الصوتي لسورة الفرقان",
        tracks: [
          {
            id: "saadi-s25",
            title: "تفسير سورة الفرقان كاملاً",
            duration: "01:22:51",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/025.mp3"
          }
        ]
      },
      {
        id: "saadi-shuara",
        surahName: "سورة الشعراء",
        description: "التفسير الصوتي لسورة الشعراء",
        tracks: [
          {
            id: "saadi-s26",
            title: "تفسير سورة الشعراء كاملاً",
            duration: "01:26:02",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/026.mp3"
          }
        ]
      },
      {
        id: "saadi-naml",
        surahName: "سورة النمل",
        description: "التفسير الصوتي لسورة النمل",
        tracks: [
          {
            id: "saadi-s27",
            title: "تفسير سورة النمل كاملاً",
            duration: "01:18:45",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/027.mp3"
          }
        ]
      },
      {
        id: "saadi-qasas",
        surahName: "سورة القصص",
        description: "التفسير الصوتي لسورة القصص",
        tracks: [
          {
            id: "saadi-s28",
            title: "تفسير سورة القصص كاملاً",
            duration: "01:40:17",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/028.mp3"
          }
        ]
      },
      {
        id: "saadi-ankabut",
        surahName: "سورة العنكبوت",
        description: "التفسير الصوتي لسورة العنكبوت",
        tracks: [
          {
            id: "saadi-s29",
            title: "تفسير سورة العنكبوت كاملاً",
            duration: "01:05:03",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/029.mp3"
          }
        ]
      },
      {
        id: "saadi-rum",
        surahName: "سورة الروم",
        description: "التفسير الصوتي لسورة الروم",
        tracks: [
          {
            id: "saadi-s30",
            title: "تفسير سورة الروم كاملاً",
            duration: "00:59:04",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/030.mp3"
          }
        ]
      },
      {
        id: "saadi-luqman",
        surahName: "سورة لقمان",
        description: "التفسير الصوتي لسورة لقمان",
        tracks: [
          {
            id: "saadi-s31",
            title: "تفسير سورة لقمان كاملاً",
            duration: "00:44:41",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/031.mp3"
          }
        ]
      },
      {
        id: "saadi-sajdah",
        surahName: "سورة السجدة",
        description: "التفسير الصوتي لسورة السجدة",
        tracks: [
          {
            id: "saadi-s32",
            title: "تفسير سورة السجدة كاملاً",
            duration: "00:27:03",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/032.mp3"
          }
        ]
      },
      {
        id: "saadi-ahzab",
        surahName: "سورة الأحزاب",
        description: "التفسير الصوتي لسورة الأحزاب",
        tracks: [
          {
            id: "saadi-s33",
            title: "تفسير سورة الأحزاب كاملاً",
            duration: "01:42:56",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/033.mp3"
          }
        ]
      },
      {
        id: "saadi-saba",
        surahName: "سورة سبأ",
        description: "التفسير الصوتي لسورة سبأ",
        tracks: [
          {
            id: "saadi-s34",
            title: "تفسير سورة سبأ كاملاً",
            duration: "01:07:38",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/034.mp3"
          }
        ]
      },
      {
        id: "saadi-fatir",
        surahName: "سورة فاطر",
        description: "التفسير الصوتي لسورة فاطر",
        tracks: [
          {
            id: "saadi-s35",
            title: "تفسير سورة فاطر كاملاً",
            duration: "00:58:05",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/035.mp3"
          }
        ]
      },
      {
        id: "saadi-yaseen",
        surahName: "سورة يس",
        description: "التفسير الصوتي لسورة يس",
        tracks: [
          {
            id: "saadi-s36",
            title: "تفسير سورة يس كاملاً",
            duration: "00:51:54",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/036.mp3"
          }
        ]
      },
      {
        id: "saadi-saffat",
        surahName: "سورة الصافات",
        description: "التفسير الصوتي لسورة الصافات",
        tracks: [
          {
            id: "saadi-s37",
            title: "تفسير سورة الصافات كاملاً",
            duration: "01:00:23",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/037.mp3"
          }
        ]
      },
      {
        id: "saadi-sad",
        surahName: "سورة ص",
        description: "التفسير الصوتي لسورة ص",
        tracks: [
          {
            id: "saadi-s38",
            title: "تفسير سورة ص كاملاً",
            duration: "00:54:49",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/038.mp3"
          }
        ]
      },
      {
        id: "saadi-zumar",
        surahName: "سورة الزمر",
        description: "التفسير الصوتي لسورة الزمر",
        tracks: [
          {
            id: "saadi-s39",
            title: "تفسير سورة الزمر كاملاً",
            duration: "01:28:47",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/039.mp3"
          }
        ]
      },
      {
        id: "saadi-ghafir",
        surahName: "سورة غافر",
        description: "التفسير الصوتي لسورة غافر",
        tracks: [
          {
            id: "saadi-s40",
            title: "تفسير سورة غافر كاملاً",
            duration: "01:28:37",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/040.mp3"
          }
        ]
      },
      {
        id: "saadi-fussilat",
        surahName: "سورة فصلت",
        description: "التفسير الصوتي لسورة فصلت",
        tracks: [
          {
            id: "saadi-s41",
            title: "تفسير سورة فصلت كاملاً",
            duration: "00:58:07",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/041.mp3"
          }
        ]
      },
      {
        id: "saadi-shura",
        surahName: "سورة الشورى",
        description: "التفسير الصوتي لسورة الشورى",
        tracks: [
          {
            id: "saadi-s42",
            title: "تفسير سورة الشورى كاملاً",
            duration: "01:07:49",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/042.mp3"
          }
        ]
      },
      {
        id: "saadi-zukhruf",
        surahName: "سورة الزخرف",
        description: "التفسير الصوتي لسورة الزخرف",
        tracks: [
          {
            id: "saadi-s43",
            title: "تفسير سورة الزخرف كاملاً",
            duration: "00:55:27",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/043.mp3"
          }
        ]
      },
      {
        id: "saadi-dukhan",
        surahName: "سورة الدخان",
        description: "التفسير الصوتي لسورة الدخان",
        tracks: [
          {
            id: "saadi-s44",
            title: "تفسير سورة الدخان كاملاً",
            duration: "00:23:59",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/044.mp3"
          }
        ]
      },
      {
        id: "saadi-jathiya",
        surahName: "سورة الجاثية",
        description: "التفسير الصوتي لسورة الجاثية",
        tracks: [
          {
            id: "saadi-s45",
            title: "تفسير سورة الجاثية كاملاً",
            duration: "00:26:43",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/045.mp3"
          }
        ]
      },
      {
        id: "saadi-ahqaf",
        surahName: "سورة الأحقاف",
        description: "التفسير الصوتي لسورة الأحقاف",
        tracks: [
          {
            id: "saadi-s46",
            title: "تفسير سورة الأحقاف كاملاً",
            duration: "00:37:57",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/046.mp3"
          }
        ]
      },
      {
        id: "saadi-muhammad",
        surahName: "سورة محمد",
        description: "التفسير الصوتي لسورة محمد",
        tracks: [
          {
            id: "saadi-s47",
            title: "تفسير سورة محمد كاملاً",
            duration: "00:42:30",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/047.mp3"
          }
        ]
      },
      {
        id: "saadi-fath",
        surahName: "سورة الفتح",
        description: "التفسير الصوتي لسورة الفتح",
        tracks: [
          {
            id: "saadi-s48",
            title: "تفسير سورة الفتح كاملاً",
            duration: "00:34:16",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/048.mp3"
          }
        ]
      },
      {
        id: "saadi-hujurat",
        surahName: "سورة الحجرات",
        description: "التفسير الصوتي لسورة الحجرات",
        tracks: [
          {
            id: "saadi-s49",
            title: "تفسير سورة الحجرات كاملاً",
            duration: "00:26:58",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/049.mp3"
          }
        ]
      },
      {
        id: "saadi-qaf",
        surahName: "سورة ق",
        description: "التفسير الصوتي لسورة ق",
        tracks: [
          {
            id: "saadi-s50",
            title: "تفسير سورة ق كاملاً",
            duration: "00:29:46",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/050.mp3"
          }
        ]
      },
      {
        id: "saadi-dhariyat",
        surahName: "سورة الذاريات",
        description: "التفسير الصوتي لسورة الذاريات",
        tracks: [
          {
            id: "saadi-s51",
            title: "تفسير سورة الذاريات كاملاً",
            duration: "00:31:54",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/051.mp3"
          }
        ]
      },
      {
        id: "saadi-tur",
        surahName: "سورة الطور",
        description: "التفسير الصوتي لسورة الطور",
        tracks: [
          {
            id: "saadi-s52",
            title: "تفسير سورة الطور كاملاً",
            duration: "00:28:00",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/052.mp3"
          }
        ]
      },
      {
        id: "saadi-najm",
        surahName: "سورة النجم",
        description: "التفسير الصوتي لسورة النجم",
        tracks: [
          {
            id: "saadi-s53",
            title: "تفسير سورة النجم كاملاً",
            duration: "00:32:04",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/053.mp3"
          }
        ]
      },
      {
        id: "saadi-qamar",
        surahName: "سورة القمر",
        description: "التفسير الصوتي لسورة القمر",
        tracks: [
          {
            id: "saadi-s54",
            title: "تفسير سورة القمر كاملاً",
            duration: "00:27:13",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/054.mp3"
          }
        ]
      },
      {
        id: "saadi-rahman",
        surahName: "سورة الرحمن",
        description: "التفسير الصوتي لسورة الرحمن",
        tracks: [
          {
            id: "saadi-s55",
            title: "تفسير سورة الرحمن كاملاً",
            duration: "00:25:35",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/055.mp3"
          }
        ]
      },
      {
        id: "saadi-waqia",
        surahName: "سورة الواقعة",
        description: "التفسير الصوتي لسورة الواقعة",
        tracks: [
          {
            id: "saadi-s56",
            title: "تفسير سورة الواقعة كاملاً",
            duration: "00:31:33",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/056.mp3"
          }
        ]
      },
      {
        id: "saadi-hadid",
        surahName: "سورة الحديد",
        description: "التفسير الصوتي لسورة الحديد",
        tracks: [
          {
            id: "saadi-s57",
            title: "تفسير سورة الحديد كاملاً",
            duration: "00:38:15",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/057.mp3"
          }
        ]
      },
      {
        id: "saadi-mujadila",
        surahName: "سورة المجادلة",
        description: "التفسير الصوتي لسورة المجادلة",
        tracks: [
          {
            id: "saadi-s58",
            title: "تفسير سورة المجادلة كاملاً",
            duration: "00:26:51",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/058.mp3"
          }
        ]
      },
      {
        id: "saadi-hashr",
        surahName: "سورة الحشر",
        description: "التفسير الصوتي لسورة الحشر",
        tracks: [
          {
            id: "saadi-s59",
            title: "تفسير سورة الحشر كاملاً",
            duration: "00:38:07",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/059.mp3"
          }
        ]
      },
      {
        id: "saadi-mumtahanah",
        surahName: "سورة الممتحنة",
        description: "التفسير الصوتي لسورة الممتحنة",
        tracks: [
          {
            id: "saadi-s60",
            title: "تفسير سورة الممتحنة كاملاً",
            duration: "00:25:06",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/060.mp3"
          }
        ]
      },
      {
        id: "saadi-saff",
        surahName: "سورة الصف",
        description: "التفسير الصوتي لسورة الصف",
        tracks: [
          {
            id: "saadi-s61",
            title: "تفسير سورة الصف كاملاً",
            duration: "00:17:06",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/061.mp3"
          }
        ]
      },
      {
        id: "saadi-jumuah",
        surahName: "سورة الجمعة",
        description: "التفسير الصوتي لسورة الجمعة",
        tracks: [
          {
            id: "saadi-s62",
            title: "تفسير سورة الجمعة كاملاً",
            duration: "00:11:37",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/062.mp3"
          }
        ]
      },
      {
        id: "saadi-munafiqun",
        surahName: "سورة المنافقون",
        description: "التفسير الصوتي لسورة المنافقون",
        tracks: [
          {
            id: "saadi-s63",
            title: "تفسير سورة المنافقون كاملاً",
            duration: "00:12:23",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/063.mp3"
          }
        ]
      },
      {
        id: "saadi-taghabun",
        surahName: "سورة التغابن",
        description: "التفسير الصوتي لسورة التغابن",
        tracks: [
          {
            id: "saadi-s64",
            title: "تفسير سورة التغابن كاملاً",
            duration: "00:20:40",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/064.mp3"
          }
        ]
      },
      {
        id: "saadi-talaq",
        surahName: "سورة الطلاق",
        description: "التفسير الصوتي لسورة الطلاق",
        tracks: [
          {
            id: "saadi-s65",
            title: "تفسير سورة الطلاق كاملاً",
            duration: "00:19:07",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/065.mp3"
          }
        ]
      },
      {
        id: "saadi-tahrim",
        surahName: "سورة التحريم",
        description: "التفسير الصوتي لسورة التحريم",
        tracks: [
          {
            id: "saadi-s66",
            title: "تفسير سورة التحريم كاملاً",
            duration: "00:18:23",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/066.mp3"
          }
        ]
      },
      {
        id: "saadi-mulk",
        surahName: "سورة الملك",
        description: "التفسير الصوتي لسورة الملك",
        tracks: [
          {
            id: "saadi-s67",
            title: "تفسير سورة الملك كاملاً",
            duration: "00:21:34",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/067.mp3"
          }
        ]
      },
      {
        id: "saadi-qalam",
        surahName: "سورة القلم",
        description: "التفسير الصوتي لسورة القلم",
        tracks: [
          {
            id: "saadi-s68",
            title: "تفسير سورة القلم كاملاً",
            duration: "00:21:18",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/068.mp3"
          }
        ]
      },
      {
        id: "saadi-haaqqa",
        surahName: "سورة الحاقة",
        description: "التفسير الصوتي لسورة الحاقة",
        tracks: [
          {
            id: "saadi-s69",
            title: "تفسير سورة الحاقة كاملاً",
            duration: "00:18:44",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/069.mp3"
          }
        ]
      },
      {
        id: "saadi-maarij",
        surahName: "سورة المعارج",
        description: "التفسير الصوتي لسورة المعارج",
        tracks: [
          {
            id: "saadi-s70",
            title: "تفسير سورة المعارج كاملاً",
            duration: "00:17:16",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/070.mp3"
          }
        ]
      },
      {
        id: "saadi-nuh",
        surahName: "سورة نوح",
        description: "التفسير الصوتي لسورة نوح",
        tracks: [
          {
            id: "saadi-s71",
            title: "تفسير سورة نوح كاملاً",
            duration: "00:11:06",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/071.mp3"
          }
        ]
      },
      {
        id: "saadi-jinn",
        surahName: "سورة الجن",
        description: "التفسير الصوتي لسورة الجن",
        tracks: [
          {
            id: "saadi-s72",
            title: "تفسير سورة الجن كاملاً",
            duration: "00:15:15",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/072.mp3"
          }
        ]
      },
      {
        id: "saadi-muzzammil",
        surahName: "سورة المزمل",
        description: "التفسير الصوتي لسورة المزمل",
        tracks: [
          {
            id: "saadi-s73",
            title: "تفسير سورة المزمل كاملاً",
            duration: "00:14:45",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/073.mp3"
          }
        ]
      },
      {
        id: "saadi-muddaththir",
        surahName: "سورة المدثر",
        description: "التفسير الصوتي لسورة المدثر",
        tracks: [
          {
            id: "saadi-s74",
            title: "تفسير سورة المدثر كاملاً",
            duration: "00:17:55",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/074.mp3"
          }
        ]
      },
      {
        id: "saadi-qiyamah",
        surahName: "سورة القيامة",
        description: "التفسير الصوتي لسورة القيامة",
        tracks: [
          {
            id: "saadi-s75",
            title: "تفسير سورة القيامة كاملاً",
            duration: "00:12:35",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/075.mp3"
          }
        ]
      },
      {
        id: "saadi-insan",
        surahName: "سورة الإنسان",
        description: "التفسير الصوتي لسورة الإنسان",
        tracks: [
          {
            id: "saadi-s76",
            title: "تفسير سورة الإنسان كاملاً",
            duration: "00:18:03",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/076.mp3"
          }
        ]
      },
      {
        id: "saadi-mursalat",
        surahName: "سورة المرسلات",
        description: "التفسير الصوتي لسورة المرسلات",
        tracks: [
          {
            id: "saadi-s77",
            title: "تفسير سورة المرسلات كاملاً",
            duration: "00:12:06",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/077.mp3"
          }
        ]
      },
      {
        id: "saadi-naba",
        surahName: "سورة النبأ",
        description: "التفسير الصوتي لسورة النبأ",
        tracks: [
          {
            id: "saadi-s78",
            title: "تفسير سورة النبأ كاملاً",
            duration: "00:11:34",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/078.mp3"
          }
        ]
      },
      {
        id: "saadi-naziat",
        surahName: "سورة النازعات",
        description: "التفسير الصوتي لسورة النازعات",
        tracks: [
          {
            id: "saadi-s79",
            title: "تفسير سورة النازعات كاملاً",
            duration: "00:12:30",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/079.mp3"
          }
        ]
      },
      {
        id: "saadi-abasa",
        surahName: "سورة عبس",
        description: "التفسير الصوتي لسورة عبس",
        tracks: [
          {
            id: "saadi-s80",
            title: "تفسير سورة عبس كاملاً",
            duration: "00:08:50",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/080.mp3"
          }
        ]
      },
      {
        id: "saadi-takwir",
        surahName: "سورة التكوير",
        description: "التفسير الصوتي لسورة التكوير",
        tracks: [
          {
            id: "saadi-s81",
            title: "تفسير سورة التكوير كاملاً",
            duration: "10:46",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/081.mp3"
          }
        ]
      },
      {
        id: "saadi-infitar",
        surahName: "سورة الانفطار",
        description: "التفسير الصوتي لسورة الانفطار",
        tracks: [
          {
            id: "saadi-s82",
            title: "تفسير سورة الانفطار كاملاً",
            duration: "04:43",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/082.mp3"
          }
        ]
      },
      {
        id: "saadi-mutaffifin",
        surahName: "سورة المطففين",
        description: "التفسير الصوتي لسورة المطففين",
        tracks: [
          {
            id: "saadi-s83",
            title: "تفسير سورة المطففين كاملاً",
            duration: "11:47",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/083.mp3"
          }
        ]
      },
      {
        id: "saadi-inshiqaq",
        surahName: "سورة الانشقاق",
        description: "التفسير الصوتي لسورة الانشقاق",
        tracks: [
          {
            id: "saadi-s84",
            title: "تفسير سورة الانشقاق كاملاً",
            duration: "07:01",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/084.mp3"
          }
        ]
      },
      {
        id: "saadi-buruj",
        surahName: "سورة البروج",
        description: "التفسير الصوتي لسورة البروج",
        tracks: [
          {
            id: "saadi-s85",
            title: "تفسير سورة البروج كاملاً",
            duration: "09:50",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/085.mp3"
          }
        ]
      },
      {
        id: "saadi-tariq",
        surahName: "سورة الطارق",
        description: "التفسير الصوتي لسورة الطارق",
        tracks: [
          {
            id: "saadi-s86",
            title: "تفسير سورة الطارق كاملاً",
            duration: "04:58",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/086.mp3"
          }
        ]
      },
      {
        id: "saadi-ala",
        surahName: "سورة الأعلى",
        description: "التفسير الصوتي لسورة الأعلى",
        tracks: [
          {
            id: "saadi-s87",
            title: "تفسير سورة الأعلى كاملاً",
            duration: "05:35",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/087.mp3"
          }
        ]
      },
      {
        id: "saadi-ghashiya",
        surahName: "سورة الغاشية",
        description: "التفسير الصوتي لسورة الغاشية",
        tracks: [
          {
            id: "saadi-s88",
            title: "تفسير سورة الغاشية كاملاً",
            duration: "07:14",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/088.mp3"
          }
        ]
      },
      {
        id: "saadi-fajr",
        surahName: "سورة الفجر",
        description: "التفسير الصوتي لسورة الفجر",
        tracks: [
          {
            id: "saadi-s89",
            title: "تفسير سورة الفجر كاملاً",
            duration: "10:43",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/089.mp3"
          }
        ]
      },
      {
        id: "saadi-balad",
        surahName: "سورة البلد",
        description: "التفسير الصوتي لسورة البلد",
        tracks: [
          {
            id: "saadi-s90",
            title: "تفسير سورة البلد كاملاً",
            duration: "05:32",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/090.mp3"
          }
        ]
      },
      {
        id: "saadi-shams",
        surahName: "سورة الشمس",
        description: "التفسير الصوتي لسورة الشمس",
        tracks: [
          {
            id: "saadi-s91",
            title: "تفسير سورة الشمس كاملاً",
            duration: "04:24",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/091.mp3"
          }
        ]
      },
      {
        id: "saadi-layl",
        surahName: "سورة الليل",
        description: "التفسير الصوتي لسورة الليل",
        tracks: [
          {
            id: "saadi-s92",
            title: "تفسير سورة الليل كاملاً",
            duration: "06:55",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/092.mp3"
          }
        ]
      },
      {
        id: "saadi-duha",
        surahName: "سورة الضحى",
        description: "التفسير الصوتي لسورة الضحى",
        tracks: [
          {
            id: "saadi-s93",
            title: "تفسير سورة الضحى كاملاً",
            duration: "04:11",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/093.mp3"
          }
        ]
      },
      {
        id: "saadi-sharh",
        surahName: "سورة الشرح",
        description: "التفسير الصوتي لسورة الشرح",
        tracks: [
          {
            id: "saadi-s94",
            title: "تفسير سورة الشرح كاملاً",
            duration: "02:57",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/094.mp3"
          }
        ]
      },
      {
        id: "saadi-tin",
        surahName: "سورة التين",
        description: "التفسير الصوتي لسورة التين",
        tracks: [
          {
            id: "saadi-s95",
            title: "تفسير سورة التين كاملاً",
            duration: "02:38",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/095.mp3"
          }
        ]
      },
      {
        id: "saadi-alaq",
        surahName: "سورة العلق",
        description: "التفسير الصوتي لسورة العلق",
        tracks: [
          {
            id: "saadi-s96",
            title: "تفسير سورة العلق كاملاً",
            duration: "04:45",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/096.mp3"
          }
        ]
      },
      {
        id: "saadi-qadr",
        surahName: "سورة القدر",
        description: "التفسير الصوتي لسورة القدر",
        tracks: [
          {
            id: "saadi-s97",
            title: "تفسير سورة القدر كاملاً",
            duration: "02:14",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/097.mp3"
          }
        ]
      },
      {
        id: "saadi-bayyina",
        surahName: "سورة البينة",
        description: "التفسير الصوتي لسورة البينة",
        tracks: [
          {
            id: "saadi-s98",
            title: "تفسير سورة البينة كاملاً",
            duration: "04:50",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/098.mp3"
          }
        ]
      },
      {
        id: "saadi-zalzala",
        surahName: "سورة الزلزلة",
        description: "التفسير الصوتي لسورة الزلزلة",
        tracks: [
          {
            id: "saadi-s99",
            title: "تفسير سورة الزلزلة كاملاً",
            duration: "02:14",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/099.mp3"
          }
        ]
      },
      {
        id: "saadi-adiyat",
        surahName: "سورة العاديات",
        description: "التفسير الصوتي لسورة العاديات",
        tracks: [
          {
            id: "saadi-s100",
            title: "تفسير سورة العاديات كاملاً",
            duration: "03:32",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/100.mp3"
          }
        ]
      },
      {
        id: "saadi-qaria",
        surahName: "سورة القارعة",
        description: "التفسير الصوتي لسورة القارعة",
        tracks: [
          {
            id: "saadi-s101",
            title: "تفسير سورة القارعة كاملاً",
            duration: "03:13",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/101.mp3"
          }
        ]
      },
      {
        id: "saadi-takathur",
        surahName: "سورة التكاثر",
        description: "التفسير الصوتي لسورة التكاثر",
        tracks: [
          {
            id: "saadi-s102",
            title: "تفسير سورة التكاثر كاملاً",
            duration: "02:45",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/102.mp3"
          }
        ]
      },
      {
        id: "saadi-asr",
        surahName: "سورة العصر",
        description: "التفسير الصوتي لسورة العصر",
        tracks: [
          {
            id: "saadi-s103",
            title: "تفسير سورة العصر كاملاً",
            duration: "01:35",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/103.mp3"
          }
        ]
      },
      {
        id: "saadi-humaza",
        surahName: "سورة الهمزة",
        description: "التفسير الصوتي لسورة الهمزة",
        tracks: [
          {
            id: "saadi-s104",
            title: "تفسير سورة الهمزة كاملاً",
            duration: "02:12",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/104.mp3"
          }
        ]
      },
      {
        id: "saadi-fil",
        surahName: "سورة الفيل",
        description: "التفسير الصوتي لسورة الفيل",
        tracks: [
          {
            id: "saadi-s105",
            title: "تفسير سورة الفيل كاملاً",
            duration: "01:29",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/105.mp3"
          }
        ]
      },
      {
        id: "saadi-quraysh",
        surahName: "سورة قريش",
        description: "التفسير الصوتي لسورة قريش",
        tracks: [
          {
            id: "saadi-s106",
            title: "تفسير سورة قريش كاملاً",
            duration: "01:19",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/106.mp3"
          }
        ]
      },
      {
        id: "saadi-maun",
        surahName: "سورة الماعون",
        description: "التفسير الصوتي لسورة الماعون",
        tracks: [
          {
            id: "saadi-s107",
            title: "تفسير سورة الماعون كاملاً",
            duration: "02:19",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/107.mp3"
          }
        ]
      },
      {
        id: "saadi-kawthar",
        surahName: "سورة الكوثر",
        description: "التفسير الصوتي لسورة الكوثر",
        tracks: [
          {
            id: "saadi-s108",
            title: "تفسير سورة الكوثر كاملاً",
            duration: "01:35",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/108.mp3"
          }
        ]
      },
      {
        id: "saadi-kafirun",
        surahName: "سورة الكافرون",
        description: "التفسير الصوتي لسورة الكافرون",
        tracks: [
          {
            id: "saadi-s109",
            title: "تفسير سورة الكافرون كاملاً",
            duration: "01:11",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/109.mp3"
          }
        ]
      },
      {
        id: "saadi-nasr",
        surahName: "سورة النصر",
        description: "التفسير الصوتي لسورة النصر",
        tracks: [
          {
            id: "saadi-s110",
            title: "تفسير سورة النصر كاملاً",
            duration: "02:23",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/110.mp3"
          }
        ]
      },
      {
        id: "saadi-masad",
        surahName: "سورة المسد",
        description: "التفسير الصوتي لسورة المسد",
        tracks: [
          {
            id: "saadi-s111",
            title: "تفسير سورة المسد كاملاً",
            duration: "01:50",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/111.mp3"
          }
        ]
      },
      {
        id: "saadi-ikhlas",
        surahName: "سورة الإخلاص",
        description: "التفسير الصوتي لسورة الإخلاص",
        tracks: [
          {
            id: "saadi-s112",
            title: "تفسير سورة الإخلاص كاملاً",
            duration: "01:19",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/112.mp3"
          }
        ]
      },
      {
        id: "saadi-falaq",
        surahName: "سورة الفلق",
        description: "التفسير الصوتي لسورة الفلق",
        tracks: [
          {
            id: "saadi-s113",
            title: "تفسير سورة الفلق كاملاً",
            duration: "01:27",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/113.mp3"
          }
        ]
      },
      {
        id: "saadi-nas",
        surahName: "سورة الناس",
        description: "التفسير الصوتي لسورة الناس",
        tracks: [
          {
            id: "saadi-s114",
            title: "تفسير سورة الناس كاملاً",
            duration: "01:43",
            audioUrl: "https://archive.org/download/Tafseer_Al_Saadi_MP3/114.mp3"
          }
        ]
      }
    ]
  },
  {
    id: "tafsir-asmari-hakam",
    name: "عبد الله الأسمري وصابر عبد الحكم (التفسير المختصر)",
    description: "قراءة صوتية لكتاب المختصر في تفسير القرآن الكريم بصوت عبدالله الأسمري وتلاوة صابر عبد الحكم، مادة متميزة من إنتاج مركز تفسير للدراسات القرآنية.",
    likes: 47800,
    surahs: asmariHakamSurahs
  }
];
