const middlewares = require('../../middlewares');
const { Provider, Server } = require('backend-framework');

const { full, useMethod } = Provider.provider(__filename);

Server.get(`${full}/list`, [], useMethod('list'));

Server.post(`${full}/save`, [middlewares.notEmptyBody, middlewares.Authorized], useMethod('save'));
