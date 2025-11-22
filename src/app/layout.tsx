"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>COS72 - Community Tool</title>
        <meta name="description" content="A simple community tool for any product or business" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white dark:bg-neutral-950 antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b dark:border-neutral-800">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="text-xl font-bold">COS72</div>
              <nav className="hidden md:flex gap-4">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <Link href="/onboarding" className="hover:text-blue-600 transition-colors">Onboarding</Link>
                <Link href="/points" className="hover:text-blue-600 transition-colors">OpenPoints</Link>
                <Link href="/tasks" className="hover:text-blue-600 transition-colors">Tasks</Link>
                <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
                <Link href="/reputation" className="hover:text-blue-600 transition-colors">Reputation</Link>
                <Link href="/demo" className="hover:text-blue-600 transition-colors">Demo</Link>
              </nav>
              <div className="md:hidden">
                <button className="p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t dark:border-neutral-800 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              COS72 - A simple community tool for any product or business &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
