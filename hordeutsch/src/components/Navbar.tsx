import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

gsap.registerPlugin(ScrollTrigger);

interface NavbarProps {
  onNavClick: (selector: string) => void;
}

export default function Navbar({ onNavClick }: NavbarProps) {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1010);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("Schwarzwald");

  // ردیاب پویای عرض صفحه
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1010);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // نوار پیشرفت اسکرول و شناسایی فصل جاری
  useEffect(() => {
    gsap.to(".scroll-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.1,
      },
    });

    const sections = document.querySelectorAll(".lesson-section");
    sections.forEach((section) => {
      const title = section.querySelector("h2")?.textContent || "Schwarzwald";
      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => setCurrentChapterTitle(title),
        onEnterBack: () => setCurrentChapterTitle(title),
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // تغییر تم با افکت دایره‌ای
  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextThemeIsLight = isDarkTheme;
    setIsDarkTheme(!isDarkTheme);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 pointer-events-none";
    overlay.style.zIndex = "9999";
    overlay.style.backgroundColor = nextThemeIsLight ? "#ffffff" : "#0d0d0d";
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    document.body.appendChild(overlay);

    const maxRadius = Math.hypot(window.innerWidth, window.innerHeight) * 1.25;

    gsap.to(overlay, {
      clipPath: `circle(${maxRadius}px at ${x}px ${y}px)`,
      duration: 1.1,
      ease: "power3.inOut",
      onComplete: () => {
        if (nextThemeIsLight) {
          document.documentElement.classList.add("light-theme");
          document.body.style.backgroundColor = "#FAFAF8";
          document.body.style.color = "#202124";
        } else {
          document.documentElement.classList.remove("light-theme");
          document.body.style.backgroundColor = "#0d0d0d";
          document.body.style.color = "#ffffff";
        }
        overlay.remove();
      }
    });
  };

  return (
    <>
      {isMobile ? (
        <NavbarMobile
          onNavClick={onNavClick}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
          currentChapterTitle={currentChapterTitle}
        />
      ) : (
        <NavbarDesktop
          onNavClick={onNavClick}
          isDarkTheme={isDarkTheme}
          toggleTheme={toggleTheme}
        />
      )}
    </>
  );
}