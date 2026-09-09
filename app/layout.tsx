import type { Metadata } from "next";
import "./globals.css";

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
      <body style={{ fontFamily: "Vazirmatn, sans-serif" }}>{children}</body>
    </html>
  );
}
