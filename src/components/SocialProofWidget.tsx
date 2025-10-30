import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Clock } from "lucide-react";

interface RecentBooking {
    name: string;
    service: string;
    time: string;
}

const mockRecentBookings: RecentBooking[] = [
    { name: "Michael C.", service: "Signature Cut", time: "2 minutes ago" },
    { name: "David M.", service: "Traditional Shave", time: "15 minutes ago" },
    { name: "James P.", service: "Executive Package", time: "1 hour ago" },
    { name: "Robert K.", service: "Cut & Shave", time: "2 hours ago" },
];

export function SocialProofWidget() {
    const [currentBooking, setCurrentBooking] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [liveCount, setLiveCount] = useState(3);

    useEffect(() => {
        // Rotate through recent bookings
        const interval = setInterval(() => {
            setCurrentBooking((prev) => (prev + 1) % mockRecentBookings.length);
            setIsVisible(true);

            setTimeout(() => setIsVisible(false), 4000);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    // Simulate live viewing count fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount((prev) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const booking = mockRecentBookings[currentBooking];

    return (
        <div className="fixed bottom-6 left-6 z-40 space-y-3 hidden lg:block">
            {/* Recent booking notification */}
            <Card
                className={`bg-background/95 backdrop-blur-xl border-primary/20 p-4 shadow-xl transition-all duration-500 max-w-sm ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
                    }`}
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                            {booking.name} just booked
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {booking.service}
                        </p>
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.time}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Live viewing count */}
            <Badge
                variant="outline"
                className="bg-background/95 backdrop-blur-xl border-primary/20 px-4 py-2 shadow-lg animate-in fade-in slide-in-from-left duration-500"
            >
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="text-xs font-medium">
                        {liveCount} viewing now
                    </span>
                </div>
            </Badge>

            {/* Trust indicators */}
            <div className="flex gap-2">
                <Badge
                    variant="outline"
                    className="bg-background/95 backdrop-blur-xl border-primary/20 shadow-lg"
                >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="text-xs">Highly Rated</span>
                </Badge>
            </div>
        </div>
    );
}

export function TrustBadges() {
    const badges = [
        { icon: "✓", text: "Verified Business" },
        { icon: "⭐", text: "4.9 Rating" },
        { icon: "🏆", text: "Best in Calgary" },
        { icon: "💳", text: "Secure Booking" },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-3 py-6">
            {badges.map((badge, index) => (
                <Badge
                    key={index}
                    variant="outline"
                    className="bg-background/40 backdrop-blur-sm border-primary/10 px-4 py-2 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                >
                    <span className="mr-2">{badge.icon}</span>
                    <span className="text-xs font-medium">{badge.text}</span>
                </Badge>
            ))}
        </div>
    );
}
