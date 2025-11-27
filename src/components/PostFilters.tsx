
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface PostFiltersProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const postTypes = [
  'Все',
  'Тюнинг',
  'Путешествия',
  'Спорт',
  'Ремонт',
  'Блог',
  'Фотоотчет',
  'Вопрос',
  'Мой опыт',
  'Обзор'
];

export function PostFilters({ 
  activeType, 
  onTypeChange, 
  searchQuery, 
  onSearchChange 
}: PostFiltersProps) {
  return (
    <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Поиск по постам..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-3">
              {postTypes.map(type => (
                <Button
                  key={type}
                  variant={activeType === type ? 'default' : 'outline'}
                  onClick={() => onTypeChange(type)}
                  size="sm"
                  className="shrink-0"
                >
                  {type}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </div>
  );
}
