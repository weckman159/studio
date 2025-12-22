// postcss.config.js
// ПОЧЕМУ СОЗДАНО: Этот файл необходим для правильной работы Tailwind CSS v3 и Autoprefixer.
// Его отсутствие вызывало ошибку сборки.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
