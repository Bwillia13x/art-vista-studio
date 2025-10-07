import { useEffect, useRef, useState } from "react";
import barbershopImage from "@/assets/barbershop-interior.jpg";

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 md:py-40 px-6 bg-background" id="about">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary mb-8 tracking-tight leading-tight">
              Craftsmanship & Tradition
            </h2>
            <div className="w-20 h-px bg-primary mb-10" />
            <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
              Nestled in the heart of Bridgeland, The Bridge represents more than a barbershop—it's a destination for
              the discerning gentleman who values quality, precision, and timeless style.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our master barbers bring decades of combined experience, blending classic techniques with contemporary
              aesthetics to deliver an unparalleled grooming experience.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every detail, from our carefully curated products to our refined atmosphere, has been thoughtfully
              designed to provide you with a moment of luxury in your day.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { value: "25+", label: "Years combined mastery" },
                { value: "5-Star", label: "Guest rated experience" },
                { value: "1:1", label: "Personalized consultations" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-6">
                  <p className="font-serif text-3xl text-primary">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            <div className="aspect-[4/5] rounded-sm relative overflow-hidden border border-primary/10 shadow-2xl group">
              <img 
                src={barbershopImage} 
                alt="Luxury barbershop interior showcasing traditional craftsmanship" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div
              className={`absolute -bottom-8 -right-8 w-40 h-40 border border-primary/20 rounded-sm -z-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 translate-x-4 translate-y-4"}`}
            />
            <div
              className={`absolute -top-8 -left-8 w-32 h-32 border border-primary/20 rounded-sm -z-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0 translate-y-0" : "opacity-0 -translate-x-4 -translate-y-4"}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
