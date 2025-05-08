import "./globals.css";
import FluidCursor from "../components/FluidCursor";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <FluidCursor />
        {children}
      </body>
    </html>
  );
}
