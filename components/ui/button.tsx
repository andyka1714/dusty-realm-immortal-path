import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        amber:
          "border-amber-500/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25",
        emerald:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
        stone:
          "border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800/85",
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
