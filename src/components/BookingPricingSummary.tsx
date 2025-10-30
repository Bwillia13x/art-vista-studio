import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, Sparkles } from "lucide-react";

interface Service {
    id: string;
    name: string;
    price: number;
    duration: number;
}

interface AddOn {
    id: string;
    name: string;
    price: number;
}

interface Stylist {
    id: string;
    name: string;
    title: string;
}

interface BookingPricingSummaryProps {
    service?: Service;
    addOns?: AddOn[];
    stylist?: Stylist;
    appointmentDate?: Date;
    appointmentTime?: string;
    className?: string;
}

export default function BookingPricingSummary({
    service,
    addOns = [],
    stylist,
    appointmentDate,
    appointmentTime,
    className = ""
}: BookingPricingSummaryProps) {
    const subtotal = (service?.price || 0) + addOns.reduce((sum, addon) => sum + addon.price, 0);
    const tax = subtotal * 0.05; // 5% tax rate
    const total = subtotal + tax;

    const formatPrice = (price: number) => `$${price.toFixed(2)}`;
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!service) {
        return (
            <Card className={`bg-accent/30 border-primary/20 ${className}`}>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                            Select a service to see your appointment summary
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`bg-background/60 backdrop-blur-xl border-primary/20 sticky top-24 ${className}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Your Appointment
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Service details */}
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">{service.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{service.duration} min</span>
                            </div>
                        </div>
                        <span className="font-semibold text-primary">{formatPrice(service.price)}</span>
                    </div>

                    {/* Add-ons */}
                    {addOns.length > 0 && (
                        <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                            {addOns.map((addon) => (
                                <div key={addon.id} className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{addon.name}</span>
                                    <span className="text-sm font-medium text-foreground">
                                        +{formatPrice(addon.price)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Separator className="bg-primary/10" />

                {/* Pricing breakdown */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (5%)</span>
                        <span className="font-medium">{formatPrice(tax)}</span>
                    </div>
                </div>

                <Separator className="bg-primary/20" />

                {/* Total */}
                <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="text-lg font-bold text-foreground">Total</span>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary animate-in zoom-in duration-300">
                            {formatPrice(total)}
                        </div>
                    </div>
                </div>

                {/* Appointment details */}
                {(stylist || appointmentDate || appointmentTime) && (
                    <>
                        <Separator className="bg-primary/10" />
                        <div className="space-y-3 text-sm">
                            {stylist && (
                                <div>
                                    <p className="text-muted-foreground mb-1">Stylist</p>
                                    <div>
                                        <p className="font-semibold text-foreground">{stylist.name}</p>
                                        <p className="text-xs text-muted-foreground">{stylist.title}</p>
                                    </div>
                                </div>
                            )}

                            {appointmentDate && (
                                <div>
                                    <p className="text-muted-foreground mb-1">Date & Time</p>
                                    <p className="font-semibold text-foreground">{formatDate(appointmentDate)}</p>
                                    {appointmentTime && (
                                        <p className="text-sm text-muted-foreground mt-0.5">{appointmentTime}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Trust badge */}
                <div className="pt-4">
                    <Badge variant="outline" className="w-full justify-center py-2 border-primary/20 bg-primary/5">
                        <span className="text-xs text-muted-foreground">
                            💳 Secure booking • No payment required
                        </span>
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
