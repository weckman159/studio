
'use client';
import { useUser } from '@/firebase';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Users, FileText, Shield, BarChart3, Settings } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useActivePath } from '@/hooks/use-active-path';
import { Header } from '@/components/Header';

const adminNavLinks = [
    { href: '/admin', label: 'Дашборд', icon: BarChart3 },
    { href: '/admin/users', label: 'Пользователи', icon: Users },
    { href: '/admin/content', label: 'Контент', icon: FileText },
    { href: '/admin/reports', label: 'Жалобы', icon: Shield },
    { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

function AdminSidebar() {
    const checkActivePath = useActivePath();
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center space-x-2 p-2">
                    <Shield className="h-6 w-6 text-primary shrink-0" />
                    <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Админка</span>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <SidebarMenu>
                    {adminNavLinks.map(link => (
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
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { profile, isLoading: isProfileLoading } = useUserProfile(user?.uid);
  const router = useRouter();

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!user || !profile?.roles?.isAdmin) {
        router.replace('/');
      }
    }
  }, [isLoading, user, profile, router]);

  if (isLoading || !profile || !profile.roles?.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <div className="relative flex min-h-screen">
            <AdminSidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
}
