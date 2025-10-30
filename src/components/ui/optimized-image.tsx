import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
    src: string;
    alt: string;
    aspectRatio?: string;
    blurDataURL?: string;
    priority?: boolean;
    onLoad?: () => void;
}

export function OptimizedImage({
    src,
    alt,
    className,
    aspectRatio,
    blurDataURL,
    priority = false,
    onLoad,
    ...props
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (priority) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "50px",
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, [priority]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    return (
        <div
            className={cn("relative overflow-hidden", className)}
            style={{ aspectRatio }}
        >
            {/* Blur placeholder */}
            {blurDataURL && !isLoaded && (
                <img
                    src={blurDataURL}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
                    aria-hidden="true"
                />
            )}

            {/* Loading skeleton */}
            {!isLoaded && !blurDataURL && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            {/* Main image */}
            <img
                ref={imgRef}
                src={isInView ? src : undefined}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                onLoad={handleLoad}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                {...props}
            />

            {/* Shimmer effect while loading */}
            {!isLoaded && (
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            )}
        </div>
    );
}

interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'srcSet'> {
    srcSet?: {
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
    };
}

export function ResponsiveImage({
    srcSet,
    src,
    ...props
}: ResponsiveImageProps) {
    const srcSetString = srcSet
        ? `
      ${srcSet.sm ? `${srcSet.sm} 640w,` : ''}
      ${srcSet.md ? `${srcSet.md} 768w,` : ''}
      ${srcSet.lg ? `${srcSet.lg} 1024w,` : ''}
      ${srcSet.xl ? `${srcSet.xl} 1280w,` : ''}
      ${src}
    `.trim()
        : undefined;

    return (
        <OptimizedImage
            {...props}
            src={src}
            srcSet={srcSetString}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
    );
}
