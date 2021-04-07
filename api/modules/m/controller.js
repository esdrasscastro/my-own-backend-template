const { LogMessage } = require('oi-log-message');

module.exports = class ListController {
    constructor() {
        this.log = new LogMessage(this, __filename);
    }

    async listAll(req, res, send) {
        this.log.setRequest(req);
        this.log.success('Sucesso na listagem dos dados');
        res.send(200);
    }
}