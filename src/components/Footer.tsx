import { MapPin, Phone, Mail, Instagram, Facebook, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/bridge-logo.png";

export default function Footer() {
  const scrollToBooking = () => {
    const element = document.getElementById("booking");
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black border-t border-primary/20 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary/70">Begin your ritual</p>
            <h3 className="mt-3 text-2xl font-serif text-primary">Ready to cross the bridge?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Reserve a chair for your next cut or grooming service in under a minute.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={scrollToBooking}
            >
              Book now
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary hover:bg-primary/10">
              <a href="mailto:info@thebridgeyyc.com">Connect with concierge</a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="mb-6">
              <img
                src={logo} 
                alt="The Bridge Barbershop" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Calgary's premier destination for luxury grooming. Where traditional craftsmanship meets modern style in
              the heart of Bridgeland.
            </p>
          </div>

          <div>
            <h4 className="text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" />
                <span>
                  123 Bridge Street
                  <br />
                  Bridgeland, Calgary
                  <br />
                  AB T2E 2K8
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary/60 flex-shrink-0" />
                <span>(403) 555-0123</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary/60 flex-shrink-0" />
                <span>info@thebridgeyyc.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-primary font-semibold mb-4 text-sm uppercase tracking-wider">Hours</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Mon - Fri: 9am - 7pm</p>
              <p>Saturday: 9am - 6pm</p>
              <p>Sunday: 10am - 5pm</p>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-primary/60 hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary/60 hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/20 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} The Bridge Barbershop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
