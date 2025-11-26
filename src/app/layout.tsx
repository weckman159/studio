import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { CarFront, Home, BookOpen, Users, ShoppingCart, Wrench, Calendar, CheckSquare, Radio } from 'lucide-react';
import Link from "next/link";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { CarOfTheDay } from "@/components/CarOfTheDay";

export const metadata: Metadata = {
  title: "AutoSphere",
  description: "A community for car enthusiasts",
};

const navLinks = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/posts', label: 'Журналы', icon: BookOpen },
  // Hiding links to non-existent pages to fix 404 errors as per the audit
  // { href: '/communities', label: 'Сообщества', icon: Users },
  // { href: '/marketplace', label: 'Маркетплейс', icon: ShoppingCart },
  // { href: '/workshops', label: 'Мастерские', icon: Wrench },
  // { href: '/events', label: 'События', icon: Calendar },
  { href: '/voting', label: 'Голосование', icon: CheckSquare },
  // { href: '/news', label: 'Автоновости', icon: Radio },
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
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
              <Sidebar>
                  <SidebarHeader>
                      <div className="flex items-center space-x-2">
                       <CarFront className="h-6 w-6 text-primary" />
                       <span className="font-bold text-lg">AutoSphere</span>
                      </div>
                  </SidebarHeader>
                  <SidebarContent>
                      <SidebarMenu>
                          {navLinks.map(link => (
                              <SidebarMenuItem key={link.href}>
                                  <SidebarMenuButton asChild>
                                      <Link href={link.href}>
                                          <link.icon />
                                          <span>{link.label}</span>
                                      </Link>
                                  </SidebarMenuButton>
                              </SidebarMenuItem>
                          ))}
                      </SidebarMenu>
                  </SidebarContent>
              </Sidebar>
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
