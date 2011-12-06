var sys = require('sys');
var twitter = require("twitter");
var settings = require('./site_config.js');
var twit = new twitter({
  consumer_key: settings.twitter.consumerKey,
  consumer_secret: settings.twitter.consumerSecret,
  access_token_key: settings.twitter.accessToken,
  access_token_secret: settings.twitter.accessTokenSecret
});

exports.twitter = twit;
