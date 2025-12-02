
const { Storage } = require('@google-cloud/storage');

// Укажите путь к вашему JSON-ключу
const storage = new Storage({
  keyFilename: './service-account.json',
  projectId: 'studio-7924146673-6e291', // Ваш ID проекта из логов
});

// Имя вашего бакета (взято из вашей ошибки)
const bucketName = 'studio-7924146673-6e291.appspot.com';

async function configureCors() {
  const bucket = storage.bucket(bucketName);

  await bucket.setCorsConfiguration([
    {
      maxAgeSeconds: 3600,
      method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
      origin: ['*'], // Разрешаем всем (или укажите конкретный домен Vercel)
      responseHeader: [
        'Content-Type',
        'Authorization',
        'Content-Length',
        'User-Agent',
        'x-goog-resumable',
      ],
    },
  ]);

  console.log(`CORS успешно настроен для бакета ${bucketName}`);
}

configureCors().catch(console.error);
