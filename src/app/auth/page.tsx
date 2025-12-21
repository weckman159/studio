
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { Loader2, CarFront, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }).max(50),
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Успешный вход", description: "С возвращением!" });
      router.push('/');
    } catch (error: any) {
      let msg = "Ошибка входа. Проверьте данные.";
      if (error.code === 'auth/invalid-credential') msg = "Неверный email или пароль";
      toast({ variant: "destructive", title: "Ошибка", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    if (!auth || !firestore) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: values.name });
      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        uid: user.uid,
        displayName: values.name,
        name: values.name,
        email: user.email,
        photoURL: '',
        roles: { isAdmin: false, isModerator: false, isFirm: false, isPremium: false },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        stats: { postsCount: 0, followersCount: 0, followingCount: 0, carsCount: 0 }
      });
      toast({ title: "Регистрация успешна", description: "Добро пожаловать в AutoSphere!" });
      router.push('/');
    } catch (error: any) {
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
      <Card className="w-full max-w-md holographic-panel-dark">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <CarFront className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">AutoSphere</CardTitle>
          <CardDescription className="text-text-secondary">Войдите или создайте аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/20">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="text-text-secondary">Email</FormLabel><FormControl><Input type="email" {...field} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary" autoComplete="email" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                     <FormItem><FormLabel className="text-text-secondary">Пароль</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary" autoComplete="current-password"/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>{showPassword ? <EyeOff/> : <Eye/>}</Button></div></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Войти
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField control={registerForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel className="text-text-secondary">Имя пользователя</FormLabel><FormControl><Input placeholder="Например, AlexDriver" {...field} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary" autoComplete="name"/></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={registerForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel className="text-text-secondary">Email</FormLabel><FormControl><Input type="email" {...field} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary" autoComplete="email"/></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={registerForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel className="text-text-secondary">Пароль</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} disabled={loading} className="bg-black/20 border-primary/20 focus:border-primary" autoComplete="new-password"/><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}>{showPassword ? <EyeOff/> : <Eye/>}</Button></div></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Создать аккаунт
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
