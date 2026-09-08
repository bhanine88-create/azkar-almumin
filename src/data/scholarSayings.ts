export interface ScholarSaying {
  id: string;
  text: string;
  category: 'scholars' | 'successors' | 'companions' | 'thinkers' | 'sages';
  scholarName: string;
  isPinned?: boolean;
}

export const SCHOLAR_SAYINGS: ScholarSaying[] = [
  // الحكماء (sages)
  { id: 'sage_luq1', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، إياك والدين، فإنه ذل بالنهار، وهم بالليل.', isPinned: true },
  { id: 'sage_luq2', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، إن الدنيا بحر عميق، وقد غرق فيها ناس كثير، فلتكن سفينتك فيها تقوى الله.' },
  { id: 'sage_luq3', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، إنك منذ نزلت إلى الدنيا استدبرتها واستقبلت الآخرة، فدار أنت إليها تسير أقرب من دار أنت عنها تباعد.' },
  { id: 'sage_luq4', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، جالس العلماء وزاحمهم بركبتيك، فإن الله يحيي القلوب بنور الحكمة كما يحيي الأرض الميتة بوابل السماء.' },
  { id: 'sage_luq5', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، قلل من الكلام، فإن الصمت زين، والسكوت نجاة.' },
  { id: 'sage_luq6', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، لا تشتكِ إلى الناس فتهون عليهم، ولكن اشتكِ إلى من يملك كشف ما بك.' },
  { id: 'sage_luq7', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، إن من الكلام ما هو أشد من الحجر، وأنفذ من ضرب الإبر، وأمر من الصبر.' },
  { id: 'sage_luq8', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، إذا أردت أن تؤاخي رجلاً فأغضبه قبل ذلك، فإن أنصفك في غضبه وإلا فاحذره.' },
  { id: 'sage_luq9', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، بادر بعملك قبل أن يقطع عليك، فإنه لا يدري أحدكم متى يعترضه أمر الله.' },
  { id: 'sage_luq10', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، لتكن كلمتك طيبة، ووجهك بسطاً، تكن أحب إلى الناس ممن يعطيهم الذهب والفضة.' },
  { id: 'sage_ahnaf1', scholarName: 'الأحنف بن قيس', category: 'sages', text: 'لا مروءة لكذوب، ولا راحة لحسود، ولا سؤدد لسيء الخلق.' },
  { id: 'sage_ahnaf2', scholarName: 'الأحنف بن قيس', category: 'sages', text: 'كثرة الضحك تذهب الهيبة، وكثرة المزاح تذهب المروءة.' },
  { id: 'sage_aktham1', scholarName: 'أكثم بن صيفي', category: 'sages', text: 'أفضل الأولاد البررة، وأفضل الأصحاب من لم يملّك عند الشدائد.' },
  { id: 'sage_aktham2', scholarName: 'أكثم بن صيفي', category: 'sages', text: 'قد يبلغ الصادق بصدقه ما لا يبلغه الكاذب باحتياله.' },
  { id: 'sage_aktham3', scholarName: 'أكثم بن صيفي', category: 'sages', text: 'آفة الرأي الهوى، والعجز مفتاح الفقر.' },
  { id: 'sage_sage1', scholarName: 'حكيم', category: 'sages', text: 'من عفا عن معتدٍ، كان له نصيبٌ من عدله.' },
  { id: 'sage_sage2', scholarName: 'حكيم', category: 'sages', text: 'إذا أقبلت الدنيا على المرء أعارته محاسن غيره، وإذا أدبرت عنه سلبته محاسن نفسه.' },
  { id: 'sage_sage3', scholarName: 'حكيم', category: 'sages', text: 'الصحة تاج على رؤوس الأصحاء لا يراه إلا المرضى.' },
  { id: 'sage_sage4', scholarName: 'حكيم', category: 'sages', text: 'الوقت كالسيف، إن لم تقطعه قطعك.' },

  // الصحابة (comapnions)
  { id: 'comp1', scholarName: 'أبو بكر الصديق', category: 'companions', text: 'احرص على الموت توهب لك الحياة.' },
  { id: 'comp2', scholarName: 'عمر بن الخطاب', category: 'companions', text: 'نحن قوم أعزنا الله بالإسلام، فمهما ابتغينا العزة في غيره أذلنا الله.' },
  { id: 'comp3', scholarName: 'عثمان بن عفان', category: 'companions', text: 'لو طهرت قلوبكم ما شبعتم من كلام ربكم.' },
  { id: 'comp4', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'الناس أعداء ما جهلوا.' },
  { id: 'comp_ali2', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'عظمت الخالق عندك تصغر المخلوق في عينك.' },
  { id: 'comp_ali3', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'من نصب نفسه للناس إماماً، فليبدأ بتعليم نفسه قبل تعليم غيره.' },
  { id: 'comp_ali4', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'الدنيا دار ممر لا دار مقر، والناس فيها رجلان: رجل باع نفسه فأوبقها، ورجل اشتاق لنفسه فأعتقها.' },
  { id: 'comp_ali5', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'كفى بالتجارب مؤدباً، وبتقوى الله معتصماً.' },
  { id: 'comp_ali6', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'أفضل الزهد إخفاء الزهد.' },
  { id: 'comp_ali7', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'ثمرة التفريط الندامة، وثمرة الحزم السلامة.' },
  { id: 'comp5', scholarName: 'عبد الله بن مسعود', category: 'companions', text: 'من كان متأسياً فليتأس بمن قد مات، فإن الحي لا تؤمن عليه الفتنة.' },
  { id: 'comp_abb1', scholarName: 'عبد الله بن عباس', category: 'companions', text: 'العلم أكثر من أن يحاط به، فخذوا من كل شيء أحسنه.' },
  { id: 'comp_abb2', scholarName: 'عبد الله بن عباس', category: 'companions', text: 'صاحب المعروف لا يقع، فإذا وقع وجد متكأ.' },
  { id: 'comp_hur1', scholarName: 'أبو هريرة', category: 'companions', text: 'أشد الناس عذاباً يوم القيامة عالم لم ينفعه الله بعلمه.' },
  { id: 'comp_khalid1', scholarName: 'خالد بن الوليد', category: 'companions', text: 'فلا نامت أعين الجبناء.' },
  { id: 'comp_muadh1', scholarName: 'معاذ بن جبل', category: 'companions', text: 'يا ابن آدم، إنك محتاج إلى نصيبك من الدنيا، وأنت إلى نصيبك من الآخرة أحوج.' },
  { id: 'comp_muadh2', scholarName: 'معاذ بن جبل', category: 'companions', text: 'تعلموا العلم فإن تعلمه لله خشية، وطلبه عبادة، ومذاكرته تسبيح، والبحث عنه جهاد.' },
  { id: 'comp_ali8', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'لسان العاقل وراء قلبه، وقلب الأحمق وراء لسانه.' },
  { id: 'comp_umr2', scholarName: 'عمر بن الخطاب', category: 'companions', text: 'أحب الناس إلي من أهدى إلي عيوبي.' },
  { id: 'comp_umr3', scholarName: 'عمر بن الخطاب', category: 'companions', text: 'لا تغرنكم طنطنة الرجل بصلاته وصيامه، ولكن انظروا إلى صدقه إذا حدث، وأمانته إذا اؤتمن، وورعه إذا أشفى.' },

  // التابعون (successors)
  { id: 'hb1', scholarName: 'الحسن البصري', category: 'successors', text: 'يا ابن آدم، إنما أنت أيام، فإذا ذهب يوم ذهب بعضك.' },
  { id: 'hb2', scholarName: 'الحسن البصري', category: 'successors', text: 'من خاف الله أخاف الله منه كل شيء، ومن خاف الناس أخافه الله من كل شيء.' },
  { id: 'hb3', scholarName: 'الحسن البصري', category: 'successors', text: 'المؤمن في الدنيا كالغريب، لا يجزع من ذلها ولا ينافس في عزها، له شأن وللناس شأن.' },
  { id: 'hb4', scholarName: 'الحسن البصري', category: 'successors', text: 'استكثروا من الأصدقاء المؤمنين فإن لهم شفاعة يوم القيامة.' },
  { id: 'st1', scholarName: 'سفيان الثوري', category: 'successors', text: 'ما عالجت شيئاً أشد علي من نيتي، إنها تتقلب علي.' },
  { id: 'st2', scholarName: 'سفيان الثوري', category: 'successors', text: 'عليك بالزهد يفتح الله لك بصرك.' },

  // العلماء والدعاة (scholars)
  { id: 'iq1', scholarName: 'ابن القيم', category: 'scholars', text: 'القلب يمرض كما يمرض البدن، وشفاؤه في التوبة والحمية، ويصدأ كما تصدأ المرأة، وجلاؤه بالذكر.' },
  { id: 'iq2', scholarName: 'ابن القيم', category: 'scholars', text: 'لو علم المتصدق أن صدقته تقع في يد الله قبل يد الفقير، لكانت لذة المعطي أكبر من لذة الآخذ.' },
  { id: 'iq3', scholarName: 'ابن القيم', category: 'scholars', text: 'من أراد انشراح الصدر وغفران الذنب وتفريج الكرب وذهاب الهم فليكثر من الصلاة على النبي ﷺ.' },
  { id: 'iq4', scholarName: 'ابن القيم', category: 'scholars', text: 'الرضا باب الله الأعظم، وجنة الدنيا، ومستراح العابدين، وقرة عين المشتاقين.' },
  { id: 'iq5', scholarName: 'ابن القيم', category: 'scholars', text: 'قبيح بالعبد أن يقول بلسانه الله أكبر وقد امتلأ قلبه بغير الله، فمن كان في قلبه شيء أكبر من الله فقد كذب في قوله الله أكبر وإن صدق في نطقه.' },
  { id: 'it1', scholarName: 'ابن تيمية', category: 'scholars', text: 'إن في الدنيا جنة من لم يدخلها لا يدخل جنة الآخرة، وهي ذكر الله وطاعته ومحبته.' },
  { id: 'it2', scholarName: 'ابن تيمية', category: 'scholars', text: 'ما يصنع أعدائي بي؟ أنا جنتي وبستاني في صدري؛ إن رحت فهي معي لا تفارقني.' },
  { id: 'it3', scholarName: 'ابن تيمية', category: 'scholars', text: 'الذكر للقلب مثل الماء للسمك، فكيف يكون حال السمك إذا فارق الماء؟' },
  { id: 'it4', scholarName: 'ابن تيمية', category: 'scholars', text: 'القلوب الصادقة والأدعية الصالحة هي العسكر الذي لا يغلب.' },
  { id: 'sh1', scholarName: 'الإمام الشافعي', category: 'scholars', text: 'إذا تخلى الناس عنك في كرب، فاعلم أن الله يريد أن يتولى أمرك، وكفى بالله وكيلاً.' },
  { id: 'sh2', scholarName: 'الإمام الشافعي', category: 'scholars', text: 'ما جادلت أحداً إلا تمنيت أن يظهر الله الحق على لسانه.' },
  { id: 'sh3', scholarName: 'الإمام الشافعي', category: 'scholars', text: 'العلم ما نفع، ليس العلم ما حُفظ.' },
  { id: 'jaw1', scholarName: 'ابن الجوزي', category: 'scholars', text: 'اعلم أن الزمان لا يثبت على حال، والمغبون من شغل عمره بما لا ينفعه.' },
  { id: 'jaw2', scholarName: 'ابن الجوزي', category: 'scholars', text: 'ما يزال التغافل عن الزلات من أرقى شيم الكرام.' },
  { id: 'barr1', scholarName: 'ابن عبد البر', category: 'scholars', text: 'ليس شيء أدل على عقل الرجل من حسن سؤاله وصمته.' },
  { id: 'khatib1', scholarName: 'الخطيب البغدادي', category: 'scholars', text: 'العلم يَهْتِفُ بِالعَمَلِ، فَإِنْ أَجَابَهُ وَإِلَّا ارْتَحَلَ.' },
  { id: 'ghaz1', scholarName: 'أبو حامد الغزالي', category: 'scholars', text: 'حقيقة الصبر هي ثبات باعث الدين في مقابلة باعث الهوى.' },
  { id: 'ghaz2', scholarName: 'أبو حامد الغزالي', category: 'scholars', text: 'القلب كالمرآة، والشهوات كالصدأ الذي يتراكم عليها فيمنعها من رؤية الحقائق.' },
  { id: 'jil1', scholarName: 'عبد القادر الجيلاني', category: 'scholars', text: 'لا تكن عبداً لله في الظاهر، وعبداً للمخلوقين في الباطن.' },
  { id: 'rushd1', scholarName: 'ابن رشد', category: 'scholars', text: 'الجهل يؤدي إلى الخوف، والخوف يؤدي إلى الكراهية، والكراهية تؤدي إلى العنف، هذه هي المعادلة.' },
  { id: 'razi1', scholarName: 'فخر الدين الرازي', category: 'scholars', text: 'من أعظم أسباب سعادة المرء أن يعلم أن كماله ليس في ماله ولا في جاهه بل في علمه وعقله.' },
  { id: 'salam1', scholarName: 'عز الدين بن عبد السلام', category: 'scholars', text: 'أفضل العبادات ما كان أكثرها نفعاً لخلق الله.' },
  { id: 'suhr1', scholarName: 'شهاب الدين السهروردي', category: 'scholars', text: 'المعرفة نور يقذفه الله في القلب لا يناله المرء بمجرد التمني بل بصفاء الروح.' },
  { id: 'rash1', scholarName: 'ابن رشيق القيرواني', category: 'scholars', text: 'الكلام إذا خرج من القلب وقع في القلب، وإذا خرج من اللسان لم يجاوز الآذان.' },
  { id: 'maar1', scholarName: 'أبو العلاء المعري', category: 'scholars', text: 'تعبٌ كلّها الحَياةُ فَما أعْـجَبُ إلا من راغِبٍ في ازْديادِ.' },
  { id: 'tahzan1', scholarName: 'لا تحزن', category: 'scholars', text: 'عش يومك، ولا تحزن على ما فاتك، فإن الماضي لا يعود، والمستقبل غيب.' },
  { id: 'tahzan2', scholarName: 'لا تحزن', category: 'scholars', text: 'ما أصابك لم يكن ليخطئك، وما أخطأك لم يكن ليصيبك.' },
  { id: 'tahzan3', scholarName: 'لا تحزن', category: 'scholars', text: 'إذا أغلقت دونك الأبواب، وأوصدت دونك السبل، فقل: يا الله.' },
  { id: 'tahzan4', scholarName: 'لا تحزن', category: 'scholars', text: 'البلاء سنة الله في خلقه، وإنما يبتلي الله عبده ليختبر صبره ويرفع درجته.' },
  { id: 'tahzan5', scholarName: 'لا تحزن', category: 'scholars', text: 'اغسل قلبك بدموع التوبة، وأطفئ نار الخطيئة بماء الاستغفار.' },
  { id: 'tahzan_masry1', scholarName: 'محمود المصري', category: 'scholars', text: 'لا تحزن وابتسم للحياة، فكل عسر بعده يسر، وكل ضيق يعقبه فرج من الله.' },
  { id: 'tahzan_masry2', scholarName: 'محمود المصري', category: 'scholars', text: 'الابتسامة في وجه أخيك صدقة، وفي وجه المحن يقين بأن الله سيعوضك خيراً عما فقدت.' },
  { id: 'tahzan_masry3', scholarName: 'محمود المصري', category: 'scholars', text: 'كم من محنة في طياتها منحة، وكم من بلاء كان سبباً في قربك من رب السماء.' },
  { id: 'tahzan_masry4', scholarName: 'محمود المصري', category: 'scholars', text: 'لا تدع قطار الأحزان يدهس لحظات عمرك الجميلة، تذكر نعم الله عليك وابتسم.' },
  { id: 'tahzan_masry5', scholarName: 'محمود المصري', category: 'scholars', text: 'إذا تكالبت عليك الهموم فقل: يا حي يا قيوم برحمتك أستغيث، فإنه سبحانه لا يخيب من رجاه.' },

  // المفكرون والشعراء (thinkers)
  { id: 'adham1', scholarName: 'أدهم شرقاوي', category: 'thinkers', text: 'النهايات السعيدة لا تأتي صدفة، بل يصنعها الله لمن صبروا طويلاً.' },
  { id: 'adham2', scholarName: 'أدهم شرقاوي', category: 'thinkers', text: 'نحن لا ننسى... نحن فقط نعتاد غيابهم نعطيهم حجمهم الطبيعي في الذاكرة.' },
  { id: 'adham3', scholarName: 'أدهم شرقاوي', category: 'thinkers', text: 'الله لا يبتليك بشيء إلا وبه خيراً لك، حتى وإن ظننت العكس.' },
  { id: 'adham4', scholarName: 'أدهم شرقاوي', category: 'thinkers', text: 'في جبر الخواطر رسالة خفية مفادها: أنا أشعر بك، لست وحدك.' },
  { id: 'adham6', scholarName: 'أدهم شرقاوي', category: 'thinkers', text: 'سلامٌ على الذين يزهرون فينا كلما ذبلنا.' },
  { id: 'omari1', scholarName: 'أحمد خيري العمري', category: 'thinkers', text: 'العبادات ليست مجرد طقوس، بل هي إعادة شحن للروح لمواجهة معارك الحياة.' },
  { id: 'omari2', scholarName: 'أحمد خيري العمري', category: 'thinkers', text: 'القرآن لا يقدم أجوبة جاهزة، بل يقدم طريقاً للبحث عن الأجوبة.' },
  { id: 'omari3', scholarName: 'أحمد خيري العمري', category: 'thinkers', text: 'إننا نحتاج إلى تدين يجعلنا أكثر إنسانية، لا إلى تدين يجعلنا أكثر قسوة.' },
  { id: 'rumaih1', scholarName: 'نواضر الرميح', category: 'thinkers', text: 'كن أنت التغيير الذي تريد أن تراه في العالم، وابدأ بقلبك أولاً.' },
  { id: 'rumaih2', scholarName: 'نواضر الرميح', category: 'thinkers', text: 'النوافذ التي تفتحها لله، لا يغلقها أحد.' },
  { id: 'tarif1', scholarName: 'عمر طريف', category: 'thinkers', text: 'ليست العبرة بالبدايات، بل بجميل النهايات والثبات على الحق.' },
  { id: 'tarif2', scholarName: 'عمر طريف', category: 'thinkers', text: 'كن غيمًا يمر، ليمطر أثرًا طيبًا في قلوب البشر.' },
  { id: 'latif1', scholarName: 'أحمد عبد اللطيف', category: 'thinkers', text: 'الكتابة هي محاولة لفهم الفوضى في الداخل، وترتيب شتات النفس.' },
  { id: 'latif2', scholarName: 'أحمد عبد اللطيف', category: 'thinkers', text: 'العزلة ليست هروباً، بل هي عودة للذات لإعادة ترتيب الأولويات.' },
  { id: 'atar1', scholarName: 'إبراهيم العتر', category: 'thinkers', text: 'الأمل نبات ينمو في تربة الصبر، ويسقى بماء اليقين.' },
  { id: 'atar2', scholarName: 'إبراهيم العتر', category: 'thinkers', text: 'اليقين هو أن تشعر بنور الله في قلبك، رغم شدة الظلام حولك.' },
  { id: 'thinker_gen1', scholarName: 'أدهم شرقاوي', category: 'thinkers', text: 'العشيرة الحقيقية هي تلك القلوب التي تحيط بنا لا التي تجمعنا بها رابطة دم فقط.' },
  { id: 'thinker_gen2', scholarName: 'أحمد خيري العمري', category: 'thinkers', text: 'الإيمان ليس فكرة نعتنقها، بل هو أسلوب حياة نمارسه في كل لحظة.' },

  // إضافات جديدة مميزة (New additions for all categories)
  
  // الحكماء (sages)
  { id: 'sage_luq11', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، عليك بمجالسة الصالحين، فإنهم كحامل المسك؛ إن لم يصيبك من عطرهم، نالك من ريحهم الطيب.' },
  { id: 'sage_ahnaf3', scholarName: 'الأحنف بن قيس', category: 'sages', text: 'ثلاثة لا يعرفون إلا عند ثلاثة: الحليم عند الغضب، والشجاع عند الحرب، والصديق عند الحاجة والشدة.' },
  { id: 'sage_extra1', scholarName: 'حكيم', category: 'sages', text: 'جمال الجسد يذوي ويزول مع السنين، أما جمال النفس والروح والقلب فيزداد نضارة وإشراقاً كلما طال به العمر.' },
  { id: 'sage_extra2', scholarName: 'حكيم', category: 'sages', text: 'أعظم الكرامة حفظ الأمانة، وأجمل الشيم الوفاء بالعهود، وأعلى مراتب النبل كتمان الأسرار وستر العيوب.' },
  { id: 'sage_extra3', scholarName: 'حكيم سلفي', category: 'sages', text: 'من أصلح ما بينه وبين الله، كفاه الله ما بينه وبين الناس، ومن أصلح سريرته أصلح الله علانيته.' },

  // الصحابة (companions)
  { id: 'comp_umr4', scholarName: 'عمر بن الخطاب', category: 'companions', text: 'اعتزل ما يؤذيك، وعليك بالخليل الصالح وقلّما تجده، وشاور في أمرك الذين يخافون الله تعالى.' },
  { id: 'comp_ali9', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'ليس اليتيم من مات والده، إن اليتيم يتيم العلم والأدب والأخلاق الكريمة.' },
  { id: 'comp_masud2', scholarName: 'عبد الله بن مسعود', category: 'companions', text: 'إنكم في ممر الليل والنهار، في آجال منقوصة، وأعمال محفوظة، والموت يأتيكم بغتة.' },
  { id: 'comp_bakr2', scholarName: 'أبو بكر الصديق', category: 'companions', text: 'إن الله تعالى قرن وعده بوعيده؛ ليكون العبد دائماً راغباً راهباً يرجو رحمته ويخاف عذابه.' },
  { id: 'comp_salman1', scholarName: 'سلمان الفارسي', category: 'companions', text: 'أضحكني ثلاث وأبكاني ثلاث: أضحكني مؤمل الدنيا والموت يطلبه، وغافل لا يغفل عنه، وضاحك بملء فيه ولا يدري أسخط ربه أم أرضاه.' },

  // التابعون (successors)
  { id: 'hb5', scholarName: 'الحسن البصري', category: 'successors', text: 'مصاحبة الأشرار ومجالستهم توجب سوء الظن بالأخيار، فاحذر من تصاحب في دينك ودنياك.' },
  { id: 'hb6', scholarName: 'الحسن البصري', category: 'successors', text: 'الدنيا دار عمل وجهاد؛ من زرع فيها خيراً حصد كرامة وجنة، ومن زرع فيها شراً حصد ندامة وبؤساً.' },
  { id: 'st3', scholarName: 'سفيان الثوري', category: 'successors', text: 'الزهد في الدنيا هو الزهد في الخلق وفي ثنائهم، وأول ذلك أن تزهد في مدح نفسك وتنقيتها.' },
  { id: 'umar_aziz1', scholarName: 'عمر بن عبد العزيز', category: 'successors', text: 'من جعل دينه وعقيدته غرضاً للخصومات والجدل الجوفاء أكثر التنقل والاضطراب.' },
  { id: 'umar_aziz2', scholarName: 'عمر بن عبد العزيز', category: 'successors', text: 'أصلحوا آخرتكم تصلح لكم دنياكم، وأصلحوا سرائركم تصلح لكم علانيتكم ومحبتكم في قلوب الخلق.' },

  // العلماء (scholars)
  { id: 'iq6', scholarName: 'ابن القيم', category: 'scholars', text: 'الذنوب والمعاصي جراحات في القلوب والنفوس، ورب جرح من ذنب عابر وقع في مقتل فدمّر صاحبه.' },
  { id: 'iq7', scholarName: 'ابن القيم', category: 'scholars', text: 'إذا أحب الله عبداً اصطنعه لنفسه، واجتباه لمحبته، وشغل لسانه بذكره، وجوارحه بخدمته وطاعته.' },
  { id: 'sh4', scholarName: 'الإمام الشافعي', category: 'scholars', text: 'نعيب زماننا والعيب فينا، وما لزماننا عيبٌ سوانا، ونهجو ذا الزمان بغير ذنبٍ ولو نطق الزمان لنا هجانا.' },
  { id: 'jaw3', scholarName: 'ابن الجوزي', category: 'scholars', text: 'الدنيا دار عبور ومجاز لا دار استقرار وإقامة، فاجعل همك ونظرك فيها كمسافر استظل تحت شجرة ثم راح وتركها.' },
  { id: 'ghaz3', scholarName: 'أبو حامد الغزالي', category: 'scholars', text: 'من لم ينظر في عيوب نفسه ويسعى لعلاجها، لم يدرك حقيقة النقص فيها، وكان غروره حاجزاً عظيماً بينه وبين الكمال والرفعة.' },

  // المفكرون (thinkers)
  { id: 'rafii1', scholarName: 'مصطفى صادق الرافعي', category: 'thinkers', text: 'إذا لم تزد شيئاً على هذه الدنيا بجهدك وعلمك وأثرك، كنت أنت زائداً وعبئاً ثقيلاً عليها.' },
  { id: 'm_mahmoud1', scholarName: 'مصطفى محمود', category: 'thinkers', text: 'إنما نعيش لنهتدي ونكتشف أنفسنا، والرحلة الحقيقية المثمرة في هذا الوجود هي رحلة الروح للتقرب من خالقها سبحانه.' },
  { id: 'tantawi1', scholarName: 'علي الطنطاوي', category: 'thinkers', text: 'الحياة قطار سريع للغاية، يمر بنا في محطات السعادة والألم، والمؤمن الواثق بربه هو من يرى يد الرحمة الإلهية تقود خطاه دائماً.' },
  { id: 'babi1', scholarName: 'مالك بن نبي', category: 'thinkers', text: 'إن الحضارة والمجتمعات الراقية لا تبنى بالآلات المادية والمباني الفارهة فحسب، بل تبنى بالإنسان الصالح الحامل للقيم والمبادئ أولاً.' },

  // دفعة إضافية من الأقوال العصرية والعميقة لتثري التطبيق (More inspiring and deep sayings for all categories)
  
  // الحكماء (sages)
  { id: 'sage_luq12', scholarName: 'لقمان الحكيم', category: 'sages', text: 'يا بني، إن الدنيا بحر عميق، وقد غرق فيه ناس كثير، فلتكن سفينتك فيه تقوى الله، وحشوك فيه الإيمان، وشراعك فيه التوكل على الله.' },
  { id: 'sage_extra4', scholarName: 'حكيم سلفي', category: 'sages', text: 'تمنّى الصالحون السكوت هيبةً من زلل الكلام، وتمنّوا القناعة راحةً من هموم الدنيا، وتمنّوا الرضا بابًا للسلام الداخلي.' },
  { id: 'sage_extra5', scholarName: 'حكيم', category: 'sages', text: 'لا يعاب المرء على فقره أو بساطة معيشته، ولكن يعاب على قبح لسانه وفساد طويته وضيق صدره بفضل ربه.' },
  { id: 'sage_fudayl1', scholarName: 'الفضيل بن عياض', category: 'sages', text: 'من أحب أن يُذكر لم يُذكر، ومن كره أن يُذكر ذُكر وارتفع شأنه في قلوب الصادقين.' },
  { id: 'sage_extra6', scholarName: 'حكيم', category: 'sages', text: 'لا تعامل الناس بأسلوبهم فتنزل إلى مستواهم، بل عاملهم بأصلك وأخلاقك ليرتفع مقامك وتسمو بروحك.' },

  // الصحابة (companions)
  { id: 'comp_umr5', scholarName: 'عمر بن الخطاب', category: 'companions', text: 'لو نزلت صاعقة من السماء ما أصابت مستغفراً؛ لأن الله تعالى يقول: {وما كان الله معذبهم وهم يستغفرون}.' },
  { id: 'comp_ali10', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'كفى بالمرء جهلاً أن لا يعرف قدر نفسه، وكفى به فخراً أن يكون مطيعاً لربه، مقبلاً على صلاح أمره.' },
  { id: 'comp_uthman2', scholarName: 'عثمان بن عفان', category: 'companions', text: 'لو طهرت قلوبنا ما شبعت من كلام ربنا سبحانه، وإني لأكره أن يمر عليّ يوم لا أنظر فيه في المصحف.' },
  { id: 'comp_aisha1', scholarName: 'عائشة أم المؤمنين', category: 'companions', text: 'من التمس رضا الله بسخط الناس كفاه الله مؤونة الناس، ومن التمس رضا الناس بسخط الله وكله الله إلى الناس.' },
  { id: 'comp_ali11', scholarName: 'علي بن أبي طالب', category: 'companions', text: 'إن الدنيا مدبرة، وإن الآخرة مقبلة، ولكل واحدة منهما بنون؛ فكونوا من أبناء الآخرة، ولا تكونوا من أبناء الدنيا.' },

  // التابعون (successors)
  { id: 'hb7', scholarName: 'الحسن البصري', category: 'successors', text: 'ما نظرت ببصري، ولا نطقت بلساني، ولا بطشت بيدي، ولا نهضت على قدمي حتى أنظر على طاعة أو على معصية؛ فإن كانت طاعة تقدمت، وإن كانت معصية تأخرت.' },
  { id: 'st4', scholarName: 'سفيان الثوري', category: 'successors', text: 'عليك بقلة الكلام يلن قلبك، وعليك بقلة المخالطة تسلم من الغيبة، وعليك بالاستغفار يذهب همك ونصبك.' },
  { id: 'said_musayyib1', scholarName: 'سعيد بن المسيب', category: 'successors', text: 'ما أذن المؤذن منذ ثلاثين سنة إلا وأنا في المسجد، وما فاتتني الركعة الأولى في جماعة قط.' },
  { id: 'ata1', scholarName: 'عطاء بن أبي رباح', category: 'successors', text: 'إن الرجل ليحدثني بالحديث فأنصت إليه كأني لم أسمعه قط، وقد سمعته قبل أن يولد.' },

  // العلماء (scholars)
  { id: 'iq8', scholarName: 'ابن القيم', category: 'scholars', text: 'إضاعة الوقت أشد من الموت؛ لأن إضاعة الوقت تقطعك عن الله والدار الآخرة، والموت يقطعك عن الدنيا وأهلها.' },
  { id: 'sh5', scholarName: 'الإمام الشافعي', category: 'scholars', text: 'من أراد الدنيا فعليه بالعلم، ومن أراد الآخرة فعليه بالعلم، ومن أرادهما معاً فعليه بالعلم والعمل المخلص.' },
  { id: 'ahmad1', scholarName: 'الإمام أحمد بن حنبل', category: 'scholars', text: 'الناس إلى العلم أحوج منهم إلى الطعام والشراب؛ لأن الطعام والشراب يحتاج إليه في اليوم مرة أو مرتين، والعلم يحتاج إليه بعدد الأنفاس.' },
  { id: 'malik1', scholarName: 'الإمام مالك بن أنس', category: 'scholars', text: 'العلم ليس بكثرة الرواية، وإنما العلم نور يضعه الله تعالى في القلب المنقاد لطاعته ورضاه.' },
  { id: 'jaw4', scholarName: 'ابن الجوزي', category: 'scholars', text: 'يا مغلول الأعضاء عن الطاعة، ويا مفرطاً في الأوقات الفاضلة، تذكّر يوماً تقف فيه بين يدي الله حافياً عارياً باحثاً عن حسنة واحدة تسعدك.' },
  { id: 'iq9', scholarName: 'ابن القيم', category: 'scholars', text: 'الإخلاص هو تصفية العمل من كل شائبة كدرية؛ فلا يطلب العامل على عمله شاهداً إلا الله، ولا مجازياً سواه.' },

  // المفكرون (thinkers)
  { id: 'rafii2', scholarName: 'مصطفى صادق الرافعي', category: 'thinkers', text: 'إن في الحياة ساعات روحية مباركة، يشرق فيها القلب بنور يفوق ضياء الشمس، فتبدو الدنيا صغيرة تافهة لا تساوي جناح بعوضة.' },
  { id: 'm_mahmoud2', scholarName: 'مصطفى محمود', category: 'thinkers', text: 'الرحمة هي صفة عليا تجمع بين الحب والعدل والقوة، والقلب الرحيم هو أقرب القلوب إلى الله سبحانه وأكثرها شعوراً بالسلام الداخلي.' },
  { id: 'tantawi2', scholarName: 'علي الطنطاوي', category: 'thinkers', text: 'إذا أغلقت الأبواب في وجهك، فاعلم أن باب السماء مفتوح لا يغلق أبداً، فادعُ ربك بيقين وسلامة صدر تجد مخرجاً جميلاً من كل ضيق.' },
  { id: 'iqbal1', scholarName: 'محمد إقبال', category: 'thinkers', text: 'المؤمن الحقيقي لا يحني رأسه لغير خالقه، وهو كالشمس يضيء لنفسه وللآخرين، ويبث الدفء والخير أينما حل وارتحل.' },
  { id: 'rafii3', scholarName: 'مصطفى صادق الرافعي', category: 'thinkers', text: 'أجمل ما في الحياة أن تترك وراءك أثراً طيباً يذكره الناس بالخير، ويسجل في صحيفة حسناتك عند رب الأرض والسماوات.' }
];
