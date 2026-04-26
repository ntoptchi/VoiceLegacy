import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VoiceLegacy - Preserve the voice that makes you, you.",
  description:
    "Preserve the voice, words, and phrases that make communication feel personal before speech loss occurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-on-background">
        <Navbar />
        <main className="mx-auto flex w-full max-w-content flex-1 flex-col px-4 py-6 sm:px-6 md:px-margin md:py-lg">
          {children}
        </main>
      </body>
    </html>
  );
}
