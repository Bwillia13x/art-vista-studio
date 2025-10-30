import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck, Users, Calendar, Award } from "lucide-react";

const testimonials = [
  {
    name: "Michael Chen",
    role: "Executive",
    content:
      "The Bridge isn't just a barbershop—it's an experience. The attention to detail and level of service is unmatched in Calgary. I wouldn't trust anyone else with my grooming.",
    rating: 5,
    verified: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "David Morrison",
    role: "Entrepreneur",
    content:
      "From the moment you walk in, you know you're somewhere special. The traditional shave is absolutely incredible. Worth every penny.",
    rating: 5,
    verified: true,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "James Patterson",
    role: "Creative Director",
    content:
      "Finally, a barbershop that understands modern style while respecting classic techniques. The team here are true craftsmen.",
    rating: 5,
    verified: true,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Robert Kim",
    role: "Tech Founder",
    content:
      "Exceptional service from start to finish. The team takes their time to understand what you want and delivers perfection every time.",
    rating: 5,
    verified: true,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Thomas Wright",
    role: "Lawyer",
    content:
      "Best barbershop experience in Calgary. The atmosphere is top-notch and the results speak for themselves.",
    rating: 5,
    verified: true,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
  },
];

const stats = [
  { icon: Users, value: "1,500+", label: "Happy Clients" },
  { icon: Calendar, value: "5+", label: "Years Experience" },
  { icon: Award, value: "4.9", label: "Average Rating" },
  { icon: BadgeCheck, value: "100%", label: "Satisfaction" },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [animatedStats, setAnimatedStats] = useState<number[]>([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

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

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying && isVisible) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isVisible, maxIndex]);

  // Animate stats counter
  useEffect(() => {
    if (!isVisible) return;

    const targets = [1500, 5, 4.9, 100];
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats(targets.map(target => {
        const value = target * progress;
        return Math.min(value, target);
      }));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-32 md:py-40 px-6 bg-accent/30" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 id="testimonials-heading" className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary mb-8 tracking-tight">
            Client Testimonials
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
            Don't just take our word for it. Here's what our clients have to say about their experience at The Bridge.
          </p>
        </div>

        {/* Social Proof Statistics */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: '200ms' }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            let displayValue = stat.value;

            if (index === 0) {
              displayValue = `${Math.floor(animatedStats[0]).toLocaleString()}+`;
            } else if (index === 1) {
              displayValue = `${Math.floor(animatedStats[1])}+`;
            } else if (index === 2) {
              displayValue = animatedStats[2].toFixed(1);
            } else if (index === 3) {
              displayValue = `${Math.floor(animatedStats[3])}%`;
            }

            return (
              <div
                key={stat.label}
                className="text-center p-6 rounded-lg bg-background/40 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105 group"
              >
                <Icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-primary mb-1 tabular-nums">
                  {displayValue}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10 -mx-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="pointer-events-auto rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="pointer-events-auto rounded-full bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-lg"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full md:w-1/3 flex-shrink-0 px-4"
                >
                  <Card
                    className={`bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-primary/20 group h-full ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    style={{
                      transitionDelay: `${index * 150}ms`,
                      willChange: 'transform, box-shadow, border-color',
                      transform: 'translate3d(0, 0, 0)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translate3d(0, -12px, 0) scale(1.02)';
                      setIsAutoPlaying(false);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1)';
                      setIsAutoPlaying(true);
                    }}
                  >
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <Quote className="w-8 h-8 text-primary/30 group-hover:text-primary/50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500" />
                        {testimonial.verified && (
                          <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 animate-in fade-in zoom-in duration-500">
                            <BadgeCheck className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-xs">Verified</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-primary text-primary group-hover:scale-110 transition-transform duration-300"
                            style={{ transitionDelay: `${i * 50}ms` }}
                          />
                        ))}
                      </div>

                      <p className="text-muted-foreground leading-relaxed mb-6 italic flex-grow">
                        "{testimonial.content}"
                      </p>

                      <div className="pt-4 border-t border-primary/20 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-primary/30 hover:bg-primary/50'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play control */}
          <div className="text-center mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              {isAutoPlaying ? '⏸ Pause auto-play' : '▶ Resume auto-play'}
            </button>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground max-w-xl">
            Join Calgary professionals who trust The Bridge for meticulous grooming. Reserve your chair in moments.
          </p>
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            onClick={scrollToBooking}
          >
            Book your experience
          </Button>
        </div>
      </div>
    </section>
  );
}
