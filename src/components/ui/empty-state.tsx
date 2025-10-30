import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
            <div className="mb-6 relative">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />

                {/* Icon container */}
                <div className="relative w-24 h-24 rounded-full bg-muted/50 backdrop-blur-sm flex items-center justify-center border border-primary/10 animate-in zoom-in duration-500">
                    <Icon className="w-12 h-12 text-muted-foreground/50 animate-in fade-in slide-in-from-bottom-4 duration-700" />
                </div>
            </div>

            <h3 className="text-2xl font-semibold text-foreground mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {title}
            </h3>

            <p className="text-muted-foreground max-w-md leading-relaxed mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {description}
            </p>

            {action && (
                <Button
                    onClick={action.onClick}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}

interface EmptyStateIllustrationProps {
    type: 'no-results' | 'no-data' | 'error' | 'coming-soon';
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyStateIllustration({ type, title, description, action }: EmptyStateIllustrationProps) {
    const illustrations = {
        'no-results': (
            <svg className="w-48 h-48 text-muted-foreground/30" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                <circle cx="100" cy="100" r="40" fill="currentColor" opacity="0.1" />
                <path d="M80 90 Q100 70 120 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="85" cy="85" r="3" fill="currentColor" />
                <circle cx="115" cy="85" r="3" fill="currentColor" />
                <path d="M80 120 Q100 130 120 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        'no-data': (
            <svg className="w-48 h-48 text-muted-foreground/30" viewBox="0 0 200 200" fill="none">
                <rect x="60" y="60" width="80" height="80" rx="8" stroke="currentColor" strokeWidth="2" />
                <path d="M70 80 L130 80 M70 100 L130 100 M70 120 L130 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                <circle cx="100" cy="140" r="20" fill="currentColor" opacity="0.1" />
            </svg>
        ),
        'error': (
            <svg className="w-48 h-48 text-destructive/30" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" />
                <path d="M80 80 L120 120 M120 80 L80 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        'coming-soon': (
            <svg className="w-48 h-48 text-primary/30" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 100 100"
                        to="360 100 100"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                </circle>
                <path d="M100 70 L100 100 L120 120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="mb-8 animate-in zoom-in duration-500">
                {illustrations[type]}
            </div>

            <h3 className="text-2xl font-semibold text-foreground mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {title}
            </h3>

            <p className="text-muted-foreground max-w-md leading-relaxed mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {description}
            </p>

            {action && (
                <Button
                    onClick={action.onClick}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-1000"
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
