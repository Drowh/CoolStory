import "./globals.css";

export const metadata = {
  title: "Chat App",
  description: "A simple chat application built with Next.js",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
