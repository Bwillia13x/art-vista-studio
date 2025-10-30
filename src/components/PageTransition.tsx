import { useEffect, useState } from "react";

export default function PageTransition() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progressive loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-background flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: progress === 100 ? 0 : 1 }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Premium loading spinner */}
        <div className="relative w-16 h-16">
          <div 
            className="absolute inset-0 rounded-full border-2 border-primary/20"
          />
          <div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-primary/50 border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <div 
            className="absolute inset-2 rounded-full bg-primary/5 blur-sm"
          />
        </div>
        
        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-primary/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 10px hsl(var(--primary) / 0.5)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
