"use client";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import React from "react";

export interface ConfirmationDialogProps {
  confirmLabel: string;
  content: React.ReactNode;
  loading?: boolean;
  onClose: (confirmed: boolean) => void;
  open: boolean;
  title: React.ReactNode;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  confirmLabel,
  content,
  loading,
  onClose,
  open,
  title,
  variant,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      onOpenChange={(toOpen) => {
        if (!toOpen) {
          onClose(false);
        }
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"secondary"}>Cancel</Button>
          </DialogClose>
          <Button
            loading={loading}
            onClick={() => {
              onClose(true);
            }}
            variant={variant}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
