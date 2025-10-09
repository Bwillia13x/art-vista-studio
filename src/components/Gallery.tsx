import { useEffect, useRef, useState } from "react";

const galleryImages = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
  "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80",
  "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800&q=80",
];

export default function Gallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const isPaused = isUserPaused || isHoverPaused || prefersReducedMotion;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMotionPreference);
    } else {
      mediaQuery.addListener(updateMotionPreference);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateMotionPreference);
      } else {
        mediaQuery.removeListener(updateMotionPreference);
      }
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let scrollAmount = scrollContainer.scrollLeft;
    const scrollSpeed = 0.3;

    const scroll = () => {
      scrollAmount += scrollSpeed;
      scrollContainer.scrollLeft = scrollAmount;
      if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollAmount = 0;
      }
    };

    const interval = window.setInterval(scroll, 30);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  const toggleUserPause = () => {
    setIsUserPaused((prev) => !prev);
  };

  return (
    <section ref={sectionRef} className="py-32 md:py-40 bg-background" id="gallery">
      <div
        className={`mb-20 px-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary mb-8 tracking-tight">
            The Experience
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
            Step into a world where tradition meets modern luxury. Every detail has been crafted to provide an
            exceptional experience.
          </p>
        </div>
      </div>

      <div className="px-6">
        <div className="flex justify-end items-center gap-3 mb-4">
          <button
            type="button"
            onClick={toggleUserPause}
            aria-pressed={isUserPaused}
            className="text-xs uppercase tracking-widest rounded-full border border-primary/40 px-4 py-2 text-primary transition-colors duration-300 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            disabled={prefersReducedMotion}
          >
            {prefersReducedMotion ? "Autoplay disabled" : isUserPaused ? "Play carousel" : "Pause carousel"}
          </button>
          {prefersReducedMotion && (
            <span className="text-xs text-muted-foreground">
              Autoplay disabled to respect reduced motion settings.
            </span>
          )}
        </div>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto"
          style={{ scrollBehavior: "smooth" }}
          onPointerEnter={() => setIsHoverPaused(true)}
          onPointerLeave={() => setIsHoverPaused(false)}
          onFocus={() => setIsHoverPaused(true)}
          onBlur={() => setIsHoverPaused(false)}
        >
          {[...galleryImages, ...galleryImages].map((image, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-80 h-[28rem] rounded-sm relative overflow-hidden border border-primary/10 hover:border-primary/30 transition-all duration-500 group ${isVisible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: `${(index % galleryImages.length) * 100}ms` }}
            >
              <img
                src={image}
                alt={`The Bridge barbershop luxury interior and premium grooming services - image ${(index % galleryImages.length) + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8 px-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Use the pause control or hover to stop motion • Autoplay respects reduced-motion settings
        </p>
      </div>
    </section>
  );
}
