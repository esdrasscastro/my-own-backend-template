const config = require('./api/config');
const server = require('./api/config/server');
const {importModuleRoutes} = require('./api/config/provider');
const database = require('./api/config/database');
//const redis = require('./api/config/redis');

server.get('/', (req, res, next) => {
	console.log(`${process.env.PROJECT_NAME} está rodando!`);
	res.send(200, `${process.env.PROJECT_NAME} está rodando!`);
	return next();
});

server.listen(process.env.API_PORT, () => {
  database.connect();
  //redis.configure();
  

	importModuleRoutes();

	console.log(`A aplicação [${process.env.PROJECT_NAME}] está rodando em modo [${process.env.NODE_ENV}] na porta [${process.env.API_PORT}].`);
});

server.on('close', () => {
	console.log('Aplicação:', 'O Servidor do restify foi finalizado.');

	// finaliza a conexão com o banco sempre que o restify for finalizado
  if(database.close()) {
    console.log('-', 'Conexão com o banco de dados foi finalizada.');
  }
  
  // if(redis && redis.client && redis.client.close()) {
  //   console.log('-', 'Conexão com o redis foi finalizada.');
  // }
});

// Finaliza a aplicação e todos os seus processos e conexões
process.on('SIGINT', () => {
  console.log('');
  console.log('Aplicação encerrada.');
  process.exit();
});

module.exports = server;
