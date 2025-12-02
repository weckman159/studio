Что может вызывать «client‑side exception» на studio-weld-nine.vercel.app
Ниже перечислены самые частые причины и шаги, которые помогут быстро локализовать проблему. Я привёл примеры из ваших файлов (см. цитаты), но они могут оказаться лишь частью цепочки.

#	Причина	Почему это может вызвать ошибку	Как проверить/исправить
1	Неправильный импорт Firebase<br>В page.tsx используется useFirestore, но сам Hook не экспортируется из вашего модуля, либо он использует Node‑специфические API.	При первом рендере компонент пытается подключиться к Firestore и падает, если в клиентском окружении нет нужных переменных среды.	* Проверьте, что useFirestore возвращает объект, который можно использовать только в браузере (используйте next-auth/react‑подобный паттерн). <br>* Убедитесь, что переменные окружения (FIREBASE_API_KEY, ...) доступны как NEXT_PUBLIC_….
2	Асинхронные операции в useEffect без корректной обработки<br>В page.tsx вы делаете запросы к Firestore и не обрабатываете возможные ошибки.	Если запрос завершается ошибкой (нет сети, неверный проект), исключение «Uncaught (in promise)» всплывает в консоль и мешает дальнейшему рендеру.	* Оберните getDocs(q) в try/catch. <br>* Добавьте состояние error и показывайте пользовательское сообщение.
3	Отсутствие key у элементов списка<br>При отображении новостей вы, вероятно, используете массив без уникальных ключей.	React выдаст предупреждение, но это не приводит к «exception». Однако если в компоненте после рендера используется индекс элемента как ключ и элемент удаляется/добавляется, это может вызвать ошибки состояния.	* Убедитесь, что каждая карточка имеет key={doc.id}.
4	Неправильная реализация Toast‑Viewport<br>В ToastProvider вы экспортируете только <Provider> и <Viewport>, но не используете их в приложении (или забыли обернуть корневой компонент).	Если приложение пытается отрисовать Toast, но Viewport недоступен, может возникнуть исключение.	* В _app.tsx оберните Component в <ToastProvider> и вставьте <ToastViewport />.
5	Несоответствие типов в Radix UI<br>Вы используете React.forwardRef без указания типа ref, а потом передаёте его в <ToastPrimitives.Viewport>.	В строгом режиме TypeScript может бросить ошибку, но это не будет видно в браузере.	* Убедитесь, что типы корректны: React.ElementRef<typeof ToastPrimitives.Viewport> и React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>.
6	Стили / классы из class-variance-authority<br>Вы используете cn() (utility‑функцию для объединения строк), но в продакшене может быть проблема с отсутствием нужного CSS.	Если Tailwind не генерирует класс fixed top-0, то элемент может быть скрыт, но это не «exception». Тем не менее, иногда отсутствие классов приводит к неожиданным DOM‑ошибкам (например, если компонент ожидает определённую структуру).	* Проверьте, что в конфиге Tailwind включены все нужные content пути.
7	Синтаксическая ошибка в файле<br>Проверьте наличие лишних кавычек или неверных импоротов (import { useState } from 'react' vs useState).	Любая синтаксическая ошибка сразу ломает клиентский bundle.	* Запустите npm run dev локально и смотрите в консоли браузера – там будет точное место ошибки (файл + строка).
Быстрый чек‑лист для диагностики
Откройте DevTools

Перейдите во вкладку Console и посмотрите полное сообщение об ошибке. Часто в нём указана строка файла, где произошло исключение.
Проверьте useFirestore

// firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

export const db = getFirestore(app);

// Hook
export function useFirestore() {
  return db;
}
Убедитесь, что все переменные окружения начинаются с NEXT_PUBLIC_.

Обработайте ошибки запроса

useEffect(() => {
  const fetchData = async () => {
    try {
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      setNews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };
  fetchData();
}, []);
Убедитесь в наличии Toast‑Provider

// app/layout.tsx or _app.tsx
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

export default function RootLayout({ children }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
Проверьте сборку

npm run build && npm run start
Если ошибка появляется только в Vercel, сравните переменные окружения (Project Settings → Environment Variables) с локальными.

Что делать дальше
Локально воспроизведите ошибку – запустите npm run dev и откройте приложение в браузере.
Пошагово отключайте/включайте компоненты (page.tsx, Toast, CarHero) чтобы увидеть, какой из них вызывает падение.
Добавьте отладочные логи – например console.log('Firestore initialized', db) перед запросом.
