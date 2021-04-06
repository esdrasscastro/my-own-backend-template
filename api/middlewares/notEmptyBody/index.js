const PreconditionError = require('../../Exceptions/PreconditionError');

module.exports = (req, res, next) => {
    try {
        const obj = req.body;

        if (!obj || (Object.keys(obj).length === 0 && obj.constructor === Object) || Object.keys(obj).filter(k => !!k).length === 0) {
            throw new PreconditionError("You must need to send a body in this request.", "[MiddleWare] [notEmptyBody]");
        }

        return next();
    } catch (error) {
        // 428 - Precondition Required
        res.send(428, error);
    }
}