import { defineConfig } from "vite";

export default defineConfig({
    base: "/",
    plugins: [
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            },
        },
    ],
    build: {
        rollupOptions: {
            input: {
                main: './index.html', // Главная страница
                register: './register.html', // Страница регистрации
                mainPage: './main.html', // Дополнительная страница
            },
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]', // Кастомная структура ассетов
                chunkFileNames: 'js/[name]-[hash:8].js', // Кастомные имена файлов с js
                entryFileNames: 'js/[name]-[hash:8].js', // Главные точки входа
            }
        }
    },
    publicDir: "assets",
});