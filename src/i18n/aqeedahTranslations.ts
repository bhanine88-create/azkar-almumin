import {
  AqeedahArticle,
  AqeedahQuickCard,
  AqeedahSalafQuote,
  AqeedahBookSummary
} from '../data/aqeedahData';

export interface AqeedahCategoryTranslation {
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
}

export const CATEGORY_TRANSLATIONS: Record<string, Record<string, AqeedahCategoryTranslation>> = {
  usool_thalatha: {
    en: {
      title: 'Explanation of the Three Fundamental Principles',
      shortTitle: 'Three Principles',
      subtitle: 'Knowledge of Allah, His Religion Islam through evidence, and His Prophet Muhammad ﷺ',
      badge: 'Great Text'
    },
    fr: {
      title: 'Explication des Trois Principes Fondamentaux',
      shortTitle: 'Trois Principes',
      subtitle: 'Connaissance d’Allah, de Sa religion et de Son Prophète Muhammad ﷺ',
      badge: 'Grand Texte'
    },
    ur: {
      title: 'ثلاثۃ الاصول کی شرح و ادلہ',
      shortTitle: 'ثلاثۃ الاصول',
      subtitle: 'رب، دین اسلام اور نبی کریم ﷺ کی معرفت',
      badge: 'عظیم متن'
    },
    id: {
      title: 'Penjelasan Tiga Landasan Utama',
      shortTitle: 'Tiga Landasan Utama',
      subtitle: 'Mengenal Allah, Agama Islam dengan Dalil, dan Nabi Muhammad ﷺ',
      badge: 'Matan Utama'
    },
    tr: {
      title: 'Üç Esas Metninin Şerhi',
      shortTitle: 'Üç Esas',
      subtitle: 'Allah’ı, İslam Dinini ve Peygamberimiz Hz. Muhammed’i ﷺ Tanımak',
      badge: 'Büyük Metin'
    },
    bn: {
      title: 'তিনটি মৌলিক মূলনীতি ও তার প্রমাণ',
      shortTitle: 'তিনটি মূলনীতি',
      subtitle: 'আল্লাহ, ইসলাম ধর্ম এবং নবী মুহাম্মাদ ﷺ কে জানার মূলনীতি',
      badge: 'মহান মতনের ব্যাখ্যা'
    },
    ms: {
      title: 'Penjelasan Tiga Landasan Utama',
      shortTitle: 'Tiga Landasan Utama',
      subtitle: 'Mengenal Allah, Agama Islam dengan Dalil, dan Nabi Muhammad ﷺ',
      badge: 'Matan Utama'
    },
    de: {
      title: 'Erklärung der Drei Grundprinzipien',
      shortTitle: 'Drei Prinzipien',
      subtitle: 'Wissen über Allah, Seine Religion und Seinen Propheten Muhammad ﷺ',
      badge: 'Großer Text'
    },
    es: {
      title: 'Explicación de los Tres Principios Fundamentales',
      shortTitle: 'Tres Principios',
      subtitle: 'Conocimiento de Allah, de Su religión y de Su Profeta Muhammad ﷺ',
      badge: 'Gran Texto'
    }
  },
  qawaid_arbaa: {
    en: {
      title: 'The Four Rules of Tawheed',
      shortTitle: 'Four Rules',
      subtitle: 'Understanding the Tawheed of Prophets vs the Shirk of Polytheists',
      badge: 'Tawheed Rules'
    },
    fr: {
      title: 'Les Quatre Règles du Tawhid',
      shortTitle: 'Quatre Règles',
      subtitle: 'Comprendre le Tawhid des Prophètes et la différence avec le Shirk',
      badge: 'Règles du Tawhid'
    },
    ur: {
      title: 'توحید کے چار بنیادی قواعد',
      shortTitle: 'القواعد الأربع',
      subtitle: 'انبیاء کے توحید اور مشرکین کے شرک میں فرق کی سمجھ',
      badge: 'قواعدِ توحید'
    },
    id: {
      title: 'Empat Kaidah Utama Tauhid',
      shortTitle: 'Empat Kaidah',
      subtitle: 'Memahami Tauhid para Nabi dan Perbedaannya dengan Syirik',
      badge: 'Kaidah Tauhid'
    },
    tr: {
      title: 'Tevhidin Dört Temel Kaidesi',
      shortTitle: 'Dört Kaide',
      subtitle: 'Peygamberlerin Tevhidi ve Şirkten Farkı',
      badge: 'Tevhid Kaideleri'
    },
    bn: {
      title: 'তাওহীদের চারটি মৌলিক নীতি',
      shortTitle: 'চারটি নীতি',
      subtitle: 'নবীগণের তাওহীদ এবং মুশরিকদের শিরকের মূল পার্থক্য',
      badge: 'তাওহীদের নিয়ম'
    },
    ms: {
      title: 'Empat Kaedah Utama Tauhid',
      shortTitle: 'Empat Kaedah',
      subtitle: 'Memahami Tauhid para Nabi dan Perbedaannya dengan Syirik',
      badge: 'Kaedah Tauhid'
    },
    de: {
      title: 'Die Vier Regeln des Tauhid',
      shortTitle: 'Vier Regeln',
      subtitle: 'Verständnis des Tauhid der Propheten im Vergleich zum Shirk',
      badge: 'Tauhid-Regeln'
    },
    es: {
      title: 'Las Cuatro Reglas del Tauhid',
      shortTitle: 'Cuatro Reglas',
      subtitle: 'Comprender el Tauhid de los Profetas frente al Shirk',
      badge: 'Reglas del Tauhid'
    }
  },
  kitab_tawheed: {
    en: {
      title: 'Kitab At-Tawheed (The Book of Monotheism)',
      shortTitle: 'Book of Tawheed',
      subtitle: 'Allah’s Right Upon His Servants, Virtues of Tawheed and Warning Against Shirk',
      badge: 'Right of Allah'
    },
    fr: {
      title: 'Kitab At-Tawhid (Le Livre du Monothéisme)',
      shortTitle: 'Livre du Tawhid',
      subtitle: 'Le droit d’Allah sur Ses serviteurs, les mérites du Tawhid et la prévention du Shirk',
      badge: 'Droit d’Allah'
    },
    ur: {
      title: 'کتاب التوحید - بندوں پر اللہ کا حق',
      shortTitle: 'کتاب التوحيد',
      subtitle: 'توحیدِ الوہیت، فضیلت اور شرک سے تحذیر',
      badge: 'حق اللہ'
    },
    id: {
      title: 'Kitab Tauhid - Hak Allah Atas Hamba-Nya',
      shortTitle: 'Kitab Tauhid',
      subtitle: 'Keutamaan Tauhid dan Peringatan Terhadap Perbuatan Syirik',
      badge: 'Hak Allah'
    },
    tr: {
      title: 'Kitab’ut-Tevhid - Allah’ın Kullar Üzerindeki Hakkı',
      shortTitle: 'Kitab’ut-Tevhid',
      subtitle: 'Tevhidin Fazileti ve Şirkten Sakındırma',
      badge: 'Allah’ın Hakkı'
    },
    bn: {
      title: 'কিতাবুত তাওহীদ - বান্দার ওপর আল্লাহর হক',
      shortTitle: 'কিতাবুত তাওহীদ',
      subtitle: 'তাওহীদের ফজিলত এবং শিরক থেকে সতর্কীকরণ',
      badge: 'আল্লাহর পাওনা হক'
    },
    ms: {
      title: 'Kitab Tauhid - Hak Allah Atas Hamba-Nya',
      shortTitle: 'Kitab Tauhid',
      subtitle: 'Keutamaan Tauhid dan Peringatan Terhadap Perbuatan Syirik',
      badge: 'Hak Allah'
    },
    de: {
      title: 'Kitab At-Tawhid (Das Buch des Monotheismus)',
      shortTitle: 'Buch des Tauhid',
      subtitle: 'Allahs Recht gegenüber Seinen Dienern und Warnung vor Shirk',
      badge: 'Recht Allahs'
    },
    es: {
      title: 'Kitab At-Tauhid (El Libro del Monoteísmo)',
      shortTitle: 'Libro del Tauhid',
      subtitle: 'El derecho de Allah sobre Sus siervos y prevención del Shirk',
      badge: 'Derecho de Allah'
    }
  },
  kashf_shubuhat: {
    en: {
      title: 'Kashf Ash-Shubuhat (Removal of Doubts)',
      shortTitle: 'Removal of Doubts',
      subtitle: 'Refuting doubts regarding supplication, intercession, and reality of Shirk',
      badge: 'Shield of Monotheism'
    },
    fr: {
      title: 'Kashf Ash-Shubuhat (Dissipation des Doutes)',
      shortTitle: 'Dissipation des Doutes',
      subtitle: 'Réfutation des doutes concernant l’invocation et l’intercession',
      badge: 'Bouclier du Tawhid'
    },
    ur: {
      title: 'کشف الشبہات - شبہات کا ازالہ',
      shortTitle: 'کشف الشبہات',
      subtitle: 'دعا، شفاعت اور شرک کے متعلق شبہات کا قاطع جواب',
      badge: 'موحد کا ہتھيار'
    },
    id: {
      title: 'Kashf Asy-Syubuhat (Penyingkapan Syubhat)',
      shortTitle: 'Penyingkapan Syubhat',
      subtitle: 'Membantah keraguan seputar doa, syafaat, dan hakikat syirik',
      badge: 'Perisai Tauhid'
    },
    tr: {
      title: 'Keşfü’ş-Şübehat (Şüphelerin Giderilmesi)',
      shortTitle: 'Şüphelerin Giderilmesi',
      subtitle: 'Dua ve şefaat hakkındaki şüphelerin reddi ve tevhidin hakikati',
      badge: 'Tevhid Zırhı'
    },
    bn: {
      title: 'কাশফুশ শুবুহাত (সংশয় নিরসন)',
      shortTitle: 'সংশয় নিরসন',
      subtitle: 'দুআ ও শাফাআত সংক্রান্ত সংশয়ের খণ্ডন',
      badge: 'তাওহীদের ঢাল'
    },
    ms: {
      title: 'Kashf Asy-Syubuhat (Penyingkapan Syubhat)',
      shortTitle: 'Penyingkapan Syubhat',
      subtitle: 'Membantah keraguan seputar doa, syafaat, dan hakikat syirik',
      badge: 'Perisai Tauhid'
    },
    de: {
      title: 'Kashf Ash-Shubuhat (Beseitigung von Zweifeln)',
      shortTitle: 'Beseitigung von Zweifeln',
      subtitle: 'Widerlegung von Zweifeln bezüglich Bittgebet und Fürsprache',
      badge: 'Schild des Tauhid'
    },
    es: {
      title: 'Kashf Ash-Shubuhat (Disipación de Dudas)',
      shortTitle: 'Disipación de Dudas',
      subtitle: 'Refutación de dudas sobre la súplica y la intercesión',
      badge: 'Escudo del Tauhid'
    }
  },
  usool_sittah: {
    en: {
      title: 'Explanation of the Six Foundations by Sheikh Ibn Baz',
      shortTitle: 'Six Foundations',
      subtitle: 'Great principles clarified clearly in the Quran explained by Sheikh Ibn Baz',
      badge: 'Ibn Baz Explanation'
    },
    fr: {
      title: 'Explication des Six Principes par Cheikh Ibn Baz',
      shortTitle: 'Six Principes',
      subtitle: 'Principes fondamentaux clarifiés dans le Coran, expliqués par Cheikh Ibn Baz',
      badge: 'Explication Ibn Baz'
    },
    ur: {
      title: 'شیخ ابن باز کے چھ بنیادی اصول',
      shortTitle: 'الأصول الستة',
      subtitle: 'قرآن و سنت کے روشن اصول جن کی وضاحت ابن بازؒ نے کی',
      badge: 'شرح ابن باز'
    },
    id: {
      title: 'Penjelasan Enam Landasan Utama oleh Syaikh Ibn Baz',
      shortTitle: 'Enam Landasan',
      subtitle: 'Prinsip-prinsip agung yang dijelaskan Al-Qur\'an dengan gamblang',
      badge: 'Syarah Ibn Baz'
    },
    tr: {
      title: 'Şeyh İbn Baz’ın Altı Esas Şerhi',
      shortTitle: 'Altı Esas',
      subtitle: 'Kur’an-ı Kerim’de açıklanan temel esasların İbn Baz şerhi',
      badge: 'İbn Baz Şerhi'
    },
    bn: {
      title: 'শেখ ইবনে বাযের ছয়টি মূলনীতির ব্যাখ্যা',
      shortTitle: 'ছয়টি মূলনীতি',
      subtitle: 'কুরআনে স্পষ্ট বর্ণিত মৌলিক নীতিসমূহের ব্যাখ্যা',
      badge: 'ইবনে বাযের ব্যাখ্যা'
    },
    ms: {
      title: 'Penjelasan Enam Landasan Utama oleh Syeikh Ibn Baz',
      shortTitle: 'Enam Landasan',
      subtitle: 'Prinsip-prinsip agung yang dijelaskan Al-Quran dengan terang',
      badge: 'Syarah Ibn Baz'
    },
    de: {
      title: 'Erklärung der Sechs Grundlagen von Scheich Ibn Baz',
      shortTitle: 'Sechs Grundlagen',
      subtitle: 'Wichtige Grundsätze aus dem Koran, erklärt von Scheich Ibn Baz',
      badge: 'Ibn Baz Erklärung'
    },
    es: {
      title: 'Explicación de los Seis Fundamentos por el Sheij Ibn Baz',
      shortTitle: 'Seis Fundamentos',
      subtitle: 'Grandes principios aclarados en el Corán explicados por Ibn Baz',
      badge: 'Explicación Ibn Baz'
    }
  },
  aqeedah_wasitiyyah: {
    en: {
      title: 'Al-Aqeedah Al-Wasitiyyah by Ibn Taymiyyah',
      shortTitle: 'Al-Wasitiyyah',
      subtitle: 'Foundations of Ahlus-Sunnah wal-Jamaah in Divine Names, Attributes & Hereafter',
      badge: 'Core Creed'
    },
    fr: {
      title: 'Al-Aqida Al-Wassitiyya par Ibn Taymiyya',
      shortTitle: 'Al-Wassitiyya',
      subtitle: 'Fondements d’Ahlus-Sunnah wal-Jama’ah sur les Noms, Attributs et l’Au-delà',
      badge: 'Dogme Fondamental'
    },
    ur: {
      title: 'العقيدة الواسطية - ابن تيمية',
      shortTitle: 'الواسطية',
      subtitle: 'اہل السنت کے بنیادی عقائد اسماء و صفات اور معاد میں',
      badge: 'اصلی عقیدہ'
    },
    id: {
      title: 'Al-Aqidah Al-Wasitiyyah karya Ibnu Taimiyah',
      shortTitle: 'Al-Wasitiyyah',
      subtitle: 'Pokok Akidah Ahlus Sunnah wal Jamaah tentang Asma wa Sifat',
      badge: 'Akidah Inti'
    },
    tr: {
      title: 'İbn Teymiyye’nin El-Akidetu’l-Vasitiyye Metni',
      shortTitle: 'El-Vasitiyye',
      subtitle: 'Ehli Sünnet’in Esma ve Sıfatlar Konusundaki Temel Akidesi',
      badge: 'Temel Akide'
    },
    bn: {
      title: 'ইবনে তাইমিয়ার আল-আকীদা আল-ওয়াসিতিয়্যাহ',
      shortTitle: 'আল-ওয়াসিতিয়্যাহ',
      subtitle: 'আসমা ওয়া সিফাত বিষয়ে আহলুস সুন্নাহর মৌলিক আকীদা',
      badge: 'মূল আকীদা'
    },
    ms: {
      title: 'Al-Aqidah Al-Wasitiyyah karya Ibnu Taimiyah',
      shortTitle: 'Al-Wasitiyyah',
      subtitle: 'Teras Akidah Ahlus Sunnah wal Jamaah tentang Asma wa Sifat',
      badge: 'Akidah Inti'
    },
    de: {
      title: 'Al-Aqida Al-Wasitiyya von Ibn Taymiyyah',
      shortTitle: 'Al-Wasitiyya',
      subtitle: 'Grundlagen der Ahlus-Sunnah in den Namen und Eigenschaften Allahs',
      badge: 'Kern-Glauben'
    },
    es: {
      title: 'Al-Aqidah Al-Wasitiyyah de Ibn Taymiyyah',
      shortTitle: 'Al-Wasitiyyah',
      subtitle: 'Fundamentos de Ahlus-Sunnah sobre los Nombres y Atributos Divinos',
      badge: 'Credo Principal'
    }
  },
  tahawiyyah_lumaa: {
    en: {
      title: 'Texts of Early Scholars (Tahawiyyah & Lumaat Al-Itaqad)',
      shortTitle: 'Tahawiyyah & Lumaa',
      subtitle: 'Creed landmarks of Imam At-Tahawi and Ibn Qudamah Al-Maqdisi',
      badge: 'Salaf Texts'
    },
    fr: {
      title: 'Textes des Anciens (Tahawiyyah et Lumaat Al-Itaqad)',
      shortTitle: 'Tahawiyyah & Lumaa',
      subtitle: 'Repères de foi de l’Imam At-Tahawi et Ibn Qudamah Al-Maqdisi',
      badge: 'Textes des Salafs'
    },
    ur: {
      title: 'عقیدہ طحاویہ اور لمعۃ الاعتقاد',
      shortTitle: 'طحاویہ و لمعۃ',
      subtitle: 'امام طحاوی اور ابن قدامہ مقدسی کے مبارک متون',
      badge: 'متونِ سلف'
    },
    id: {
      title: 'Matan Akidah Salaf (Thahawiyah & Luma\'atul I\'tiqad)',
      shortTitle: 'Thahawiyah & Lumaa',
      subtitle: 'Landasan akidah karya Imam At-Thahawi dan Ibnu Qudamah',
      badge: 'Matan Salaf'
    },
    tr: {
      title: 'Tahaviyye ve Lum’atü’l-İ’tikad Metinleri',
      shortTitle: 'Tahaviyye ve Lum’a',
      subtitle: 'İmam Et-Tahavi ve İbn Kudame’nin Akide Esasları',
      badge: 'Selef Metinleri'
    },
    bn: {
      title: 'আকীদা ত্বহাবী ও লুমআতুল ই\'তিকাদ',
      shortTitle: 'ত্বহাবী ও লুমআ',
      subtitle: 'ইমাম ত্বহাবী ও ইবনে কুদামাহ আল-মাকদিসীর আকীদাগত গ্রন্থ',
      badge: 'সালাফদের বই'
    },
    ms: {
      title: 'Matan Akidah Salaf (Thahawiyah & Luma\'atul I\'tiqad)',
      shortTitle: 'Thahawiyah & Lumaa',
      subtitle: 'Landasan akidah karya Imam At-Thahawi dan Ibnu Qudamah',
      badge: 'Matan Salaf'
    },
    de: {
      title: 'Texte der Salaf (Tahawiyyah & Lumaat Al-Itaqad)',
      shortTitle: 'Tahawiyyah & Lumaa',
      subtitle: 'Glaubenswerke von Imam At-Tahawi und Ibn Qudamah',
      badge: 'Salaf-Texte'
    },
    es: {
      title: 'Textos Clásicos (Tahawiyyah y Lumaat Al-Itaqad)',
      shortTitle: 'Tahawiyyah y Lumaa',
      subtitle: 'Obras de credo del Imam At-Tahawi e Ibn Qudamah',
      badge: 'Textos Salaf'
    }
  },
  heart_purification: {
    en: {
      title: 'Purification of Hearts and Spiritual Diseases',
      shortTitle: 'Purification of Hearts',
      subtitle: 'Curing spiritual ailments, patience, gratitude, and avoiding major sins',
      badge: 'Medicine of Hearts'
    },
    fr: {
      title: 'Purification des Cœurs et des Âmes',
      shortTitle: 'Purification des Cœurs',
      subtitle: 'Guérison des maladies du cœur, patience, gratitude et évitement des péchés',
      badge: 'Remède des Cœurs'
    },
    ur: {
      title: 'تزکیہ نفس اور اعمال القلوب',
      shortTitle: 'تزکیہ نفس',
      subtitle: 'باطنی بیماریاں، صبر، شکر اور گناہوں سے دوری',
      badge: 'طب القلوب'
    },
    id: {
      title: 'Penyucian Jiwa & Amalan Hati',
      shortTitle: 'Penyucian Jiwa',
      subtitle: 'Mengobati penyakit hati, sabar, syukur, dan menjauhi dosa besar',
      badge: 'Obat Hati'
    },
    tr: {
      title: 'Kalp Temizliği ve Nefis Terbiyesi',
      shortTitle: 'Kalp Temizliği',
      subtitle: 'Manevi hastalıkların tedavisi, sabır, şükür ve günahlardan kaçınma',
      badge: 'Gönül İlacı'
    },
    bn: {
      title: 'আত্মশুদ্ধি ও হৃদয়ের আমল',
      shortTitle: 'আত্মশুদ্ধি',
      subtitle: 'অন্তরের ব্যাধির চিকিৎসা, তাওয়াক্কুল, সবর ও শিকর',
      badge: 'অন্তরের ঔষধ'
    },
    ms: {
      title: 'Penyucian Jiwa & Amalan Hati',
      shortTitle: 'Penyucian Jiwa',
      subtitle: 'Mengobati penyakit hati, sabar, syukur, dan menjauhi dosa besar',
      badge: 'Obat Hati'
    },
    de: {
      title: 'Läuterung der Herzen & Spiritualität',
      shortTitle: 'Herzensläuterung',
      subtitle: 'Heilung spiritueller Krankheiten, Geduld, Dankbarkeit und Aufrichtigkeit',
      badge: 'Herzensmedizin'
    },
    es: {
      title: 'Purificación de los Corazones y del Alma',
      shortTitle: 'Purificación del Corazón',
      subtitle: 'Cura de enfermedades espirituales, paciencia, gratitud y sinceridad',
      badge: 'Medicina del Corazón'
    }
  },
  books_library: {
    en: {
      title: 'Library of Major Creed & Spiritual Books',
      shortTitle: 'Book Summaries',
      subtitle: 'Summaries, key takeaways, and guides to important Islamic books',
      badge: 'Creed Library'
    },
    fr: {
      title: 'Bibliothèque des Livres de Dogme et Purification',
      shortTitle: 'Résumés de Livres',
      subtitle: 'Résumés et aperçus des livres majeurs du Tawhid',
      badge: 'Bibliothèque'
    },
    ur: {
      title: 'عقیدہ و تزکیہ کی بنیادی کتب کی لائبریری',
      shortTitle: 'کتب خلاصات',
      subtitle: 'توحید اور شرعی علوم کی اہم کتابوں کے خلاصے اور ڈائرکٹری',
      badge: 'عقیدہ لائبریری'
    },
    id: {
      title: 'Perpustakaan Kitab Induk Akidah & Penyucian Jiwa',
      shortTitle: 'Ringkasan Kitab',
      subtitle: 'Ringkasan terfokus dan panduan membaca kitab-kitab utama',
      badge: 'Perpustakaan'
    },
    tr: {
      title: 'Temel Akide ve Tezkiye Kitapları Kütüphanesi',
      shortTitle: 'Kitap Özetleri',
      subtitle: 'Tevhid ve şeri ilimlerin en önemli kitap özetleri',
      badge: 'Kütüphane'
    },
    bn: {
      title: 'আকীদা ও আত্মশুদ্ধির মূল গ্রন্থাগার',
      shortTitle: 'বইয়ের সারসংক্ষেপ',
      subtitle: 'তাওহীদ ও শরয়ী জ্ঞানের প্রধান বইগুলোর সারসংক্ষেপ',
      badge: 'লাইব্রেরি'
    },
    ms: {
      title: 'Perpustakaan Kitab Induk Akidah & Penyucian Jiwa',
      shortTitle: 'Ringkasan Kitab',
      subtitle: 'Ringkasan terfokus dan panduan membaca kitab-kitab utama',
      badge: 'Perpustakaan'
    },
    de: {
      title: 'Bibliothek der Hauptwerke der Glaubenslehre',
      shortTitle: 'Buchzusammenfassungen',
      subtitle: 'Kompakte Zusammenfassungen wichtiger islamischer Bücher',
      badge: 'Bibliothek'
    },
    es: {
      title: 'Biblioteca de Libros Principales de Credo y Purificación',
      shortTitle: 'Resúmenes de Libros',
      subtitle: 'Resúmenes y guías de lectura de los libros de Tauhid',
      badge: 'Biblioteca'
    }
  },
  pillars: {
    en: {
      title: 'The Six Pillars of Faith (Iman)',
      shortTitle: 'Pillars of Faith',
      subtitle: 'The six core pillars of Islamic creed and belief',
      badge: 'Solid Foundation'
    },
    fr: {
      title: 'Les Six Piliers de la Foi (Iman)',
      shortTitle: 'Piliers de la Foi',
      subtitle: 'Les six piliers fondamentaux de la foi musulmane',
      badge: 'Fondement Solide'
    },
    ur: {
      title: 'ارکانِ ایمان کے اصول',
      shortTitle: 'ارکانِ ایمان',
      subtitle: 'اسلامی عقیدے کے چھ بنیادی اور مستحکم ارکان',
      badge: 'مضبوط بنیاد'
    },
    id: {
      title: 'Enam Rukun Iman dalam Islam',
      shortTitle: 'Rukun Iman',
      subtitle: 'Enam pilar utama akidah dan keyakinan seorang muslim',
      badge: 'Pilar Kokoh'
    },
    tr: {
      title: 'İmanın Altı Şartı ve Esasları',
      shortTitle: 'İmanın Şartları',
      subtitle: 'İslam akidesinin altı temel direği',
      badge: 'Müstahkem Temel'
    },
    bn: {
      title: 'ঈমানের ছয়টি রুকন',
      shortTitle: 'ঈমানের রুকন',
      subtitle: 'ইসলামী আকীদার প্রধান ৬টি ভিত্তি',
      badge: 'সুদৃঢ় ভিত্তি'
    },
    ms: {
      title: 'Enam Rukun Iman dalam Islam',
      shortTitle: 'Rukun Iman',
      subtitle: 'Enam pilar utama akidah dan keyakinan seorang muslim',
      badge: 'Pilar Kokoh'
    },
    de: {
      title: 'Die Sechs Pfeiler des Glaubens (Iman)',
      shortTitle: 'Glaubenspfeiler',
      subtitle: 'Die sechs Kernpfeiler der islamischen Glaubenslehre',
      badge: 'Solide Basis'
    },
    es: {
      title: 'Los Seis Pilares de la Fe (Iman)',
      shortTitle: 'Pilares de la Fe',
      subtitle: 'Los seis pilares fundamentales del credo islámico',
      badge: 'Base Sólida'
    }
  },
  nullifiers: {
    en: {
      title: 'Nullifiers of Islam & Warning Against Shirk',
      shortTitle: 'Preserving Tawheed',
      subtitle: 'Protection against Shirk, innovations, and invalidators of faith',
      badge: 'Protection Gate'
    },
    fr: {
      title: 'Les Annulatifs de l’Islam et la Prévention du Shirk',
      shortTitle: 'Préservation du Tawhid',
      subtitle: 'Protection contre le Shirk, les innovations et les annulatifs',
      badge: 'Protection'
    },
    ur: {
      title: 'نواقضِ اسلام اور توحید کی حفاظت',
      shortTitle: 'حمايتِ توحيد',
      subtitle: 'شرک، بدعات اور ایمان باطل کرنے والی چیزوں سے تحفظ',
      badge: 'حصنِ ایمانی'
    },
    id: {
      title: 'Pembatal-Pembatal Keislaman & Menjaga Tauhid',
      shortTitle: 'Menjaga Tauhid',
      subtitle: 'Perlindungan dari syirik, bid\'ah, dan hal yang membatalkan iman',
      badge: 'Benteng Iman'
    },
    tr: {
      title: 'İslam’ı Bozan Unsurlar ve Tevhidin Korunması',
      shortTitle: 'Tevhidin Korunması',
      subtitle: 'Şirkten, bidatlerden ve imanı bozan şeylerden korunma',
      badge: 'İman Kalesi'
    },
    bn: {
      title: 'ইসলামের বাতিলকারী বিষয়সমূহ ও তাওহীদ রক্ষা',
      shortTitle: 'তাওহীদ রক্ষা',
      subtitle: 'শিরক, বিদআত ও ঈমান ভঙ্গকারী বিষয় থেকে সুরক্ষা',
      badge: 'ঈমানের দুর্গ'
    },
    ms: {
      title: 'Pembatal-Pembatal Keislaman & Menjaga Tauhid',
      shortTitle: 'Menjaga Tauhid',
      subtitle: 'Perlindungan dari syirik, bid\'ah, dan hal yang membatalkan iman',
      badge: 'Benteng Iman'
    },
    de: {
      title: 'Dinge, die den Islam ungültig machen & Schutz des Tauhid',
      shortTitle: 'Tauhid bewahren',
      subtitle: 'Schutz vor Shirk, Neuerungen und Ungültigkeitserklärungen',
      badge: 'Schutzburg'
    },
    es: {
      title: 'Anuladores del Islam y Protección del Tauhid',
      shortTitle: 'Preservar el Tauhid',
      subtitle: 'Protección contra el Shirk, las innovaciones y anuladores de la fe',
      badge: 'Protección'
    }
  },
  names_attributes: {
    en: {
      title: 'Understanding the Beautiful Names & Attributes of Allah',
      shortTitle: 'Names & Attributes',
      subtitle: 'Noble meanings, rules of affirmation, and worshipping Allah through them',
      badge: 'Knowing Allah'
    },
    fr: {
      title: 'Les Noms Sublimes et Attributs d’Allah',
      shortTitle: 'Noms & Attributs',
      subtitle: 'Comprendre leurs significations et adorer Allah par Ses Noms',
      badge: 'Connaître Allah'
    },
    ur: {
      title: 'اسماء و صفاتِ الہی کا فہم',
      shortTitle: 'اسماء و صفات',
      subtitle: 'نیک معانی، اثبات کے قواعد اور اللہ سے عبدیت کے تقاضے',
      badge: 'معرفتِ الہی'
    },
    id: {
      title: 'Memahami Asma wa Sifat Allah yang Mulia',
      shortTitle: 'Asma wa Sifat',
      subtitle: 'Makna luhur, kaidah penetapan, dan beribadah dengan Nama-Nya',
      badge: 'Mengenal Allah'
    },
    tr: {
      title: 'Allah’ın Yüce İsim ve Sıfatlarının Anlaşılması',
      shortTitle: 'Esma ve Sıfat',
      subtitle: 'Yüce manalar, isbat kuralları ve isimleriyle ibadet etme',
      badge: 'Allah’ı Tanımak'
    },
    bn: {
      title: 'আল্লাহর সুন্দর নাম ও গুণাবলী অনুধাবন',
      shortTitle: 'আসমা ওয়া সিফাত',
      subtitle: 'মহিমান্বিত অর্থ, প্রমাণের নিয়মাবলী এবং ইবাদতের সুফল',
      badge: 'আল্লাহকে জানা'
    },
    ms: {
      title: 'Memahami Asma wa Sifat Allah yang Mulia',
      shortTitle: 'Asma wa Sifat',
      subtitle: 'Makna luhur, kaedah penetapan, dan beribadah dengan Nama-Nya',
      badge: 'Mengenal Allah'
    },
    de: {
      title: 'Die Schönsten Namen und Eigenschaften Allahs verstehen',
      shortTitle: 'Namen & Eigenschaften',
      subtitle: 'Erhabene Bedeutungen und Anbetung Allahs durch Seine Namen',
      badge: 'Allah erkennen'
    },
    es: {
      title: 'Comprender los Hermosos Nombres y Atributos de Allah',
      shortTitle: 'Nombres y Atributos',
      subtitle: 'Significados nobles y adorar a Allah a través de Sus Nombres',
      badge: 'Conocer a Allah'
    }
  },
  contemporary_issues: {
    en: {
      title: 'Contemporary Faith Issues & Steadfastness',
      shortTitle: 'Steadfastness',
      subtitle: 'Firmness in times of doubts, good expectations, and grounded answers',
      badge: 'Certainty'
    },
    fr: {
      title: 'Enjeux Contemporains de la Foi et Constance',
      shortTitle: 'Constance de la Foi',
      subtitle: 'Fermeté face aux doutes et certitude dans la foi',
      badge: 'Certitude'
    },
    ur: {
      title: 'معاصر عقائدی مسائل اور ثبات قدمی',
      shortTitle: 'ثبات قدمی',
      subtitle: 'فتنوں کے دور میں استقامت اور مستند جوابات',
      badge: 'یقین و ثبات'
    },
    id: {
      title: 'Isu Akidah Kontemporer & Istiqamah',
      shortTitle: 'Keteguhan Iman',
      subtitle: 'Keteguhan di masa syubhat dan jawaban ilmiah berdasar Al-Qur\'an',
      badge: 'Keyakinan'
    },
    tr: {
      title: 'Güncel Akide Meseleleri ve Sebat',
      shortTitle: 'İmanda Sebat',
      subtitle: 'Şüpheler karşısında metanet ve sağlam ilmi cevaplar',
      badge: 'Yakin'
    },
    bn: {
      title: 'সমসাময়িক আকীদাগত বিষয় ও দ্বীনে অবিচলতা',
      shortTitle: 'অবিচলতা',
      subtitle: 'সংশয় ও ফিতনার যুগে সুদৃঢ় থাকা এবং প্রমাণিত উত্তর',
      badge: 'দৃঢ় বিশ্বাস'
    },
    ms: {
      title: 'Isu Akidah Kontemporari & Istiqamah',
      shortTitle: 'Keteguhan Iman',
      subtitle: 'Keteguhan di masa syubhat dan jawaban ilmiah berdasar Al-Quran',
      badge: 'Keyakinan'
    },
    de: {
      title: 'Zeitgenössische Glaubensfragen & Standhaftigkeit',
      shortTitle: 'Standhaftigkeit',
      subtitle: 'Standhaftigkeit in Zeiten von Zweifeln und fundierte Antworten',
      badge: 'Gewissheit'
    },
    es: {
      title: 'Cuestiones Contemporáneas de Fe y Firmeza',
      shortTitle: 'Firmeza en la Fe',
      subtitle: 'Firmeza en tiempos de dudas y respuestas fundamentadas',
      badge: 'Certeza'
    }
  },
  salaf_quotes: {
    en: {
      title: 'Gems and Sayings of the Early Pious Predecessors (Salaf)',
      shortTitle: 'Salaf Gems',
      subtitle: 'Golden sayings from the Companions and Imams regarding Tawheed',
      badge: 'Path of Salaf'
    },
    fr: {
      title: 'Perles et Paroles des Pieux Prédécesseurs (Salaf)',
      shortTitle: 'Perles des Salafs',
      subtitle: 'Paroles dorées des compagnons et grands imams',
      badge: 'Voie des Salafs'
    },
    ur: {
      title: 'سلف صالحین کے انمول درر اور اقوال',
      shortTitle: 'دررِ سلف',
      subtitle: 'صحابہ، تابعین اور آئمہ کے توحید پر سنہرے اقوال',
      badge: 'منہجِ سلف'
    },
    id: {
      title: 'Mutiara Ucapan Salafush Shalih dalam Akidah',
      shortTitle: 'Mutiara Salaf',
      subtitle: 'Perkataan emas para Sahabat dan Imam mengenai Tauhid',
      badge: 'Jalan Salaf'
    },
    tr: {
      title: 'Selef-i Salihin’in Akide Hakkındaki Özlü Sözleri',
      shortTitle: 'Selef Sözleri',
      subtitle: 'Sahabe ve İmamların Tevhid hakkındaki altın sözleri',
      badge: 'Selef Yolu'
    },
    bn: {
      title: 'আকীদা বিষয়ে সালাফে সালেহীনদের অমূল্য উক্তি',
      shortTitle: 'সালাফদের উক্তি',
      subtitle: 'সাহাবী ও বিখ্যাত ইমামগণের মূল্যবান বক্তব্য',
      badge: 'সালাফদের পথ'
    },
    ms: {
      title: 'Mutiara Ucapan Salafus Sholeh dalam Akidah',
      shortTitle: 'Mutiara Salaf',
      subtitle: 'Perkataan emas para Sahabat dan Imam mengenai Tauhid',
      badge: 'Jalan Salaf'
    },
    de: {
      title: 'Perlen und Aussagen der rechtschaffenen Salaf',
      shortTitle: 'Salaf-Perlen',
      subtitle: 'Aussagen der Gefährten und Imame zum Thema Tauhid',
      badge: 'Pfad der Salaf'
    },
    es: {
      title: 'Joyas y Dichos de los Piadosos Predecesores (Salaf)',
      shortTitle: 'Joyas Salaf',
      subtitle: 'Palabras doradas de los Compañeros e Imames sobre el Tauhid',
      badge: 'Vía Salaf'
    }
  },
  quick_cards: {
    en: {
      title: 'Quick Creed Benefit Cards for Sharing',
      shortTitle: 'Benefit Cards',
      subtitle: 'Concise faith principles designed for quick social media sharing',
      badge: 'Quick Benefits'
    },
    fr: {
      title: 'Cartes de Bénéfices pour Partage Rapide',
      shortTitle: 'Cartes Bénéfices',
      subtitle: 'Règles concises de foi conçues pour un partage facile',
      badge: 'Bénéfices Rapides'
    },
    ur: {
      title: 'شیئرنگ کے لیے مختصر عقائدی کارڈز',
      shortTitle: 'عقائدی کارڈز',
      subtitle: 'سوشل میڈیا پر آسانی سے شیئر کرنے کے لیے ڈیزائن کردہ قواعد',
      badge: 'مختصر فوائد'
    },
    id: {
      title: 'Kartu Faedah Akidah Ringkas untuk Bagikan',
      shortTitle: 'Kartu Faedah',
      subtitle: 'Prinsip iman ringkas yang dirancang untuk dibagikan',
      badge: 'Faedah Ringkas'
    },
    tr: {
      title: 'Paylaşım İçin Hızlı Akide Kartları',
      shortTitle: 'Akide Kartları',
      subtitle: 'Sosyal medyada paylaşılmak üzere özet kaideler',
      badge: 'Hızlı Özet'
    },
    bn: {
      title: 'শেয়ার করার জন্য দ্রুত আকীদাগত বেনিফিট কার্ড',
      shortTitle: 'বেনিফিট কার্ড',
      subtitle: 'সোশ্যাল মিডিয়ায় দ্রুত শেয়ার করার উপযোগী ঈমানী মূলনীতি',
      badge: 'দ্রুত বেনিফিট'
    },
    ms: {
      title: 'Kad Faedah Akidah Ringkas untuk Dikongsi',
      shortTitle: 'Kad Faedah',
      subtitle: 'Prinsip iman ringkas yang direka untuk dikongsi',
      badge: 'Faedah Ringkas'
    },
    de: {
      title: 'Kurze Glaubenskarten zum Teilen',
      shortTitle: 'Glaubenskarten',
      subtitle: 'Prägnante Glaubensgrundsätze zum schnellen Teilen',
      badge: 'Kurzer Nutzen'
    },
    es: {
      title: 'Tarjetas Rápidas de Beneficios del Credo para Compartir',
      shortTitle: 'Tarjetas de Beneficios',
      subtitle: 'Principios concisos diseñados para compartir rápidamente',
      badge: 'Beneficios Rápidos'
    }
  }
};

