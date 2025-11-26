
'use client';

import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarSeparator } from "@/components/ui/sidebar";
import { CarFront, Home, BookOpen, Users, ShoppingCart, Wrench, Calendar, Newspaper, BarChartHorizontal, Info, MessageSquare } from 'lucide-react';
import Link from "next/link";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { CarOfTheDay } from "@/components/CarOfTheDay";
import { useActivePath } from "@/hooks/use-active-path";

const navLinks = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/posts', label: 'Журналы', icon: BookOpen },
  { href: '/communities', label: 'Сообщества', icon: Users },
  { href: '/marketplace', label: 'Маркетплейс', icon: ShoppingCart },
  { href: '/workshops', label: 'Мастерские', icon: Wrench },
  { href: '/events', label: 'События', icon: Calendar },
];

const secondaryNavLinks = [
    { href: '/voting', label: 'Голосования', icon: BarChartHorizontal },
    { href: '/news', label: 'Новости', icon: Newspaper },
];

const footerNavLinks = [
    { href: '/about', label: 'О проекте', icon: Info },
    { href: '/feedback', label: 'Обратная связь', icon: MessageSquare },
]

function AppSidebar() {
  const checkActivePath = useActivePath();

  return (
      <Sidebar>
          <SidebarHeader>
              <div className="flex items-center space-x-2">
               <CarFront className="h-6 w-6 text-primary" />
               <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">AutoSphere</span>
              </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
              <SidebarMenu>
                  {navLinks.map(link => (
                      <SidebarMenuItem key={link.href}>
                          <SidebarMenuButton asChild isActive={checkActivePath(link.href)}>
                              <Link href={link.href}>
                                  <link.icon />
                                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                              </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
              <SidebarSeparator />
               <SidebarMenu>
                  {secondaryNavLinks.map(link => (
                      <SidebarMenuItem key={link.href}>
                          <SidebarMenuButton asChild isActive={checkActivePath(link.href)}>
                              <Link href={link.href}>
                                  <link.icon />
                                  <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                              </Link>
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
              </SidebarMenu>
          </SidebarContent>
           <SidebarContent className="p-2 mt-auto">
                <SidebarSeparator className="mb-2"/>
                <SidebarMenu>
                     {footerNavLinks.map(link => (
                      <SidebarMenuItem key={link.href}>
                          <SidebarMenuButton asChild isActive={checkActivePath(link.href)}>
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
    <html lang="en" className="dark">
      <head>
        <title>AutoSphere</title>
        <meta name="description" content="A community for car enthusiasts" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="relative flex min-h-screen">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1">
                  <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-3">
                        {children}
                      </div>
                      <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                           <CarOfTheDay />
                        </div>
                      </aside>
                    </div>
                  </div>
                </main>
                <Footer />
              </div>
            </div>
            <Toaster />
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
