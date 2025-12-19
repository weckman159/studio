'use client';

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { ThemeProvider } from "next-themes";
import { Analytics } from '@vercel/analytics/react';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <title>AutoSphere 3D Command Hub</title>
        <meta name="description" content="Платформа для автолюбителей: бортжурналы, сообщества, маркетплейс." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="font-display h-screen w-screen overflow-hidden selection:bg-primary selection:text-black relative">
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%230af\\' fill-opacity=\\'0.2\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{background: "radial-gradient(circle at center, rgba(10, 170, 255, 0.05) 0%, transparent 50%)"}}></div>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SidebarProvider>
                <div className="relative z-10 flex h-full w-full">
                    {children}
                </div>
                <Toaster />
            </SidebarProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
