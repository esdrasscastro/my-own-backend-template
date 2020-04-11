const config = require('.');

// Classe responsável por gerenciar a conexão com o banco de dados (MongoDB)
class Database {
	constructor() {
		this.config = config;
		this.connections = {};
		this.mongoose = require('mongoose');
		this.mongoose.Promise = Promise;
	}

	close(name) {
		try {
			Object.keys(this.connections).map(connection => {
				if (!name || connection.toLowerCase() == name.toLowerCase()) {
					this.connections[connection].close();
					delete this.connections[connection];
				}

				return connection;
			});

			return true;
		} catch (error) {
			return false;
		}
	}

	connect() {
		const databases = JSON.parse(process.env.DATABASES_MONGODB);

		if (databases && databases.length) {

			databases.map(base => {
				if (this.connections[base.database]) return;

				let url = base.host;
				
				if(base.port && base.database) {
					url = `${base.host}:${base.port}/${base.database}`;
				}

				const connection = this.mongoose.createConnection(url, base.options);

				connection.on('connecting', () => {
					console.log(
						`Tentando conectar no banco de dados [${base.database}] [${url}]...`,
					);
				});

				connection.on('connected', () => {
					console.log(
						`Conectado com sucesso no banco de dados [${base.database}] [${url}]`,
					);
				});

				connection.on('close', () => {
					console.log(
						`A conexão com o banco de dados foi fechada [${base.database}] [${url}]`,
					);
				});

				connection.on('error', erro => {
					console.error(
						`Erro ao conectar com banco de dados [${base.database}] [${url}]`,
						erro,
					);
				});

				this.connections[base.name] = connection;

				return base;
			});
		}
	}
}

module.exports = new Database();
