const productsModel = require('../models/productsModel');
const RepositoryError = require('../../Exceptions/RepositoryError');

/**
 * User Repository
 * @param {string} message
 */
class UsersRepository {
    constructor() {
        this.model = productsModel;
        this.context = "[ProductsRepository]";
    }

    async findAll() {
        let rs = {};
        try {
            rs = await this.model.find({});
        } catch (error) {
            throw new RepositoryError(error.message, `${this.context} [findAll]`);
        }

        return rs;
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

    async findByName(productName) {
        let rs = {};
        try {
            rs = await this.model.findOne({ name: productName });
        } catch (error) {
            throw new RepositoryError(error.message, `${this.context} [findByName]`);
        }

        return rs;
    }

    async save(id, product) {
        let rs = {};
        try {
            if (id) {
                rs = await this.model.updateOne({ id }, product);
            } else {
                rs = await this.model.insertMany(product);
            }
        } catch (error) {
            throw new RepositoryError(error.message, `${this.context} [save]`);
        }

        return rs;
    }
}

module.exports = new UsersRepository();