
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Rss, 
    Users, 
    Book, 
    ShoppingCart, 
    Car,
    Power,
    User,
    BarChart,
    Newspaper,
    ChevronRight,
    Map
} from 'lucide-react';

function LeftSidebar() {
    const navItems = [
        { icon: Rss, label: "Главная", href: "/", active: true },
        { icon: Users, label: "Сообщества", href: "/communities" },
        { icon: Book, label: "Блоги", href: "/posts" },
        { icon: ShoppingCart, label: "Маркетплейс", href: "/marketplace" },
        { icon: Car, label: "Автомобили", href: "/garage" },
    ];

    return (
        <aside className="col-span-1 bg-[#0F141C] p-6 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">AUTOSPHERE</h1>
                <p className="text-xs text-muted-foreground">COMMAND HUB v3.0</p>
            </div>
            <nav className="flex flex-col gap-2">
                {navItems.map(item => (
                    <Link key={item.label} href={item.href}>
                        <Button 
                            variant={item.active ? "secondary" : "ghost"}
                            className="w-full justify-start text-base"
                        >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Power className="h-4 w-4 text-green-400" />
                            ENERGY CORE STATUS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">Main power at 98%. All systems optimal.</p>
                        <div className="w-full bg-green-900/50 rounded-full h-1.5">
                            <div className="bg-green-400 h-1.5 rounded-full" style={{width: "98%"}}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </aside>
    );
}

function RightSidebar() {
    return (
        <aside className="col-span-1 bg-[#0F141C] p-6 space-y-8">
            <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="p-0 text-center flex flex-col items-center">
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-primary mb-3">
                       <div className="absolute inset-0.5 bg-background rounded-full p-1">
                          <img src="https://i.pravatar.cc/150?u=alexdriver" alt="Alex Driver" className="w-full h-full rounded-full object-cover"/>
                       </div>
                    </div>
                    <CardTitle className="text-white">Alex Driver</CardTitle>
                    <p className="text-sm text-muted-foreground">Premium Member</p>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold text-white">TOP 10 CARS</h3>
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg text-muted-foreground w-6">0{i+1}</span>
                                <div>
                                    <p className="font-semibold text-sm">Car Model {i+1}</p>
                                    <p className="text-xs text-muted-foreground">1,000 HP • Electric</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                        </div>
                    ))}
                </div>
            </div>

             <div className="space-y-4">
                <h3 className="font-semibold text-white">AUTO NEWS</h3>
                <div className="space-y-4">
                     {[...Array(3)].map((_, i) => (
                        <div key={i}>
                            <p className="text-xs text-primary mb-1">EV TECH</p>
                            <p className="font-semibold text-sm hover:underline cursor-pointer">Solid-state battery production begins</p>
                        </div>
                     ))}
                </div>
            </div>
        </aside>
    );
}

export default function HomePage() {
  return (
      <div className="grid grid-cols-[280px_1fr_360px] min-h-screen">
          <LeftSidebar />
          
          <main className="col-span-1 p-8 overflow-y-auto">
              <header className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-semibold text-white">CONTROL CONSOLE</h2>
                  <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">Search...</p>
                      <p className="text-sm font-bold text-white">10:42 AM</p>
                  </div>
              </header>

              {/* Featured Car Placeholder */}
              <Card className="glass p-8 mb-8">
                <h2 className="text-4xl font-bold text-white">Tesla Model S Plaid</h2>
                <p className="text-muted-foreground mt-2 mb-6">Experience the pinnacle of electric performance.</p>
                <div className="flex gap-4">
                    <Button variant="primary" size="lg">Customize</Button>
                    <Button variant="outline" size="lg">Explore Specs</Button>
                </div>
              </Card>

              {/* Live Feed Placeholder */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">LIVE FEED</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-[#161B26]"><CardContent className="p-6">Post 1</CardContent></Card>
                    <Card className="bg-[#161B26]"><CardContent className="p-6">Post 2</CardContent></Card>
                </div>
              </div>

              <footer className="mt-12 pt-6 border-t border-white/10 text-center text-muted-foreground text-xs">
                © 2024 AUTOSPHERE TECHNOLOGIES.
              </footer>
          </main>
          
          <RightSidebar />
      </div>
  );
}
