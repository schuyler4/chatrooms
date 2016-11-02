var express = require('express');

/*this file is for all the routes and server sockets in the chatroom and
 creating it*/

module.exports = function(app, io) {
  var Chatroom = require('../data/chatroom.js');

  /*this is where the websockets are */
  io.on("connection", function(socket) {

    /* to join the correct room when users join it */
    socket.on("create", function(joinCode) {
      socket.join(joinCode);
      console.log("created " + joinCode);
    });

    /* for when the room is destroyed by its creator so that people in it are
    forced to leave*/
    socket.on("destroy", function(joinCode) {
      console.log("destroying " + joinCode);
      socket.broadcast.to(joinCode).emit("finish destroy");
      socket.in(joinCode).emit("finish destroy", joinCode);
      console.log("emited finish destroy");
      socket.leave(joinCode);
    });

    /* for when someone joins an already created chatroom */
    socket.on("join", function(data) {
      console.log("hit the join call")
      socket.join(data.joinCode);
      socket.in(data.joinCode).emit("finish join", data.name);
      socket.broadcast.to(data.joinCode).emit(data.name);
    });

    /*for when someone leaves a chatroom that will contiue running */
    socket.on("leave", function(data) {
      socket.leave(data.code);
      console.log(data.name + " left " + data.code);
    });

    /* for the people in the chatroom to chat */
    socket.on("message", function(message) {
      console.log(message)
      Chatroom.message(message.message, message.room);

      socket.in(message.room).emit("finish message", message.message);
      socket.in(message.room).emit("finish message", message.message);
      socket.broadcast.to(message.room).emit("finish message", message.message);
      console.log("emiting message to " + message.room);
    });

  });

  /* get the home and render flash messages */
  app.get('/', function(req, res) {
    res.render('home',{
      messages: req.flash('Err')
    });
  });

  /*create a chatroom */
  app.post('/', function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    var promise = Chatroom.findRooms();
    promise.then(function(chatrooms) {
      /*loop through the running chatrooms and make sure there is no name
      repeats probaly better writen as middle ware */
      var noRepeat = true;

      for(var i = 0; i < chatrooms.length; i++) {
        if(chatrooms[i].joinCode == joinCode) {
          noRepeat = false
        }
      }

      if(noRepeat) {
        Chatroom.create(joinCode, name);
        req.session.chatroom = joinCode;
        io.sockets.emit("create", joinCode);
        res.redirect('/' + joinCode)
      } else {
        req.flash(
          'Err', 'there is already a chatroom with that join code in session'
        );

        res.redirect('/');
      }

    });

  });

  /* for joining a chatroom that is already in existence */
  app.post('/join', function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;
    var promise = Chatroom.find(joinCode);

    /*check to make sure that there are no name repeats */
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
          req.flash(
            "Err","there is already a user with you name in the chat room"
          );
          res.redirect('/');
        }

      } else {
        res.redirect('/');
      }
    });

  });

  /* for leaving the chatroom */
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

  /*the get method for rendering the chatroom page */
  app.get('/:joinCode', function(req, res) {
    var joinCode = req.params.joinCode;
    var admin;

    if (req.session.chatroom) {
      admin = true;
    } else {
      admin = false;
    }

    var joinCode = req.params.joinCode;
    var promise = Chatroom.find(joinCode);

    /* loop throuh all the names in the
    chatroom so they can be displayed */
    promise.then(function(chatroom) {
      var names = [];
      var messages = [];
      for(var i = 0; i < chatroom.users.length; i++) {
        names.push(chatroom.users[i].name)
        messages.push(chatroom.messages);
      }

      console.log(messages)

      res.render('chatroom', {
        joinCode: joinCode,
        admin: admin,
        names: names,
        messages: messages
      });

    });

  });

  /* for the creator of a chatroom to destroy it */
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
