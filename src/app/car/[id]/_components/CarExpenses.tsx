'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, TrendingUp, Fuel, Wrench, Zap, Car } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'fuel' | 'service' | 'tuning' | 'other';
  date: any;
  mileage?: number;
}

const CATEGORY_ICONS: Record<string, any> = {
    fuel: <Fuel className="h-5 w-5 text-yellow-500" />,
    service: <Wrench className="h-5 w-5 text-blue-500" />,
    tuning: <Zap className="h-5 w-5 text-purple-500" />,
    other: <Car className="h-5 w-5 text-gray-500" />
};

export function CarExpenses({ carId, isOwner }: { carId: string, isOwner: boolean }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('fuel');
  const [mileage, setMileage] = useState('');

  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'cars', carId, 'expenses'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
        setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
    });
    return () => unsub();
  }, [firestore, carId]);

  const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !amount) return;
      setLoading(true);
      try {
          await addDoc(collection(firestore, 'cars', carId, 'expenses'), {
              title,
              amount: Number(amount),
              category,
              mileage: Number(mileage),
              date: serverTimestamp(),
              userId: user?.uid
          });
          setIsOpen(false);
          setTitle(''); setAmount(''); setMileage('');
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id: string) => {
      if(confirm('Удалить запись?')) {
          await deleteDoc(doc(firestore, 'cars', carId, 'expenses', id));
      }
  }

  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
        {/* Карточка с общей суммой */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
            <CardContent className="p-6 flex justify-between items-center">
                <div>
                    <p className="text-slate-400 text-sm font-medium">Всего потрачено</p>
                    <h2 className="text-4xl font-bold mt-1">{totalAmount.toLocaleString()} ₽</h2>
                </div>
                <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="h-8 w-8" />
                </div>
            </CardContent>
        </Card>

        {/* Кнопка добавления (Только для владельца) */}
        {isOwner && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full h-12 text-base shadow-sm" variant="outline">
                        <Plus className="mr-2 h-5 w-5" /> Добавить расход
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Новая запись расходов</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Например: АИ-95, 40л" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Сумма (₽)</Label>
                                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                 <Label>Категория</Label>
                                 <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fuel">⛽ Топливо</SelectItem>
                                        <SelectItem value="service">🔧 Сервис</SelectItem>
                                        <SelectItem value="tuning">⚡ Тюнинг</SelectItem>
                                        <SelectItem value="other">🚗 Прочее</SelectItem>
                                    </SelectContent>
                                 </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Пробег (км)</Label>
                            <Input type="number" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="Текущий пробег" />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>Сохранить</Button>
                    </form>
                </DialogContent>
            </Dialog>
        )}

        {/* Список */}
        <div className="space-y-3">
            {expenses.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                            {CATEGORY_ICONS[item.category]}
                        </div>
                        <div>
                            <p className="font-semibold text-base">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {item.date?.toDate ? item.date.toDate().toLocaleDateString() : 'Недавно'} 
                                {item.mileage ? ` • ${item.mileage.toLocaleString()} км` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{item.amount.toLocaleString()} ₽</span>
                        {isOwner && (
                            <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-red-500 p-1">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
             {expenses.length === 0 && <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-xl">Записей о расходах пока нет</div>}
        </div>
    </div>
  );
}