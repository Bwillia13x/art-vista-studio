import { cn } from "@/lib/utils";

interface ShimmerProps {
    className?: string;
    children?: React.ReactNode;
}

export function Shimmer({ className, children }: ShimmerProps) {
    return (
        <div className={cn("relative overflow-hidden", className)}>
            {children}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        </div>
    );
}

export function ShimmerCard({ className }: { className?: string }) {
    return (
        <div className={cn("rounded-lg bg-muted p-6 space-y-4", className)}>
            <Shimmer className="h-6 w-3/4 bg-muted-foreground/20 rounded" />
            <Shimmer className="h-4 w-full bg-muted-foreground/20 rounded" />
            <Shimmer className="h-4 w-5/6 bg-muted-foreground/20 rounded" />
            <div className="flex gap-2 mt-4">
                <Shimmer className="h-8 w-20 bg-muted-foreground/20 rounded" />
                <Shimmer className="h-8 w-16 bg-muted-foreground/20 rounded" />
            </div>
        </div>
    );
}

export function ShimmerButton({ className }: { className?: string }) {
    return (
        <Shimmer className={cn("h-10 w-32 bg-muted rounded-md", className)} />
    );
}

export function ShimmerImage({ className }: { className?: string }) {
    return (
        <Shimmer className={cn("w-full aspect-video bg-muted rounded-lg", className)} />
    );
}
