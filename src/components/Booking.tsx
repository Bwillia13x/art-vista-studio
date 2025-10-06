import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";

export default function Booking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: "",
        time: "",
        notes: "",
      });
    }, 3000);
  };

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-background" id="booking">
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary mb-6 tracking-tight">
            Reserve Your Experience
          </h2>
          <div className="w-20 h-px bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Book your appointment at Calgary's premier barbershop. Limited availability—reserve your spot today.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div
            className={`lg:col-span-2 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <Card className="bg-accent/30 border-primary/20 hover:border-primary/30 transition-all">
              <CardContent className="p-8">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                    <h3 className="text-2xl font-serif text-primary mb-2">Request Received!</h3>
                    <p className="text-muted-foreground text-center">
                      We'll contact you shortly to confirm your appointment.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-background border-primary/20 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-background border-primary/20 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-background border-primary/20 focus:border-primary transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service">Service *</Label>
                        <Select
                          value={formData.service}
                          onValueChange={(value) => setFormData({ ...formData, service: value })}
                          required
                        >
                          <SelectTrigger className="bg-background border-primary/20 focus:border-primary transition-colors">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="signature-cut">Signature Cut - $65</SelectItem>
                            <SelectItem value="traditional-shave">Traditional Shave - $55</SelectItem>
                            <SelectItem value="cut-shave">Cut & Shave - $110</SelectItem>
                            <SelectItem value="beard-sculpting">Beard Sculpting - $45</SelectItem>
                            <SelectItem value="grey-blending">Grey Blending - $85</SelectItem>
                            <SelectItem value="executive-package">Executive Package - $195</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="date">Preferred Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="bg-background border-primary/20 focus:border-primary transition-colors"
                          required
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Preferred Time *</Label>
                        <Select
                          value={formData.time}
                          onValueChange={(value) => setFormData({ ...formData, time: value })}
                          required
                        >
                          <SelectTrigger className="bg-background border-primary/20 focus:border-primary transition-colors">
                            <SelectValue placeholder="Select a time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9:00">9:00 AM</SelectItem>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                            <SelectItem value="15:00">3:00 PM</SelectItem>
                            <SelectItem value="16:00">4:00 PM</SelectItem>
                            <SelectItem value="17:00">5:00 PM</SelectItem>
                            <SelectItem value="18:00">6:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="bg-background border-primary/20 focus:border-primary transition-colors"
                        placeholder="Any special requests or preferences..."
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-primary/20"
                    >
                      Confirm Booking Request
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      We'll contact you within 24 hours to confirm your appointment
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              className={`bg-accent/30 border-primary/20 hover:border-primary/30 transition-all duration-500 hover:shadow-md ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              style={{ transitionDelay: "400ms" }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Visit Us</h3>
                    <address className="text-sm text-muted-foreground leading-relaxed not-italic">
                      123 Bridge Street
                      <br />
                      Bridgeland, Calgary
                      <br />
                      AB T2E 2K8
                    </address>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`bg-accent/30 border-primary/20 hover:border-primary/30 transition-all duration-500 hover:shadow-md ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              style={{ transitionDelay: "600ms" }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Contact</h3>
                    <p className="text-sm text-muted-foreground">(403) 555-0123</p>
                    <p className="text-sm text-muted-foreground">info@thebridgeyyc.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`bg-accent/30 border-primary/20 hover:border-primary/30 transition-all duration-500 hover:shadow-md ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              style={{ transitionDelay: "800ms" }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-primary">Hours</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Monday - Friday: 9am - 7pm</p>
                      <p>Saturday: 9am - 6pm</p>
                      <p>Sunday: 10am - 5pm</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
