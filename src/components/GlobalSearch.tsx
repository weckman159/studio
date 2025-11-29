
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { isMobile } = useSidebar();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      // Clear input after search on mobile for better UX
      if (isMobile) {
        setQuery('');
      }
    }
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-10 h-10 w-full"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Поиск по сайту..."
      />
    </form>
  );
}
