const database = require('../../../config/database');
const mongoose = require('mongoose');

const connection = database.connections.onegraph || mongoose;

const ProductsSchema = mongoose.Schema({
    name : String,
    description : String,
    visibility : Boolean,
    permission : Array,
    properties : Object,
    new : Boolean,
    createdAt : Date,
    updatedAt : Date
}, {
    collection: 'products'
});
 
module.exports = connection.model('productsModel', ProductsSchema);