const { Redis } = require('backend-framework');
const AuthorizationError = require('../../Exceptions/AuthorizationError');

module.exports = async (req, res, next) => {
    const redis = Redis;
    const context = "[Middleware] [Authorize]";

    try {
        if (req.url.match(/authorization\/v1/)) {
            console.debug(context, "[NoAuthURL]", true);
            return next();
        }

        const { authorization } = req.headers;
        const userId = req.headers['x-uuid'];

        if (!userId) throw new AuthorizationError('User id is needed to authenticate user', context);

        if (!authorization) throw new AuthorizationError('You must send an Authorization header', context);

        const [authType, token] = authorization.trim().split(' ');
        if (authType !== 'Bearer') throw new AuthorizationError('Expected a Bearer token', context);

        const redisToken = await redis
            .get(`onegraph:${userId}:token`)
            .catch((error) => {
                throw new AuthorizationError(error.message, "".concat(context, " [Redis]"));
            });

        if (token === redisToken) {
            next();
        } else {
            throw new AuthorizationError("Invalid session token", context);
        }
    } catch (error) {
        res.send(403, "Permission Denied");
    }
};