export const QUICK_CARD_TRANSLATIONS: Record<string, Record<string, Partial<AqeedahQuickCard>>> = {
  'card-usool-1': {
    en: {
      title: '1st Foundation: Sincerity in Religion',
      badge: 'Six Foundations - Ibn Baz',
      text: '“Unquestionably, for Allah is the pure religion.” Tawheed is singling out Allah alone in supplication, hope, and vows. Directing these to the deceased is polytheism, not respect.',
      authorOrSource: 'Explanation of Six Foundations by Sheikh Ibn Baz'
    },
    fr: {
      title: '1er Principe: La Sincérité dans la Religion',
      badge: 'Six Principes - Ibn Baz',
      text: 'Le Tawhid consiste à vouer l’adoration exclusivement à Allah. Diriger les invocations aux morts est une association (Shirk).',
      authorOrSource: 'Explication des Six Principes par Cheikh Ibn Baz'
    }
  },
  'card-usool-2': {
    en: {
      title: '2nd Foundation: Holding Fast to Unity',
      badge: 'Six Foundations - Ibn Baz',
      text: 'The commanded unity is uniting upon the Book of Allah and the Sunnah of His Messenger ﷺ. Division and sectarianism ruin the strength of Muslims.',
      authorOrSource: 'Explanation of Six Foundations by Sheikh Ibn Baz'
    },
    fr: {
      title: '2ème Principe: L’Unité des Musulmans',
      badge: 'Six Principes - Ibn Baz',
      text: 'L’union ordonnée est le rassemblement autour du Livre d’Allah et de la Sunnah. Les divisions affaiblissent les musulmans.',
      authorOrSource: 'Explication des Six Principes par Cheikh Ibn Baz'
    }
  },
  'card-usool-3': {
    en: {
      title: '3rd Foundation: Listening and Obeying',
      badge: 'Six Foundations - Ibn Baz',
      text: 'Obeying Muslim rulers in good deeds ensures safety and prevents bloodshed. Gentle advice in private and praying for their guidance is the way of the Salaf.',
      authorOrSource: 'Explanation of Six Foundations by Sheikh Ibn Baz'
    }
  },
  'card-1': {
    en: {
      title: 'Golden Rule in Divine Attributes',
      badge: 'Creed Principle',
      text: 'We affirm for Allah what He affirmed for Himself in His Book and upon the tongue of His Messenger ﷺ without distorting, denying, questioning how, or resembling: “There is nothing like unto Him, and He is the Hearing, the Seeing.”',
      authorOrSource: 'Consensus of Ahlus-Sunnah wal-Jamaah'
    },
    fr: {
      title: 'Règle d’Or sur les Attributs Divins',
      badge: 'Règle de Foi',
      text: 'Nous affirmons pour Allah ce qu’Il a affirmé pour Lui-même sans altération, ni reniement, ni comparaison: «Il n’y a rien qui Lui ressemble; et C’est Lui l’Audient, le Clairvoyant».',
      authorOrSource: 'Consensus d’Ahlus-Sunnah'
    }
  },
  'card-2': {
    en: {
      title: 'Secret of Peace of Mind',
      badge: 'Fruit of Faith in Qadar',
      text: 'What has reached you was never meant to miss you, and what missed you was never meant to reach you. The pens have been lifted and pages dried. Rest assured, Allah’s decree is good for you.',
      authorOrSource: 'Prophetic Hadith'
    },
    fr: {
      title: 'Secret de la Sérénité',
      badge: 'Foi au Destin',
      text: 'Ce qui t’est destiné ne manquait pas de t’atteindre. Les plumes se sont levées et les pages ont séché. Sois rassuré, tout décret d’Allah est un bien.',
      authorOrSource: 'Hadith du Prophète'
    }
  },
  'card-3': {
    en: {
      title: 'Shield Against Shirk',
      badge: 'Prophetic Dua',
      text: '“O Allah, I seek refuge in You from knowingly associating anything with You, and I ask Your forgiveness for that which I do not know.” Recite it daily to protect your monotheism.',
      authorOrSource: 'Al-Adab Al-Mufrad by Al-Bukhari'
    }
  },
  'card-4': {
    en: {
      title: 'Two Conditions for Acceptance of Deeds',
      badge: 'Pillars of Worship',
      text: 'Allah accepts no deed unless two conditions are met: Complete sincerity for Allah alone without ostentation, and complete compliance with the guidance of the Prophet ﷺ without innovation.',
      authorOrSource: 'Tafsir Ibn Kathir (Surah Al-Kahf: 110)'
    }
  },
  'card-5': {
    en: {
      title: 'True Reliance upon Allah (Tawakkul)',
      badge: 'Understanding Tawakkul',
      text: 'Tawakkul is the action of the heart, while taking means is the action of the limbs. A believer pursues all permissible means while trusting only in the Lord of all means.',
      authorOrSource: 'Imam Ahmad ibn Hanbal'
    }
  },
  'card-6': {
    en: {
      title: 'Overcoming Satanic Whispers (Waswas)',
      badge: 'Firmness of Heart',
      text: 'When whispered doubts attack your faith: immediately seek refuge in Allah, stop dwelling on them, say “I believe in Allah and His Messengers”, and know that hating the whisper is pure faith.',
      authorOrSource: 'Sahih Muslim'
    }
  },
  'card-7': {
    en: {
      title: 'The Greatness of Allah’s Name Al-Lateef',
      badge: 'Knowing Allah',
      text: 'Al-Lateef (The Subtle, The Most Gentle), when He wills to save you, directs causes from where you never expect; turning a prison into a kingdom and the river into a rescue for an infant. Trust His gentle kindness.',
      authorOrSource: 'Ibn Al-Qayyim'
    }
  },
  'card-8': {
    en: {
      title: 'Ark of Salvation',
      badge: 'Gems of Salaf',
      text: '“The Sunnah is Noah’s Ark; whoever embarks upon it is saved, and whoever stays behind drowns.” Holding fast to the way of the Prophet ﷺ and his Companions is safety in times of trials.',
      authorOrSource: 'Imam Malik ibn Anas'
    }
  }
};

