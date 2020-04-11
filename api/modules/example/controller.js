class Example {
    async example(req, res, next) {
        res.send(200, "Teste");
        return next();
    }
}

module.exports = Example;