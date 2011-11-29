var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Admin = new Schema({userid: String});

exports.Admin = Admin;
