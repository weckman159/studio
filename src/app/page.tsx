
'use client';
import React from 'react';
import { Sparkles, Users, Rss, Store, Car, Zap, Search, GaugeCircle, BatteryCharging, Palette, Info, Newspaper, MoreHorizontal, Heart, MessageCircle, Send, Shield, BarChart, ChevronRight, Gem, Infinity, Star, ThumbsUp, Flame, TrendingUp, Globe, Menu, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Featured Car Hero Component
const FeaturedCarHero = () => {
    return (
        <section className="w-full relative rounded-2xl overflow-hidden holographic-panel group min-h-[500px] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark/40 z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-background-dark/80 via-transparent to-background-dark/80 z-0"></div>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-10 pointer-events-none">
                <div className="w-[90%] aspect-[16/9] relative" style={{ backgroundImage: "url('https://picsum.photos/seed/nissangtr/1200/675')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                    <div className="absolute top-0 left-0">
                        <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            <Star className="text-yellow-400 h-5 w-5" fill="currentColor" />
                            <span className="text-yellow-400 font-bold text-sm tracking-wider uppercase">Авто дня</span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0">
                        <div className="flex items-center gap-2 bg-background-dark/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full">
                            <ThumbsUp className="text-primary text-lg" />
                            <span className="text-white font-bold text-sm">2,845</span>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 mb-4 mr-4 pointer-events-auto">
                        <div className="flex items-center gap-3 bg-background-dark/60 backdrop-blur-md border border-white/10 pl-2 pr-4 py-2 rounded-full hover:bg-background-dark/80 transition-colors cursor-pointer group/owner">
                            <div className="w-8 h-8 rounded-full bg-cover bg-center border border-primary/50 shadow-md group-hover/owner:scale-105 transition-transform" style={{ backgroundImage: "url('https://i.pravatar.cc/40?u=alexspeed')" }}></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-white/50 uppercase tracking-widest leading-none">Владелец</span>
                                <span className="text-xs font-bold text-white group-hover/owner:text-primary transition-colors">AlexSpeed_99</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative z-20 p-8 w-full bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
                <div className="flex w-full justify-between items-end">
                    <Button className="bg-primary hover:bg-white text-background-dark transition-colors rounded-full px-8 py-3 text-base font-bold flex items-center gap-2 shadow-lg glow">
                        <span>Новое голосование</span>
                        <Palette className="text-[20px]" />
                    </Button>
                    <Button className="bg-primary hover:bg-white text-background-dark transition-colors rounded-full px-8 py-3 text-base font-bold flex items-center gap-2 shadow-lg glow">
                        <span>Смотреть машину</span>
                        <Info className="text-[20px]" />
                    </Button>
                </div>
            </div>
        </section>
    );
};

// Live Feed Component
const LiveFeed = () => (
    <section className="w-full mt-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-primary/20">
            <h5 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2"><Newspaper className="text-base" /> Live Feed</h5>
            <div className="flex items-center gap-2 text-xs">
                <button className="font-bold text-primary">Latest</button><span className="text-primary/50">/</span><button className="font-medium text-white/70 hover:text-primary">Popular</button>
            </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <article className="p-5 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors holographic-panel-dark">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">JS</div><div><h4 className="font-bold text-sm text-white">Julia Stevens</h4><div className="flex items-center gap-2 text-xs text-white/70"><span>San Francisco, CA</span><span>•</span><span>2 hours ago</span></div></div></div>
                    <button className="text-white/70 hover:text-primary"><MoreHorizontal /></button>
                </div>
                <p className="text-sm text-white leading-relaxed mb-4">Testing the new navigation update on the downtown route today. The real-time traffic visualization is a game changer for morning commutes.</p>
                <div className="w-full h-48 rounded-lg bg-cover bg-center mb-4 opacity-80" style={{ backgroundImage: "url('https://picsum.photos/seed/downtown1/800/450')" }}></div>
                <div className="flex items-center gap-6 text-white/70 text-sm">
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors group"><Heart className="text-[18px] group-hover:fill-current" /><span>248</span></button>
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors group"><MessageCircle className="text-[18px]" /><span>42</span></button>
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors group"><Send className="text-[18px]" /><span>Share</span></button>
                </div>
            </article>
            <article className="p-5 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors holographic-panel-dark">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm">AS</div><div><h4 className="font-bold text-sm text-white">AutoSphere Official</h4><div className="flex items-center gap-2 text-xs text-white/70"><span className="bg-primary/20 text-primary px-1 rounded text-[10px] font-bold">ADMIN</span><span>•</span><span>5 hours ago</span></div></div></div>
                    <button className="text-white/70 hover:text-primary"><MoreHorizontal /></button>
                </div>
                <h5 className="font-bold text-primary mb-2">Community Guidelines Update v2.4</h5>
                <p className="text-sm text-white/90 leading-relaxed mb-4">We've updated our community standards to foster better discussions around EV modifications and track day events.</p>
                <div className="p-4 rounded-lg bg-background-dark/50 border border-white/5 mb-4"><div className="flex items-center gap-2 text-primary mb-1"><Shield className="text-sm" /><span className="text-xs font-bold uppercase">Important Notice</span></div><p className="text-xs text-white/60">Please review the new sections regarding high-voltage modification discussions.</p></div>
                <div className="flex items-center gap-6 text-white/70 text-sm mt-auto">
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors"><Heart className="text-[18px]" /><span>1.2k</span></button>
                    <button className="flex items-center gap-1.5 hover:text-primary transition-colors"><MessageCircle className="text-[18px]" /><span>89</span></button>
                </div>
            </article>
        </div>
    </section>
);

// Right Sidebar Component
const RightSidebar = () => {
    const topCars = [
        { name: 'Rimac Nevera', spec: '1,914 HP • Electric', image: 'https://picsum.photos/seed/rimac/100/56' },
        { name: 'Tesla Roadster', spec: '1.9s 0-60 • Concept', image: 'https://picsum.photos/seed/roadster/100/56' },
        { name: 'Pininfarina Battista', spec: '1,900 HP • Hyper GT', image: 'https://picsum.photos/seed/battista/100/56' },
        { name: 'Lucid Air Sapphire', spec: '1,234 HP • Sedan', image: 'https://picsum.photos/seed/lucid/100/56' },
        { name: 'Porsche Taycan T-GT', spec: '1,092 HP • Track', image: 'https://picsum.photos/seed/taycan/100/56' },
    ];
    return (
        <aside className="w-[320px] hidden lg:flex flex-none border-l border-primary/20 bg-background-dark/20 p-6 overflow-y-auto scroll-effect flex-col gap-6 z-20 backdrop-blur-sm">
            <div className="flex-none flex flex-col">
                <div className="flex items-center justify-between mb-4"><h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2"><BarChart className="text-sm" /> Top 10 Cars</h5><button className="text-[10px] text-primary hover:text-white transition-colors">View All</button></div>
                <div className="flex flex-col gap-2">
                    {topCars.map((car, index) => (
                        <div key={car.name} className={`flex items-center gap-3 p-3 rounded-lg border transition-all group cursor-pointer ${index === 0 ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : 'bg-background-dark/50 border-white/5 hover:bg-primary/10 hover:border-primary/30'}`}>
                            <span className={`text-lg font-bold font-mono w-6 ${index === 0 ? 'text-primary/80' : 'text-white/30 group-hover:text-primary/80'}`}>0{index + 1}</span>
                            <div className="w-12 h-8 rounded bg-cover bg-center flex-none border border-white/10" style={{ backgroundImage: `url(${car.image})` }}></div>
                            <div className="flex-1 min-w-0"><h6 className="text-sm font-bold text-white truncate">{car.name}</h6><p className="text-[10px] text-primary/70">{car.spec}</p></div>
                            <ChevronRight className="text-white/50 text-[16px] group-hover:text-primary" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-none">
                <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2"><Newspaper className="text-sm" /> Auto News</h5>
                <div className="flex flex-col gap-4">
                    <div className="group cursor-pointer"><div className="flex justify-between items-start mb-1.5"><span className="text-[10px] font-bold text-primary border border-primary/30 px-1.5 rounded bg-primary/10">EV TECH</span><span className="text-[10px] text-white/40">2h ago</span></div><h4 className="text-sm text-white font-medium leading-tight group-hover:text-primary transition-colors">Solid-state battery production begins in Nevada facility.</h4></div><div className="h-px bg-white/5 w-full"></div>
                    <div className="group cursor-pointer"><div className="flex justify-between items-start mb-1.5"><span className="text-[10px] font-bold text-white/70 border border-white/10 px-1.5 rounded bg-white/5">RACING</span><span className="text-[10px] text-white/40">5h ago</span></div><h4 className="text-sm text-white font-medium leading-tight group-hover:text-primary transition-colors">New lap record set at Nürburgring by mystery prototype.</h4></div><div className="h-px bg-white/5 w-full"></div>
                    <div className="group cursor-pointer"><div className="flex justify-between items-start mb-1.5"><span className="text-[10px] font-bold text-white/70 border border-white/10 px-1.5 rounded bg-white/5">INDUSTRY</span><span className="text-[10px] text-white/40">1d ago</span></div><h4 className="text-sm text-white font-medium leading-tight group-hover:text-primary transition-colors">Global charging standard adoption accelerates in EU.</h4></div>
                </div>
            </div>
        </aside>
    );
};

export default function HomePage() {
    return (
        <div className="flex-1 flex overflow-hidden relative z-10">
            <div className="flex-1 overflow-y-auto scroll-effect p-8 flex flex-col gap-6">
                <FeaturedCarHero />
                <LiveFeed />
            </div>
            <RightSidebar />
        </div>
    );
}

