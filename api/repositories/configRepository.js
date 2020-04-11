const configModel = require('./models/configModel');

class ConfigRepository {
    constructor() {
        this.model = configModel;
    }

    async consultar() {
        let rs = {};
        try {
            rs = await this.model.find({});
        } catch (error) {
            console.log(`${module} - ${error}`);
        }
        return rs;
    }
}

module.exports = ConfigRepository;