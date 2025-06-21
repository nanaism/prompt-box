import Navbar from "@/components/navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prompt Box - AIプロンプトテンプレート管理",
  description: "AIプロンプトテンプレートを管理します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="py-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="container mx-auto flex items-center justify-center">
              <p className="text-sm text-zinc-500">
                © {new Date().getFullYear()} Oga Aiichiro
              </p>
            </div>
          </footer>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
