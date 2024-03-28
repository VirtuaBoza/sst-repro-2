"use client";

import { Toaster as Sonner } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner> & {
  children?: React.ReactNode;
};

const ToasterContext = React.createContext<{
  childRendered: () => () => void;
} | null>(null);

const Toaster = ({ children, className, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [hasChild, setHasChild] = React.useState(false);

  const context = React.useContext(ToasterContext);

  useEffect(() => {
    if (context) {
      return context.childRendered();
    }
  }, [context]);

  const childRendered = React.useCallback(() => {
    setHasChild(true);
    return () => {
      setHasChild(false);
    };
  }, []);

  return (
    <ToasterContext.Provider value={{ childRendered }}>
      {!hasChild && (
        <Sonner
          className={cn("toaster group", className)}
          theme={theme as ToasterProps["theme"]}
          toastOptions={{
            classNames: {
              actionButton:
                "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast[data-type='error']]:bg-destructive group-[.toast[data-type='error']]:text-destructive-foreground",
              cancelButton:
                "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              description: "group-[.toast]:text-muted-foreground",
              error: "error",
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            },
          }}
          {...props}
        />
      )}
      {children}
    </ToasterContext.Provider>
  );
};

export { Toaster };
