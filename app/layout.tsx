import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "麦当 OS · 个人智能",
  description: "看见、记住、找回来",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            麦当 OS <span className="text-muted-foreground font-normal">· 个人智能</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/capture" className="hover:text-foreground transition-colors">+ 新捕获</Link>
            <Link href="/search" className="hover:text-foreground transition-colors">搜索</Link>
          </nav>
        </header>
        <KeyboardShortcuts />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border px-6 py-2 text-xs text-muted-foreground text-right">
          麦当mdldm · 个人 OS
        </footer>
      </body>
    </html>
  );
}
