import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] hover:-translate-y-1 rounded-xl shadow-[0_20px_40px_-12px_hsl(var(--primary)_/_0.35)] hover:shadow-[0_30px_60px_-12px_hsl(var(--primary)_/_0.5)] transition-all duration-300 ease-[var(--ease-spring)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary-glow/30 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.03] hover:-translate-y-1 rounded-xl shadow-[0_15px_35px_-10px_hsl(var(--destructive)_/_0.4)] hover:shadow-[0_20px_45px_-10px_hsl(var(--destructive)_/_0.5)] transition-all duration-300 ease-[var(--ease-spring)]",
        outline: "border-2 border-primary/40 bg-background/60 text-foreground backdrop-blur-xl hover:bg-card/90 hover:border-primary/70 hover:text-primary hover:scale-[1.03] hover:-translate-y-1 rounded-xl shadow-[0_10px_30px_-10px_hsl(0_0%_0%_/_0.2)] hover:shadow-[0_15px_40px_-10px_hsl(var(--primary)_/_0.25)] transition-all duration-300 ease-[var(--ease-spring)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_hsl(var(--primary)_/_0.08)_0%,_transparent_70%)] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.03] hover:-translate-y-1 rounded-xl shadow-[0_10px_25px_-8px_hsl(0_0%_0%_/_0.15)] hover:shadow-[0_15px_35px_-8px_hsl(0_0%_0%_/_0.2)] transition-all duration-300 ease-[var(--ease-spring)]",
        ghost: "hover:bg-accent/80 hover:text-accent-foreground hover:scale-[1.02] rounded-xl backdrop-blur-sm transition-all duration-200 ease-[var(--ease-smooth)]",
        link: "text-primary underline-offset-4 hover:underline transition-all duration-200",
        premium: "bg-[linear-gradient(135deg,_hsl(var(--primary))_0%,_hsl(var(--primary-glow))_50%,_hsl(var(--accent))_100%)] bg-[length:200%_200%] hover:bg-[position:100%_0] text-primary-foreground hover:scale-[1.03] hover:-translate-y-1 rounded-xl shadow-[0_25px_50px_-12px_hsl(var(--primary)_/_0.4),_0_0_0_1px_hsl(var(--primary)_/_0.1)_inset] hover:shadow-[0_35px_70px_-12px_hsl(var(--primary)_/_0.6),_0_0_80px_hsl(var(--primary-glow)_/_0.3),_0_0_0_1px_hsl(var(--primary-glow)_/_0.2)_inset] transition-all duration-500 ease-[var(--ease-spring)] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 after:absolute after:inset-0 after:rounded-xl after:bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--primary-glow)_/_0.3),_transparent_50%)] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-11 py-3.5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
