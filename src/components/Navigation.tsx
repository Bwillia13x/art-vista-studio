import { useState, useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/bridge-logo.png";

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const bookNowButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Calculate scroll progress
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      setScrollProgress(scrolled);

      const sections = ["about", "services", "gallery", "testimonials", "booking"];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      setActiveSection(current ?? "");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Magnetic button effect
  useEffect(() => {
    const button = bookNowButtonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);

      if (distance < 100) {
        const strength = (100 - distance) / 100;
        setMousePosition({ x: x * strength * 0.3, y: y * strength * 0.3 });
      }
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Scroll progress indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-primary-glow to-primary z-50 transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll progress"
      />


      <nav
        id="navigation"
        aria-label="Primary"
        className={`sticky top-0 z-40 w-full transition-all duration-500 ${isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-primary/20 shadow-xl shadow-black/5"
          : "bg-background/80 supports-[backdrop-filter]:bg-background/60 border-b border-transparent backdrop-blur-lg"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between gap-4">
            {/* Logo - Always visible */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
              aria-label="Scroll to top"
            >
              <img 
                src={logo} 
                alt="The Bridge Barbershop" 
                className="h-10 w-auto md:h-12"
              />
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-sm font-medium transition-all duration-300 tracking-wide relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background px-1 hover:-translate-y-0.5 hover:scale-105 ${activeSection === link.href.slice(1) ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary via-primary-glow to-primary transition-all duration-300 shadow-[0_0_8px_hsl(var(--primary)/0.5)] ${activeSection === link.href.slice(1) ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                  />
                  {/* Haptic feedback indicator */}
                  <span className="absolute inset-0 rounded-md bg-primary/5 scale-0 group-hover:scale-100 group-active:scale-95 transition-transform duration-200" />
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <Button
                ref={bookNowButtonRef}
                size="sm"
                variant="premium"
                onClick={() => scrollToSection("#booking")}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
                style={{
                  transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                  transition: mousePosition.x === 0 ? 'transform 0.3s ease-out' : 'none'
                }}
              >
                <span className="relative z-10">Book Now</span>
                {/* Shimmer effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Button>
            </div>

            <button
              className="lg:hidden text-primary transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen ? "true" : "false"}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop mobile menu fallback and Mobile bottom sheet */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navigation"
        snapPoints={[0.5, 0.75]}
        className="lg:hidden"
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link, index) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className={`text-left text-xl font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:translate-x-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 min-h-[44px] ${activeSection === link.href.slice(1) ? "bg-primary/5 text-primary border-l-4 border-primary" : "text-foreground/80 hover:text-primary"
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.name}
            </button>
          ))}
          <div className="flex flex-col gap-3 mt-6">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold hover:scale-105 active:scale-95 transition-all duration-200 min-h-[44px] text-base"
              onClick={() => scrollToSection("#booking")}
            >
              Reserve Your Experience
            </Button>
            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

export default memo(Navigation);
