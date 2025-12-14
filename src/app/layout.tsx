'use client';

import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { ThemeProvider } from "next-themes";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from '@vercel/analytics/react';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <title>AutoSphere - Социальная сеть для автолюбителей</title>
        <meta name="description" content="Платформа для автолюбителей: ведите бортжурналы, общайтесь в сообществах, покупайте и продавайте на маркетплейсе." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a0f10" />
      </head>
      <body className="font-body">
        {/* Background Effects */}
        <div className="fixed inset-0 z-[-1] bg-carbon-pattern opacity-30"></div>
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-[#221011]/80 to-[#110808]"></div>

        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SidebarProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                   {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </SidebarProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
