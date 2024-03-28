import "./global.css";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/lib/trpc.client";
import { Toaster } from "@/components/sonner";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  description: "Stacks ILS",
  title: "App - Stacks ILS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html className="h-full" lang="en">
      <body
        className={cn(
          "h-full bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider session={session}>
          <TRPCProvider>
            <Toaster position="top-center" richColors>
              {children}
            </Toaster>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
