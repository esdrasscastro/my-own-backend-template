const middlewares = require("../../middlewares");
const { Provider, Server } = require('backend-framework');

const { full, useMethod } = Provider.provider(__filename);

Server.post(`${full}/v1/`, [middlewares.notEmptyBody], useMethod("auth"));
