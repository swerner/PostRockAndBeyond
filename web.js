var express = require('express');
var TrackProvider = require('./trackprovider-mongodb').TrackProvider;

var app = express.createServer(express.logger());
var trackProvider = new TrackProvider('localhost', 27017);

app.configure(function(){
  app.set('views', __dirname+'/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname +'/public'));
});

app.get('/', function(request, response){
  trackProvider.findAll(function(error, tracks){
    response.render('index.jade', { locals: {
      title: "Post Rock And Beyond",
      tracks:tracks.reverse()}
  });
  });
});

app.get('/artists/:name', function(request, response){
  trackProvider.findByArtist(request.params.name, function(error, tracks){
    response.render("artist_show.jade", { locals: {
      title: "Post Rock And Beyond",
      artists: tracks
    }
    });
  });
});
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
