import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60",
  {
    variants: {
      variant: {
        stone:
          "border-stone-700 bg-stone-900 text-stone-200",
        amber:
          "border-amber-500/30 bg-amber-500/15 text-amber-100",
        emerald:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
        danger:
          "border-red-500/35 bg-red-500/15 text-red-100",
        outline:
          "border-stone-700 bg-transparent text-stone-300",
      },
    },
    defaultVariants: {
      variant: "stone",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  className?: string;
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
