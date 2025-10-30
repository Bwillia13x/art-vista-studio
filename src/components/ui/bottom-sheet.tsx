import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    snapPoints?: number[];
    className?: string;
}

export function BottomSheet({
    isOpen,
    onClose,
    children,
    title,
    snapPoints = [0.4, 0.75, 0.95],
    className
}: BottomSheetProps) {
    const [currentSnapPoint, setCurrentSnapPoint] = React.useState(1);
    const [dragStartY, setDragStartY] = React.useState<number | null>(null);
    const [dragCurrentY, setDragCurrentY] = React.useState<number | null>(null);
    const sheetRef = React.useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setDragStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (dragStartY === null) return;
        setDragCurrentY(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (dragStartY === null || dragCurrentY === null) {
            setDragStartY(null);
            setDragCurrentY(null);
            return;
        }

        const deltaY = dragCurrentY - dragStartY;
        const threshold = 50;

        if (deltaY > threshold) {
            // Dragged down
            if (currentSnapPoint > 0) {
                setCurrentSnapPoint(currentSnapPoint - 1);
            } else {
                onClose();
            }
        } else if (deltaY < -threshold) {
            // Dragged up
            if (currentSnapPoint < snapPoints.length - 1) {
                setCurrentSnapPoint(currentSnapPoint + 1);
            }
        }

        setDragStartY(null);
        setDragCurrentY(null);
    };

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const heightPercentage = snapPoints[currentSnapPoint] * 100;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className={cn(
                    "fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 shadow-2xl transition-all duration-300 ease-out",
                    className
                )}
                style={{ height: `${heightPercentage}vh` }}
            >
                {/* Drag handle */}
                <div
                    className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
                </div>

                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 pb-4 border-b">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: `calc(${heightPercentage}vh - 80px)` }}>
                    {children}
                </div>
            </div>
        </>
    );
}
