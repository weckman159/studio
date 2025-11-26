'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useFirestore, useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Bell,
  Shield,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

// Интерфейс настроек уведомлений
interface NotificationSettings {
  emailNotifications: boolean;
  newComments: boolean;
  newLikes: boolean;
  newFollowers: boolean;
  marketplaceMessages: boolean;
  eventReminders: boolean;
}

// Интерфейс настроек приватности
interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showGarage: boolean;
  allowMessages: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();


  // Состояния
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('account');

  // Email и пароль
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Настройки уведомлений
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    newComments: true,
    newLikes: true,
    newFollowers: true,
    marketplaceMessages: true,
    eventReminders: true
  });

  // Настройки приватности
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showGarage: true,
    allowMessages: true
  });

  // Загрузка настроек
  useEffect(() => {
    if (user && firestore) {
      loadSettings();
    } else if (!isUserLoading) {
      setLoading(false);
    }
  }, [user, firestore, isUserLoading]);

  // Функция загрузки настроек из Firestore
  const loadSettings = async () => {
    if (!user || !firestore) return;

    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(firestore, 'userSettings', user.uid));

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.notifications) setNotifications(data.notifications);
        if (data.privacy) setPrivacy(data.privacy);
      }

      setNewEmail(user.email || '');
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция смены email
  const handleUpdateEmail = async () => {
    if (!user || !auth.currentUser) return;

    setError('');
    setSuccess('');

    if (!newEmail.trim() || newEmail === user.email) {
      setError('Введите новый email адрес');
      return;
    }

    if (!currentPassword) {
      setError('Для изменения email введите текущий пароль');
      return;
    }

    try {
      setSaving(true);

      if(!user.email) throw new Error("User email is not defined.");

      // Реаутентификация пользователя
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Обновление email
      await updateEmail(auth.currentUser, newEmail);

      // Обновление в Firestore
      await updateDoc(doc(firestore, 'users', user.uid), {
        email: newEmail,
        updatedAt: serverTimestamp()
      });

      setSuccess('Email успешно обновлен');
      setCurrentPassword('');
    } catch (err: any) {
      console.error('Ошибка обновления email:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Неверный текущий пароль');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Этот email уже используется');
      } else {
        setError('Не удалось обновить email. Попробуйте позже.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Функция смены пароля
  const handleUpdatePassword = async () => {
    if (!user || !auth.currentUser) return;

    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setSaving(true);
      
      if(!user.email) throw new Error("User email is not defined.");

      // Реаутентификация
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Обновление пароля
      await updatePassword(auth.currentUser, newPassword);

      setSuccess('Пароль успешно обновлен');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Ошибка обновления пароля:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Неверный текущий пароль');
      } else {
        setError('Не удалось обновить пароль. Попробуйте позже.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Функция сохранения настроек уведомлений
  const handleSaveNotifications = async () => {
    if (!user || !firestore) return;

    setError('');
    setSuccess('');

    try {
      setSaving(true);
      await setDoc(doc(firestore, 'userSettings', user.uid), {
        notifications,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccess('Настройки уведомлений сохранены');
    } catch (err) {
      console.error('Ошибка сохранения настроек:', err);
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  // Функция сохранения настроек приватности
  const handleSavePrivacy = async () => {
    if (!user || !firestore) return;

    setError('');
    setSuccess('');

    try {
      setSaving(true);
      await setDoc(doc(firestore, 'userSettings', user.uid), {
        privacy,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Обновляем видимость профиля в документе пользователя
      await updateDoc(doc(firestore, 'users', user.uid), {
        profileVisibility: privacy.profileVisibility,
        updatedAt: serverTimestamp()
      });

      setSuccess('Настройки приватности сохранены');
    } catch (err) {
      console.error('Ошибка сохранения настроек:', err);
      setError('Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  // Проверка авторизации
  if (!user && !isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Для доступа к настройкам необходимо войти в систему.
            <Link href="/auth" className="ml-2 underline">
              Войти
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // UI загрузки
  if (loading || isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка настроек...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Настройки</h1>
        <p className="text-muted-foreground">
          Управление вашим аккаунтом и настройками приватности
        </p>
      </div>

      {/* Сообщения */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Вкладки */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <Mail className="mr-2 h-4 w-4" />
            Аккаунт
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="mr-2 h-4 w-4" />
            Безопасность
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="mr-2 h-4 w-4" />
            Приватность
          </TabsTrigger>
        </TabsList>

        {/* Вкладка: Аккаунт */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Email адрес</CardTitle>
              <CardDescription>
                Изменить email для входа в систему
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">Новый email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPasswordEmail">Текущий пароль (для подтверждения)</Label>
                <Input
                  id="currentPasswordEmail"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  disabled={saving}
                />
              </div>
              <Button onClick={handleUpdateEmail} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Обновить email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Безопасность */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Изменить пароль</CardTitle>
              <CardDescription>
                Обновите пароль для повышения безопасности
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPasswordSec">Текущий пароль</Label>
                <Input
                  id="currentPasswordSec"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={saving}
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Обновить пароль
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Уведомления */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>
                Управление уведомлениями по email и в приложении
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать уведомления на email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={checked => 
                    setNotifications({...notifications, emailNotifications: checked})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Новые комментарии</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о комментариях к вашим постам
                  </p>
                </div>
                <Switch
                  checked={notifications.newComments}
                  onCheckedChange={checked => 
                    setNotifications({...notifications, newComments: checked})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Новые лайки</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о лайках ваших постов
                  </p>
                </div>
                <Switch
                  checked={notifications.newLikes}
                  onCheckedChange={checked => 
                    setNotifications({...notifications, newLikes: checked})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Сообщения на маркетплейсе</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о новых сообщениях по объявлениям
                  </p>
                </div>
                <Switch
                  checked={notifications.marketplaceMessages}
                  onCheckedChange={checked => 
                    setNotifications({...notifications, marketplaceMessages: checked})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Напоминания о событиях</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомлять о предстоящих событиях
                  </p>
                </div>
                <Switch
                  checked={notifications.eventReminders}
                  onCheckedChange={checked => 
                    setNotifications({...notifications, eventReminders: checked})
                  }
                  disabled={saving}
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Сохранить настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка: Приватность */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Приватность</CardTitle>
              <CardDescription>
                Управление видимостью вашего профиля и данных
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Публичный профиль</Label>
                  <p className="text-sm text-muted-foreground">
                    Ваш профиль виден всем пользователям
                  </p>
                </div>
                <Switch
                  checked={privacy.profileVisibility === 'public'}
                  onCheckedChange={checked => 
                    setPrivacy({...privacy, profileVisibility: checked ? 'public' : 'private'})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Показывать email</Label>
                  <p className="text-sm text-muted-foreground">
                    Другие пользователи увидят ваш email
                  </p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={checked => 
                    setPrivacy({...privacy, showEmail: checked})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Показывать гараж</Label>
                  <p className="text-sm text-muted-foreground">
                    Другие пользователи увидят ваши автомобили
                  </p>
                </div>
                <Switch
                  checked={privacy.showGarage}
                  onCheckedChange={checked => 
                    setPrivacy({...privacy, showGarage: checked})
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Разрешить сообщения</Label>
                  <p className="text-sm text-muted-foreground">
                    Другие пользователи могут писать вам
                  </p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={checked => 
                    setPrivacy({...privacy, allowMessages: checked})
                  }
                  disabled={saving}
                />
              </div>

              <Button onClick={handleSavePrivacy} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Сохранить настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}