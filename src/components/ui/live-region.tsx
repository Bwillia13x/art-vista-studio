import { useEffect, useState } from "react";

interface LiveRegionProps {
    message: string;
    politeness?: "polite" | "assertive";
    clearDelay?: number;
}

export function LiveRegion({ message, politeness = "polite", clearDelay = 3000 }: LiveRegionProps) {
    const [announcement, setAnnouncement] = useState("");

    useEffect(() => {
        if (message) {
            setAnnouncement(message);

            if (clearDelay > 0) {
                const timeout = setTimeout(() => {
                    setAnnouncement("");
                }, clearDelay);

                return () => clearTimeout(timeout);
            }
        }
    }, [message, clearDelay]);

    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic="true"
            className="sr-only"
        >
            {announcement}
        </div>
    );
}

export function useLiveRegion() {
    const [message, setMessage] = useState("");

    const announce = (text: string) => {
        setMessage("");
        // Small delay to ensure screen readers pick up the change
        setTimeout(() => setMessage(text), 100);
    };

    return { message, announce };
}
