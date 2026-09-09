import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Jira Clone",
  description: "پروژه نمونه‌کار",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/dist/font-face.css"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Vazirmatn, sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
