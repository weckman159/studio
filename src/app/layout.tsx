'use client';

import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarSeparator } from "@/components/ui/sidebar";
import { CarFront, Home, BookOpen, Users, ShoppingCart, Wrench, Calendar, Newspaper, BarChartHorizontal, Info, MessageSquare, Shield, Trophy } from 'lucide-react';
import Link from "next/link";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { useActivePath } from "@/hooks/use-active-path";
import { ThemeProvider } from "next-themes";
import { useUser } from '@/firebase';
import type { User as UserData } from '@/lib/types';
import { useUserProfile } from "@/hooks/useUserProfile";
import { CookieConsent } from "@/components/CookieConsent";
import { MobileNav } from "@/components/MobileNav";


const navLinks = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/posts', label: 'Журналы', icon: BookOpen },
  { href: '/car-of-the-day', label: 'Авто дня', icon: Trophy },
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/marketplace', label: 'Маркетплейс', icon: ShoppingCart },
  { href: '/workshops', label: 'Мастерские', icon: Wrench },
  { href: '/events', label: 'События', icon: Calendar },
  { href: '/voting', label: 'Голосования', icon: BarChartHorizontal },
  { href: '/news', label: 'Новости', icon: Newspaper },
];

const footerNavLinks = [
    { href: '/about', label: 'О проекте', icon: Info },
    { href: '/feedback', label: 'Обратная связь', icon: MessageSquare },
]

function AppSidebar() {
  const checkActivePath = useActivePath();
  const { user } = useUser();
  const { profile } = useUserProfile(user?.uid);


  return (
      <Sidebar>
          <SidebarHeader>
              <div className="flex items-center space-x-2 p-2">
               <CarFront className="h-6 w-6 text-primary shrink-0" />
               <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">AutoSphere</span>
              </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
              <SidebarMenu>
                  {navLinks.map(link => (
                      <SidebarMenuItem key={link.href}>
                          <SidebarMenuButton asChild isActive={checkActivePath(link.href)} title={link.label} tooltip={link.label}>
                              <Link href={link.href}>
                                  <link.icon />
                                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                              </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
                  {profile?.role === 'admin' && (
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={checkActivePath('/admin')} title="Админка" tooltip="Админка">
                            <Link href="/admin">
                                <Shield />
                                <span className="group-data-[collapsible=icon]:hidden">Админка</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
              </SidebarMenu>
          </SidebarContent>
           <SidebarContent className="p-2 mt-auto">
                <SidebarSeparator className="mb-2"/>
                <SidebarMenu>
                     {footerNavLinks.map(link => (
                      <SidebarMenuItem key={link.href}>
                          <SidebarMenuButton asChild isActive={checkActivePath(link.href)} title={link.label} tooltip={link.label}>
                              <Link href={link.href}>
                                  <link.icon />
                                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                              </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
                </SidebarMenu>
           </SidebarContent>
      </Sidebar>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <title>AutoSphere</title>
        <meta name="description" content="Сообщество для автолюбителей" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <SidebarProvider>
              <div className="relative flex min-h-screen">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0">
                  <Header />
                  <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                     {children}
                  </main>
                  <Footer />
                </div>
              </div>
              <MobileNav />
              <Toaster />
            </SidebarProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
        <CookieConsent />
      </body>
    </html>
  );
}