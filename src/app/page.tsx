
'use client';
import React, { useEffect, useRef } from 'react';
import {
    Sparkles, Users, Rss, Store, Car, Zap, Search, GaugeCircle, BatteryCharging, Palette, Info, Newspaper,
    MoreHorizontal, Heart, MessageCircle, Send, Shield, BarChart, ChevronRight, Gem, Infinity,
} from 'lucide-react';

const RightSidebar = () => {
    return (
        <aside className="w-[320px] hidden lg:flex flex-none border-l border-primary/20 bg-background-dark/20 p-6 overflow-y-auto scroll-effect flex-col gap-6 z-20 backdrop-blur-sm">
            <div className="p-6 rounded-xl holographic-panel-dark text-white text-center flex-none">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-cover bg-center border-2 border-primary shadow-md glow" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=a042581f4e29026704d')" }}></div>
                </div>
                <h4 className="font-bold text-lg text-primary mb-1">Alex Driver</h4>
                <div className="flex items-center justify-center gap-1 text-sm text-white/70">
                    <Gem className="text-[16px] text-primary" />
                    <span>Premium Member</span>
                </div>
            </div>
            <div className="flex-none flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2"><BarChart className="text-sm" /> Top 10 Cars</h5>
                    <button className="text-[10px] text-primary hover:text-white transition-colors">View All</button>
                </div>
                <div className="flex flex-col gap-2">
                    {[
                        { name: 'Rimac Nevera', spec: '1,914 HP • Electric' },
                        { name: 'Tesla Roadster', spec: '1.9s 0-60 • Concept' },
                        { name: 'Pininfarina Battista', spec: '1,900 HP • Hyper GT' },
                    ].map((car, index) => (
                        <div key={car.name} className={`flex items-center gap-3 p-3 rounded-lg border transition-all group cursor-pointer ${index === 0 ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : 'bg-background-dark/50 border-white/5 hover:bg-primary/10 hover:border-primary/30'}`}>
                            <span className={`text-lg font-bold font-mono ${index === 0 ? 'text-primary/80' : 'text-white/30 group-hover:text-primary/80'}`}>0{index + 1}</span>
                            <div className="flex-1 min-w-0">
                                <h6 className={`text-sm font-bold truncate ${index === 0 ? 'text-white' : 'text-white/90 font-medium'}`}>{car.name}</h6>
                                <p className={`text-[10px] ${index === 0 ? 'text-primary/70' : 'text-white/50 group-hover:text-primary/70'}`}>{car.spec}</p>
                            </div>
                            <ChevronRight className={`text-[16px] group-hover:text-primary ${index === 0 ? 'text-white/50' : 'text-white/50'}`} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-none">
                <h5 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2"><Newspaper className="text-sm" /> Auto News</h5>
                <div className="flex flex-col gap-4">
                    {[
                        { cat: 'EV TECH', time: '2h ago', title: 'Solid-state battery production begins in Nevada facility.' },
                        { cat: 'RACING', time: '5h ago', title: 'New lap record set at Nürburgring by mystery prototype.' },
                    ].map((news, index) => (
                        <React.Fragment key={index}>
                            <div className="group cursor-pointer">
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={`text-[10px] font-bold border px-1.5 rounded ${index === 0 ? 'text-primary border-primary/30 bg-primary/10' : 'text-white/70 border-white/10 bg-white/5'}`}>{news.cat}</span>
                                    <span className="text-[10px] text-white/40">{news.time}</span>
                                </div>
                                <h4 className="text-sm text-white font-medium leading-tight group-hover:text-primary transition-colors">{news.title}</h4>
                            </div>
                            {index < 1 && <div className="h-px bg-white/5 w-full"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </aside>
    );
};

const CarModel = () => {
    const carModelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const carModel = carModelRef.current;
        let rotationY = 0;
        let autoRotate = true;
        let animationFrameId: number;

        function updateRotation() {
            if (autoRotate && carModel) {
                rotationY = (rotationY + 0.1) % 360;
                carModel.style.transform = `rotateY(${rotationY}deg) scale(1.1)`;
            }
            animationFrameId = requestAnimationFrame(updateRotation);
        }
        updateRotation();
        
        const handleMouseEnter = () => autoRotate = false;
        const handleMouseLeave = () => autoRotate = true;

        if (carModel) {
            carModel.addEventListener('mouseenter', handleMouseEnter);
            carModel.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (carModel) {
                carModel.removeEventListener('mouseenter', handleMouseEnter);
                carModel.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    return (
        <div ref={carModelRef} className="w-[90%] aspect-[16/9] transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://storage.googleapis.com/aida-images/futuristic-car.png')", backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', transform: 'rotateY(0deg) scale(1.1)', transformStyle: 'preserve-3d' }}>
            <div className="absolute bottom-[20%] left-[5%] text-white p-3 rounded-lg holographic-panel pointer-events-auto cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-z-10">
                <GaugeCircle className="text-primary text-[28px] mb-1" />
                <p className="text-xl font-bold text-primary">1020 HP</p>
                <p className="text-xs text-white/70">Performance Mode</p>
            </div>
            <div className="absolute top-[10%] right-[5%] text-white p-3 rounded-lg holographic-panel pointer-events-auto cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-z-10">
                <BatteryCharging className="text-primary text-[28px] mb-1" />
                <p className="text-xl font-bold text-primary">92%</p>
                <p className="text-xs text-white/70">Battery Level</p>
            </div>
        </div>
    );
};

export default function HomePage() {
    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto scroll-effect p-8 flex flex-col gap-6">
                <section className="w-full relative rounded-2xl overflow-hidden holographic-panel group min-h-[500px] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark/40 z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-l from-background-dark/80 via-transparent to-background-dark/80 z-0"></div>
                    <div className="absolute inset-0 perspective-[1000px] flex items-center justify-center overflow-hidden z-10 pointer-events-none">
                       <CarModel />
                    </div>
                    <div className="relative z-20 p-8 w-full bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-background-dark uppercase tracking-wider glow">Electric</span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur text-white uppercase tracking-wider border border-white/10">Tri-Motor AWD</span>
                        </div>
                        <h3 className="text-4xl font-bold tracking-tight text-primary mb-2">Tesla Model S Plaid</h3>
                        <p className="text-white/80 font-mono text-sm max-w-2xl leading-relaxed mb-6">Experience the pinnacle of electric performance with tri-motor all-wheel drive and torque vectoring.</p>
                        <div className="flex gap-4">
                            <button className="bg-primary hover:bg-white text-background-dark transition-colors rounded-full px-8 py-3 text-base font-bold flex items-center gap-2 shadow-lg glow">
                                <span>Customize</span>
                                <Palette className="text-[20px]" />
                            </button>
                            <button className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-background-dark transition-colors rounded-full px-8 py-3 text-base font-bold flex items-center gap-2 shadow-lg">
                                <span>Explore Specs</span>
                                <Info className="text-[20px]" />
                            </button>
                        </div>
                    </div>
                </section>
                <section className="w-full">
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-primary/20">
                        <h5 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2"><Newspaper className="text-base" /> Live Feed</h5>
                        <div className="flex items-center gap-2 text-xs">
                            <button className="font-bold text-primary">Latest</button>
                            <span className="text-primary/50">/</span>
                            <button className="font-medium text-white/70 hover:text-primary">Popular</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <article className="p-5 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors holographic-panel-dark">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">JS</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Julia Stevens</h4>
                                        <div className="flex items-center gap-2 text-xs text-white/70"><span>San Francisco, CA</span><span>•</span><span>2 hours ago</span></div>
                                    </div>
                                </div>
                                <button className="text-white/70 hover:text-primary"><MoreHorizontal /></button>
                            </div>
                            <p className="text-sm text-white leading-relaxed mb-4">Testing the new navigation update on the downtown route today. The real-time traffic visualization is a game changer for morning commutes.</p>
                            <div className="w-full h-48 rounded-lg bg-cover bg-center mb-4 opacity-80" style={{ backgroundImage: "url('https://storage.googleapis.com/aida-images/downtown-traffic.png')" }}></div>
                            <div className="flex items-center gap-6 text-white/70 text-sm">
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors group"><Heart className="text-[18px] group-hover:fill-current" /><span>248</span></button>
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors group"><MessageCircle className="text-[18px]" /><span>42</span></button>
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors group"><Send className="text-[18px]" /><span>Share</span></button>
                            </div>
                        </article>
                        <article className="p-5 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors holographic-panel-dark">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background-dark font-bold text-sm">AS</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">AutoSphere Official</h4>
                                        <div className="flex items-center gap-2 text-xs text-white/70"><span className="bg-primary/20 text-primary px-1 rounded text-[10px] font-bold">ADMIN</span><span>•</span><span>5 hours ago</span></div>
                                    </div>
                                </div>
                                <button className="text-white/70 hover:text-primary"><MoreHorizontal /></button>
                            </div>
                            <h5 className="font-bold text-primary mb-2">Community Guidelines Update v2.4</h5>
                            <p className="text-sm text-white/90 leading-relaxed mb-4">We've updated our community standards to foster better discussions around EV modifications and track day events.</p>
                            <div className="p-4 rounded-lg bg-background-dark/50 border border-white/5 mb-4">
                                <div className="flex items-center gap-2 text-primary mb-1"><Shield className="text-sm" /><span className="text-xs font-bold uppercase">Important Notice</span></div>
                                <p className="text-xs text-white/60">Please review the new sections regarding high-voltage modification discussions.</p>
                            </div>
                            <div className="flex items-center gap-6 text-white/70 text-sm mt-auto">
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors"><Heart className="text-[18px]" /><span>1.2k</span></button>
                                <button className="flex items-center gap-1.5 hover:text-primary transition-colors"><MessageCircle className="text-[18px]" /><span>89</span></button>
                            </div>
                        </article>
                    </div>
                </section>
            </div>
            <RightSidebar />
        </div>
    );
}
