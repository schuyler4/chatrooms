var express = require('express');

module.exports = function(app) {
  var Chatroom = require('../data/chatroom.js');

  app.get('/', function(req, res) {
    res.render('home');
  });

  app.post('/', function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    Chatroom.create(joinCode, name);

    req.session.chatroom = joinCode;
    res.redirect('/' + joinCode)
  });

  app.post('/join', function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;
    var promise = Chatroom.join(joinCode, name);

    promise.then(function(chatroom) {
      if(chatroom) {
        res.redirect('/' + chatroom.joinCode);
      } else {
        res.redirect('/');
      }
    });

    if(join) {
      res.redirect('/' + joinCode);
    } else {
      res.redirect('/');
    }
  });

  app.get('/:joinCode', function(req, res) {
    var joinCode = req.params.joinCode;
    var admin;

    if (req.session.chatroom) {
      admin = true;
    } else {
      admin = false;
    }

    res.render('chatroom', {joinCode: joinCode, admin: admin});
  });

  app.post('/destroy', function(req, res) {
    console.log("destroying")
    var joinCode = req.params.joinCode;

    if(req.session.chatroom == joinCode) {
      Chatroom.destroy();
      var admin = req.session.chatroom;
      admin.destroy(joinCode);
    }

    res.redirect('/');
  });
}
