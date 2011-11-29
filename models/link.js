var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Link = new Schema({
  link_type: String,
  value: String
});

exports.Link = Link;
