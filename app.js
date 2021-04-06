const { Server, Provider, Redis } = require('backend-framework');
const { LogMessage } = require('oi-log-message');
//const {Authorized} = require('./api/middlewares');

// Disable debugs in production enviroment, just allowing errors logs
if (process.env.NODE_ENV === "prd") {
  console.debug = () => { };
  console.info = () => { };
  console.log = () => { };
}

// Allow only authenticated requests
// Server.use(Authorized);

Server.use((req, res, next) => {
  const Log = new LogMessage();
  Log.setRequest(req);
  req.log = Log;

  return next();
})

// Allow simple access to look running server
Server.get("/", (req, res, next) => {
  res.send(200, `${process.env.PROJECT_NAME} está rodando!`);
  return next();
});

Server.listen(process.env.API_PORT, () => {
  Redis.configure();

  Provider.importModuleRoutes();

  console.debug(
    `A aplicação [${process.env.PROJECT_NAME}] está rodando em modo [${process.env.NODE_ENV}] na porta [${process.env.API_PORT}].`
  );
});

Server.on("close", () => {
  console.debug("Aplicação:", "O Servidor do restify foi finalizado.");

  if (redis && redis.client && redis.client.close()) {
    console.debug("-", "Conexão com o redis foi finalizada.");
  }
});

// Finaliza a aplicação e todos os seus processos e conexões
process.on("SIGINT", () => {
  console.debug("");
  console.debug("-", "Aplicação encerrada.");
  process.exit();
});

module.exports = Server;
