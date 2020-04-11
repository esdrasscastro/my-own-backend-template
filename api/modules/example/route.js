const middlewares = require('../../middlewares');

const { full, server, useMethod } = require('../../config/provider').provider(__filename);

server.get(`${full}/example`, [], useMethod('example'));
