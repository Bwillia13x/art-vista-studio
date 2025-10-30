import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import GalleryLightbox from "@/components/GalleryLightbox";
import { useSwipeGesture } from "@/hooks/use-touch-gestures";
import { ChevronLeft, ChevronRight } from "lucide-react";

const galleryImages = [
  { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80", alt: "The Bridge barbershop luxury interior and premium grooming services - classic barber chair", category: "Interior" },
  { url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80", alt: "Premium haircut service showcasing expert craftsmanship", category: "Haircuts" },
  { url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80", alt: "Traditional straight razor shave demonstration", category: "Shaves" },
  { url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80", alt: "Professional beard sculpting and grooming", category: "Beard Grooming" },
  { url: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80", alt: "Elegant barbershop ambiance with vintage details", category: "Interior" },
  { url: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=800&q=80", alt: "Premium grooming products and tools display", category: "Products" },
];

export default function Gallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
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

  const categories = ["All", ...Array.from(new Set(galleryImages.map(img => img.category).filter(Boolean)))];
  const filteredImages = selectedFilter === "All"
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedFilter);

  const scrollToNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const scrollToPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: scrollToNext,
    onSwipeRight: scrollToPrev,
  }, { threshold: 50 });

  return (
    <section ref={sectionRef} className="py-32 md:py-40 bg-background" id="gallery" aria-labelledby="gallery-heading">
      <div
        className={`mb-20 px-6 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2 id="gallery-heading" className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary mb-8 tracking-tight">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedFilter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(category)}
                className={`text-xs uppercase tracking-wider transition-all duration-300 ${selectedFilter === category
                  ? 'shadow-lg shadow-primary/30 scale-105'
                  : 'hover:border-primary hover:text-primary hover:scale-105 active:scale-95'
                  }`}
              >
                {category}
                {selectedFilter === category && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                )}
              </Button>
            ))}
          </div>

          {/* Pause control */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleUserPause}
              aria-pressed={isUserPaused ? "true" : "false"}
              aria-label={prefersReducedMotion ? "Autoplay disabled due to reduced motion preference" : isUserPaused ? "Resume gallery carousel autoplay" : "Pause gallery carousel autoplay"}
              className="text-xs uppercase tracking-widest rounded-full border border-primary/40 px-4 py-2 text-primary transition-all duration-300 hover:bg-primary/10 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        </div>
        <div className="relative">
          {/* Navigation buttons for mobile */}
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-primary/40 hover:bg-primary hover:text-primary-foreground md:hidden shadow-lg"
            aria-label="Previous images"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-primary/40 hover:bg-primary hover:text-primary-foreground md:hidden shadow-lg"
            aria-label="Next images"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto touch-pan-x"
            style={{ scrollBehavior: "smooth" }}
            onPointerEnter={() => setIsHoverPaused(true)}
            onPointerLeave={() => setIsHoverPaused(false)}
            onFocus={() => setIsHoverPaused(true)}
            onBlur={() => setIsHoverPaused(false)}
            role="region"
            aria-label="Image gallery carousel"
            aria-live={isPaused ? "off" : "polite"}
            {...swipeHandlers}
          >
            {[...filteredImages, ...filteredImages].map((image, index) => (
              <button
                key={index}
                onClick={() => setLightboxIndex(index % filteredImages.length)}
                className={`flex-shrink-0 w-80 h-[28rem] rounded-lg relative overflow-hidden border border-primary/10 hover:border-primary/40 transition-all duration-500 ease-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:shadow-2xl hover:shadow-primary/20 ${isVisible ? "opacity-100" : "opacity-0"}`}
                style={{
                  transitionDelay: `${(index % filteredImages.length) * 100}ms`,
                  willChange: 'transform, border-color',
                  transform: 'translate3d(0, 0, 0)',
                  perspective: '1000px',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 30;
                  const rotateY = (centerX - x) / 30;
                  e.currentTarget.style.transform = `translate3d(0, -8px, 20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)';
                }}
                aria-label={`View ${image.alt} in lightbox`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Zoom indicator */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-0 group-hover:scale-100">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-6">
                  <div className="text-left transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-sm font-semibold">{image.category}</p>
                    <p className="text-white/80 text-xs mt-1">Click to enlarge</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-8 px-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Use the pause control or hover to stop motion • Autoplay respects reduced-motion settings • Click any image to view full size
        </p>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={filteredImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
