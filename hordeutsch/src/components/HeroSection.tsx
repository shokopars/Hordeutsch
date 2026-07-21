// src/components/HeroSection.tsx

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "../contexts/ThemeContext";
import heroImg from "../assets/hero.png";

interface HeroSectionProps {
  onExplore: () => void;
}

export default function HeroSection({ onExplore }: HeroSectionProps) {
  const { isDarkTheme } = useTheme();

  // Refs
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  // توابع quickTo برای کارایی ۱۲۰ فریم در ثانیه
  const xToImage = useRef<gsap.QuickToFunc | null>(null);
  const yToImage = useRef<gsap.QuickToFunc | null>(null);
  const xToCard = useRef<gsap.QuickToFunc | null>(null);
  const yToCard = useRef<gsap.QuickToFunc | null>(null);

  // پارالکس روان بدون افت فریم
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    const targetX = (clientX / innerWidth - 0.5) * 35;
    const targetY = (clientY / innerHeight - 0.5) * 35;

    xToImage.current?.(targetX * 0.9);
    yToImage.current?.(targetY * 0.9);
    xToCard.current?.(-targetX * 0.4);
    yToCard.current?.(-targetY * 0.4);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      xToImage.current = gsap.quickTo(imageWrapperRef.current, "x", { duration: 0.9, ease: "power2.out" });
      yToImage.current = gsap.quickTo(imageWrapperRef.current, "y", { duration: 0.9, ease: "power2.out" });
      xToCard.current = gsap.quickTo(cardRef.current, "x", { duration: 0.9, ease: "power2.out" });
      yToCard.current = gsap.quickTo(cardRef.current, "y", { duration: 0.9, ease: "power2.out" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ۱. ورود سینمایی تصویر بزرگ (از راست با زوم لطیف)
      tl.fromTo(
        imageWrapperRef.current,
        { opacity: 0, x: 80, scale: 1.15, filter: "blur(15px)" },
        { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 1.4 }
      );

      // ۲. شناور بودن دائمی تصویر بزرگ در پس‌زمینه
      gsap.to(imageWrapperRef.current, {
        y: "+=15",
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4,
      });

      // ۳. ورود کارت روی تصویر
      tl.fromTo(
        cardRef.current,
        { opacity: 0, x: -60, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1.1 },
        "-=1.1"
      );

      // ۴. بج
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.6"
      );

      // ۵. انیمیشن حروف تیتر
      const chars = titleRef.current?.querySelectorAll(".char");
      if (chars?.length) {
        tl.fromTo(
          chars,
          { opacity: 0, y: 25, rotateX: -60 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.03, ease: "back.out(1.7)" },
          "-=0.4"
        );
      }

      // ۶. زیرعنوان و دکمه
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.3"
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
        "-=0.3"
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const titleText = "HÖRDEUTSCH";

  return (
    <section
      ref={sectionRef}
      id="kapitel-01"
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center px-4 sm:px-8 lg:px-16 dir-rtl overflow-hidden py-16 lg:py-0 select-none"
    >
      {/* هاله نورانی محیطی برای غوطه‌وری تصویر */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[45rem] h-[45rem] bg-[#FFCC00]/15 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-[35rem] h-[35rem] bg-red-600/10 rounded-full blur-[140px]" />
      </div>

      {/* گرید اصلی */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 items-center relative z-10">
        
        {/* ================= ستون ۱: تصویر بسیار بزرگ (از مرز باکس بیرون می‌زند) ================= */}
        <div className="lg:col-span-7 order-1 flex justify-center lg:justify-start relative z-10 overflow-visible">
          <div
            ref={imageWrapperRef}
            className="relative w-full min-w-[320px] sm:min-w-[550px] lg:min-w-[750px] xl:min-w-[900px] lg:-ml-36 xl:-ml-52 pointer-events-none transform-gpu"
          >
            {/* عکس اصلی با عرض ۱۴۰٪ و بدون محدودیت max-w */}
            <img
              src={heroImg}
              alt="Brandenburg Gate and Berlin Skyline"
              className="w-[125%] sm:w-[135%] lg:w-[145%] max-w-none h-auto object-contain relative z-10"
              style={{
                filter: isDarkTheme
                  ? "drop-shadow(0 25px 50px rgba(255,204,0,0.25)) drop-shadow(0 35px 70px rgba(0,0,0,0.9))"
                  : "drop-shadow(0 20px 40px rgba(217,119,6,0.25)) drop-shadow(0 25px 50px rgba(0,0,0,0.15))",
              }}
            />
          </div>
        </div>

        {/* ================= ستون ۲: کارت CTA شیشه‌ای (روی تصویر قرار می‌گیرد) ================= */}
        <div className="lg:col-span-5 order-2 -mt-12 lg:mt-0 z-20 relative">
          <div
            ref={cardRef}
            className={`w-full p-6 sm:p-8 md:p-11 rounded-3xl border relative overflow-hidden backdrop-blur-3xl transition-all duration-300 transform-gpu ${
              isDarkTheme
                ? "bg-black/45 border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
                : "bg-white/75 border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.1)]"
            }`}
          >
            {/* نوار سه‌رنگ بالای کارت */}
            <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-black via-red-600 to-[#FFCC00]" />

            {/* نشان بالای کارت */}
            <div ref={badgeRef} className="mb-6 flex justify-start">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                  isDarkTheme
                    ? "bg-white/10 border-white/20 text-amber-300"
                    : "bg-black/5 border-black/10 text-amber-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FFCC00] animate-pulse" />
                پلتفرم تخصصی آموزش زبان آلمانی
              </span>
            </div>

            {/* عنوان اصلی سئو و A11y شده */}
            <h1
              ref={titleRef}
              aria-label={titleText}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-right leading-none"
            >
              <span aria-hidden="true">
                {Array.from(titleText).map((char, i) => (
                  <span
                    key={i}
                    className={`char inline-block ${
                      i < 3
                        ? isDarkTheme
                          ? "text-white drop-shadow-md"
                          : "text-zinc-900"
                        : i < 7
                        ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        : "text-[#FFCC00] drop-shadow-[0_0_20px_rgba(255,204,0,0.6)]"
                    }`}
                  >
                    {char}
                  </span>
                ))}
              </span>
            </h1>

            {/* زیرعنوان */}
            <p
              ref={subtitleRef}
              className={`text-base sm:text-lg md:text-xl mb-8 leading-relaxed font-bold text-right ${
                isDarkTheme ? "text-zinc-200" : "text-zinc-800"
              }`}
            >
              آلمانی را نه فقط یاد بگیر، که زندگی کن.
              <br />
              <span className="text-sm font-normal opacity-80 mt-1 block">
                تجربه‌ای شنیداری و غوطه‌ور از اعماق فرهنگ و زبان آلمانی
              </span>
            </p>

            {/* دکمه CTA */}
            <div className="flex justify-start">
              <button
                ref={ctaRef}
                onClick={onExplore}
                className="group relative inline-flex items-center justify-center px-8 py-3.5 font-bold text-sm text-white transition-all duration-300 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_40px_rgba(255,204,0,0.5)] active:scale-95"
              >
                <span className="absolute inset-0 bg-zinc-950 transition-opacity group-hover:opacity-0" />
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, #000000 0%, #DD0000 50%, #FFCC00 100%)",
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  <span>شروع یادگیری</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4 transition-transform group-hover:-translate-x-1.5 rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* نشانگر اسکرول */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 z-30 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
        }
      >
        <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase font-semibold">
          اسکرول کنید
        </span>
        <div className="w-5 h-9 rounded-full border-2 border-current flex justify-center p-1">
          <div className="w-1 h-2 bg-current rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}