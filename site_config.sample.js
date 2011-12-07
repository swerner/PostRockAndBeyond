var settings = {
  'bot':{
    'auth':'AUTH KEY HERE', //Get these values from Alain Gilbert's bookmark at:
    'userid':'BOTS USER ID', // http://alaingilbert.github.com/Turntable-API/bookmarklet.html
    'room':'ROOM ID',
  },
  /* Optional, uncomment to have bot automatically post statuses to twitter */
  // 'twitter':{
  //   'consumerKey':'TWITTER CONSUMER KEY',
  //   'consumerSecret':'TWITTER CONSUMER SECRET',
  //   'accessToken':'TWITTER ACCESS TOKEN',
  //   'accessTokenSecret':'TWITTER ACCESS TOKEN SECRET'
  // },

  /* Optional, uncomment to use airbrake for error reporting */
  // 'airbrake':{
  //   'apikey':'airbrake api key'
  // },
  'site':{
    'title':'WEBSITE TITLE', //Title of the bot
    'url':'http://example.com', //The url of your bot's website
    'room_link':'http://example.com', //The link to the turntable.fm room for the bot
    'dburl':'' //Url to connect to your database
  }
};
    
if(process.env.NODE_ENV == 'production'){
  settings.port = 80;
}

module.exports = settings;
