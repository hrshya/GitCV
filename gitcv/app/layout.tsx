import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
