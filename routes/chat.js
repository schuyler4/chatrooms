var express = require('express');

module.exports = function(app, io) {
  var Chatroom = require('../data/chatroom.js');

  io.on("connection", function(socket) {

    socket.on("create", function(joinCode) {
      console.log("created " + joinCode);
      socket.join(joinCode);
    });

    socket.on("destroy", function(joinCode) {
      console.log("destroying " + joinCode);
      socket.broadcast.to(joinCode).emit("finish destroy")
      socket.leave(joinCode);
    });

    socket.on("join", function(data) {
      console.log("hit the join call")
      socket.join(data.joinCode);
      socket.in(data.joinCode).emit("finish join", data.name);
      //socket.broadcast.to(data.joinCode).emit(data.name);
    });

    socket.on("leave", function(data) {
      socket.leave(data.code);
      console.log(data.name + " left " + data.code);
    });

    socket.on("message", function(message) {
      socket.to(message.room).emit("message", message.message);
      console.log("emiting message to " + message.room);
    });

  });

  app.get('/', function(req, res) {
    res.render('home');
  });

  app.post('/', function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    Chatroom.create(joinCode, name);

    req.session.chatroom = joinCode;
    io.sockets.emit("create", joinCode);
    console.log("event emited");
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
            noRepeat = false;
          }
        }

        if(noRepeat) {
          Chatroom.addUser(chatroom.id, name);

          req.session.chatName = name;
          req.session.joinCode = joinCode;

          var data = {
            name: name,
            joinCode: joinCode
          }

          io.sockets.emit("join", data);
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
    var joinCode = req.session.joinCode;
    var name = req.session.chatName;

    Chatroom.leave(joinCode, name);

    var leaveData = {
      code: joinCode,
      name: name
    }

    io.sockets.emit("leave", leaveData);
    res.redirect('/');
  });

  app.get('/:joinCode', function(req, res) {
    var joinCode = req.params.joinCode;
    var admin;
    console.log(req.session.chatroom);
    console.log(req.session.chatName);
    console.log(req.session.joinCode);

    if (req.session.chatroom) {
      admin = true;
    } else {
      admin = false;
    }

    res.render('chatroom', {joinCode: joinCode, admin: admin});
  });

  app.post('/destroy', function(req, res) {
    var joinCode = req.session.chatroom;

    if(joinCode) {
      io.sockets.emit("destroy", joinCode);
      Chatroom.destroy(joinCode)
      req.session.chatroom = null;
    }

    res.redirect('/');
  });
}