export const SALAF_QUOTE_TRANSLATIONS: Record<string, Record<string, Partial<AqeedahSalafQuote>>> = {
  'quote-1': {
    en: {
      scholar: 'Imam Malik ibn Anas',
      title: 'How Allah Rose Over the Throne (Istawa)',
      era: 'Imam of Madinah',
      quote: 'Al-Istawa (rising over the Throne) is known, the manner of how is incomprehensible, believing in it is obligatory, and asking about its manner is an innovation.',
      context: 'When asked by a man how Allah rose over His Throne.',
      theme: 'Names & Attributes'
    },
    fr: {
      scholar: 'L’Imam Malik ibn Anas',
      title: 'L’Établissement sur le Trône (Istawa)',
      era: 'Imam de Médine',
      quote: 'L’Istawa est connu, le comment est inconcevable, y croire est obligatoire et questionner sur le comment est une innovation.',
      theme: 'Noms et Attributs'
    }
  },
  'quote-2': {
    en: {
      scholar: 'Imam Ahmad ibn Hanbal',
      title: 'Patience and Firmness in Sunnah',
      era: 'Imam of Ahlus-Sunnah',
      quote: 'Religion consists only of the Book of Allah, the Sunnah of His Messenger ﷺ, and the traditions of the Companions. Avoid innovations for every innovation is misguidance.',
      context: 'Stance during the trial of the creation of the Quran.',
      theme: 'Adhering to Sunnah'
    }
  },
  'quote-3': {
    en: {
      scholar: 'Fudayl ibn Iyad',
      title: 'Sincerity and Correctness of Deeds',
      era: 'Ascetic Scholar of Haramain',
      quote: 'Action must be sincere and correct. If it is sincere but not correct, it is not accepted; if correct but not sincere, it is not accepted—until it is both sincere (for Allah) and correct (upon Sunnah).',
      theme: 'Purification & Sincerity'
    }
  },
  'quote-4': {
    en: {
      scholar: 'Ibn Al-Qayyim Al-Jawziyyah',
      title: 'The Greatness of Tawheed in the Heart',
      era: 'Doctor of Hearts',
      quote: 'In the heart there is a loneliness that can only be removed by intimacy with Allah, a sadness that can only be relieved by the joy of knowing Him, and a poverty that can only be enriched by devotion to Him.',
      theme: 'Medicine of Hearts'
    }
  }
};

