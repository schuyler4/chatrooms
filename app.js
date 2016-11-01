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

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: new redisStore({ host: 'localhost', port: 6379,client:client,ttl:260}),
  cookie: { secure: false }
}));
app.use(flash());

require('./routes/chat')(app, io);

http.listen(process.env.PORT || 3000);
console.log("listeing on 3000");
