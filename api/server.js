const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("api/db.json"); // Обрати внимание: путь к db.json теперь 'api/db.json'
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser); // Для обработки POST/PUT/PATCH запросов

// Настройка CORS (очень важно, чтобы твой React-фронтенд мог обращаться к API)
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Разрешает запросы с любого домена. В продакшене лучше указать домен твоего фронтенда.
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // Отвечаем на предварительные OPTIONS запросы
  }
  next();
});

server.use("/api", router); // Указываем, что API будет доступен по пути /api/

// Экспортируем сервер для Vercel
module.exports = server;
