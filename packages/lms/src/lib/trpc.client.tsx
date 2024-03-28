"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type TRPCRouter } from "@/server";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

export const trpc = createTRPCReact<TRPCRouter>({});

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // url: `${process.env.NEXT_PUBLIC_LMS_URL}/api/trpc`,
          url: `/api/trpc`,
        }),
      ],
      transformer: superjson,
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
