import { Check } from "lucide-react";

interface BookingStepIndicatorProps {
    currentStep: number;
    steps: string[];
    onStepClick?: (step: number) => void;
}

export default function BookingStepIndicator({ currentStep, steps, onStepClick }: BookingStepIndicatorProps) {
    return (
        <div className="w-full py-8">
            <div className="max-w-3xl mx-auto">
                {/* Mobile: Simple progress bar */}
                <div className="md:hidden">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-foreground">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {steps[currentStep]}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-primary-glow to-primary transition-all duration-500 ease-out"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Desktop: Full step indicator */}
                <div className="hidden md:flex items-center justify-between relative">
                    {/* Progress line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted -z-10">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-primary-glow to-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isClickable = onStepClick && index <= currentStep;

                        return (
                            <button
                                key={step}
                                onClick={() => isClickable && onStepClick(index)}
                                disabled={!isClickable}
                                className={`flex flex-col items-center gap-3 transition-all duration-300 group ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                                    }`}
                            >
                                {/* Step circle */}
                                <div
                                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                            : isCurrent
                                                ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/40 scale-110'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6 animate-in zoom-in duration-300" />
                                    ) : (
                                        <span className="font-semibold">{index + 1}</span>
                                    )}

                                    {/* Pulse animation for current step */}
                                    {isCurrent && (
                                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                                    )}
                                </div>

                                {/* Step label */}
                                <div className="flex flex-col items-center">
                                    <span
                                        className={`text-sm font-medium transition-all duration-300 text-center max-w-[120px] ${isCurrent
                                                ? 'text-primary scale-105'
                                                : isCompleted
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground'
                                            }`}
                                    >
                                        {step}
                                    </span>
                                    {isCurrent && (
                                        <span className="text-xs text-primary/70 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            Current
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
