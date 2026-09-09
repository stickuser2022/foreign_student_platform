import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/shared/site-header";
import { SiteFooter } from "@/shared/site-footer";

export const metadata: Metadata = {
  title: "Учёба в Китае",
  description:
    "Информационная платформа для российских студентов: университеты, программы и стипендии в Китае.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
