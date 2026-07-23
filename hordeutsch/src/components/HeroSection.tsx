interface HeroSectionProps {
  onExplore?: () => void;
}

export default function HeroSection({}: HeroSectionProps) {
  return (
    <section id="kapitel-01" className="relative min-h-screen flex items-center justify-center px-6 text-center select-none">
      <div className="max-w-4xl mx-auto space-y-6 z-10">
        
        {/* نشان کوچک بالای تیتر */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-black/40 backdrop-blur-xl text-germanGold text-xs font-semibold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-germanGold animate-pulse"></span>
          پلتفرم تخصصی زبان آلمانی
        </div>

        {/* تیتر اصلی */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          سفر در اعماق <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-germanGold via-red-500 to-amber-200">
            زبان و فرهنگ آلمانی
          </span>
        </h1>

        {/* زیرتیتر توضیحی */}
        <p className="max-w-2xl mx-auto text-sm md:text-base text-zinc-400 font-medium leading-relaxed backdrop-blur-xs p-2 rounded-xl">
          یادگیری آلمانی با روش‌های نوین هوشمند، تلفظ صوتی اختصاصی و تجربه‌ای کهکشانی و تعاملی.
        </p>

      </div>
    </section>
  );
}