const server = require('./api/config/server');
const {importModuleRoutes} = require('./api/config/provider');
const database = require('./api/config/database');
const redis = require('./api/config/redis');
const {Authorized} = require('./api/middlewares');

// Disable debugs in production enviroment, just allowing errors logs
if (process.env.NODE_ENV === 'prd') {
  console.debug = () => {};
  console.info = () => {};
  console.log = () => {};
}

// Allow only authenticated requests
// server.use(Authorized);

// Allow simple access to look running server
server.get('/', (req, res, next) => {
	res.send(200, `${process.env.PROJECT_NAME} está rodando!`);
	return next();
});

server.listen(process.env.API_PORT, () => {
  database.connect();
  redis.configure();

	importModuleRoutes();

	console.debug(`A aplicação [${process.env.PROJECT_NAME}] está rodando em modo [${process.env.NODE_ENV}] na porta [${process.env.API_PORT}].`);
});

server.on('close', () => {
	console.debug('Aplicação:', 'O Servidor do restify foi finalizado.');

	// finaliza a conexão com o banco sempre que o restify for finalizado
  if(database.close()) {
    console.debug('-', 'Conexão com o banco de dados foi finalizada.');
  }
  
  if(redis && redis.client && redis.client.close()) {
     console.debug('-', 'Conexão com o redis foi finalizada.');
  }
});

// Finaliza a aplicação e todos os seus processos e conexões
process.on('SIGINT', () => {
  console.debug('');
  console.debug('Aplicação encerrada.');
  process.exit();
});

module.exports = server;
