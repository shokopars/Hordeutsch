import { useEffect, useRef, useCallback } from "react";
import CanvasView from "./components/CanvasView";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import { ThemeProvider } from "./contexts/ThemeContext";
import Lenis from "lenis"; // آپدیت شده به پکیج جدید
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // ۱. ساخت انیمیشن Lenis
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    // ۲. سینک کردن ScrollTrigger با Lenis
    lenis.on("scroll", ScrollTrigger.update);

    // ۳. تعریف Ticker اختصاصی جهت جلوگیری از Memory Leak
    const updatePhysics = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updatePhysics);
    gsap.ticker.lagSmoothing(0);

    // ۴. کلین‌آپ کامل و تمیز
    return () => {
      gsap.ticker.remove(updatePhysics); // جلوگیری از Memory Leak
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // بهینه‌سازی توابع با useCallback
  const handleScrollTo = useCallback((selector: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, {
        offset: -40,
        immediate: false,
        duration: 1.8,
      });
    }
  }, []);

  const handleExplore = useCallback(() => {
    handleScrollTo("#kapitel-02");
  }, [handleScrollTo]);

  return (
    <ThemeProvider>
      <div className="relative w-full overflow-hidden dir-rtl">
        <CanvasView />
        <Navbar onNavClick={handleScrollTo} />
        
        <main className="relative z-10">
          <HeroSection onExplore={handleExplore} />
          
          <section id="kapitel-02" className="min-h-screen bg-black/5 backdrop-blur-md flex items-center justify-center text-4xl font-black">
            دوره‌ها (در حال ساخت...)
          </section>

          {/* ترتیب آی‌دی‌ها مرتب شد */}
          <section id="kapitel-03" className="min-h-screen bg-black/5 backdrop-blur-md flex items-center justify-center text-4xl font-black">
            ارتباط با ما (در حال ساخت...)
          </section>

          <section id="kapitel-04" className="min-h-screen bg-black/5 backdrop-blur-md flex items-center justify-center text-4xl font-black">
            دیکشنری صوتی (در حال ساخت...)
          </section>

          <section id="kapitel-05" className="min-h-screen bg-black/5 backdrop-blur-md flex items-center justify-center text-4xl font-black">
            تلفظ هوشمند (در حال ساخت...)
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;