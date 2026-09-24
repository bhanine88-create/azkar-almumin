// Builds the Arabic (RTL) delivery report as a .docx.
//
// RTL in Word is two separate switches and both are needed: `bidirectional` on
// the paragraph (w:bidi — puts the text flow right-to-left) and `rightToLeft`
// on every run (w:rtl — makes Word pick the complex-script font and shape the
// Arabic). Setting only the paragraph leaves the letters unjoined and the
// punctuation on the wrong side.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, TabStopType,
} = require('docx');

const FONT = 'Segoe UI';
const GREEN = '0B3B2A';
const TEAL = '0D9488';
const GREY = '5A6B72';

// A4 content width: 11906 DXA page - 2 x 1440 margin.
const CONTENT_W = 9026;

/** An RTL paragraph of plain text. */
function p(text, opts = {}) {
  const { bold = false, size = 22, color, spacingAfter = 140, align } = opts;
  return new Paragraph({
    bidirectional: true,
    alignment: align || AlignmentType.RIGHT,
    spacing: { after: spacingAfter, line: 320 },
    children: [new TextRun({ text, bold, size, color, font: FONT, rightToLeft: true })],
  });
}

/** An RTL paragraph built from [text, bold?] fragments, for inline emphasis. */
function rich(parts, opts = {}) {
  const { size = 22, spacingAfter = 140 } = opts;
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: spacingAfter, line: 320 },
    children: parts.map(
      ([text, bold]) => new TextRun({ text, bold: !!bold, size, font: FONT, rightToLeft: true })
    ),
  });
}

function h1(text) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, bold: true, size: 30, color: GREEN, font: FONT, rightToLeft: true })],
  });
}

function h2(text) {
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 140 },
    children: [new TextRun({ text, bold: true, size: 25, color: TEAL, font: FONT, rightToLeft: true })],
  });
}

function bullet(text, opts = {}) {
  const parts = Array.isArray(text) ? text : [[text, false]];
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    numbering: { reference: opts.numbered ? 'nums' : 'bullets', level: 0 },
    spacing: { after: 90, line: 310 },
    children: parts.map(
      ([t, b]) => new TextRun({ text: t, bold: !!b, size: 22, font: FONT, rightToLeft: true })
    ),
  });
}

/** Cell text — same dual RTL switches as a body paragraph. */
function cellText(text, { bold = false, color } = {}) {
  const parts = Array.isArray(text) ? text : [[text, bold]];
  return new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, after: 60, line: 290 },
    children: parts.map(
      ([t, b]) => new TextRun({ text: t, bold: !!b, size: 20, color, font: FONT, rightToLeft: true })
    ),
  });
}

/**
 * An RTL table. Column widths must be given on the table AND on every cell,
 * both in DXA, or Google Docs collapses the layout.
 */
function table(widths, headerRow, bodyRows) {
  const mkRow = (cells, isHeader) =>
    new TableRow({
      tableHeader: !!isHeader,
      children: cells.map(
        (c, i) =>
          new TableCell({
            width: { size: widths[i], type: WidthType.DXA },
            shading: isHeader
              ? { type: ShadingType.CLEAR, fill: GREEN, color: 'auto' }
              : { type: ShadingType.CLEAR, fill: i % 2 ? 'F4F7F6' : 'FFFFFF', color: 'auto' },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [cellText(c, isHeader ? { bold: true, color: 'FFFFFF' } : {})],
          })
      ),
    });

  return new Table({
    visuallyRightToLeft: true,
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'D3DEDA' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'D3DEDA' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'D3DEDA' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'D3DEDA' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D3DEDA' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'D3DEDA' },
    },
    rows: [mkRow(headerRow, true), ...bodyRows.map((r) => mkRow(r, false))],
  });
}

/** A thin rule under the title block, as a paragraph border. */
function rule() {
  return new Paragraph({
    bidirectional: true,
    spacing: { before: 40, after: 260 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 1 } },
    children: [new TextRun({ text: '', font: FONT })],
  });
}

