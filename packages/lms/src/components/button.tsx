import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
        lg: "h-11 rounded-md px-8",
        sm: "h-9 rounded-md px-3",
      },
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "outline-destructive":
          "border border-destructive text-destructive bg-background hover:bg-accent",
        "outline-primary":
          "border border-primary text-primary bg-background hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      loading,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ className, size, variant }))}
        disabled={disabled || loading}
        {...props}
      >
        <span
          className={cn(
            "flex items-center whitespace-nowrap max-w-full",
            loading && "invisible"
          )}
        >
          {children}
        </span>
        {loading && <Spinner className="absolute w-6 h-6" />}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
