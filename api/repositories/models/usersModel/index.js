const database = require("backend-framework").MongoDB;
const mongoose = require("mongoose");

const connection = database.connections.onegraph || mongoose;

const UsersSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    userType: String,
    createAt: Date,
    updateAt: Date,
  },
  {
    collection: "users",
  }
);

module.exports = connection.model("usersModel", UsersSchema);
