const { server, useMethod } = require('../../config/provider').provider(__filename);


server.get(`/listar/projetos`, [], useMethod('projectsList'));
server.get(`/listar/ics`, [], useMethod('icsListAll'));
server.post(`/listar/ics`, [], useMethod('icsList'));
