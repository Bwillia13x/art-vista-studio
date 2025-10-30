import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Sparkles, Clock, Award, TrendingUp } from "lucide-react";

const services = [
  {
    name: "Signature Cut",
    description: "Precision haircut tailored to your style, including consultation, wash, cut, and styling.",
    duration: "45 min",
    price: "$65",
    icon: Scissors,
    popular: true,
  },
  {
    name: "Traditional Shave",
    description: "Hot towel treatment, straight razor shave, and premium aftercare for the ultimate experience.",
    duration: "30 min",
    price: "$55",
    icon: Sparkles,
    popular: false,
  },
  {
    name: "Cut & Shave",
    description: "Our complete grooming package combining signature cut with traditional shave.",
    duration: "75 min",
    price: "$110",
    icon: Award,
    popular: true,
  },
  {
    name: "Beard Sculpting",
    description: "Expert beard trimming and shaping with hot towel treatment and conditioning.",
    duration: "30 min",
    price: "$45",
    icon: Scissors,
    popular: false,
  },
  {
    name: "Grey Blending",
    description: "Natural-looking color treatment to blend grey hair seamlessly with your natural tone.",
    duration: "60 min",
    price: "$85",
    icon: Sparkles,
    popular: false,
  },
  {
    name: "Executive Package",
    description: "The ultimate grooming experience: cut, shave, beard sculpting, and scalp treatment.",
    duration: "120 min",
    price: "$195",
    icon: Award,
    popular: true,
  },
];

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section ref={sectionRef} className="py-32 md:py-40 px-6 bg-accent/30" id="services" aria-labelledby="services-heading">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 id="services-heading" className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary mb-8 tracking-tight">
            Bespoke Services
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
            Each service is performed with meticulous attention to detail, ensuring you leave looking and feeling your
            absolute best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className={`relative bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/40 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-primary/20 group cursor-pointer ${service.popular ? 'ring-2 ring-primary/30' : ''
                  } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  animation: isVisible ? `spring-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms backwards` : 'none',
                  willChange: 'transform, box-shadow, border-color',
                  transform: 'translate3d(0, 0, 0)',
                  perspective: '1000px',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 20;
                  const rotateY = (centerX - x) / 20;
                  e.currentTarget.style.transform = `translate3d(0, -12px, 0) scale(1.02) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1) rotateX(0deg) rotateY(0deg)';
                }}
              >
                {/* Popular badge */}
                {service.popular && (
                  <div className="absolute -top-3 -right-3 z-10 animate-in zoom-in duration-500">
                    <Badge className="bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground px-3 py-1 shadow-lg shadow-primary/50 animate-pulse">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-[900ms] -translate-y-20 translate-x-20 group-hover:-translate-y-8 group-hover:translate-x-8"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                  <div className="mb-4 relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-lg scale-0 group-hover:scale-150 transition-transform duration-[900ms]"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />
                    <div className="relative inline-flex p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-all duration-[600ms] group-hover:scale-110 group-hover:rotate-3"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                      <Icon className="w-8 h-8 text-primary/60 group-hover:text-primary transition-all duration-[600ms]"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                      />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl text-primary mb-3 group-hover:text-primary/80 transition-colors duration-[500ms]">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors duration-[500ms]">{service.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-primary/20 group-hover:border-primary/40 transition-colors duration-[500ms]">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2 group-hover:text-primary/70 transition-colors duration-[500ms]">
                      <Clock className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                      <span>{service.duration}</span>
                    </span>
                    <span className="text-primary font-bold text-2xl group-hover:scale-110 transition-transform duration-300 inline-block">
                      {service.price}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
