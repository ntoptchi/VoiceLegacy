import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/lib/theme";
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
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "VoiceLegacy — Preserve the voice, words, and phrases that make communication feel personal.",
  description:
    "Preserve the voice, words, and phrases that make communication feel personal before speech loss occurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`${plusJakartaSans.variable} ${lora.variable} light h-full antialiased`}
      >
        <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-on-background">
          <ThemeProvider>
            <Navbar />
            <main className="mx-auto flex w-full max-w-content flex-1 flex-col px-4 py-6 sm:px-6 md:px-margin md:py-lg">
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
