interface Window {
  initialMobileCheck: boolean;
}

// Добавляем объявления для модулей без типов
declare module "*.css";

// Объявляем, что все tsx файлы в директории app являются модулями Next.js
declare module "*/app/layout.tsx" {
  import React from "react";

  export const metadata: {
    title: string;
    description: string;
  };

  interface RootLayoutProps {
    children: React.ReactNode;
  }

  export default function RootLayout(props: RootLayoutProps): JSX.Element;
}
