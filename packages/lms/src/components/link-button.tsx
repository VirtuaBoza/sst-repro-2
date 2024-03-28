import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkButtonVariants = cva(
  "relative inline-flex items-center whitespace-nowrap max-w-full justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
        lg: "h-11 px-8",
        sm: "h-9 px-3",
      },
    },
  }
);

export interface LinkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof linkButtonVariants> {
  asChild?: boolean;
}

const LinkButton = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ asChild = false, children, className, disabled, size, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(linkButtonVariants({ className, size }))}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
LinkButton.displayName = "LinkButton";

export { LinkButton, linkButtonVariants };
