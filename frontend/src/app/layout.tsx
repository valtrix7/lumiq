import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/cn";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lumiq — Live Commerce Moment Vault",
    template: "%s · Lumiq",
  },
  description:
    "Lumiq turns live commerce moments into polished, provenance-backed media. Every published asset traces to its exact source moment, raw capture, catalog snapshot, generation run, QA result, and manifest.",
  applicationName: "Lumiq",
  metadataBase: new URL("https://lumiq.local"),
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark h-full", inter.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-full flex-col antialiased">
        <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
