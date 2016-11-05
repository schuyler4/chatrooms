/* this is the basic app file for configering all the
modules */
if(process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

var express = require('express');
var app = express();
var http = require('http').Server(app);

var pug = require('pug');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session')
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var MongoStore = require('connect-mongo')(session);
var client = redis.createClient(6379, 'localhost');
var sio = require("socket.io");
var io = sio(http);
var flash = require("connect-flash");

app.set('view engine', 'pug');
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URL);
mongoose.Promise = require('bluebird');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* use mongo session to save session data in
the same database as the rest of the data*/
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    url: process.env.MONGO_URL,
    ttl: 14 * 24 * 60 * 60
  })
}));
app.use(flash());

app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

/* add all the routes */
require('./routes/chat')(app, io);

app.get('*', function(req, res){
  console.log('404ing');
  res.render('404');
});

/* need to use http for socket.io to work*/
var server = http.listen(process.env.PORT || 3000);
console.log("listeing on 3000");
module.exports = server;
