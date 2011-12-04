var sys = require('sys');
var twitter = require("twitter");
var twit = new twitter({
  consumer_key: process.env.PRABTCONSKEY,
  consumer_secret: process.env.PRABTCONSSEC,
  access_token_key: process.env.PRABACCTOK,
  access_token_secret: process.env.PRABACCTOKSEC
});

exports.twitter = twit;
