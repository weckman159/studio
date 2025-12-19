
'use client';

import React from 'react';
import Link from 'next/link';
import {
    Sparkles, Users, Rss, Store, Car, Zap, Settings, User, LogOut, Shield,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, useUser, useAuth } from "@/firebase/client-provider";
import { ThemeProvider } from "next-themes";
import { Analytics } from '@vercel/analytics/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LeftSidebar = () => {
    const pathname = usePathname();
    const navItems = [
        { href: '/', label: 'Главная', icon: <Sparkles className="group-hover:scale-110 transition-transform text-[20px] filled" />, active: pathname === '/' },
        { href: '/communities', label: 'Сообщества', icon: <Users className="group-hover:scale-110 transition-transform text-[20px]" />, active: pathname.startsWith('/communities') },
        { href: '/posts', label: 'Блоги', icon: <Rss className="group-hover:scale-110 transition-transform text-[20px]" />, active: pathname.startsWith('/posts') },
        { href: '/marketplace', label: 'Маркетплейс', icon: <Store className="group-hover:scale-110 transition-transform text-[20px]" />, active: pathname.startsWith('/marketplace') },
        { href: '/garage', label: 'Гараж', icon: <Car className="group-hover:scale-110 transition-transform text-[20px]" />, active: pathname.startsWith('/garage') },
    ];

    return (
        <aside className="w-[260px] hidden md:flex flex-none bg-background-dark text-white flex-col justify-between z-40 overflow-y-auto px-6 py-8 border-r border-primary/20 holographic-panel-dark">
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark glow">
                        <Sparkles className="text-[24px] filled" />
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold tracking-wider uppercase">AutoSphere</h1>
                        <p className="text-primary text-xs font-mono">COMMAND HUB v3.0</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-3">
                    {navItems.map(item => (
                        <Link key={item.label} href={item.href} className={`group flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-300 border-l-4 ${item.active ? 'bg-primary/10 border-primary text-primary glow' : 'text-white/70 hover:text-white hover:bg-primary/10 hover:border-primary/50 border-transparent'}`}>
                            {item.icon}
                            <span className="text-base font-medium tracking-wide">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 flex flex-col gap-3 text-white holographic-panel-dark">
                <div className="flex items-center gap-2 text-primary">
                    <Zap className="text-[18px] filled" />
                    <span className="text-xs font-bold uppercase tracking-widest">Energy Core Status</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">Main power at 98%. All systems optimal.</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                    <div className="bg-primary h-2 rounded-full w-[98%]"></div>
                </div>
            </div>
        </aside>
    );
};

const PageHeader = () => {
    const { user } = useUser();
    const { toast } = useToast();
    const auth = useAuth();
    const handleLogout = () => {
        if (auth) {
          signOut(auth).then(() => {
            toast({ title: 'Вы вышли из системы.' });
          });
        }
      };

    return (
        <header className="h-16 flex-none bg-background-dark/80 backdrop-blur-md border-b border-primary/20 flex items-center justify-between px-8 z-30">
            <div className="flex items-center gap-4">
                <h2 className="text-primary text-xl font-bold tracking-tight uppercase">Control Console</h2>
                <div className="h-6 w-px bg-primary/30 mx-2"></div>
                <div className="flex items-center gap-2 text-sm text-primary">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse glow"></span>
                    <span>Active Link</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  {user ? (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                  <Avatar className="h-10 w-10 border-2 border-primary/50">
                                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="end">
                              <DropdownMenuLabel>{user.displayName}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild><Link href={`/profile/${user.uid}`}><User className="mr-2 h-4 w-4" />Профиль</Link></DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" />Настройки</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Выйти</DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  ) : (
                      <Button asChild>
                          <Link href="/auth">Войти</Link>
                      </Button>
                  )}
                </div>
                <span className="text-sm font-mono text-primary border px-3 py-1 rounded border-primary/30 bg-primary/10 glow">10:42 AM</span>
            </div>
        </header>
    );
};

const PageFooter = () => (
    <footer className="flex-none py-4 border-t border-primary/20 bg-background-dark/80 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-8">
            <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity text-primary">
                <Sparkles className="text-[18px]" />
                <span className="text-xs font-bold tracking-wider uppercase">AutoSphere</span>
            </div>
            <div className="flex items-center gap-6">
                <Link className="text-xs font-medium text-white/70 hover:text-primary transition-colors" href="/about">About</Link>
                <Link className="text-xs font-medium text-white/70 hover:text-primary transition-colors" href="/terms">Terms of Service</Link>
            </div>
            <p className="text-[10px] text-white/50 font-mono">© 2024 AUTOSPHERE TECHNOLOGIES.</p>
        </div>
    </footer>
);

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
      <body className="bg-background text-foreground font-display h-screen w-screen overflow-hidden selection:bg-primary selection:text-black relative">
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%230af\\' fill-opacity=\\'0.2\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\'3\\' r=\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{background: "radial-gradient(circle at center, rgba(10, 170, 255, 0.05) 0%, transparent 50%)"}}></div>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
                <div className="relative z-10 flex h-full w-full">
                    <LeftSidebar />
                    <main className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
                        <PageHeader />
                        <div className="flex-1 overflow-y-auto scroll-effect">
                          {children}
                        </div>
                        <PageFooter />
                    </main>
                </div>
                <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
