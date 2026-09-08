3456,3516c\
                      if (extendedPages[currentPageIndex] && Array.isArray(extendedPages[currentPageIndex][1])) {\
                        const pageAyahs = extendedPages[currentPageIndex][1] as any[];\
                        if (pageAyahs.length > 0) {\
                          setSelectedAyah(pageAyahs[0]);\
                        }\
                      }\
                    }}\
                  >\
                    {/* Modern Minimal Spine Shadow */}\
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/[0.04] via-transparent to-transparent z-20 pointer-events-none" />\
\
                    {/* Subtle Corner Brackets for a modern touch */}\
                    <div className="absolute inset-0 z-10 pointer-events-none opacity-20">\
                      <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-teal-600/40 rounded-tl-sm" />\
                      <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-teal-600/40 rounded-tr-sm" />\
                      <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-teal-600/40 rounded-bl-sm" />\
                      <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-teal-600/40 rounded-br-sm" />\
                    </div>\
\
                    <div className="relative w-full h-full flex flex-1 items-center justify-center">\
                      <MushafPage pageNum={pageNum} recitation={recitation} ayahs={Array.isArray(ayahs) ? ayahs : []} surahName={surah?.name} setSelectedAyah={setSelectedAyah} />\
                    </div>\
\
                    {/* Hint Overlay - Redesigned */}\
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-teal-600/90 backdrop-blur-xl rounded-2xl text-white text-[11px] font-black opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-2xl shadow-teal-600/30 z-30 flex items-center gap-2">\
                      <BookOpen size={14} />\
                      عرض التفسير والبيان\
                    </div>\
                  </div>\
                );\
              }}\
            />\
          ) : (\
            <div\
              className="w-full flex-1 flex flex-col items-center gap-4 py-4 overflow-y-auto custom-scrollbar snap-y snap-proximity pb-20"\
              dir="rtl"\
            >\
              {extendedPages.map((pageData, index) => {\
                const [pageNum, ayahs] = pageData;\
                if (typeof ayahs === "string") return null;\
                const isVisible = Math.abs(index - currentPageIndex) <= 3;\
                return (\
                  <div\
                    key={`vertical-page-${pageNum}-${index}`}\
                    data-index={index}\
                    className="quran-vertical-page w-full flex justify-center py-1 shrink-0 scroll-mt-20 snap-start"\
                  >\
                    <div\
                      className={cn(\
                        "relative overflow-visible shadow-[0_12px_36px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] w-full sm:max-w-3xl md:max-w-4xl lg:max-w-4xl aspect-[3/4.6] flex flex-col items-center justify-center p-0 cursor-pointer group rounded-xl ring-1 ring-black/[0.03] dark:ring-white/[0.05]",\
                        settings.visualTheme === "glass"\
                          ? "bg-white/30 backdrop-blur-md"\
                          : settings.visualTheme === "neo"\
                            ? "bg-[#fdfbf7] dark:bg-slate-900"\
                            : theme === "light"\
                              ? "bg-[#fdfbf7]"\
