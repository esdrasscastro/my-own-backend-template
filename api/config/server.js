const restify = require('restify');

const server = restify.createServer();

server.use(
    restify.plugins.queryParser({
        mapParams: true
    })
);

server.use(
    restify.plugins.bodyParser({
        mapParams: true
    })
);

server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

server.use(restify.plugins.acceptParser(server.acceptable));

module.exports = server;
