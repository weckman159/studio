// src/components/MarketplaceFilters.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';

// Mock данные - в реальном приложении их нужно получать из Firestore
const BRANDS_MODELS: Record<string, string[]> = {
    'BMW': ['3-Series', '5-Series', 'X5', 'M4'],
    'Audi': ['A4', 'A6', 'Q7', 'RS6'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'G-Class', 'AMG GT']
};

export function MarketplaceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Локальное состояние для управляемых компонентов
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [models, setModels] = useState<string[]>([]);

  // Обновляем модели при выборе бренда
  useEffect(() => {
    if (brand) {
      setModels(BRANDS_MODELS[brand] || []);
    } else {
      setModels([]);
    }
    // Сбрасываем модель, если бренд изменился
    if(searchParams.get('brand') !== brand) {
        setModel('');
    }
  }, [brand, searchParams]);

  // Функция для обновления URL
  const updateUrlParams = useCallback((paramsToUpdate: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    // Используем shallow routing, чтобы не перезагружать всю страницу
    router.push(`${pathname}${query}`, { scroll: false });
  }, [searchParams, pathname, router]);
  
  const handleResetFilters = () => {
    setSearch('');
    setBrand('');
    setModel('');
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-4xl font-bold mb-2 text-white">Маркетплейс</h1>
              <p className="text-text-secondary">Покупайте и продавайте автозапчасти, аксессуары и автомобили</p>
          </div>
          <Link href="/marketplace/create"><Button size="lg"><Plus className="mr-2 h-5 w-5" />Разместить объявление</Button></Link>
      </div>

      <div className="p-4 rounded-xl holographic-panel space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted h-5 w-5" />
            <Input type="text" placeholder="Поиск по названию..." value={search} onChange={e => { setSearch(e.target.value); updateUrlParams({ q: e.target.value }); }} className="pl-10 h-12 bg-surface border-border"/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select value={brand} onValueChange={value => { setBrand(value); updateUrlParams({ brand: value, model: null }); }}>
            <SelectTrigger><SelectValue placeholder="Бренд" /></SelectTrigger>
            <SelectContent>{Object.keys(BRANDS_MODELS).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={model} onValueChange={value => { setModel(value); updateUrlParams({ model: value }); }} disabled={!brand}>
            <SelectTrigger><SelectValue placeholder="Модель" /></SelectTrigger>
            <SelectContent>{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={value => updateUrlParams({ sortBy: value })} defaultValue={searchParams.get('sortBy') || 'createdAt_desc'}>
              <SelectTrigger><SelectValue placeholder="Сортировать" /></SelectTrigger>
              <SelectContent><SelectItem value="createdAt_desc">Сначала новые</SelectItem><SelectItem value="price_asc">Сначала дешевые</SelectItem><SelectItem value="price_desc">Сначала дорогие</SelectItem></SelectContent>
          </Select>
          <Button variant="ghost" onClick={handleResetFilters} className="gap-2 text-text-secondary"><X className="h-4 w-4"/> Сбросить</Button>
        </div>
      </div>
    </div>
  );
}
