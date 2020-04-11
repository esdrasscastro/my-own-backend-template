class Products {
    async list(req, res, next) {
        res.send(200, "List");
        return next();
    }

    async save(req, res, next) {
        res.send(200, "Save");
        return next();
    }
}

module.exports = Products;