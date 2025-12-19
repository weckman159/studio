
'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Users, Rss, Store, Car, Zap, Search, GaugeCircle, BatteryCharging, Palette, Info, Newspaper, MoreHorizontal, Heart, MessageCircle, Send, Shield, BarChart, ChevronRight, Gem, Infinity, Filter, Bell, Menu, Globe, Flame, TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider, useUser, useAuth } from "@/firebase";
import { ThemeProvider } from "next-themes";
import { Analytics } from '@vercel/analytics/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const LeftSidebar = () => {
    const pathname = usePathname();
    const navItems = [
        { href: '/', label: 'Главная', icon: <Sparkles className="group-hover:scale-110 transition-transform text-[20px] filled" /> },
        { href: '/communities', label: 'Сообщества', icon: <Users className="group-hover:scale-110 transition-transform text-[20px]" /> },
        { href: '/posts', label: 'Блоги', icon: <Rss className="group-hover:scale-110 transition-transform text-[20px]" /> },
        { href: '/marketplace', label: 'Маркетплейс', icon: <Store className="group-hover:scale-110 transition-transform text-[20px]" /> },
        { href: '/garage', label: 'Автомобили', icon: <Car className="group-hover:scale-110 transition-transform text-[20px]" /> },
    ];
    return (
        <aside className="w-[260px] hidden md:flex flex-none bg-background-dark text-white flex-col justify-between z-40 overflow-y-auto px-6 py-8 border-r border-primary/20 holographic-panel-dark scroll-effect">
            <div className="flex flex-col">
                 {/* Top section is now just nav and filters */}
                <nav className="flex flex-col gap-3">
                    {navItems.map(item => (
                        <Link key={item.label} href={item.href} className={`group flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-300 border-l-4 ${(pathname === item.href) ? 'bg-primary/10 border-primary text-primary glow' : 'text-white/70 hover:text-white hover:bg-primary/10 hover:border-primary/50 border-transparent'}`}>
                            {item.icon}
                            <span className="text-base font-medium tracking-wide">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                 <div className="mt-8 pt-6 border-t border-primary/20">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Filter className="text-[16px]" />
                        Blog Filters
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-[16px]" />
                            <input className="w-full bg-primary/5 border border-primary/20 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:border-primary/50 focus:ring-0 placeholder-white/30 transition-colors" placeholder="Keywords..." type="text" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button className="px-2 py-1 rounded bg-primary/20 border border-primary/30 text-[10px] text-primary hover:bg-primary/30 transition-colors">Latest</button>
                            <button className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-white/10 transition-colors">Tech</button>
                            <button className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-white/10 transition-colors">Mods</button>
                            <button className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/70 hover:bg-white/10 transition-colors">Events</button>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 pt-6 border-t border-primary/20">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Flame className="text-[16px]" />
                        Новые сообщества
                    </h3>
                    <div className="flex flex-col gap-3">
                        <a className="flex items-center gap-3 group" href="#">
                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                <span className="text-[10px] font-bold text-white/70">UE</span>
                            </div>
                            <div className="flex flex-col"><span className="text-xs font-medium text-white/80 group-hover:text-primary transition-colors">Urban Explorers</span><span className="text-[10px] text-white/40">128 members</span></div>
                        </a>
                         <a className="flex items-center gap-3 group" href="#">
                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                <span className="text-[10px] font-bold text-white/70">NR</span>
                            </div>
                            <div className="flex flex-col"><span className="text-xs font-medium text-white/80 group-hover:text-primary transition-colors">Night Riders</span><span className="text-[10px] text-white/40">86 members</span></div>
                        </a>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-primary/20">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <TrendingUp className="text-[16px]" />
                        Популярные сообщества
                    </h3>
                    <div className="flex flex-col gap-3">
                         <a className="flex items-center gap-3 group" href="#">
                            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                <Users className="text-[16px] text-primary" />
                            </div>
                            <div className="flex flex-col"><span className="text-xs font-medium text-white/80 group-hover:text-primary transition-colors">JDM Legends</span><span className="text-[10px] text-white/40">45.2k members</span></div>
                        </a>
                         <a className="flex items-center gap-3 group" href="#">
                            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                                <GaugeCircle className="text-[16px] text-primary" />
                            </div>
                            <div className="flex flex-col"><span className="text-xs font-medium text-white/80 group-hover:text-primary transition-colors">Euro Tuners</span><span className="text-[10px] text-white/40">32.1k members</span></div>
                        </a>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const TopHeader = () => {
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
         <header className="h-16 flex-none bg-background-dark/80 backdrop-blur-md border-b border-primary/20 flex items-center justify-between px-6 z-50">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background-dark glow">
                    <Sparkles className="text-[20px] filled" />
                </div>
                <div>
                    <h1 className="text-white text-lg font-bold tracking-wider uppercase">AutoSphere</h1>
                    <p className="text-primary text-[10px] font-mono -mt-1">COMMAND HUB v3.0</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70 text-[20px]" />
                    <input className="w-full bg-white/5 border border-primary/30 rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 placeholder-primary/50 text-white" placeholder="Search..." type="text"/>
                </div>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-primary"><Bell className="text-[24px]" /></Button>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-primary"><Globe className="text-[24px]" /></Button>
                
                {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-primary"><Menu className="text-[24px]" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild><Link href={`/profile/${user.uid}`}><User className="mr-2 h-4 w-4" />Профиль</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Выйти</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                 ) : (
                    <Button asChild><Link href="/auth">Войти</Link></Button>
                )}
                 <div className="w-10 h-10 rounded-full bg-cover bg-center border border-primary/50 shadow-md" style={{backgroundImage: `url(${user?.photoURL || 'https://i.pravatar.cc/40'})`}}></div>
            </div>
        </header>
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
        <title>AutoSphere 3D Command Hub</title>
        <meta name="description" content="Платформа для автолюбителей: бортжурналы, сообщества, маркетплейс." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="bg-background-dark text-[#e6e6db] font-display h-screen w-screen overflow-hidden selection:bg-primary selection:text-black relative">
        <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%230af\\' fill-opacity=\\'0.2\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\'3\\' r=\\'3\'/%3E%3Ccircle cx=\\'13\\' cy=\'13\\' r=\\'3\'/%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{background: "radial-gradient(circle at center, rgba(10, 170, 255, 0.05) 0%, transparent 50%)"}}></div>
        
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
                <div className="flex flex-col h-screen w-full relative z-10">
                    <TopHeader />
                    <div className="flex flex-1 overflow-hidden">
                        <LeftSidebar />
                        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-y-auto scroll-effect">
                            {children}
                        </main>
                    </div>
                </div>
                <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
    
