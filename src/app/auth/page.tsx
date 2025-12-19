
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CarFront } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Успешный вход", description: "С возвращением!" });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let msg = "Ошибка входа";
      if (error.code === 'auth/invalid-credential') msg = "Неверный email или пароль";
      toast({ variant: "destructive", title: "Ошибка", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);
    try {
      // 1. Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update profile (name)
      await updateProfile(user, { displayName: name });

      // 3. Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        uid: user.uid,
        displayName: name,
        name: name,
        email: user.email,
        photoURL: '',
        roles: { isAdmin: false, isModerator: false, isFirm: false, isPremium: false },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: {
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            carsCount: 0
        }
      });

      toast({ title: "Регистрация успешна", description: "Добро пожаловать в AutoSphere!" });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      let msg = "Ошибка регистрации";
      if (error.code === 'auth/email-already-in-use') msg = "Этот email уже занят";
      if (error.code === 'auth/weak-password') msg = "Пароль слишком простой (мин. 6 символов)";
      toast({ variant: "destructive", title: "Ошибка", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="w-full max-w-md holographic-panel">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full glow">
                <CarFront className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">AutoSphere</CardTitle>
          <CardDescription className="text-text-secondary">Войдите или создайте аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/20">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-text-secondary">Пароль</Label>
                  <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary"/>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Войти
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-text-secondary">Имя пользователя</Label>
                  <Input id="reg-name" required value={name} onChange={e => setName(e.target.value)} disabled={loading} placeholder="Например, AlexDriver" className="bg-black/20 border-primary/20 focus:border-primary"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-text-secondary">Email</Label>
                  <Input id="reg-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-text-secondary">Пароль</Label>
                  <Input id="reg-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} minLength={6} className="bg-black/20 border-primary/20 focus:border-primary"/>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Создать аккаунт
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
