const middlewares = require('../../middlewares');

const { full, server, useMethod } = require('../../config/provider').provider(__filename);


server.get(`${full}/list`, [], useMethod('list'));

server.post(`${full}/save`, [middlewares.notEmptyBody, middlewares.Authorized], useMethod('save'));
