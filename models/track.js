var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Track = new Schema({
  name: String,
  upvotes: Number,
  downvotes: Number
});

exports.Track = Track;
