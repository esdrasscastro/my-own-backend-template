const ProductsRepository = require('../../repositories/productsRepository');

class Products {
    constructor() {
        this.context = "[Products]"
    }

    async list(req, res, next) {
        try {
            const products = await ProductsRepository.findAll();

            res.send(200, products);
            next();
        } catch (error) {
            res.send(500, error.message);
        }
    }

    async save(req, res, next) {
        try {
            const {_id: productId, ...product} = req.body;
            let products = {};
            const now = Date.now();

            if (productId) {
                product.updatedAt = now;
                products = await ProductsRepository.save(productId, product);
            } else {
                product.createdAt = now;
                product.updatedAt = now;
                products = await ProductsRepository.save(false, product);
            }

            console.log(products);

            res.send(200, "The product have been saved successfully");
            next();
        } catch (error) {
            res.send(500, error.message);
        }
    }
}

module.exports = Products;