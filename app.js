if(process.env.NODE_ENV != 'production') {
  require('dotenv').config()
}

var express = require('express');
var app = express();

var pug = require('pug');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var session = require('express-session')
var redis = require('redis');
var redisStore = require('connect-redis')(session);
var client = redis.createClient(6379, 'localhost');

app.set('view engine', 'pug');

mongoose.connect(process.env.MONGO_URL);
mongoose.promise = require('bluebird');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  260}),
}));

require('./routes/chat')(app);

app.listen(process.env.PORT || 3000);
console.log("listeing on 3000");
