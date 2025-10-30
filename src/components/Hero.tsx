import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoLoadingStates, setVideoLoadingStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});
  const [retryCount, setRetryCount] = useState<Record<number, number>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const videos = [
    "/videos/cinematic-barbershop.mp4",
    "/videos/barbershop-scene.mp4",
    "/videos/barbershop-orbit.mp4"
  ];

  // Placeholder image for initial paint
  const placeholderImage = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80&auto=format&fit=crop";

  useEffect(() => {
    setIsLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle video loading states
  const handleVideoLoadStart = (index: number) => {
    setVideoLoadingStates(prev => ({ ...prev, [index]: 'loading' }));
  };

  const handleVideoCanPlay = (index: number) => {
    setVideoLoadingStates(prev => ({ ...prev, [index]: 'loaded' }));
  };

  const handleVideoError = (index: number) => {
    setVideoLoadingStates(prev => ({ ...prev, [index]: 'error' }));
  };

  const retryVideoLoad = (index: number) => {
    const video = videoRefs.current[index];
    if (video && (retryCount[index] || 0) < 3) {
      setRetryCount(prev => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
      setVideoLoadingStates(prev => ({ ...prev, [index]: 'loading' }));
      video.load();
    }
  };

  useEffect(() => {
    // Only preload the first video for faster initial load
    const firstVideo = videoRefs.current[0];
    if (firstVideo) {
      firstVideo.preload = 'auto';
      firstVideo.load();
      firstVideo.play().catch(err => console.log("Initial video play error:", err));
    }

    // Lazy load other videos after first video starts playing
    const preloadOthers = setTimeout(() => {
      videoRefs.current.forEach((video, index) => {
        if (video && index > 0) {
          video.preload = 'metadata'; // Load metadata only
        }
      });
    }, 2000); // Wait 2 seconds before preloading others

    return () => clearTimeout(preloadOthers);
  }, []);

  useEffect(() => {
    // Handle video switching
    const currentVideo = videoRefs.current[currentVideoIndex];
    const nextIndex = (currentVideoIndex + 1) % videos.length;
    const nextVideo = videoRefs.current[nextIndex];

    if (currentVideo) {
      // Ensure current video is playing from the start
      if (currentVideo.currentTime === 0 || currentVideo.paused) {
        currentVideo.currentTime = 0;
        currentVideo.play().catch(err => console.log("Video play error:", err));
      }
    }

    // Preload next video for seamless transition
    if (nextVideo && nextVideo.readyState < 2) {
      nextVideo.load();
    }

    // Pause videos that are not current or next
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentVideoIndex && index !== nextIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentVideoIndex, videos.length]);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;

    if (!video.duration || isNaN(video.duration)) return;

    const timeRemaining = video.duration - video.currentTime;

    // Start preparing next video 2 seconds before current ends
    if (timeRemaining <= 2 && timeRemaining > 1.5) {
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      const nextVideo = videoRefs.current[nextIndex];

      if (nextVideo && nextVideo.paused) {
        nextVideo.currentTime = 0;
        // Start next video but keep it invisible until crossfade
        nextVideo.play().catch(err => console.log("Next video prep error:", err));
      }
    }

    // Trigger crossfade transition 1 second before video ends
    if (timeRemaining <= 1 && !isTransitioning) {
      setIsTransitioning(true);

      // Switch to next video
      setTimeout(() => {
        const nextIndex = (currentVideoIndex + 1) % videos.length;
        setCurrentVideoIndex(nextIndex);
        setIsTransitioning(false);
      }, 800);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-4 sm:pt-6 md:pt-8 pb-24" aria-label="Hero section">
      {/* Placeholder background image for initial paint */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${placeholderImage})`,
          opacity: videoLoadingStates[currentVideoIndex] === 'loaded' ? 0 : 0.3,
          transition: 'opacity 0.5s ease-out'
        }}
        aria-hidden="true"
      />

      {/* Video background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {videos.map((video, index) => {
          const isActive = index === currentVideoIndex;
          const nextIndex = (currentVideoIndex + 1) % videos.length;
          const isNext = index === nextIndex;

          return (
            <div
              key={video}
              className="absolute inset-0"
              style={{
                zIndex: isActive ? 2 : isNext ? 1 : 0,
              }}
            >
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                src={video}
                muted
                loop={false}
                playsInline
                preload="auto"
                onLoadStart={() => handleVideoLoadStart(index)}
                onCanPlay={() => handleVideoCanPlay(index)}
                onError={() => handleVideoError(index)}
                onTimeUpdate={isActive ? handleVideoTimeUpdate : undefined}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover md:w-[110%] md:h-auto md:object-contain md:top-[38%]"
                style={{
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'opacity',
                  transform: 'translate(-50%, -50%) translate3d(0, 0, 0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />

              {/* Loading skeleton for current video */}
              {isActive && videoLoadingStates[index] === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto animate-pulse" />
                    <p className="text-primary/70 text-sm font-medium">Loading experience...</p>
                  </div>
                </div>
              )}

              {/* Error state with retry */}
              {isActive && videoLoadingStates[index] === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center space-y-4 p-6 rounded-lg bg-background/60 border border-primary/20">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <p className="text-foreground font-medium">Unable to load video</p>
                    {(retryCount[index] || 0) < 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryVideoLoad(index)}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Multi-layer glass overlay */}
        <div className="absolute inset-0" style={{
          backdropFilter: 'blur(1px) brightness(0.75) saturate(1.15)',
          WebkitBackdropFilter: 'blur(1px) brightness(0.75) saturate(1.15)',
          background: 'linear-gradient(135deg, hsl(0 0% 0% / 0.2) 0%, hsl(0 0% 0% / 0.15) 50%, hsl(0 0% 0% / 0.2) 100%)'
        }} />

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            backgroundRepeat: 'repeat'
          }}
        />

        {/* Premium animated glow orbs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 40%, transparent 70%)',
            animation: 'glow-pulse 10s ease-in-out infinite',
            filter: 'blur(40px)'
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.12) 0%, hsl(var(--accent) / 0.04) 50%, transparent 75%)',
            animation: 'glow-pulse 12s ease-in-out infinite reverse',
            filter: 'blur(50px)'
          }}
        />

        {/* Refined vignette with color tint */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(0_0%_0%_/_0.2)_60%,_hsl(0_0%_0%_/_0.4)_100%)]" />

        {/* Subtle edge glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.03) 0%, transparent 20%, transparent 80%, hsl(var(--primary) / 0.04) 100%)'
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Hero content with enhanced animations */}
        <div
          className={`space-y-8 mb-16 transition-all duration-1200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          style={{
            animation: isLoaded ? 'fade-blur-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards' : 'none'
          }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-primary font-bold tracking-tight leading-[1.1] drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
            Artisan Grooming in Bridgeland
          </h1>

          {/* Premium divider with glow */}
          <div className="flex items-center justify-center gap-8">
            <div
              className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
              style={{
                boxShadow: '0 0 12px hsl(var(--primary) / 0.3)'
              }}
            />
            <span className="text-xs uppercase tracking-[0.5em] text-primary/80 font-semibold">
              Calgary
            </span>
            <div
              className="h-px w-20 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70"
              style={{
                boxShadow: '0 0 12px hsl(var(--primary) / 0.3)'
              }}
            />
          </div>

          <p className="text-lg md:text-xl lg:text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            Where craftsmanship meets luxury. Experience the art of traditional barbering elevated to new heights.
          </p>
        </div>

        {/* Premium CTA buttons with enhanced styling */}
        <div
          className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          style={{
            animation: isLoaded ? 'spring-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.6s backwards' : 'none'
          }}
        >
          <Button
            size="lg"
            variant="premium"
            className="font-bold tracking-wide text-base px-12 py-4 h-14"
            onClick={() => scrollToSection("booking")}
          >
            Reserve Your Experience
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="font-semibold tracking-wide text-base px-12 py-4 h-14"
            onClick={() => scrollToSection("services")}
          >
            Explore Services
          </Button>
        </div>
      </div>

      {/* Enhanced scroll indicator with glow */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 transition-all duration-1200 ${isLoaded ? "opacity-100" : "opacity-0"
          }`}
        style={{
          animation: isLoaded ? 'fade-in 1s ease-out 1s backwards' : 'none'
        }}
      >
        <span className="text-xs uppercase tracking-[0.5em] text-primary/70 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          Discover
        </span>
        <div
          className="relative p-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20"
          style={{
            animation: 'float 3s ease-in-out infinite',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.2)'
          }}
        >
          <ChevronDown className="w-5 h-5 text-primary" />
        </div>
      </div>
    </section>
  );
}
