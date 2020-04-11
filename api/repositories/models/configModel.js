
const database = require('../../config/database');
const mongoose = require('mongoose');

const connection = database.connections.accenture || mongoose;

const Config = mongoose.Schema({
    appName: { type: String, required: true }
}, {
    collection: 'config'
});
 
module.exports = connection.model('configModel', Config);