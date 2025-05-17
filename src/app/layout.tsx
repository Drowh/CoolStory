import { Fira_Code } from "next/font/google";
import "./globals.css";
import FluidCursor from "../components/FluidCursor";

export const metadata = {
  title: "CoolStory",
  description: "Интерфейс для общения с ИИ",
};

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
        <FluidCursor />
        {children}
      </body>
    </html>
  );
}
