"use client";

import * as React from "react";
import { Input } from "./input";
import { UseDateInputParams, useDateInput } from "@abizzle/react-date-input";

export interface DateInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      keyof UseDateInputParams
    >,
    UseDateInputParams {}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ defaultValue, onDateChange, value, ...props }, ref) => {
    const { inputProps } = useDateInput({
      ...props,
      defaultValue,
      onDateChange,
      ref,
      value,
    });
    return <Input autoComplete="off" {...props} {...inputProps} />;
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
