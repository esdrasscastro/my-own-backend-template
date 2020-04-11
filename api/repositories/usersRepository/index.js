const usersModel = require('../models/usersModel');
const RepositoryError = require('../../Exceptions/RepositoryError');

/**
 * User Repository
 * @param {string} message
 */
class UsersRepository {
    constructor() {
        this.model = usersModel;
        this.context = "[UserRepository]";
    }

    async findById(id) {
        let rs = {};
        try {
            rs = await this.model.findById(id);
        } catch (error) {
            throw new RepositoryError(error.message, `${this.context} [findById]`);
        }

        return rs;
    }

    async findByEmail(username) {
        let rs = {};
        try {
            rs = await this.model.findOne({ email: username });
        } catch (error) {
            throw new RepositoryError(error.message, `${this.context} [findByEmail]`);
        }

        return rs;
    }
}

module.exports = new UsersRepository();