
"use client"

import * as React from "react"
import { format, setHours, setMinutes } from "date-fns"
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input";
import { Label } from "./label";

interface DateTimePickerProps {
    date: Date | null;
    setDate: (date: Date | null) => void;
    disabled?: boolean;
}


export function DateTimePicker({ date, setDate, disabled }: DateTimePickerProps) {

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return;
    
    let newDate = date || new Date();

    if(type === 'hours') {
        if (numericValue < 0 || numericValue > 23) return;
        newDate = setHours(newDate, numericValue);
    }
    if(type === 'minutes') {
        if (numericValue < 0 || numericValue > 59) return;
        newDate = setMinutes(newDate, numericValue);
    }

    setDate(newDate);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPPp", { locale: ru }) : <span>Выберите дату и время</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(d) => setDate(d || null)}
          initialFocus
          locale={ru}
        />
        <div className="p-3 border-t border-border">
            <Label className="text-sm">Время</Label>
            <div className="flex items-center gap-2 mt-2">
                <Input 
                    type="number"
                    value={date ? String(date.getHours()).padStart(2, '0') : '00'}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                    className="w-16"
                    min="0"
                    max="23"
                />
                <span>:</span>
                 <Input 
                    type="number"
                    value={date ? String(date.getMinutes()).padStart(2, '0') : '00'}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    className="w-16"
                    min="0"
                    max="59"
                />
            </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
