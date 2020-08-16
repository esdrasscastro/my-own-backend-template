const middlewares = require("../../middlewares");

const { full, server, useMethod } = require("../../config/provider").provider(
  __filename
);

server.post(`${full}/v1/`, [middlewares.notEmptyBody], useMethod("auth"));
