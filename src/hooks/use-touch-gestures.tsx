import { useEffect, useRef, useState } from "react";

interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

interface SwipeOptions {
    threshold?: number;
    preventScroll?: boolean;
}

export function useSwipeGesture(
    handlers: SwipeHandlers,
    options: SwipeOptions = {}
) {
    const { threshold = 50, preventScroll = false } = options;
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
        });
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (preventScroll) {
            e.preventDefault();
        }
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
        });
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const deltaX = touchStart.x - touchEnd.x;
        const deltaY = touchStart.y - touchEnd.y;

        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Determine if swipe is more horizontal or vertical
        if (absX > absY) {
            // Horizontal swipe
            if (absX > threshold) {
                if (deltaX > 0) {
                    handlers.onSwipeLeft?.();
                } else {
                    handlers.onSwipeRight?.();
                }
            }
        } else {
            // Vertical swipe
            if (absY > threshold) {
                if (deltaY > 0) {
                    handlers.onSwipeUp?.();
                } else {
                    handlers.onSwipeDown?.();
                }
            }
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
    };
}

interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    resistance?: number;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
    const { onRefresh, threshold = 80, resistance = 2.5 } = options;
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const startY = useRef(0);
    const scrollY = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        scrollY.current = window.scrollY;
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (scrollY.current > 0 || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = currentY - startY.current;

        if (distance > 0) {
            setIsPulling(true);
            setPullDistance(Math.min(distance / resistance, threshold * 1.5));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        setIsPulling(false);
        setPullDistance(0);
    };

    return {
        isPulling,
        isRefreshing,
        pullDistance,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}

export function useTouchTarget() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check if touch target meets minimum size (44x44px)
        const checkTouchTarget = () => {
            const rect = element.getBoundingClientRect();
            const minSize = 44;

            if (rect.width < minSize || rect.height < minSize) {
                console.warn(
                    `Touch target is too small: ${rect.width}x${rect.height}px. Minimum recommended size is ${minSize}x${minSize}px`,
                    element
                );
            }
        };

        checkTouchTarget();
        window.addEventListener('resize', checkTouchTarget);

        return () => {
            window.removeEventListener('resize', checkTouchTarget);
        };
    }, []);

    return ref;
}
