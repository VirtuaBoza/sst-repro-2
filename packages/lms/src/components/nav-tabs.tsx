"use client";

import { LAST_SEEN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

const variant = cva("border-b-2 px-4 py-2 -mb-0.5", {
  variants: {
    active: {
      false: "",
      true: "text-primary border-primary",
    },
  },
});

export function NavTabs({
  layoutSegment,
  libraryId,
  tabs,
}: {
  layoutSegment: string;
  libraryId: string;
  tabs: Array<{ label: string; segment: string }>;
}) {
  const segment = useSelectedLayoutSegment();

  return (
    <nav className="flex bg-accent border-b-2">
      {tabs.map((tab, i) => (
        <Link
          key={i}
          className={cn(
            variant({
              active: segment == tab.segment,
            })
          )}
          href={`/${libraryId}/${layoutSegment}/${tab.segment}?${LAST_SEEN}=true`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
