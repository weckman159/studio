'use client';

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  Code, 
  Image as ImageIcon, 
  Quote,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GithubEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function GithubEditor({ value, onChange, placeholder, className }: GithubEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState('write');

  // Функция для вставки Markdown-символов в позицию курсора
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousValue = textarea.value;

    const selectedText = previousValue.substring(start, end);
    const newValue = 
      previousValue.substring(0, start) + 
      before + selectedText + after + 
      previousValue.substring(end);

    onChange(newValue);

    // Возвращаем фокус и ставим курсор в нужное место
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className={cn("border rounded-md w-full bg-background", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        
        {/* Хедер с табами и инструментами */}
        <div className="flex items-center justify-between px-2 pt-2 border-b bg-muted/30">
          <TabsList className="bg-transparent p-0 h-auto gap-2">
            <TabsTrigger 
              value="write" 
              className="rounded-t-md rounded-b-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none px-4 py-2 text-sm"
            >
              Write
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="rounded-t-md rounded-b-none border border-transparent data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:shadow-none px-4 py-2 text-sm"
            >
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Панель инструментов (видна только в режиме Write) */}
          {activeTab === 'write' && (
            <div className="flex items-center gap-1 mb-1 hidden sm:flex">
              <ToolbarButton icon={<Bold className="h-4 w-4" />} onClick={() => insertText('**', '**')} tooltip="Полужирный" />
              <ToolbarButton icon={<Italic className="h-4 w-4" />} onClick={() => insertText('_', '_')} tooltip="Курсив" />
              <ToolbarButton icon={<LinkIcon className="h-4 w-4" />} onClick={() => insertText('[', '](url)')} tooltip="Ссылка" />
              <ToolbarButton icon={<Quote className="h-4 w-4" />} onClick={() => insertText('> ')} tooltip="Цитата" />
              <ToolbarButton icon={<Code className="h-4 w-4" />} onClick={() => insertText('`', '`')} tooltip="Код" />
              <ToolbarButton icon={<List className="h-4 w-4" />} onClick={() => insertText('- ')} tooltip="Список" />
              <ToolbarButton icon={<CheckSquare className="h-4 w-4" />} onClick={() => insertText('- [ ] ')} tooltip="Задач" />
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="p-2">
          <TabsContent value="write" className="mt-0">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || "Leave a comment"}
              className="min-h-[200px] font-mono text-sm resize-y focus-visible:ring-0 border-0 shadow-none p-2"
            />
            <div className="flex justify-between items-center mt-2 px-2 text-xs text-muted-foreground border-t pt-2 border-dashed">
               <span className="flex items-center gap-1">
                 <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15 13h13.69c.64 0 1.15-.52 1.15-1.15V4.15C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4 8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z"/></svg>
                 Styling with Markdown is supported
               </span>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0 min-h-[200px] p-4 prose dark:prose-invert max-w-none text-sm">
             {value.trim() ? (
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {value}
               </ReactMarkdown>
             ) : (
               <p className="text-muted-foreground">Nothing to preview</p>
             )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Вспомогательная кнопка для тулбара
function ToolbarButton({ icon, onClick, tooltip }: { icon: React.ReactNode, onClick: () => void, tooltip: string }) {
  return (
    <Button 
      type="button" 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      title={tooltip}
    >
      {icon}
    </Button>
  );
}
