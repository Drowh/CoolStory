import { ReactNode } from "react";
import { Fira_Code } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import FluidCursorWrapper from "../components/FluidCursorWrapper";

export const metadata: Metadata = {
  title: "CoolStory",
  description: "Интерфейс для общения с ИИ",
};

const firaCode = Fira_Code({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={firaCode.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <FluidCursorWrapper />
        {children}
      </body>
    </html>
  );
}