const children = [
  // ---------- Title block ----------
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 60 },
    children: [
      new TextRun({ text: 'تقرير تسليم — تطبيق أذكار المؤمن', bold: true, size: 40, color: GREEN, font: FONT, rightToLeft: true }),
    ],
  }),
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 20 },
    children: [
      new TextRun({ text: 'Azkar Almumin  ·  Bouchta Hanine', size: 20, color: GREY, font: FONT, rightToLeft: false }),
    ],
  }),
  new Paragraph({
    bidirectional: true,
    alignment: AlignmentType.RIGHT,
    spacing: { after: 40 },
    children: [
      new TextRun({ text: '21 سبتمبر 2026', size: 20, color: GREY, font: FONT, rightToLeft: true }),
    ],
  }),
  rule(),

  p(
    'التطبيق جاهز للرفع على Google Play: حزمة نشر موقّعة (AAB) ونسخة تجربة (APK)، وأصول المتجر كاملة، مع إصلاح ستة أخطاء كانت ستصل إلى المستخدمين بعد النشر.',
    { size: 24, spacingAfter: 240 }
  ),

  // ---------- Deliverables ----------
  h1('محتويات التسليم'),
  table(
    [3500, 4126, 1400],
    ['الملف', 'الغرض', 'الحجم'],
    [
      ['حزمة النشر (AAB)', 'ترفع على Google Play — موقّعة', '8.0 م.ب'],
      ['نسخة التجربة (APK)', 'تُثبّت مباشرة على الهاتف للاختبار', '7.5 م.ب'],
      ['6 لقطات شاشة منسّقة', 'لصفحة التطبيق في المتجر (1080×1920)', '—'],
      ['لقطتان إضافيتان', 'بديلتان جاهزتان للاستبدال', '—'],
      ['أيقونة المتجر 512×512', 'مطلوبة من Play', '—'],
      ['الصورة الرئيسية 1024×500', 'مطلوبة من Play', '—'],
      ['دليل النشر خطوة بخطوة', 'نصوص المتجر وإجابات الاستمارات', '—'],
      ['مفتاح التوقيع وكلمة مروره', 'ملف حسّاس — سُلّم منفصلاً', '—'],
    ]
  ),
  p('Google Play لا يقبل ملف APK للنشر — فقط AAB. الـ APK للتجربة على الهاتف قبل الرفع.', {
    size: 20,
    color: GREY,
    spacingAfter: 200,
  }),

  // ---------- Offline ----------
  h1('تطبيق أصلي يعمل بدون إنترنت'),
  p('التطبيق الآن يحمل كل محتواه داخل الحزمة، فيفتح فوراً من أول تشغيل حتى لو كان الهاتف بلا شبكة، ولا يظهر فيه أي شريط متصفح أو عنوان.'),
  p('كان في النسخة السابقة تحويل ينقل التطبيق عند الإقلاع إلى خادم خارجي. وهذا كان يعني ثلاثة أمور:'),
  bullet('أول تشغيل بدون إنترنت = شاشة فارغة.'),
  bullet('توقف ميزات الهاتف الأصلية (الإشعارات، الاهتزاز، شريط الحالة) لأنها لا تعمل على خادم خارجي.'),
  bullet('زمن الإقلاع مرهون بسرعة الشبكة لا بسرعة الهاتف.'),
  p('أُزيل هذا الاعتماد بالكامل، والتطبيق لا يحتاج الإنترنت إلا لتحميل التلاوات الصوتية وتحديث مواقيت الصلاة.', {
    spacingAfter: 200,
  }),

  // ---------- OTA ----------
  h1('تحديث المحتوى دون إصدار نسخة جديدة'),
  p('أي تعديل على الواجهة أو المحتوى يصل للمستخدمين بمجرد نشره على الموقع، بلا رفع نسخة جديدة على المتجر وبلا انتظار مراجعة Google.'),
  p('التطبيق يفحص الموقع في الخلفية، وإن وجد تحديثاً نزّله (حجمه 4.6 م.ب) وطبّقه. ولو كان الملف الجديد معطوباً لأي سبب، يرجع التطبيق تلقائياً إلى النسخة المدمجة معه ولا يعيد محاولة تحميله — فلا يمكن لتحديث فاشل أن يعطّل التطبيق عند المستخدم.'),
  p('التحديث لا يُطبّق في منتصف الاستخدام: ينتظر حتى يتوقف الصوت ويفرغ المستخدم، فلا تُقطع تلاوة أو محاضرة جارية.'),
  p('يبقى إصدار نسخة جديدة على المتجر لازماً في حالات محدودة فقط: تغيير الأيقونة أو شاشة البداية، أو إضافة صلاحية جديدة، أو تحديث متطلبات Android.', {
    spacingAfter: 200,
  }),

  // ---------- Notifications ----------
  h1('الإشعارات والتنبيهات'),
  p('التطبيق يطلب إذن الإشعارات عند أول تشغيل، ويجدول تنبيهات الصلوات الخمس وأذكار الصباح والمساء وقيام الليل على مستوى نظام الهاتف — فتصل ولو كان التطبيق مغلقاً، وتُعاد جدولتها تلقائياً بعد إعادة تشغيل الهاتف.'),
  p('أُنشئت ثلاث قنوات إشعار منفصلة (الصلاة، الأذكار، التذكيرات) ليتمكّن المستخدم من إسكات نوع واحد دون البقية، مع أيقونة بيضاء واضحة في شريط الحالة ونغمة تنبيه.'),
  rich([
    ['للتحقق: ', false],
    ['الإعدادات ← الإشعارات والتنبيهات', true],
    ['، وفيها زرّا اختبار يرسلان إشعاراً خلال ثلاث ثوانٍ. يُفضّل تصغير التطبيق عند التجربة للتأكد من وصوله في الخلفية.', false],
  ]),
  p('ملاحظة تقنية تستحق الذكر: في Android 14 وما بعده لا تُمنح صلاحية المنبّهات الدقيقة تلقائياً، فيفتح التطبيق شاشة النظام لمنحها عند أول جدولة. إن رفضها المستخدم فستصل التنبيهات مع تأخير دقائق محتمل عن دقيقة الأذان.', {
    spacingAfter: 200,
  }),

  // ---------- Icon ----------
  h1('الأيقونة والهوية البصرية'),
  p('أُعيد بناء الأيقونة من الشعار الرسمي لتظهر كاملة دون قصّ على كل أشكال الأيقونات: المربعة، والدائرية، والمربعة المستديرة — وهي تختلف بين Samsung و Xiaomi و Pixel.'),
  p('المعيار الأصعب هو القناع الدائري، لأنه يقطع الأركان. قيست أقصى بُعد لأي نقطة من الشعار عن المركز فوُجد يتجاوز حدّ الأمان بقليل، فضُبط المقاس حتى استقر عند 97% من المساحة المأمونة: ممتلئ بصرياً وداخل الحدود بهامش آمن.'),
  p('وأُضيفت طبقة أحادية اللون تدعم الأيقونات المتوافقة مع ثيم الهاتف في Android 13 وما بعده، فيظهر الشعار منسجماً مع ألوان خلفية المستخدم.', {
    spacingAfter: 200,
  }),

  // ---------- Security ----------
  h1('الأمان'),
  p('مراجعة قواعد قاعدة البيانات كشفت ثغرتين حقيقيتين.'),
  rich([
    ['أولاً، كانت القواعد تبدأ بما يشبه منعاً شاملاً لكل شيء، لكنه في الحقيقة ', false],
    ['لا يمنع شيئاً', true],
    [' — فقاعدة البيانات تدمج القواعد ولا ترتّبها، فكان يعطي طمأنينة زائفة.', false],
  ]),
  rich([
    ['ثانياً، أربع مجموعات بيانات كانت ', false],
    ['مفتوحة للكتابة لأي حساب', true],
    ['، منها الإحصاءات العامة. أي أن أي شخص كان يستطيع تغيير الأرقام أو إغراق المشروع ببيانات وهمية تُحسب على فاتورة التطبيق. ولمّا تبيّن أن ثلاثاً منها لا يستخدمها التطبيق إطلاقاً، أُغلقت بالكامل، وحُصرت الرابعة على زيادة مقدارها واحد فقط.', false],
  ]),
  p('وعلى مستوى التطبيق نفسه:'),
  bullet('كل الاتصالات مشفّرة، والاتصال غير المشفّر ممنوع على مستوى النظام.'),
  bullet('النسخ الاحتياطي التلقائي إلى Google معطّل، لأنه كان سينسخ رموز دخول المستخدم خارج الهاتف.'),
  bullet([['التطبيق يطلب ', false], ['تسع صلاحيات فقط', true], ['، كلها مرتبطة بميزة يراها المستخدم، ولا يجمع معرّف إعلانات.', false]]),
  bullet('موقع المستخدم يُستخدم لحساب المواقيت والقبلة داخل الهاتف فقط، ولا يُرسل لأي خادم.'),

  // ---------- Performance ----------
  h1('الأداء'),
  rich([
    ['كان التطبيق يحمّل ', false],
    ['4.99 م.ب', true],
    [' من الملفات عند كل إقلاع، منها مكتبات لا تُستخدم إلا في شاشات لا يفتحها معظم المستخدمين — مكتبة الرسوم البيانية، وأدوات تصدير الصور، ومكتبة السحب والإفلات.', false],
  ]),
  p('بتتبّع ما يُحمّل فعلاً عند الإقلاع تبيّن أن السبب رابط واحد عابر بين ملفين، وقواعد تجميع مكتوبة يدوياً كانت تسحب ملفات غير لازمة إلى مسار الإقلاع.'),
  rich([
    ['النتيجة بعد الإصلاح: ', false],
    ['3.94 م.ب (انخفاض 21%)', true],
    [' وعشرة ملفات بدل سبعة عشر، دون أي زيادة في الحجم الكلي ودون حذف أي ميزة — المكتبات صارت تُحمّل عند فتح الشاشة التي تحتاجها.', false],
  ], { spacingAfter: 200 }),

  // ---------- Bugs ----------
  h1('أخطاء اكتُشفت وأُصلحت'),
  p('ستة أخطاء لم تكن معروفة قبل العمل، وكلّها كان سيظهر أثره للمستخدم بعد النشر لا قبله:'),
  table(
    [4300, 4726],
    ['الخطأ', 'أثره على المستخدم'],
    [
      ['ملف نغمة التنبيه غير موجود أصلاً، مع إحالة إليه في 13 موضعاً', 'تنبيهات الصلاة والأذكار صامتة تماماً'],
      ['أيقونة الإشعار تُحذف من الحزمة عند البناء', 'أيقونة مفقودة أو مربّع أبيض في شريط الحالة'],
      ['رسالة «الإشعارات محظورة في المتصفح» داخل التطبيق', 'تحذير أحمر كاذب وإرشادات لا تنطبق على تطبيق هاتف'],
      ['صلاحيات الموقع غير معرّفة في الحزمة', 'القبلة والمواقيت التلقائية تفشل بلا رسالة خطأ'],
      ['بصمة توقيع خاطئة في ملف التحقّق من الموقع', 'روابط الموقع تفتح في المتصفح لا في التطبيق'],
      ['تعارض في اسم الحزمة بين ملفين', 'اختلاف الهوية بين التطبيق والموقع'],
    ]
  ),
  rich([
    ['الخطأ الأول والثاني يستحقان وقفة: كلاهما ', false],
    ['لا يظهر أبداً عند البناء', true],
    [' — لا تحذير ولا خطأ — ولا يكتشفهما أحد إلا بفحص محتويات الحزمة النهائية بعد البناء، أو بشكوى مستخدم بعد النشر.', false],
  ]),
  p('وأُصلح أيضاً خطأ ظهر أثناء العمل: إعداد خاطئ لشاشة البداية جعل الشعار يبقى فوق التطبيق بلا اختفاء. اكتُشف عند التجربة وأُصلح بطبقتي حماية تمنعان تكراره.', {
    spacingAfter: 200,
  }),

  // ---------- Store assets ----------
  h1('أصول متجر Google Play'),
  rich([
    ['ستّ لقطات مأخوذة ', false],
    ['من التطبيق المركّب على الهاتف فعلاً', true],
    ['، لا من محاكاة ولا تصميم منفصل — وهذا شرط من شروط Play. ورتّبت بترتيب شريط التنقل في التطبيق، لتمشي مع الزائر كما يمشي فيه فعلاً:', false],
  ]),
  bullet('الرئيسية — «كل عبادتك في تطبيق واحد»', { numbered: true }),
  bullet('الأذكار — «أذكار الصباح والمساء»', { numbered: true }),
  bullet('القرآن — «المصحف الشريف كاملاً»', { numbered: true }),
  bullet('المكتبة — «مكتبة إسلامية شاملة»', { numbered: true }),
  bullet('المسبحة — «مسبحة إلكترونية ذكية»', { numbered: true }),
  bullet('الإعدادات — «تحكم كامل في تجربتك»', { numbered: true }),
  p('ومعها لقطتان بديلتان منسّقتان (مواقيت الصلاة، وأسماء الله الحسنى) يمكن استبدال أي لقطة بهما بلا أي إعادة عمل.'),
  p('وأُعدّت كذلك نصوص صفحة المتجر كاملة (العنوان، الوصف القصير، الوصف الكامل)، وإجابات جاهزة لاستمارة تصنيف المحتوى واستمارة أمان البيانات — وهما أكثر ما يتعطّل عليه النشر عادةً.', {
    spacingAfter: 200,
  }),

  // ---------- Remaining ----------
  h1('الخطوات المتبقية قبل النشر'),
  bullet('نشر النسخة الجديدة من الموقع — منه يقرأ التطبيق تحديثاته.'),
  bullet('إنشاء مستند الإحصاءات العامة مرة واحدة في لوحة Firebase.'),
  bullet('إنشاء التطبيق في Google Play Console ورفع ملف AAB.'),
  bullet('تعبئة بيانات المتجر والاستمارتين من دليل النشر المرفق.'),
  bullet('بعد الموافقة: إضافة بصمة توقيع Google إلى ملف التحقّق لتعمل روابط الموقع داخل التطبيق.'),

  h2('ملف التوقيع — تنبيه مهم'),
  p('أُنشئ مفتاح توقيع جديد باسم المطور، بتشفير RSA 4096 وصلاحية حتى عام 2061.'),
  rich([
    ['بما أن هذا ', false],
    ['أول إصدار', true],
    ['، فالمفتاح الذي يوقّع أول حزمة تُرفع يصبح مفتاح التطبيق الدائم. فقدانه بعد النشر يعني عدم القدرة على نشر أي تحديث لاحق، ويحتاج تدخلاً من دعم Google. ', false],
    ['يُحفظ الملف وكلمة مروره في مكان آمن خارج جهاز التطوير.', true],
  ]),
];

const doc = new Document({
  creator: 'Bouchta Hanine',
  title: 'تقرير تسليم — تطبيق أذكار المؤمن',
  description: 'تقرير تسليم تطبيق أذكار المؤمن لمتجر Google Play',
  styles: {
    default: {
      document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 320 } } },
    },
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { start: 480, hanging: 220 } } },
          },
        ],
      },
      {
        reference: 'nums',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1',
            alignment: AlignmentType.RIGHT,
            style: { paragraph: { indent: { start: 480, hanging: 220 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        bidi: true,
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2], buf);
  console.log('wrote', process.argv[2], buf.length, 'bytes');
});
