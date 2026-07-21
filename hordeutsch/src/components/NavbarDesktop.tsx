import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logoImg from "../assets/logo.png";

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------------------------------
// داده‌های ثابت
// --------------------------------------------------------------------------
const menuItems = [
  { name: "ارتباط با ما", id: "#kapitel-03" },
  { name: "دیکشنری صوتی", id: "#kapitel-04" },
  { name: "تلفظ هوشمند", id: "#kapitel-05" },
  { name: "دوره‌ها", id: "#kapitel-02" },
  { name: "خانه", id: "#kapitel-01" }
];

const megaMenuTriggers = ["دوره‌ها", "دیکشنری صوتی", "تلفظ هوشمند"];

const megaCategoryAnchorMap: Record<string, string> = menuItems.reduce(
  (acc, item) => {
    if (megaMenuTriggers.includes(item.name)) acc[item.name] = item.id;
    return acc;
  },
  {} as Record<string, string>
);

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

interface NavbarDesktopProps {
  onNavClick: (selector: string) => void;
  isDarkTheme: boolean;
  toggleTheme: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function NavbarDesktop({ onNavClick, isDarkTheme, toggleTheme }: NavbarDesktopProps) {
  const [activeTab, setActiveTab] = useState<string>("خانه");
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [cartCount] = useState<number>(0);

  const [megaOpen, setMegaOpen] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState("");
  const [megaTriggerRect, setMegaTriggerRect] = useState<DOMRect | null>(null);

  const themeBtnRef = useRef<HTMLButtonElement>(null);
  const sunIconRef = useRef<SVGSVGElement>(null);
  const moonIconRef = useRef<SVGSVGElement>(null);
  const cartIconRef = useRef<SVGSVGElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const isFirstIndicatorRun = useRef(true);
  const progressRef = useRef<HTMLDivElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const megaContentRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const megaIconRefs = useRef<Map<string, SVGSVGElement>>(new Map());
  const prevMegaCategory = useRef<string>("");

  const loginBtnRef = useRef<HTMLButtonElement>(null);
  const loginFlagRef = useRef<HTMLSpanElement>(null);
  const loginTextRef = useRef<HTMLSpanElement>(null);
  const starGoldRef = useRef<HTMLSpanElement>(null);
  const starRedRef = useRef<HTMLSpanElement>(null);
  const starBlackRef = useRef<HTMLSpanElement>(null);

  const fullText = "HORDEUTSCH";
  const wasMegaOpen = useRef(false);

  // ---------- effects ----------
  useEffect(() => {
    let timer: any;
    const handleType = () => {
      if (!isDeleting) {
        setDisplayText(fullText.substring(0, displayText.length + 1));
        if (displayText === fullText) {
          timer = setTimeout(() => setIsDeleting(true), 5000);
          return;
        }
      } else {
        setDisplayText(fullText.substring(0, displayText.length - 1));
        if (displayText === "") {
          timer = setTimeout(() => setIsDeleting(false), 800);
          return;
        }
      }
      setTypingSpeed(isDeleting ? 60 : 120);
    };
    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typingSpeed]);

  useEffect(() => {
    const logoAnimation = gsap.timeline({ repeat: -1, repeatDelay: 4 });
    logoAnimation
      .to(logoRef.current, {
        scale: 1.2, rotationY: 360,
        filter: "drop-shadow(0 0 16px rgba(255, 204, 0, 0.85))",
        duration: 1.0, ease: "power2.inOut"
      })
      .to(logoRef.current, {
        scale: 1,
        filter: "drop-shadow(0 0 8px rgba(255, 204, 0, 0.35))",
        duration: 0.8, ease: "elastic.out(1, 0.3)"
      });
    return () => { logoAnimation.kill(); };
  }, []);

  useEffect(() => {
    const activeBtn = document.querySelector(".nav-btn-active") as HTMLElement;
    if (!activeBtn) return;
    if (isFirstIndicatorRun.current) {
      gsap.set(".nav-indicator", {
        x: activeBtn.offsetLeft, width: activeBtn.offsetWidth, opacity: 1
      });
      isFirstIndicatorRun.current = false;
      return;
    }
    gsap.to(".nav-indicator", {
      x: activeBtn.offsetLeft, width: activeBtn.offsetWidth,
      duration: 0.75, ease: "power2.out"
    });
  }, [activeTab]);

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;
    const tl = gsap.to(progress, {
      scaleX: 1, ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.1,
      },
    });
    return () => { tl.kill(); };
  }, []);

  useEffect(() => {
    const panel = megaPanelRef.current;
    if (!panel || !megaTriggerRect) return;

    const newLeft = megaTriggerRect.left + megaTriggerRect.width / 2 - 250;
    const newTop = megaTriggerRect.bottom + 8;

    if (megaOpen) {
      if (wasMegaOpen.current) {
        gsap.to(panel, {
          left: newLeft,
          top: newTop,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      } else {
        requestAnimationFrame(() => {
          gsap.set(panel, { left: newLeft, top: newTop });
          const panelRect = panel.getBoundingClientRect();
          const btnCenterX = megaTriggerRect.left + megaTriggerRect.width / 2;
          const btnCenterY = megaTriggerRect.bottom + 8;
          const cx = btnCenterX - panelRect.left;
          const cy = Math.max(0, btnCenterY - panelRect.top);

          gsap.set(panel, { clipPath: `circle(0% at ${cx}px ${cy}px)` });
          gsap.to(panel, {
            clipPath: `circle(150% at ${cx}px ${cy}px)`,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
        wasMegaOpen.current = true;
      }

      if (megaContentRef.current) {
        const items = megaContentRef.current.querySelectorAll(".mega-item");
        if (items.length) {
          gsap.fromTo(items,
            { opacity: 0, y: 8 },
            {
              opacity: 1, y: 0,
              duration: 0.35,
              stagger: 0.03,
              delay: 0.1,
              ease: "power2.out",
              overwrite: "auto"
            }
          );
        }
      }
    } else {
      wasMegaOpen.current = false;
      const panelRect = panel.getBoundingClientRect();
      const btnCenterX = megaTriggerRect.left + megaTriggerRect.width / 2;
      const btnCenterY = megaTriggerRect.bottom + 8;
      const cx = btnCenterX - panelRect.left;
      const cy = Math.max(0, btnCenterY - panelRect.top);
      gsap.to(panel, {
        clipPath: `circle(0% at ${cx}px ${cy}px)`,
        duration: 0.3,
        ease: "power3.in",
        overwrite: "auto"
      });
    }
  }, [megaOpen, megaTriggerRect, activeMegaCategory]);

  useEffect(() => {
    if (megaOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [megaOpen]);

  useEffect(() => {
    const prevCategory = prevMegaCategory.current;
    const newCategory = megaOpen ? activeMegaCategory : "";

    if (prevCategory && prevCategory !== newCategory) {
      const prevIcon = megaIconRefs.current.get(prevCategory);
      if (prevIcon) {
        gsap.to(prevIcon, {
          rotation: 0,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }

    if (newCategory) {
      const newIcon = megaIconRefs.current.get(newCategory);
      if (newIcon) {
        gsap.to(newIcon, {
          rotation: 180,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }

    prevMegaCategory.current = newCategory;
  }, [megaOpen, activeMegaCategory]);

  // ---------- mouse events ----------
  const handleNavMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    gsap.to(".nav-glow-spot", {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      duration: 0.1, ease: "power1.out"
    });
  };
  const handleNavMouseEnter = () => gsap.to(".nav-glow-spot", { opacity: 1, duration: 0.15 });
  const handleNavMouseLeave = () => gsap.to(".nav-glow-spot", { opacity: 0, duration: 0.15 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    gsap.to(".nav-indicator", {
      x: target.offsetLeft,
      width: target.offsetWidth,
      duration: 0.75, ease: "power2.out", overwrite: "auto"
    });
  };

  const returnIndicatorToActive = () => {
    const activeBtn = document.querySelector(".nav-btn-active") as HTMLElement;
    if (activeBtn) {
      gsap.to(".nav-indicator", {
        x: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        duration: 0.75,
        ease: "power2.out",
        overwrite: "auto"
      });
    }
  };

  const handleMouseLeave = () => {
    if (!megaOpen) {
      returnIndicatorToActive();
    }
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const bound = target.getBoundingClientRect();
    gsap.to(target, {
      x: (e.clientX - (bound.left + bound.width / 2)) * 0.12,
      y: (e.clientY - (bound.top + bound.height / 2)) * 0.12,
      scale: 1.05, duration: 0.45, ease: "power3.out", overwrite: "auto"
    });
  };
  const handleMagneticEnter = (e: React.MouseEvent<HTMLButtonElement>) =>
    gsap.to(e.currentTarget, { scale: 1.05, duration: 0.35, ease: "power3.out" });
  const handleMagneticLeave = (e: React.MouseEvent<HTMLButtonElement>) =>
    gsap.to(e.currentTarget, { x: 0, y: 0, scale: 1, duration: 0.4, ease: "power2.out" });

  const handleThemeButtonHover = () => {
    const icon = isDarkTheme ? sunIconRef.current : moonIconRef.current;
    gsap.to(icon, { rotation: "+=360", duration: 0.7, ease: "power2.out", transformOrigin: "50% 50%" });
  };
  const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dark = isDarkTheme;
    toggleTheme(e);
    gsap.to(themeBtnRef.current, { rotation: dark ? 360 : 0, duration: 0.8, ease: "back.out(1.2)" });
  };

  // سبد خرید
  const handleCartHoverIn = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;

    gsap.killTweensOf(btn);
    gsap.to(btn, {
      scale: 1.08,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto"
    });

    gsap.killTweensOf(cartIconRef.current);
    gsap.timeline()
      .to(cartIconRef.current, { rotation: -12, duration: 0.08, ease: "power1.inOut" })
      .to(cartIconRef.current, { rotation: 10, duration: 0.08, ease: "power1.inOut" })
      .to(cartIconRef.current, { rotation: -7, duration: 0.08, ease: "power1.inOut" })
      .to(cartIconRef.current, { rotation: 0, duration: 0.4, ease: "elastic.out(1.2, 0.4)" });

    gsap.to(".cart-glow-border", {
      opacity: 1,
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto"
    });

    gsap.to(cartIconRef.current, {
      stroke: "#FFCC00",
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto"
    });
  };

  const handleCartHoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;

    gsap.to(btn, {
      scale: 1,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto"
    });

    gsap.to(".cart-glow-border", {
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto"
    });

    gsap.to(cartIconRef.current, {
      stroke: "currentColor",
      duration: 0.2,
      ease: "power2.in",
      overwrite: "auto"
    });
  };

  // ---------- دکمهٔ ورود ----------
  const handleLoginHoverIn = () => {
    gsap.to(loginFlagRef.current, {
      x: "0%",
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto"
    });
    gsap.to(loginBtnRef.current, {
      boxShadow: isDarkTheme
        ? "0 0 24px rgba(255,204,0,0.35), 0 0 48px rgba(221,0,0,0.15)"
        : "0 0 24px rgba(255,204,0,0.45), 0 0 48px rgba(221,0,0,0.2)",
      scale: 1.03,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto"
    });

    gsap.fromTo(starGoldRef.current,
      { x: -8, y: -8, opacity: 0, scale: 0, rotation: 0 },
      {
        x: 8, y: 8, opacity: 1, scale: 1, rotation: 72,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        overwrite: "auto"
      }
    );
    gsap.fromTo(starRedRef.current,
      { x: -8, y: 8, opacity: 0, scale: 0, rotation: 0 },
      {
        x: 8, y: -8, opacity: 1, scale: 1, rotation: -72,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        overwrite: "auto"
      }
    );
    gsap.fromTo(starBlackRef.current,
      { x: 8, y: -8, opacity: 0, scale: 0, rotation: 0 },
      {
        x: -8, y: 8, opacity: 1, scale: 1, rotation: 144,
        duration: 1.35,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        overwrite: "auto"
      }
    );
  };

  const handleLoginHoverOut = () => {
    gsap.to(loginFlagRef.current, { x: "100%", duration: 0.45, ease: "power2.out", overwrite: "auto" });
    gsap.to(loginBtnRef.current, { boxShadow: "0 0 0px rgba(255,204,0,0)", scale: 1, duration: 0.35, ease: "power2.out", overwrite: "auto" });

    gsap.killTweensOf(starGoldRef.current);
    gsap.to(starGoldRef.current, { opacity: 0, scale: 0, duration: 0.2, overwrite: "auto" });
    gsap.killTweensOf(starRedRef.current);
    gsap.to(starRedRef.current, { opacity: 0, scale: 0, duration: 0.2, overwrite: "auto" });
    gsap.killTweensOf(starBlackRef.current);
    gsap.to(starBlackRef.current, { opacity: 0, scale: 0, duration: 0.2, overwrite: "auto" });
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const existingRipples = button.querySelectorAll('.ripple-effect');
    existingRipples.forEach(r => r.remove());

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.5;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,204,0,0.6) 0%, rgba(221,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%);
      transform: scale(0);
      pointer-events: none;
      z-index: 0;
    `;
    button.appendChild(ripple);

    gsap.to(ripple, {
      scale: 1,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });

    gsap.fromTo(button,
      { scale: 0.96 },
      { scale: 1, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' }
    );
  };

  // ---------- مگامنو ----------
  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closeMegaNow = () => {
    clearCloseTimeout();
    setMegaOpen(false);
    if (categoryClearTimeoutRef.current) {
      clearTimeout(categoryClearTimeoutRef.current);
    }
    categoryClearTimeoutRef.current = setTimeout(() => {
      setActiveMegaCategory("");
      categoryClearTimeoutRef.current = null;
    }, 350);
    setTimeout(() => {
      returnIndicatorToActive();
    }, 50);
  };

  const handleTriggerEnter = (e: React.MouseEvent<HTMLButtonElement>, category: string) => {
    clearCloseTimeout();
    if (categoryClearTimeoutRef.current) {
      clearTimeout(categoryClearTimeoutRef.current);
      categoryClearTimeoutRef.current = null;
    }
    handleMouseEnter(e);
    const rect = e.currentTarget.getBoundingClientRect();
    setMegaTriggerRect(rect);
    if (!megaOpen) {
      setMegaOpen(true);
    }
    setActiveMegaCategory(category);
  };

  const handleTriggerLeave = () => {};

  const handleMegaPanelEnter = () => {
    clearCloseTimeout();
    if (categoryClearTimeoutRef.current) {
      clearTimeout(categoryClearTimeoutRef.current);
      categoryClearTimeoutRef.current = null;
    }
    if (!megaOpen) setMegaOpen(true);
  };

  const handleMegaPanelLeave = () => {
    closeMegaNow();
  };

  return (
    <>
      {/* پنل مگامنو دایره‌ای – Glassmorphism خفن */}
      <div
        ref={megaPanelRef}
        onMouseEnter={handleMegaPanelEnter}
        onMouseLeave={handleMegaPanelLeave}
        className={`fixed z-40 transition-opacity duration-500 ${
          megaOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{
          top: megaTriggerRect ? megaTriggerRect.bottom + 8 : -9999,
          left: megaTriggerRect ? megaTriggerRect.left + megaTriggerRect.width / 2 - 250 : 0,
          width: "500px",
          maxWidth: "90vw",
          height: "400px",
          background: isDarkTheme
            ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.6) 100%)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          borderRadius: "24px",
          border: isDarkTheme
            ? "1px solid rgba(255,204,0,0.2)"
            : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDarkTheme
            ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 8px 32px rgba(55,65,81,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
          clipPath: "circle(0% at 0px 0px)",
        }}
      >
        <div ref={megaContentRef} className="p-6 h-full flex flex-col dir-rtl text-right">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={closeMegaNow}
              className="text-zinc-500 hover:text-white hover:bg-[#dd0000]/50 rounded-full p-1 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-xs font-black text-germanGold tracking-widest uppercase">کاوش در</span>
          </div>

          <div
            data-lenis-prevent
            className="grid grid-cols-2 gap-3 overflow-auto flex-1 scrollbar-none"
            style={{ overscrollBehavior: 'contain', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {nestedMenuData
              .filter(g => g.category === activeMegaCategory)
              .map(group =>
                group.subCategories.map(sub => (
                  <div key={sub.name} className="space-y-1.5">
                    <h4 className="text-xs font-black text-germanGold border-b border-germanGold/20 pb-1 mega-item">
                      {sub.name}
                    </h4>
                    {sub.lessons.map(lesson => (
                      <button
                        key={lesson}
                        onClick={() => {
                          closeMegaNow();
                          onNavClick(megaCategoryAnchorMap[group.category] ?? "#kapitel-02");
                        }}
                        className={`mega-item block w-full text-right px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                          isDarkTheme
                            ? "text-zinc-300 hover:text-white hover:bg-white/5"
                            : "text-[#202124] hover:text-[#202124] hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        }`}
                      >
                        {lesson}
                      </button>
                    ))}
                  </div>
                ))
              )}
            {!activeMegaCategory && (
              <div className="col-span-2 flex items-center justify-center h-full text-zinc-500 text-sm">
                یک دسته را انتخاب کنید
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نوبار اصلی */}
      <nav
        ref={navRef}
        onMouseMove={handleNavMouseMove}
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        className={`fixed top-0 left-0 w-full z-50 border-b dir-rtl selection:bg-germanGold selection:text-black transition-all duration-500 overflow-hidden ${
          isDarkTheme
            ? "bg-black/35 backdrop-blur-2xl border-white/5"
            : "bg-[rgba(255,255,255,0.72)] backdrop-blur-[24px] border-[rgba(0,0,0,0.05)]"
        }`}
        style={{
          boxShadow: isDarkTheme ? undefined : "0 8px 32px rgba(55,65,81,0.08)"
        }}
      >
        {/* glow موس */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div
            className="nav-glow-spot absolute w-[320px] h-[320px] rounded-full opacity-0 pointer-events-none"
            style={{
              left: 0, top: 0, transform: "translate(-50%, -50%)",
              background: isDarkTheme
                ? "radial-gradient(circle, rgba(255,204,0,0.14) 0%, rgba(221,0,0,0.08) 50%, rgba(0,0,0,0) 100%)"
                : "radial-gradient(circle, rgba(255,204,0,0.1) 0%, rgba(221,0,0,0.06) 50%, rgba(0,0,0,0) 100%)",
              filter: "blur(40px)",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* لوگو */}
          <button
            onClick={() => onNavClick("#kapitel-01")}
            className="flex items-center min-w-[210px] force-ltr justify-start hover:opacity-90 active:scale-95 transition-all duration-300"
          >
            <div className="flex-shrink-0 mr-3">
              <img
                ref={logoRef}
                src={logoImg}
                alt="Logo"
                className="w-[38px] h-[38px] object-contain filter drop-shadow-[0_0_8px_rgba(255,204,0,0.35)]"
              />
            </div>
            <div className="w-[145px] overflow-hidden flex items-center justify-start">
              <h1 className="text-lg font-black tracking-widest font-sans flex items-center select-none">
                {displayText.split("").map((char, index) => {
                  let colorClass = isDarkTheme ? "text-zinc-500" : "text-[#202124]";
                  if (index >= 3 && index <= 6) colorClass = "text-red-500";
                  else if (index >= 7) colorClass = "text-germanGold drop-shadow-[0_0_10px_rgba(255,204,0,0.6)]";
                  return (
                    <span key={index} className={`${colorClass} transition-all duration-150`}>
                      {char}
                    </span>
                  );
                })}
                <span className="w-[1.5px] h-3.5 bg-germanGold animate-ping ml-0.5"></span>
              </h1>
            </div>
          </button>

          {/* منوی مرکزی */}
          <div
            className={`relative flex items-center rounded-full p-1.5 dir-rtl border transition-all duration-500 ${
              isDarkTheme
                ? "bg-zinc-950/60 border-white/5"
                : "bg-white/80 border-zinc-200/50 shadow-inner"
            }`}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`nav-indicator absolute top-1.5 bottom-1.5 rounded-full z-0 transition-colors duration-500 will-change-transform ${
              isDarkTheme ? "bg-white/10" : "bg-black/5"
            }`}></div>
            <div className="relative z-10 flex items-center">
              {menuItems.map((item) => {
                const hasMega = megaMenuTriggers.includes(item.name);
                return (
                  <button
                    key={item.name}
                    onMouseEnter={(e) => {
                      if (hasMega) {
                        handleTriggerEnter(e, item.name);
                      } else {
                        handleMouseEnter(e);
                        if (megaOpen) {
                          clearCloseTimeout();
                          setMegaOpen(false);
                        }
                      }
                    }}
                    onMouseLeave={handleTriggerLeave}
                    onClick={() => {
                      setActiveTab(item.name);
                      onNavClick(item.id);
                      if (hasMega) closeMegaNow();
                    }}
                    className={`nav-btn relative z-10 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 active:scale-95 ${
                      activeTab === item.name
                        ? "nav-btn-active text-germanGold"
                        : isDarkTheme
                        ? "text-zinc-400 hover:text-white"
                        : "text-[#202124] hover:text-[#202124]"
                    }`}
                  >
                    {item.name}
                    {hasMega && (
                      <svg
                        ref={(el) => {
                          if (el) {
                            megaIconRefs.current.set(item.name, el as SVGSVGElement);
                          } else {
                            megaIconRefs.current.delete(item.name);
                          }
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="inline-block ml-2 w-3 h-3 align-middle transition-colors duration-200"
                        style={{ transformOrigin: 'center' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* دکمه‌های سمت چپ */}
          <div className="flex items-center justify-end gap-[0.8rem] min-w-[220px]">
            {/* سبد خرید */}
            <button
              onMouseEnter={handleCartHoverIn}
              onMouseLeave={handleCartHoverOut}
              className="relative p-[1.5px] rounded-full overflow-hidden active:scale-93 active:duration-100"
            >
              <span
                className="cart-glow-border absolute inset-0 rounded-full opacity-0 pointer-events-none scale-[0.95]"
                style={{
                  background: "linear-gradient(to right, #111111 0%, #111111 33.33%, #dd0000 33.33%, #dd0000 66.66%, #FFCC00 66.66%, #FFCC00 100%)",
                }}
              ></span>
              <span className={`relative block p-3 rounded-full transition-colors duration-300 z-10 ${
                isDarkTheme ? "text-zinc-400 hover:text-germanGold bg-zinc-950" : "text-[#202124] hover:text-germanGold bg-white border border-zinc-200"
              }`}>
                <svg ref={cartIconRef} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 pointer-events-none origin-center">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </span>
              {cartCount > 0 && (
                <span className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black z-20 transition-all duration-300 ${
                  isDarkTheme ? "bg-germanGold text-black shadow-[0_0_8px_rgba(255,204,0,0.4)]" : "bg-red-500 text-white"
                }`}>{cartCount}</span>
              )}
            </button>

            {/* دکمهٔ ورود / ثبت‌نام */}
            <button
              ref={loginBtnRef}
              onClick={() => { window.location.href = "/login"; }}
              onMouseDown={createRipple}
              onMouseEnter={handleLoginHoverIn}
              onMouseLeave={handleLoginHoverOut}
              className={`relative overflow-hidden px-7 py-3 text-xs font-bold tracking-wider text-white bg-black rounded-full border transition-all duration-300 active:scale-93 active:duration-100 ${
                isDarkTheme ? "border-white/15" : "border-zinc-300 shadow-sm"
              }`}
            >
              <span
                ref={loginFlagRef}
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to right, #111111 0%, #111111 33.33%, #dd0000 33.33%, #dd0000 66.66%, #FFCC00 66.66%, #FFCC00 100%)",
                  transform: "translateX(100%)"
                }}
              ></span>
              <span ref={starGoldRef} className="absolute w-3 h-3 opacity-0 pointer-events-none" style={{ top: "30%", left: "25%", zIndex: 5 }}>
                <svg viewBox="0 0 24 24" fill="#FFCC00" className="w-full h-full drop-shadow-[0_0_6px_#FFCC00]"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
              </span>
              <span ref={starRedRef} className="absolute w-3 h-3 opacity-0 pointer-events-none" style={{ bottom: "30%", right: "25%", zIndex: 5 }}>
                <svg viewBox="0 0 24 24" fill="#dd0000" className="w-full h-full drop-shadow-[0_0_6px_#dd0000]"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
              </span>
              <span ref={starBlackRef} className="absolute w-3 h-3 opacity-0 pointer-events-none" style={{ top: "60%", right: "20%", zIndex: 5 }}>
                <svg viewBox="0 0 24 24" fill="#111111" className="w-full h-full drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>
              </span>
              <span ref={loginTextRef} className="relative z-10">ورود / ثبت‌نام</span>
            </button>

            {/* تم */}
            <button
              ref={themeBtnRef}
              onClick={handleThemeClick}
              onMouseEnter={handleThemeButtonHover}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className={`p-2.5 rounded-full border transition-all duration-300 active:scale-93 active:duration-100 ${
                isDarkTheme ? "bg-white/5 border-white/5 hover:bg-white/10" : "text-[#202124] bg-white border-zinc-200 hover:bg-white hover:shadow-sm"
              }`}
            >
              {isDarkTheme ? (
                <svg ref={sunIconRef} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#FFCC00" className="w-4 h-4 filter drop-shadow-[0_0_6px_rgba(255,204,0,0.55)]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
              ) : (
                <svg ref={moonIconRef} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5B5FE8" className="w-4 h-4 filter drop-shadow-[0_0_6px_rgba(91,95,232,0.4)]">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 1 1-16.915-12.2a.75.75 0 0 1 .81-.132ZM21 3a.75.75 0 0 1 .693.465l.51 1.226 1.226.51a.75.75 0 0 1 0 1.398l-1.226.51-.51 1.226a.75.75 0 0 1-1.386 0l-.51-1.226-1.226-.51a.75.75 0 0 1 0-1.398l1.226-.51.51-1.226A.75.75 0 0 1 21 3Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* اسکرول‌بار */}
        <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-zinc-800 z-20">
          <div
            ref={progressRef}
            className="scroll-progress w-full h-full origin-left scale-x-0"
            style={{ background: "linear-gradient(to right, #111111 0%, #111111 33.33%, #dd0000 33.33%, #dd0000 66.66%, #FFCC00 66.66%, #FFCC00 100%)" }}
          ></div>
        </div>
      </nav>
    </>
  );
}