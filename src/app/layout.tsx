
'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import { Sparkles, Users, Rss, Store, Car, Zap, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, useUser } from "@/firebase";
import { ThemeProvider } from "next-themes";
import { Analytics } from '@vercel/analytics/react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Footer } from '@/components/Footer';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Header } from '@/components/Header';


// Left Sidebar Component
const LeftSidebar = () => {
    const pathname = usePathname();
    const { user } = useUser();
    const { profile } = useUserProfile(user?.uid);

    const navItems = [
        { href: '/', label: 'Главная', icon: Sparkles },
        { href: '/communities', label: 'Сообщества', icon: Users },
        { href: '/posts', label: 'Блоги', icon: Rss },
        { href: '/marketplace', label: 'Маркетплейс', icon: Store },
        { href: '/garage', label: 'Гараж', icon: Car },
        { href: '/events', label: 'События', icon: Zap },
    ];

    if (profile?.roles?.isAdmin) {
      navItems.push({ href: '/admin', label: 'Админка', icon: Shield });
    }

    return (
        <Sidebar>
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-10 p-6">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark glow">
                        <Sparkles className="text-[24px] filled" />
                    </div>
                    <div className="group-data-[collapsible=icon]:hidden">
                        <h1 className="text-white text-xl font-bold tracking-wider uppercase">AutoSphere</h1>
                        <p className="text-primary text-xs font-mono">COMMAND HUB v3.0</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-3 px-6">
                    {navItems.map(item => (
                        <Link key={item.label} href={item.href} className={`group flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-300 border-l-4 ${pathname === item.href ? 'bg-primary/10 border-primary text-primary glow' : 'text-white/70 hover:text-white hover:bg-primary/10 hover:border-primary/50 border-transparent'}`}>
                            <item.icon className="group-hover:scale-110 transition-transform text-[20px]" />
                            <span className="text-base font-medium tracking-wide group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </Sidebar>
    );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className="dark">
      <head>
        <title>AutoSphere</title>
        <meta name="description" content="Платформа для автолюбителей: бортжурналы, сообщества, маркетплейс." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="bg-background-dark text-[#e6e6db] font-display h-screen w-screen selection:bg-primary selection:text-black relative">
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%230af\\' fill-opacity=\\'0.2\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{background: "radial-gradient(circle at center, rgba(10, 170, 255, 0.05) 0%, transparent 50%)"}}></div>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
              <SidebarProvider>
                <div className="flex h-full w-full relative z-10">
                    <LeftSidebar />
                    <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
                        <Header />
                        <div className="flex-1 flex flex-col overflow-y-auto scroll-effect">
                            <div className="flex-1">
                                {children}
                            </div>
                            <Footer />
                        </div>
                    </main>
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
