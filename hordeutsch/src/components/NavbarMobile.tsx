import { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logoImg from "../assets/logo.png";

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------------------------
// داده‌های هماهنگ با دسکتاپ
// --------------------------------------------------------------------------
const nestedMenuData = [
  {
    category: "دوره‌ها",
    subCategories: [
      {
        name: "گرامر کاربردی",
        lessons: ["زمان حال ساده", "حروف اضافه اتهامی", "ضمایر ملکی در آلمانی", "حروف اضافه مکانی (Dativ)", "جملات شرطی (Wenn/Als)"]
      },
      {
        name: "مکالمه صوتی",
        lessons: ["مکالمات فرودگاهی", "احوال‌پرسی در جنگل سیاه", "دیالوگ در مطب پزشک", "رزرو هتل در برلین", "گفتگو در رستوران"]
      },
      {
        name: "واژگان پیشرفته",
        lessons: ["واژگان اقتصادی", "اصطلاحات حقوقی", "کلمات تخصصی پزشکی", "واژگان مهندسی", "اصطلاحات دانشگاهی"]
      },
      {
        name: "آمادگی آزمون",
        lessons: ["TestDaF شبیه‌سازی", "Goethe-Zertifikat B2", "telc C1 Hochschule", "DSH نمونه سوالات", "نکات طلایی آزمون"]
      }
    ]
  },
  {
    category: "دیکشنری صوتی",
    subCategories: [
      {
        name: "اصطلاحات عامیانه",
        lessons: ["واژگان خودمانی آلمانی", "ضرب‌المثل‌های پرکاربرد", "عبارات کوچه‌بازاری", "کلمات مخفف رایج"]
      },
      {
        name: "واژگان موضوعی",
        lessons: ["لغات سفر و گردشگری", "واژگان آشپزی آلمانی", "اصطلاحات ورزشی", "کلمات فناوری اطلاعات"]
      }
    ]
  },
  {
    category: "تلفظ هوشمند",
    subCategories: [
      {
        name: "واکه‌ها",
        lessons: ["ä, ö, ü", "حروف صدادار بلند", "تفاوت e و ä"]
      },
      {
        name: "آواهای ترکیبی",
        lessons: ["sch", "ch", "pf", "sp/st"]
      },
      {
        name: "تلفظ پیشرفته",
        lessons: ["آهنگ جمله", "تکیه کلمات", "کلمات هم‌آوا"]
      }
    ]
  }
];

// نگاشت دسته‌ها به anchor (همانند دسکتاپ)
const megaCategoryAnchorMap: Record<string, string> = {
  "دوره‌ها": "#kapitel-02",
  "دیکشنری صوتی": "#kapitel-04",
  "تلفظ هوشمند": "#kapitel-05"
};

// --------------------------------------------------------------------------
// Utility: بررسی prefers-reduced-motion (SSR-safe)
// --------------------------------------------------------------------------
const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------
interface NavbarMobileProps {
  onNavClick: (selector: string) => void;
  isDarkTheme: boolean;
  toggleTheme: (e: React.MouseEvent<HTMLButtonElement>) => void;
  currentChapterTitle: string;
}

export default function NavbarMobile({
  onNavClick,
  isDarkTheme,
  toggleTheme,
  currentChapterTitle,
}: NavbarMobileProps) {
  const [activeMobilePanel, setActiveMobilePanel] = useState<"menu" | "search" | null>(null);
  const [renderedPanel, setRenderedPanel] = useState<"menu" | "search" | null>(null);
  const [mobileMenuLevel, setMobileMenuLevel] = useState<number>(1);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dismissHandleRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLDivElement>(null); // نوار پیشرفت اسکرول

  // رف‌های دکمه خانه (برای افکت glow و چرخش)
  const homeLogoRef = useRef<HTMLImageElement>(null);

  // رفرنس المنتی که پیش از باز شدن پنل فوکوس داشته (برای بازگردانی فوکوس - WCAG 2.4.3)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // ⚡️ فعال‌سازی اسکرول‌بار اختصاصی موبایل (سه‌رنگ)
  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;

    const tl = gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.1,
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  // مدیریت باز/بسته شدن پنل
  useEffect(() => {
    let isMounted = true;

    if (activeMobilePanel) {
      setRenderedPanel(activeMobilePanel);
      return;
    }

    if (!mobilePanelRef.current) {
      setRenderedPanel(null);
      return;
    }

    gsap.killTweensOf(mobilePanelRef.current);
    const tween = gsap.to(mobilePanelRef.current, {
      y: "100%",
      scale: 0.95,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        // جلوگیری از state update پس از unmount شدن کامپوننت
        if (!isMounted) return;
        setRenderedPanel(null);
        setMobileMenuLevel(1);
        // بازگردانی فوکوس به المنتی که پنل را باز کرده بود
        lastFocusedElementRef.current?.focus();
        lastFocusedElementRef.current = null;
      }
    });

    return () => {
      isMounted = false;
      gsap.killTweensOf(mobilePanelRef.current);
      tween.kill();
    };
  }, [activeMobilePanel]);

  // Escape key برای بستن پنل
  useEffect(() => {
    if (!renderedPanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMobilePanel(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [renderedPanel]);

  // Focus-trap داخل پنل
  useEffect(() => {
    const panel = mobilePanelRef.current;
    if (!renderedPanel || !panel) return;

    const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = panel.querySelectorAll(focusableSelector);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener("keydown", trapFocus);
    return () => panel.removeEventListener("keydown", trapFocus);
  }, [renderedPanel]);

  // انیمیشن ورود پنل (spring از پایین) + مدیریت فوکوس
  useLayoutEffect(() => {
    const panel = mobilePanelRef.current;
    if (!renderedPanel || !panel) return;

    const reduceMotion = prefersReducedMotion();

    gsap.killTweensOf(panel);
    const tween = gsap.fromTo(panel,
      reduceMotion
        ? { opacity: 0 }
        : { y: "100%", scale: 0.95, opacity: 0 },
      {
        y: "0%",
        scale: 1,
        opacity: 1,
        duration: reduceMotion ? 0.2 : 0.55,
        ease: reduceMotion ? "power1.out" : "back.out(1.4)",
        overwrite: "auto",
        onComplete: () => {
          if (renderedPanel === "search") {
            searchInputRef.current?.focus();
          } else {
            dismissHandleRef.current?.focus();
          }
        }
      }
    );

    if (panelContentRef.current && !reduceMotion) {
      const items = panelContentRef.current.querySelectorAll(".panel-stagger-item");
      if (items.length) {
        gsap.fromTo(items,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, delay: 0.15, ease: "power2.out", overwrite: "auto" }
        );
      }
    }

    return () => {
      tween.kill();
      gsap.killTweensOf(panel);
    };
  }, [renderedPanel]);

  // افکت glow و چرخش لوگوی خانه (غیرفعال در صورت prefers-reduced-motion)
  useEffect(() => {
    if (!homeLogoRef.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 4 });
    tl.to(homeLogoRef.current, {
      rotationY: 360,
      filter: "drop-shadow(0 0 12px rgba(255,204,0,0.7))",
      duration: 1.2,
      ease: "power2.inOut"
    })
    .to(homeLogoRef.current, {
      filter: "drop-shadow(0 0 4px rgba(255,204,0,0.3))",
      duration: 0.8,
      ease: "elastic.out(1, 0.3)"
    });
    return () => { tl.kill(); };
  }, []);

  // ---------- handlers ----------
  
  // باز کردن پنل + ثبت المنت فعلی برای بازگردانی فوکوس بعداً
  const openPanel = useCallback((panel: "menu" | "search") => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    setActiveMobilePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActiveMobilePanel(null);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (!searchQuery.trim()) return;
    console.log("Search query:", searchQuery);
    closePanel();
    setSearchQuery("");
  }, [searchQuery, closePanel]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // افکت‌های هاور داک
  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const bound = target.getBoundingClientRect();
    const x = e.clientX - (bound.left + bound.width / 2);
    const y = e.clientY - (bound.top + bound.height / 2);
    gsap.to(target, {
      x: x * 0.12,
      y: y * 0.12,
      scale: 1.05,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto"
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleMobileSvgHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const svg = e.currentTarget.querySelector("svg");
    if (!svg) return;
    gsap.killTweensOf(svg);
    gsap.timeline()
      .to(svg, { rotation: -6, duration: 0.08, ease: "power1.inOut" })
      .to(svg, { rotation: 5, duration: 0.08, ease: "power1.inOut" })
      .to(svg, { rotation: -3, duration: 0.08, ease: "power1.inOut" })
      .to(svg, { rotation: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <>
      {/* نوار پیشرفت اسکرول سه‌بخشی (مشکی-قرمز-طلایی) – بالای صفحه */}
      <div className="fixed top-0 left-0 w-full h-[2.5px] z-50 bg-zinc-800/40 backdrop-blur-sm">
        <div
          ref={progressRef}
          className="scroll-progress w-full h-full origin-left scale-x-0"
          style={{
            background: "linear-gradient(to right, #111111 0%, #111111 33.33%, #dd0000 33.33%, #dd0000 66.66%, #FFCC00 66.66%, #FFCC00 100%)"
          }}
        ></div>
      </div>

      {/* استایل‌های سفارشی اسکرول‌بار پنل */}
      <style>{`
        .mega-scroll::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .mega-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 8px 0;
        }
        .mega-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,204,0,0.6);
          border-radius: 10px;
          box-shadow: 0 0 6px rgba(255,204,0,0.4);
        }
        .mega-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,204,0,1);
        }
        .mega-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,204,0,0.6) transparent;
        }
      `}</style>

      {/* پس‌زمینه محو (backdrop) با قابلیت dismiss */}
      {renderedPanel && (
        <div
          onClick={closePanel}
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Bottom Sheet تمام‌صفحه (RTL و Glassmorphism) */}
      {renderedPanel && (
        <div
          ref={mobilePanelRef}
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label={renderedPanel === "menu" ? "منوی آموزشی" : "جستجو"}
          className={`fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t shadow-2xl overflow-hidden flex flex-col ${
            isDarkTheme
              ? "bg-black/80 backdrop-blur-[40px] saturate-[180%] border-white/10"
              : "bg-[rgba(255,255,255,0.85)] backdrop-blur-[40px] saturate-[180%] border-black/5"
          }`}
          style={{ height: '92dvh'}}
        >
          {/* Handle برای dismiss */}
          <div className="flex justify-center pt-3 pb-2">
            <button
              ref={dismissHandleRef}
              type="button"
              onClick={closePanel}
              className="w-10 h-1.5 rounded-full bg-zinc-400/60"
              aria-label="بستن پنل"
            />
          </div>

          {/* محتوای پنل با اسکرول داخلی، RTL و scrollbar سفارشی */}
          <div
            ref={panelContentRef}
            data-lenis-prevent
            className="flex-1 overflow-auto px-6 pb-6 mega-scroll"
            style={{ overscrollBehavior: 'contain' }}
          >
            {renderedPanel === "menu" && (
              <div className="space-y-4">
                <div className="panel-stagger-item flex justify-between items-center border-b border-white/10 pb-3">
                  {mobileMenuLevel > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (mobileMenuLevel === 3) {
                          setMobileMenuLevel(2);
                          setSelectedLesson(null);
                        } else {
                          setMobileMenuLevel(1);
                          setSelectedSubCategory(null);
                        }
                      }}
                      className="text-xs font-bold text-germanGold flex items-center space-x-1 space-x-reverse"
                    >
                      <span>برگشت</span>
                      <span>←</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-zinc-500">سرفصل‌های آموزشی</span>
                  )}
                  <button
                    type="button"
                    onClick={closePanel}
                    className="text-zinc-500 hover:text-white hover:bg-[#dd0000]/50 rounded-full p-1 transition-all"
                    aria-label="بستن منو"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {mobileMenuLevel === 1 && (
                  <div className="flex flex-col space-y-2">
                    {nestedMenuData.map((group) => (
                      <div key={group.category} className="panel-stagger-item space-y-1">
                        <h3 className="text-[10px] text-zinc-500 font-bold mb-1 text-right mr-2">{group.category}</h3>
                        {group.subCategories.map((sub) => (
                          <button
                            key={sub.name}
                            type="button"
                            onClick={() => {
                              setSelectedSubCategory(sub.name);
                              setMobileMenuLevel(2);
                            }}
                            aria-expanded={sub.name === selectedSubCategory && mobileMenuLevel >= 2}
                            className={`w-full text-right p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all active:scale-95 ${
                              isDarkTheme
                                ? "bg-white/5 hover:bg-white/10 text-white"
                                : "bg-white/80 hover:bg-white hover:shadow-sm text-[#202124]"
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className="text-zinc-500">←</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {mobileMenuLevel === 2 && selectedSubCategory && (
                  <div className="space-y-2">
                    <p className="panel-stagger-item text-xs font-black text-germanGold mb-3 text-right mr-2">{selectedSubCategory}</p>
                    <div className="flex flex-col space-y-2">
                      {nestedMenuData
                        .flatMap((g) => g.subCategories)
                        .find((sub) => sub.name === selectedSubCategory)
                        ?.lessons.map((lesson) => (
                          <button
                            key={lesson}
                            type="button"
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setMobileMenuLevel(3);
                            }}
                            className={`panel-stagger-item w-full text-right p-3 rounded-xl flex items-center justify-between text-xs transition-all active:scale-95 ${
                              isDarkTheme
                                ? "bg-white/5 hover:bg-white/10 text-white"
                                : "bg-white/80 hover:bg-white hover:shadow-sm text-[#202124]"
                            }`}
                          >
                            <span>{lesson}</span>
                            <span className="text-zinc-500">←</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {mobileMenuLevel === 3 && selectedLesson && (
                  <div className="space-y-4 p-2 text-right">
                    <p className="panel-stagger-item text-xs font-black text-germanGold">{selectedSubCategory}</p>
                    <h3 className={`panel-stagger-item text-lg font-black ${isDarkTheme ? "text-white" : "text-[#202124]"}`}>{selectedLesson}</h3>
                    <p className="panel-stagger-item text-xs text-zinc-400 leading-relaxed">
                      این یک واحد درسی شنیداری است. در این لایه، پلتفرم آلمانی آماده لود کردن ابزارهای صوتی، متون هماهنگ شده و آزمون‌های سنجش است.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        closePanel();
                        const anchor = megaCategoryAnchorMap[
                          Object.keys(megaCategoryAnchorMap).find(cat =>
                            nestedMenuData.some(g => g.category === cat && g.subCategories.some(sub => sub.name === selectedSubCategory))
                          ) || ""
                        ] || "#kapitel-02";
                        onNavClick(anchor);
                      }}
                      className="panel-stagger-item w-full py-3 bg-germanGold text-black font-black text-xs rounded-xl shadow-lg shadow-germanGold/20 active:scale-95"
                    >
                      شروع آموزش صوتی این درس
                    </button>
                  </div>
                )}
              </div>
            )}

            {renderedPanel === "search" && (
              <div className="space-y-4">
                <div className="panel-stagger-item flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-zinc-500">جستجوی صوتی و محتوایی</span>
                  <button
                    type="button"
                    onClick={() => { closePanel(); setSearchQuery(""); }}
                    className="text-zinc-500 hover:text-white hover:bg-[#dd0000]/50 rounded-full p-1 transition-all"
                    aria-label="بستن جستجو"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="panel-stagger-item relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="کلمه، واژه یا درس مورد نظر را بنویسید..."
                    className={`w-full p-4 pl-12 rounded-2xl text-xs font-bold outline-none border transition-all text-right ${
                      isDarkTheme
                        ? "bg-white/5 border-white/10 text-white focus:border-germanGold/50"
                        : "bg-white/80 border-zinc-200 text-[#202124] focus:border-germanGold"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-germanGold hover:bg-germanGold/10 active:scale-90 transition-all duration-200"
                    aria-label="اجرای جستجو"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                    </svg>
                  </button>
                </div>
                <div className="panel-stagger-item flex flex-wrap gap-1.5 justify-start">
                  {["#Schwarzwald", "#گرامر", "#کلمات_سفری", "#الفبا"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag.replace("#", ""))}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${
                        isDarkTheme ? "bg-white/5 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* داک شناور پایین */}
      <div
        aria-hidden={renderedPanel !== null}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[440px] h-16 rounded-full px-4 flex items-center justify-between z-50 border shadow-lg transition-all duration-500 ${
          isDarkTheme
            ? "bg-black/40 backdrop-blur-[24px] saturate-[180%] border-white/10 shadow-black/60"
            : "bg-white/60 backdrop-blur-[24px] saturate-[180%] border-zinc-900/[0.06] shadow-zinc-300/40"
        }`}
      >
        {/* تغییر تم */}
        <button
          type="button"
          onClick={toggleTheme}
          onMouseEnter={handleMobileSvgHover}
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          aria-label="تغییر تم"
          className={`relative p-2.5 rounded-full border transition-all duration-300 hover:scale-110 active:scale-93 ${
            isDarkTheme
              ? "text-germanGold bg-white/5 border-white/5 hover:bg-germanGold/10"
              : "text-zinc-700 bg-white border-zinc-200 hover:bg-white hover:shadow-sm"
          }`}
        >
          {isDarkTheme ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#FFCC00" className="w-[21px] h-[21px] filter drop-shadow-[0_0_6px_rgba(255,204,0,0.5)]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5B5FE8" className="w-[21px] h-[21px]"><path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 1 1-16.915-12.2a.75.75 0 0 1 .81-.132ZM21 3a.75.75 0 0 1 .693.465l.51 1.226 1.226.51a.75.75 0 0 1 0 1.398l-1.226.51-.51 1.226a.75.75 0 0 1-1.386 0l-.51-1.226-1.226-.51a.75.75 0 0 1 0-1.398l1.226-.51.51-1.226A.75.75 0 0 1 21 3Z" clipRule="evenodd" /></svg>
          )}
        </button>

        {/* جستجو */}
        <button
          type="button"
          onClick={() => (activeMobilePanel === "search" ? closePanel() : openPanel("search"))}
          onMouseEnter={handleMobileSvgHover}
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          aria-label={activeMobilePanel === "search" ? "بستن جستجو" : "باز کردن جستجو"}
          className={`relative p-2.5 rounded-full border transition-all duration-300 hover:scale-110 active:scale-93 ${
            activeMobilePanel === "search"
              ? isDarkTheme
                ? "text-white border-germanGold ring-4 ring-germanGold/25 bg-black/80 shadow-[0_0_15px_rgba(255,204,0,0.4)] scale-105"
                : "text-[#b38600] border-germanGold ring-4 ring-germanGold/25 bg-white shadow-[0_0_15px_rgba(217,164,6,0.2)] scale-105"
              : isDarkTheme
              ? "text-zinc-400 bg-white/5 border-white/5 hover:text-germanGold"
              : "text-zinc-700 bg-white border-zinc-200 hover:bg-white hover:shadow-sm"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[21px] h-[21px] pointer-events-none origin-center"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" /></svg>
        </button>

        {/* خانه – با افکت glow */}
        <button
          type="button"
          onClick={() => {
            closePanel();
            onNavClick("#kapitel-01");
          }}
          onMouseEnter={handleMobileSvgHover}
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          aria-label="خانه"
          className={`relative p-3 rounded-full border transition-all duration-300 hover:scale-110 active:scale-93 scale-105 ${
            isDarkTheme
              ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-germanGold/20"
              : "bg-zinc-100 border-zinc-200 hover:bg-white hover:border-germanGold/30 hover:shadow-sm"
          }`}
        >
          <img
            ref={homeLogoRef}
            src={logoImg}
            alt="خانه"
            className="w-[22px] h-[22px] object-contain"
          />
        </button>

        {/* ورود */}
        <button
          type="button"
          onClick={() => {
            closePanel();
            window.location.href = "/login";
          }}
          onMouseEnter={handleMobileSvgHover}
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          aria-label="ورود به حساب"
          className={`relative p-2.5 rounded-full border transition-all duration-300 hover:scale-110 active:scale-93 ${
            isDarkTheme
              ? "text-zinc-400 bg-white/5 border-white/5 hover:text-germanGold"
              : "text-zinc-700 bg-white border-zinc-200 hover:bg-white hover:shadow-sm"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[21px] h-[21px] pointer-events-none origin-center"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
        </button>

        {/* منو */}
        <button
          type="button"
          onClick={() => {
            if (activeMobilePanel === "menu") {
              closePanel();
            } else {
              openPanel("menu");
            }
            setMobileMenuLevel(1);
          }}
          onMouseEnter={handleMobileSvgHover}
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          aria-label={activeMobilePanel === "menu" ? "بستن منوی آموزش" : "باز کردن منوی آموزش"}
          className={`relative p-2.5 rounded-full border transition-all duration-300 hover:scale-110 active:scale-93 ${
            activeMobilePanel === "menu"
              ? isDarkTheme
                ? "text-white border-germanGold ring-4 ring-germanGold/25 bg-black/80 shadow-[0_0_15px_rgba(255,204,0,0.4)] scale-105"
                : "text-[#b38600] border-germanGold ring-4 ring-germanGold/25 bg-white shadow-[0_0_15px_rgba(217,164,6,0.2)] scale-105"
              : isDarkTheme
              ? "text-zinc-400 bg-white/5 border-white/5 hover:text-germanGold"
              : "text-zinc-700 bg-white border-zinc-200 hover:bg-white hover:shadow-sm"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-[21px] h-[21px] pointer-events-none origin-center">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </button>
      </div>
    </>
  );
}