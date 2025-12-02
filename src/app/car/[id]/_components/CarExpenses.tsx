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

const CATEGORY_ICONS = {
    fuel: <Fuel className="h-4 w-4 text-yellow-500" />,
    service: <Wrench className="h-4 w-4 text-blue-500" />,
    tuning: <Zap className="h-4 w-4 text-purple-500" />,
    other: <Car className="h-4 w-4 text-gray-500" />
};

const CATEGORY_NAMES = {
    fuel: 'Топливо',
    service: 'Обслуживание',
    tuning: 'Тюнинг',
    other: 'Прочее'
};

export function CarExpenses({ carId }: { carId: string }) {
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
        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
            <CardContent className="p-6 flex justify-between items-center">
                <div>
                    <p className="text-gray-400 text-sm">Общие расходы</p>
                    <h2 className="text-3xl font-bold mt-1">{totalAmount.toLocaleString()} ₽</h2>
                </div>
                <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>

        {/* Add Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Добавить расход
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Новая запись</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 mt-4">
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
                                    <SelectItem value="fuel">Топливо</SelectItem>
                                    <SelectItem value="service">Сервис</SelectItem>
                                    <SelectItem value="tuning">Тюнинг</SelectItem>
                                    <SelectItem value="other">Прочее</SelectItem>
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

        {/* List */}
        <div className="space-y-3">
            {expenses.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {CATEGORY_ICONS[item.category]}
                        </div>
                        <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                                {item.date?.toDate().toLocaleDateString()} 
                                {item.mileage ? ` • ${item.mileage} км` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-bold">{item.amount.toLocaleString()} ₽</span>
                        {user && <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                </div>
            ))}
             {expenses.length === 0 && <div className="text-center text-muted-foreground py-8">Записей пока нет</div>}
        </div>
    </div>
  );
}
