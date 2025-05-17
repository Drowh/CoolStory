import "./globals.css";
import { Fira_Code } from "next/font/google";
import FluidCursor from "../components/FluidCursor";
import type { Metadata } from "next";
import { ReactNode } from "react";

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
        <FluidCursor />
        {children}
      </body>
    </html>
  );
}
