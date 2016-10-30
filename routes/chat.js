var express = require('express');

module.exports = function(app, io) {
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
    var promise = Chatroom.join(joinCode);

    promise.then(function(chatroom) {
      if(chatroom) {
        var noRepeat = true;

        for(var i = 0; i < chatroom.users.length; i++) {
          if(chatroom.users[i].name == name) {
            console.log("the name was repeated");
            noRepeat = false;
          }
        }

        if(noRepeat) {
          Chatroom.addUser(chatroom.id, name);

          req.session.chatName = name;
          req.session.joinCode = joinCode;

          socket.on('connection', function(socket) {
            console.log("emiting join");
            io.emit('user join', name)
          });

          res.redirect('/' + chatroom.joinCode);
        } else {
          res.redirect('/');
        }

      } else {
        res.redirect('/');
      }
    });

  });

  app.post('/leave', function(req, res) {
    console.log("the chat name leaveing is " + req.session.chatName);
    console.log("the chat room they are leaving is " + req.session.joinCode);

    var joinCode = req.session.joinCode;
    var name = req.session.chatName;

    Chatroom.leave(joinCode, name);
    res.redirect('/');
  });

  app.get('/:joinCode', function(req, res) {

    console.log("the chat room is " + req.session.chatroom);
    console.log("the chat name is " + req.session.chatName);

    var joinCode = req.params.joinCode;
    var admin;

    if (req.session.chatroom) {
      admin = true;
    } else {
      admin = false;
    }

    res.render('chatroom', {joinCode: joinCode, admin: admin});
  });

  io.on('connection', function(socket) {

  });

  app.post('/destroy', function(req, res) {
    var joinCode = req.session.chatroom;

    if(joinCode) {
      Chatroom.destroy(joinCode)
      req.session.chatroom = null;
    }

    res.redirect('/');
  });
}
