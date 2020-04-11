const config = require('.');

// Classe responsável por gerenciar a conexão com o banco de dados (MongoDB)
class DatabaseMySQL {
	constructor() {
		this.config = config;
		this.connections = {};
		this.mysql = require('mysql');
		this.mysql.Promise = Promise;
	}

	close(name) {
		try {
			Object.keys(this.connections).map(connection => {
				if (!name || connection.toLowerCase() == name.toLowerCase()) {
					this.connections[connection].end(function (err) {
						if (err) {
							return console.log('Error ao fechar conexão com o banco de dados foi fechada [${property}] [${url}]:' + err.message);
						}
						console.log(
							`A conexão com o banco de dados foi fechada [${property}] [${url}]`,
						);
					});
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
		if (this.config.mysql) {
			Object.keys(this.config.mysql).map(property => {
				// Singleton
				if (this.connections[property]) return;

				const config = this.config.mysql[property];

				let url = config.host;
				if (config.port && config.database) {
					url = `${config.host}:${config.port}/${config.database}`
				}

				const connection = this.mysql.createConnection({
					host: config.host,
					port: config.port,
					user: config.username,
					password: config.password,
					database: config.database
				});

				connection.connect(function (err) {
					if (err) {
						return console.log('Error ao conectar conexão com o banco de dados foi fechada [${property}] [${url}]:' + err.message);
					}
					console.log(
						`Conectado com sucesso no banco de dados [${property}] [${url}]`,
					);
				});

				this.connections[property] = connection;

				return property;
			});
		}
	}
}

module.exports = new DatabaseMySQL();
