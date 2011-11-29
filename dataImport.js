var fs = require('fs');
var DATA_FILE = './data.js';
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/prab');
var Dj = mongoose.model('Dj', require('./models/dj').Dj);
var Artist = mongoose.model('Artist', require('./models/artist').Artist);

var data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
if(data){
  for( a in data.admins){
    Dj.update({userid: data.admins[a]}, {admin: true}, function(err, docs){
      console.log(docs);
    });
  }
  for(var l in data.links){

    Artist.update({ name: new RegExp(RegExp.escape(l), 'i')},{links: data.links[l]}, function(err, docs){
      if(err){
        console.log(err);
      }
      if(docs){
        console.log(docs);
      }
    });
  }
}



