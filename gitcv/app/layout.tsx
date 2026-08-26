import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Gitume - AI resume optimizer",
  description:
    "Upload your resume, paste a job description, and generate a tailored ATS-friendly resume using your most relevant projects.",
  icons: {
    icon: "/gitume-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {children}
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
