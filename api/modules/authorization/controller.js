const btoa = require('btoa');
const crypto = require('crypto');

const redis = require('../../config/redis');
const UsersRepository = require('../../repositories/usersRepository');

const AuthorizationError = require('../../Exceptions/AuthorizationError');

class Authorization {
    constructor () {
        this.context = '[Authorization]';
    }

    async auth (req, res, next) {
        try {
            // const userId = req.headers['x-uuid'];
            // const {username, password} = req.body;
            const { username, password } = req.body;

            const user = await UsersRepository.findByEmail(username);

            if (!user) throw new AuthorizationError('User not found', `${this.context} [Auth] [User]`);

            
            
            const key = crypto.pbkdf2Sync(process.env.CLIENT_SECRET, `${password}:${user.email}`, 100000, 512, 'sha512');
            
            if (key.toString('hex') !== user.password) throw new AuthorizationError('Invalid password taken', `${this.context} [Auth] [User]`);

            const token = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}:${user.id}:${user.email}`);

            // TTL is passed in seconds
            redis.set(`onegraph:${user.id}:token`, token, process.env.NODE_ENV === 'dev' ? 60 : null);

            res.send(200, { session_key: token });
        } catch (error) {
            if (!(error instanceof AuthorizationError)) console.error(this.context, '[Auth]', '[Error]', error.message);

            res.send(403, 'Invalid access credentials');
            next();
        }
    }
}

module.exports = Authorization;
