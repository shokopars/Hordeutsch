import { useEffect, useRef } from "react";
import CanvasView from "./components/CanvasView";
import Navbar from "./components/Navbar"; // اصلاح مسیر به کامپوننت جدید (Wrapper)
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // ۱. راه‌اندازی Lenis
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // ۲. انیمیشن کارت‌های متنی
    const sections = gsap.utils.toArray(".lesson-section");
    sections.forEach((section: any) => {
      gsap.fromTo(
        section.querySelector(".content-card"),
        { opacity: 0, y: 70, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 35%",
            scrub: true,
          },
        }
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleScrollTo = (selector: string) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, {
        offset: -40,
        immediate: false,
        duration: 1.8,
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden">
      <CanvasView />
      <Navbar onNavClick={handleScrollTo} />

      <main className="relative z-10 pt-20">
        <section
          id="kapitel-01"
          data-kapitel="01"
          className="lesson-section min-h-screen flex items-center justify-center px-6 dir-rtl text-right"
        >
          <div className="content-card max-w-lg bg-black/60 border border-zinc-800/80 backdrop-blur-md p-8 rounded-2xl space-y-4">
            <span className="text-germanGold font-mono text-xs tracking-wider uppercase">Kapitel 01</span>
            <h2 className="text-4xl font-black tracking-tight text-white">Schwarzwald</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              به دنیای شنیداری زبان آلمانی خوش آمدید. سفر شما از اعماق جنگل سیاه آغاز می‌شود. به صداها گوش بسپارید و با اسکرول کردن، کلمات را لمس کنید.
            </p>
          </div>
        </section>

        <section
          id="kapitel-02"
          data-kapitel="02"
          className="lesson-section min-h-screen flex items-center justify-center px-6 dir-rtl text-right"
        >
          <div className="content-card max-w-lg bg-black/60 border border-zinc-800/80 backdrop-blur-md p-8 rounded-2xl space-y-4">
            <span className="text-germanGold font-mono text-xs tracking-wider uppercase">Kapitel 02</span>
            <h2 className="text-4xl font-black tracking-tight text-white">Das Hören</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              آلمانی زبانی موسیقیایی است. در این بخش، تلفظ حروف صدادار آلمانی را در میان ذرات معلق و نوسانات صوتی تجربه خواهید کرد.
            </p>
          </div>
        </section>

        <section
          id="kapitel-03"
          data-kapitel="03"
          className="lesson-section min-h-screen flex items-center justify-center px-6 dir-rtl text-right"
        >
          <div className="content-card max-w-lg bg-black/60 border border-zinc-800/80 backdrop-blur-md p-8 rounded-2xl space-y-4">
            <span className="text-germanGold font-mono text-xs tracking-wider uppercase">Kapitel 03</span>
            <h2 className="text-4xl font-black tracking-tight text-white">Im Nebel</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              "در میان مه غلیظ، هر درختی تنهاست..." با چرخش اتمسفر سه‌بعدی و حرکت آرام اسکرول، اولین گفتگوی دونفره آلمانی را در مه بشنوید.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;