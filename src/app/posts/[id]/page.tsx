
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Heart,
  MessageCircle,
  Share2,
  Edit3,
  AlertCircle,
  Send
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Интерфейс полного поста
interface Post {
  id: string;
  title: string;
  content: string; // HTML из редактора
  type: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  imageUrl?: string;
  createdAt: any;
  updatedAt?: any;
  likesCount: number;
  likedBy: string[]; // Массив ID пользователей, лайкнувших пост
  commentsCount: number;
}

// Интерфейс комментария
interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: any;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Загрузка поста и комментариев
  useEffect(() => {
    if (postId && firestore) {
      fetchPost();
      fetchComments();
    }
  }, [postId, firestore]);

  // Функция загрузки поста
  const fetchPost = async () => {
    if (!firestore) return;
    try {
      setLoading(true);
      const postDoc = await getDoc(doc(firestore, 'posts', postId));

      if (!postDoc.exists()) {
        router.push('/posts');
        return;
      }

      const postData = {
        id: postDoc.id,
        ...postDoc.data()
      } as Post;

      setPost(postData);
    } catch (error) {
      console.error('Ошибка загрузки поста:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функция загрузки комментариев
  const fetchComments = async () => {
    if (!firestore) return;
    try {
      const q = query(
        collection(firestore, 'comments'),
        where('postId', '==', postId)
      );
      const querySnapshot = await getDocs(q);
      const commentsData: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
      
      // Сортировка на клиенте
      commentsData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

      setComments(commentsData);
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
    }
  };

  // Функция лайка/дизлайка
  const handleLike = async () => {
    if (!user || !post || !firestore) return;

    try {
      const postRef = doc(firestore, 'posts', postId);
      const isLiked = post.likedBy?.includes(user.uid);

      if (isLiked) {
        // Убираем лайк
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likesCount: increment(-1)
        });
        setPost({
          ...post,
          likedBy: post.likedBy.filter(id => id !== user.uid),
          likesCount: post.likesCount - 1
        });
      } else {
        // Ставим лайк
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likesCount: increment(1)
        });
        setPost({
          ...post,
          likedBy: [...(post.likedBy || []), user.uid],
          likesCount: post.likesCount + 1
        });
      }
    } catch (error) {
      console.error('Ошибка лайка:', error);
    }
  };

  // Функция добавления комментария
  const handleAddComment = async () => {
    if (!user || !commentText.trim() || !post || !firestore) return;

    try {
      setSubmittingComment(true);
      
      const commentData = {
        postId: postId,
        authorId: user.uid,
        authorName: user.displayName || 'Пользователь',
        authorAvatar: user.photoURL,
        content: commentText.trim(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(firestore, 'comments'), commentData);

      // Увеличиваем счетчик комментариев в посте
      await updateDoc(doc(firestore, 'posts', postId), {
        commentsCount: increment(1)
      });

      setCommentText('');
      await fetchComments();
      if(post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (error) {
      console.error('Ошибка добавления комментария:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Функция "Поделиться"
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url: window.location.href
        });
      } catch (error) {
        console.log('Ошибка при попытке поделиться:', error);
      }
    } else if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована в буфер обмена');
        } catch (error) {
            console.error('Не удалось скопировать ссылку:', error);
            alert('Не удалось скопировать ссылку');
        }
    } else {
        alert('Функция "Поделиться" не поддерживается в вашем браузере.');
    }
  };

  // Форматирование даты
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Проверка, является ли текущий пользователь автором
  const isAuthor = post && user && post.authorId === user.uid;
  const isLiked = post && user && post.likedBy?.includes(user.uid);

  // UI загрузки
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка поста...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Пост не найден.
            <Link href="/posts" className="ml-2 underline">
              Вернуться к постам
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Обложка поста */}
      {post.imageUrl && (
        <div className="w-full h-[400px] overflow-hidden bg-muted relative">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Кнопка назад */}
        <Link href="/posts">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К постам
          </Button>
        </Link>

        {/* Основной контент */}
        <article>
          {/* Тип поста */}
          <div className="mb-4">
            <Badge>{post.type}</Badge>
          </div>

          {/* Заголовок */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {post.title}
            </h1>
            {isAuthor && (
              <Link href={`/posts/edit/${postId}`}>
                <Button variant="outline" size="icon">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Мета-информация и автор */}
          <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b">
            {/* Автор */}
            <Link href={`/profile/${post.authorId}`}>
              <div className="flex items-center gap-3 hover:opacity-80 cursor-pointer">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.authorName}</p>
                  <p className="text-xs text-muted-foreground">Автор</p>
                </div>
              </div>
            </Link>

            {/* Дата */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Лайк */}
              {user ? (
                <Button
                  variant={isLiked ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  {post.likesCount}
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <Heart className="mr-2 h-4 w-4" />
                  {post.likesCount}
                </Button>
              )}

              {/* Комментарии */}
              <Button variant="outline" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                {post.commentsCount}
              </Button>

              {/* Поделиться */}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Текст поста */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Комментарии */}
          <Card>
            <CardHeader>
              <CardTitle>
                Комментарии ({post.commentsCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Форма добавления комментария */}
              {user ? (
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Написать комментарий..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      rows={3}
                      disabled={submittingComment}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || submittingComment}
                      size="sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Отправить
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Для комментирования необходимо войти в систему.
                    <Link href="/auth" className="ml-2 underline">
                      Войти
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              {/* Список комментариев */}
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Комментариев пока нет. Будьте первым!
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <Link href={`/profile/${comment.authorId}`}>
                        <Avatar>
                          <AvatarImage src={comment.authorAvatar} />
                          <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${comment.authorId}`}>
                            <span className="font-semibold hover:underline">
                              {comment.authorName}
                            </span>
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
