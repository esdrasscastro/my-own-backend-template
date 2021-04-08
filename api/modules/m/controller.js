const fs = require('fs');
const { LogMessage } = require('oi-log-message');
const ObjectByteSize = require('../../util/ObjectByteSize');

module.exports = class ListController {
    constructor() {
        this.log = new LogMessage(this, __filename);
    }

    async listAll(req, res, send) {
        this.log.setRequest(req);
        const obj = {
            teste: 'object'
        }

        const { size } = new ObjectByteSize(obj);

        const buffer = new Buffer.from(JSON.stringify(obj), 'utf-8');

        fs.writeFileSync('./__files/teste.json', buffer);

        this.log.success('Sucesso na listagem dos dados');
        res.send(200);
    }
}