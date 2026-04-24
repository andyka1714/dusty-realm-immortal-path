import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-amber-500/45 bg-amber-500/18 text-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.08)] hover:bg-amber-500/28",
        amber:
          "border-amber-500/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25",
        emerald:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
        stone:
          "border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800/85",
        danger:
          "border-red-500/35 bg-red-500/12 text-red-100 hover:bg-red-500/22",
        outline:
          "border-stone-700 bg-transparent text-stone-200 hover:border-amber-600/50 hover:text-amber-100",
        tab:
          "border-transparent bg-transparent text-stone-400 hover:bg-stone-900/70 hover:text-stone-100 data-[state=active]:border-amber-600/60 data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-100",
        selection:
          "border-stone-700 bg-stone-950/80 text-stone-200 hover:border-amber-500/40 hover:bg-stone-900",
        ghost:
          "border-transparent bg-transparent text-stone-300 hover:bg-stone-900/60",
      },
      size: {
        default: "h-12 px-4 py-3",
        sm: "h-10 px-3",
        lg: "h-14 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "stone",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
