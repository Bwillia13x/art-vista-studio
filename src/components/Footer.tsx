import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-primary/20 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[60px] h-[60px] bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">TB</span>
              </div>
              <div>
                <h3 className="font-serif text-2xl text-primary">The Bridge</h3>
                <p className="text-xs text-muted-foreground">Premium Grooming</p>
              </div>
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
              <a href="#" className="text-primary/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary/60 hover:text-primary transition-colors">
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
