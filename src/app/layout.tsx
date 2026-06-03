import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/components/ReactQueryProvider";

const geist = Geist({ subsets: [ 'latin' ], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Nextjs Image Gallery",
  description: "The Image Gallery app similar to Google Photos",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full">
        <SessionProvider session={session}>
          <ReactQueryProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
