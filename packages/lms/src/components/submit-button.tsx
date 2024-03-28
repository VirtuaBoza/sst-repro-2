"use client";

import { Button, ButtonProps } from "./button";
import { useFormStatus } from "react-dom";
import React from "react";

const SubmitButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, type = "submit", ...props }, ref) => {
    const { pending } = useFormStatus();
    return (
      <Button ref={ref} {...props} loading={pending || loading} type={type} />
    );
  }
);
SubmitButton.displayName = "SubmitButton";

export { SubmitButton };
