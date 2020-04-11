const RedisClient = require('ioredis');
const config = require('.');

class Redis {
    constructor() {
        this.redisConfig = config.redis;
        this.client = null;
        this.connected = false;
    }

    configure() {
        const env = JSON.stringify(process.env);
        if (env.match(/REDIS_/) !== null) {
            const source = `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

            console.log(`Tentando conectar no REDIS [${source}]`);

            this.client = new RedisClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASS,
                ttl: process.env.REDIS_TTL,
            });

            this.client.on('end', () => {
                console.log(`A conexão com o REDIS foi finalizada. [${source}]`);
                this.connected = false;
            });

            this.client.on('connect', () => {
                console.log(`A conexão com o REDIS foi estabelecida. [${source}]`);
                this.connected = true;
            });

            this.client.on('error', (err) => {
                console.log(`Erro de conexão com o REDIS. [${source}] [${err}]`);
                this.connected = true;
            });

            return this;
        }

        console.log('Nenhuma configuração de REDIS encontrada');
        return null;
    }

    close() {
        if (this.client) return this.client.quit();
        return false;
    }

    delPattern(pattern) {
        return this.client.keys(pattern).then((keys) => {
            // Use pipeline instead of sending
            // one command each time to improve the
            // performance.
            const pipeline = this.client.pipeline();
            keys.forEach(function (key) {
                pipeline.del(key);
            });
            return pipeline.exec();
        });
    }

    del(key) {
        if (this.redisConfig && this.redisConfig.mock) {
            delete this.redisConfig.mock[key];
            return Promise.resolve(this.redisConfig.mock);
        }

        return new Promise((resolve, reject) => {
            this.client.del(key, (err, data) => {
                if (!err) resolve(data);
                else reject(err);
            });
        });
    }

    set(key, object, ttl = null) {
        if (this.redisConfig && this.redisConfig.mock) {
            this.redisConfig.mock[key] = object;
            return Promise.resolve(this.redisConfig.mock);
        }

        return new Promise((resolve, reject) => {
            const input = JSON.stringify(object);
            // Salva o valor no Redis com o TTL passado,
            // ou o definido no arquivo de configuração,
            // ou o padrão de 24 horas
            this.client.set(key, input, 'EX', ttl || process.env.REDIS_TTL, (err, data) => {
                if (!err) {
                    resolve(data);
                } else {
                    err.app_message = 'Não foi possível salvar os dados no Redis';
                    err.code = 'redis_error';
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                }
            });
        });
    }

    get(key) {
        if (this.redisConfig && this.redisConfig.mock) {
            if (this.redisConfig.mock[key]) return Promise.resolve(this.redisConfig.mock[key]);
            const err = new Error('Nenhum registro encontrado para este token');
            err.code = 'empty_session';
            return Promise.reject(err);
        }

        return new Promise((resolve, reject) => {
            this.client.get(key, (err, data) => {
                if (!err) {
                    if (data) {
                        try {
                            // Tenta fazer o parse do JSON
                            const output = JSON.parse(data);
                            resolve(output);
                        } catch (err) {
                            // Rejeita se não conseguir realizar o parse
                            err.app_message = 'Erro de formatação do JSON';
                            err.code = 'format_error';
                            this.log.error('Erro no framework - Redis', err);
                            reject(err);
                        }
                    } else {
                        // Rejeita se a chave não estiver no Redis
                        err = new Error('Nenhum registro encontrado para este token');
                        err.code = 'empty_session';
                        reject(err);
                    }
                } else {
                    // Problema no acesso ao Redis
                    err.app_message = 'Erro ao ler dados no Redis';
                    err.code = 'redis_error';
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                }
            });
        });
    }

    update(key, object, ttl) {
        return new Promise((resolve, reject) => {
            // Recebe o objeto salvo no Redis

            this.get(key)
                .then((data) => {
                    object = Object.assign({}, data, object);
                    return this.set(key, object, ttl);
                })
                .then((data) => {
                    // Salva o objeto no Redis
                    resolve(data);
                })
                .catch((err) => {
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                });
        });
    }

    getTtl(key, minTtl = null) {
        return new Promise((resolve, reject) => {
            this.client.ttl(key)
                .then(ttl => {
                    if (minTtl && ttl < minTtl) resolve();
                    else resolve(ttl);
                })
                .catch((err) => {
                    this.log.error('Erro no framework - Redis', err);
                    reject(err);
                });
        });
    }
}

module.exports = new Redis();