export function getLocalizedAqeedahCategory(catId: string, lang: string = 'ar') {
  if (lang === 'ar') return null;
  return CATEGORY_TRANSLATIONS[catId]?.[lang] || CATEGORY_TRANSLATIONS[catId]?.['en'] || null;
}

export function getLocalizedAqeedahQuickCard(card: AqeedahQuickCard, lang: string = 'ar'): AqeedahQuickCard {
  if (lang === 'ar') return card;
  const trans = QUICK_CARD_TRANSLATIONS[card.id]?.[lang] || QUICK_CARD_TRANSLATIONS[card.id]?.['en'];
  if (!trans) return card;
  return {
    ...card,
    title: trans.title || card.title,
    badge: trans.badge || card.badge,
    text: trans.text || card.text,
    authorOrSource: trans.authorOrSource || card.authorOrSource
  };
}

export function getLocalizedAqeedahSalafQuote(quote: AqeedahSalafQuote, lang: string = 'ar'): AqeedahSalafQuote {
  if (lang === 'ar') return quote;
  const trans = SALAF_QUOTE_TRANSLATIONS[quote.id]?.[lang] || SALAF_QUOTE_TRANSLATIONS[quote.id]?.['en'];
  if (!trans) return quote;
  return {
    ...quote,
    scholar: trans.scholar || quote.scholar,
    title: trans.title || quote.title,
    era: trans.era || quote.era,
    quote: trans.quote || quote.quote,
    context: trans.context || quote.context,
    theme: trans.theme || quote.theme
  };
}

export function getLocalizedAqeedahArticle(article: AqeedahArticle, lang: string = 'ar'): AqeedahArticle {
  if (lang === 'ar') return article;
  
  // Provide English / French localized titles for core article categories if lang !== 'ar'
  const categoryTrans = CATEGORY_TRANSLATIONS[article.category]?.[lang] || CATEGORY_TRANSLATIONS[article.category]?.['en'];
  const subTitle = categoryTrans?.shortTitle || article.subCategoryTitle;

  return {
    ...article,
    subCategoryTitle: subTitle
  };
}
