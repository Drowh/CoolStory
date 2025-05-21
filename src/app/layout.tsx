import { Fira_Code } from "next/font/google";
import "./globals.css";
import FluidCursor from "../components/FluidCursor";
import Toaster from "../components/ui/Toaster";
import { PreloaderProvider } from "../contexts/PreloaderContext";
import Preloader from "../components/Preloader";
import { ProfileProvider } from "../contexts/ProfileContext";

const firaCode = Fira_Code({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={firaCode.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ProfileProvider>
          <PreloaderProvider>
            <Preloader />
            <div
              className="content-container"
              style={{ opacity: 0 }}
              id="main-content"
            >
              <FluidCursor />
              {children}
              <Toaster />
            </div>
          </PreloaderProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
