import { Fira_Code } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import FluidCursor from "../components/FluidCursor";
import Toaster from "../components/ui/Toaster";
import { PreloaderProvider } from "../contexts/PreloaderContext";
import Preloader from "../components/Preloader";
import { ProfileProvider } from "../contexts/ProfileContext";
import { ThemeProvider } from "../components/ThemeProvider";
import { Metadata } from "next";

const firaCode = Fira_Code({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "monospace"],
});

const comicRelief = localFont({
  src: [
    { path: "../../public/fonts/ComicRelief-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/ComicRelief-Bold.ttf", weight: "700" },
  ],
  variable: "--font-comic-relief",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "CoolStory - AI Chat Assistant",
  description: "Интеллектуальный ассистент для общения и помощи",
  keywords: ["AI", "chat", "assistant", "coolstory", "искусственный интеллект"],
  authors: [{ name: "DrowDev" }],
  robots: "index, follow",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${firaCode.className} ${comicRelief.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={comicRelief.className}
        suppressHydrationWarning
        role="application"
      >
        <ThemeProvider>
          <ProfileProvider>
            <PreloaderProvider>
              <Preloader />
              <div
                className="content-container"
                style={{ opacity: 0 }}
                id="main-content"
                role="main"
                aria-live="polite"
              >
                <FluidCursor />
                {children}
                <Toaster />
              </div>
            </PreloaderProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
