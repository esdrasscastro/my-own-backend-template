const dotenv = require('dotenv');
const envConfig = dotenv.config();

if (envConfig.error) {
    throw envConfig.error;
}

// carrega o arquivo de configuração conforme a variavel NODE_ENV.
const cwd = process.cwd();
const env = process.env.NODE_ENV || 'development';

const config = require(`${cwd}/api/config/env/${env}`);

// injeta automaticamente a propriedade app.env no json de configuração
if (config.app) config.app.env = env;

module.exports = config;
