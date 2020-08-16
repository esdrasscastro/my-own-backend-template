const config = require(".");

// Classe responsável por gerenciar a conexão com o banco de dados (MongoDB)
class Database {
  constructor() {
    this.config = config;
    this.connections = {};
    this.mongoose = require("mongoose");
    this.mongoose.Promise = Promise;

    // Default config for database
    this.database = [
      {
        host: process.env.MONGODB_DATABASE_HOST,
        port: process.env.MONGODB_DATABASE_PORT,
        database: process.env.MONGODB_DATABASE_DBNAME,
        options: {
          useNewUrlParser: true,
          autoIndex: false, // Don't build indexes
          poolSize: 10, // Maintain up to 10 socket connections
          // If not connected, return errors immediately rather than waiting for reconnect
          bufferMaxEntries: 0,
          useUnifiedTopology: true,
        },
      },
    ];
  }

  setDatabases(database) {
    this.database = database;
  }

  close(name) {
    try {
      if (this.connections.length) {
        if (name && this.connections[name]) {
          this.disconnect(name);
          console.log(`Conexão com banco de dados [${name}] foi encerrada.`);
        } else {
          this.connections.map((connection, name) => {
            this.disconnect(name);
            console.log(`Conexão com banco de dados [${name}] foi encerrada.`);
          });
        }
      }

      return true;
    } catch (error) {
      console.error(
        `Erro ao tentar fechar a conexão com banco de dados [${name}].`,
        error
      );
      return false;
    }
  }

  disconnect(name) {
    try {
      this.connections[name].close();
      delete this.connections[name];

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  connect() {
    const databases = this.database;

    if (databases && databases.length) {
      databases.map((base) => {
        this.initDatabase(base);
      });
    }
  }

  showConnections() {
    const keys = Object.keys(this.connections);

    if (keys.length) {
      if (keys.length === 1) {
        console.debug(`Existe 1 conexão ativa com o banco de dados`);
      } else {
        console.debug(
          `Existem ${keys.length} conexões ativas com o banco de dados`
        );
      }

      keys.map((name) => {
        console.debug(`- ${this.connections[name].id}: ${name}`);
      });
    } else {
      console.debug("Não existem conexões com bancos de dados.");
    }
  }

  initDatabase(base) {
    if (this.connections[base.database]) return;

    let url = base.host;

    if (base.port && base.database) {
      url = `${base.host}:${base.port}/${base.database}`;
    }

    const connection = this.mongoose.createConnection(url, base.options);

    connection.on("connecting", () => {
      console.debug(
        `Tentando conectar no banco de dados [${base.database}] [${url}]...`
      );
    });

    connection.on("connected", () => {
      console.debug(
        `Conectado com sucesso no banco de dados [${base.database}] [${url}]`
      );
    });

    connection.on("close", () => {
      console.debug(
        `A conexão com o banco de dados foi fechada [${base.database}] [${url}]`
      );
    });

    connection.on("error", (erro) => {
      console.error(
        `Erro ao conectar com banco de dados [${base.database}] [${url}]`,
        erro
      );
    });

    this.connections[base.database] = connection;

    return base;
  }
}

module.exports = new Database();
