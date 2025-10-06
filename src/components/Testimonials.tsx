import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Michael Chen",
    role: "Executive",
    content:
      "The Bridge isn't just a barbershop—it's an experience. The attention to detail and level of service is unmatched in Calgary. I wouldn't trust anyone else with my grooming.",
    rating: 5,
  },
  {
    name: "David Morrison",
    role: "Entrepreneur",
    content:
      "From the moment you walk in, you know you're somewhere special. The traditional shave is absolutely incredible. Worth every penny.",
    rating: 5,
  },
  {
    name: "James Patterson",
    role: "Creative Director",
    content:
      "Finally, a barbershop that understands modern style while respecting classic techniques. The team here are true craftsmen.",
    rating: 5,
  },
];

export default function Testimonials() {
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
    <section ref={sectionRef} className="py-32 md:py-40 px-6 bg-accent/30" id="testimonials">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-20 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl text-primary mb-8 tracking-tight">
            Client Testimonials
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mb-8" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-lg">
            Don't just take our word for it. Here's what our clients have to say about their experience at The Bridge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`bg-background border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8">
                <Quote className="w-8 h-8 text-primary/30 mb-4 group-hover:text-primary/50 transition-colors" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary group-hover:scale-110 transition-transform"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">{testimonial.content}</p>
                <div className="pt-4 border-t border-primary/20">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
