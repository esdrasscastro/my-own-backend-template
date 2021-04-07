const middlewares = require('../../middlewares');
const { Provider, Server } = require('backend-framework');

const { full, useMethod } = Provider.provider(__filename);

Server.get(`${full}/list/all`, useMethod('listAll'));
