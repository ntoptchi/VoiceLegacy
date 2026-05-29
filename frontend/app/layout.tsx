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

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#47644f",
    colorBackground: "#fbf9f8",
    colorInputBackground: "#ffffff",
    colorInputText: "#1b1c1c",
    colorText: "#1b1c1c",
    colorTextSecondary: "#424843",
    colorNeutral: "#727972",
    borderRadius: "1rem",
    fontFamily: "var(--font-plus-jakarta-sans), system-ui, sans-serif",
    fontSize: "16px",
  },
  elements: {
    modalBackdrop: "bg-background/70 backdrop-blur-sm",
    modalContent:
      "rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_24px_80px_-36px_rgba(0,0,0,0.45)]",
    cardBox: "rounded-2xl shadow-none",
    card: "gap-5 bg-surface-container-lowest px-6 py-7 sm:px-8",
    headerTitle:
      "font-[family-name:var(--font-lora)] text-2xl font-semibold text-on-surface",
    headerSubtitle: "text-sm leading-6 text-on-surface-variant",
    socialButtonsBlockButton:
      "rounded-full border-outline-variant/60 bg-surface-container-lowest text-on-surface transition-colors hover:bg-surface-container-low",
    dividerLine: "bg-outline-variant/60",
    dividerText: "text-on-surface-variant",
    formFieldLabel: "text-sm font-semibold text-on-surface",
    formFieldInput:
      "rounded-xl border-outline-variant/70 bg-surface-container-lowest text-on-surface shadow-none focus:border-primary focus:ring-2 focus:ring-primary/20",
    formButtonPrimary:
      "rounded-full bg-primary text-on-primary shadow-[0_12px_26px_-16px_rgba(71,100,79,0.75)] transition-all hover:bg-primary-container hover:text-on-primary-container hover:shadow-[0_16px_34px_-18px_rgba(71,100,79,0.8)]",
    footerActionText: "text-on-surface-variant",
    footerActionLink: "font-semibold text-primary hover:text-primary-container",
    identityPreviewText: "text-on-surface",
    identityPreviewEditButton: "text-primary hover:text-primary-container",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
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
