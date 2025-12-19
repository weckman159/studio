
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

// Interface for notification settings
interface NotificationSettings {
  emailNotifications: boolean;
  newComments: boolean;
  newLikes: boolean;
  newFollowers: boolean;
  marketplaceMessages: boolean;
  eventReminders: boolean;
}

// Interface for privacy settings
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


  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('account');

  // Email and password
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    newComments: true,
    newLikes: true,
    newFollowers: true,
    marketplaceMessages: true,
    eventReminders: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showGarage: true,
    allowMessages: true
  });

  // Load settings
  useEffect(() => {
    if (user && firestore) {
      loadSettings();
    } else if (!isUserLoading) {
      setLoading(false);
    }
  }, [user, firestore, isUserLoading]);

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
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !auth || !auth.currentUser) return;

    setError('');
    setSuccess('');

    if (!newEmail.trim() || newEmail === user.email) {
      setError('Enter a new email address');
      return;
    }

    if (!currentPassword) {
      setError('To change email, enter your current password');
      return;
    }

    try {
      setSaving(true);
      
      if(!user.email) throw new Error("User email is not defined.");

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);
      await updateDoc(doc(firestore, 'users', user.uid), {
        email: newEmail,
        updatedAt: serverTimestamp()
      });

      setSuccess('Email updated successfully');
      setCurrentPassword('');
    } catch (err: any) {
      console.error('Error updating email:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect current password');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use');
      } else {
        setError('Failed to update email. Please try again later.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !auth || !auth.currentUser) return;

    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      
      if(!user.email) throw new Error("User email is not defined.");

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect current password');
      } else {
        setError('Failed to update password. Please try again later.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user || !firestore) return;
    setError(''); setSuccess('');
    try {
      setSaving(true);
      await setDoc(doc(firestore, 'userSettings', user.uid), {
        notifications,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSuccess('Notification settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (!user || !firestore) return;
    setError(''); setSuccess('');
    try {
      setSaving(true);
      await setDoc(doc(firestore, 'userSettings', user.uid), {
        privacy,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await updateDoc(doc(firestore, 'users', user.uid), {
        profileVisibility: privacy.profileVisibility,
        updatedAt: serverTimestamp()
      });
      setSuccess('Privacy settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!user && !isUserLoading) {
    return (
      <div className="p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to access settings.
            <Link href="/auth" className="ml-2 underline text-primary">Login</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || isUserLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-white">Настройки</h1>
            <p className="text-text-secondary">
              Управление вашим аккаунтом и настройками приватности
            </p>
          </div>

          {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="mb-6 bg-green-500/10 border-green-500/30 text-green-300"><AlertDescription>{success}</AlertDescription></Alert>}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-black/20 mb-6">
              <TabsTrigger value="account"><Mail className="mr-2 h-4 w-4" />Аккаунт</TabsTrigger>
              <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Безопасность</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Уведомления</TabsTrigger>
              <TabsTrigger value="privacy"><Shield className="mr-2 h-4 w-4" />Приватность</TabsTrigger>
            </TabsList>
            
            <Card className="holographic-panel">
              <TabsContent value="account" className="m-0">
                <CardHeader><CardTitle>Email адрес</CardTitle><CardDescription>Изменить email для входа в систему</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="newEmail">Новый email</Label><Input id="newEmail" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={saving} /></div>
                  <div className="space-y-2"><Label htmlFor="currentPasswordEmail">Текущий пароль (для подтверждения)</Label><Input id="currentPasswordEmail" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} disabled={saving} /></div>
                  <Button onClick={handleUpdateEmail} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Обновить email</Button>
                </CardContent>
              </TabsContent>

              <TabsContent value="security" className="m-0">
                <CardHeader><CardTitle>Изменить пароль</CardTitle><CardDescription>Обновите пароль для повышения безопасности</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="currentPasswordSec">Текущий пароль</Label><Input id="currentPasswordSec" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} disabled={saving} /></div>
                  <div className="space-y-2"><Label htmlFor="newPassword">Новый пароль</Label><div className="relative"><Input id="newPassword" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={saving} /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></div>
                  <div className="space-y-2"><Label htmlFor="confirmPassword">Подтвердите новый пароль</Label><Input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={saving} /></div>
                  <Button onClick={handleUpdatePassword} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Обновить пароль</Button>
                </CardContent>
              </TabsContent>

              <TabsContent value="notifications" className="m-0">
                <CardHeader><CardTitle>Уведомления</CardTitle><CardDescription>Управление уведомлениями по email и в приложении</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'emailNotifications', label: 'Email уведомления', desc: 'Получать уведомления на email' },
                    { key: 'newComments', label: 'Новые комментарии', desc: 'Уведомлять о комментариях к вашим постам' },
                    { key: 'newLikes', label: 'Новые лайки', desc: 'Уведомлять о лайках ваших постов' },
                    { key: 'marketplaceMessages', label: 'Сообщения на маркетплейсе', desc: 'Уведомлять о новых сообщениях по объявлениям' },
                    { key: 'eventReminders', label: 'Напоминания о событиях', desc: 'Уведомлять о предстоящих событиях' },
                  ].map(item => (
                    <div className="flex items-center justify-between" key={item.key}>
                      <div><Label>{item.label}</Label><p className="text-sm text-text-secondary">{item.desc}</p></div>
                      <Switch checked={notifications[item.key as keyof NotificationSettings]} onCheckedChange={checked => setNotifications({...notifications, [item.key]: checked})} disabled={saving}/>
                    </div>
                  ))}
                  <Button onClick={handleSaveNotifications} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Сохранить</Button>
                </CardContent>
              </TabsContent>

              <TabsContent value="privacy" className="m-0">
                <CardHeader><CardTitle>Приватность</CardTitle><CardDescription>Управление видимостью вашего профиля и данных</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                    {[
                        { key: 'profileVisibility', label: 'Публичный профиль', desc: 'Ваш профиль виден всем пользователям' },
                        { key: 'showEmail', label: 'Показывать email', desc: 'Другие пользователи увидят ваш email' },
                        { key: 'showGarage', label: 'Показывать гараж', desc: 'Другие пользователи увидят ваши автомобили' },
                        { key: 'allowMessages', label: 'Разрешить сообщения', desc: 'Другие пользователи могут писать вам' },
                    ].map(item => (
                      <div className="flex items-center justify-between" key={item.key}>
                        <div><Label>{item.label}</Label><p className="text-sm text-text-secondary">{item.desc}</p></div>
                        <Switch checked={item.key === 'profileVisibility' ? privacy.profileVisibility === 'public' : privacy[item.key as keyof Omit<PrivacySettings, 'profileVisibility'>]} onCheckedChange={checked => setPrivacy(prev => ({...prev, [item.key]: item.key === 'profileVisibility' ? (checked ? 'public' : 'private') : checked}))} disabled={saving}/>
                      </div>
                    ))}
                  <Button onClick={handleSavePrivacy} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Сохранить</Button>
                </CardContent>
              </TabsContent>
            </Card>
      </Tabs>
      </div>
    </div>
  );
}
