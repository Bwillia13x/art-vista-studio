import { useEffect, useState, lazy, Suspense } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navigation from "@/components/Navigation";
import SkipNav from "@/components/SkipNav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { usePullToRefresh } from "@/hooks/use-touch-gestures";
import { Loader2 } from "lucide-react";

// Lazy load non-critical components for better performance
const About = lazy(() => import("@/components/About"));
const Services = lazy(() => import("@/components/Services"));
const Gallery = lazy(() => import("@/components/Gallery"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const Booking = lazy(() => import("@/components/Booking"));
const AIConcierge = lazy(() => import("@/components/AIConcierge"));
const SocialProofWidget = lazy(() => import("@/components/SocialProofWidget").then(m => ({ default: m.SocialProofWidget })));

export default function Index() {
  const [scrollY, setScrollY] = useState(0);

  const { isPulling, isRefreshing, pullDistance, handlers } = usePullToRefresh({
    onRefresh: async () => {
      // Simulate refresh action
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    },
    threshold: 80,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <PageTransition />
      <SkipNav />

      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-opacity duration-300"
          style={{ opacity: isPulling || isRefreshing ? 1 : 0 }}
        >
          <div className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-primary/20 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm text-primary font-medium">
              {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <header className="relative z-50" {...handlers}>
        <AnnouncementBar />
        <Navigation />
      </header>
      <main className="min-h-screen bg-background" id="main-content" role="main">
        <div
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <Hero />
        </div>
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
          <About />
          <Services />
          <Gallery />
          <Testimonials />
          <Booking />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <AIConcierge />
        <SocialProofWidget />
      </Suspense>
    </>
  );
}
