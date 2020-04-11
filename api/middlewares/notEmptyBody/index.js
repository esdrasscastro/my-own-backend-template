module.exports = (req, res, next) => {
    if(!req.body) {
        // 428 - Precondition Required
        res.send(428, 'Para este tipo de requisição é obrigatório passar um corpo!');
        return next(false);
    }

    return next();
}