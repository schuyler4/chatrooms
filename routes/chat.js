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
    });

    /* for when the room is destroyed by its creator so that people in it are
    forced to leave*/
    socket.on("destroy", function(joinCode) {
      socket.broadcast.to(joinCode).emit("finish destroy");
      socket.in(joinCode).emit("finish destroy", joinCode);
      socket.leave(joinCode);
    });

    /* for when someone joins an already created chatroom */
    socket.on("join", function(data) {
      socket.join(data.joinCode);
      socket.in(data.joinCode).emit("finish join", data.name);
      //socket.broadcast.to(data.joinCode).emit(data.name);
      console.log("emiting finish join");
    });

    /*for when someone leaves a chatroom that will contiue running */
    socket.on("leave", function(data) {
      socket.leave(data.code);
    });

    /* for the people in the chatroom to chat */
    socket.on("message", function(message) {
      Chatroom.message(message.message, message.room);

      socket.in(message.room).emit("finish message", message.message);
      socket.in(message.room).emit("finish message", message.message);

      socket.broadcast.to(message.room).emit("finish message", message.message);
    });

    /* this is for removing stuff from the database when the user leaves
    without pressing the leave or end button */
    socket.on("window unload", function(creator) {
      var name = req.session.name;
      var joinCode = req.session.chatroom;
      var creator = creator;

      if(creator) {
        Chatroom.destroy(joinCode);
      } else {
        Chatroom.leave(joinCode, name);
      }

    });

  });

  /* get the home and render flash messages */
  app.get('/', function(req, res) {
    res.render('home',{
      messages: req.flash('Err')
    });
  });

  /* middle ware for making sure there is no joinCode repeats when creatting a
  chatroom */
  function noJoinCodeRepeat(req, res, next) {
    console.log("join repeat session for chatroom " + req.session.chatroom);
    console.log("sesssion for name " + req.session.name);
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    var promise = Chatroom.findRooms();

    promise.then(function(chatrooms) {
      var noRepeat = true;

      for(var i = 0; i < chatrooms.length; i++) {
        if(chatrooms[i].joinCode == joinCode) {
          noRepeat = false;
        }
      }

      if(noRepeat) {
        next();
        console.log("passed chat room repeat");
      } else {
        res.redirect('/');
        console.log("failed chat room repeat");
      }

    });
  }

  /*create a chatroom */
  app.post('/', noJoinCodeRepeat, function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    req.session.chatroom = joinCode;
    console.log(req.session.chatroom);
    req.session.admin = true;
    req.session.name = name;

    Chatroom.create(joinCode, name);
    io.sockets.emit("create", joinCode);
    res.redirect('/' + joinCode)
    console.log("should have redirected");
  });

  /* middle ware for making sure there are no name repeats when
  joining a chatroom */
  function noNameRepeat(req, res, next) {
    var name = req.body.name;
    var joinCode = req.body.joinCode;
    var promise = Chatroom.find(joinCode);

    promise.then(function(chatroom) {
      if(chatroom) {

        for(var i = 0; i < chatroom.users.length; i++) {

          if(chatroom.users[i].name == name) {
            res.redirect('/');
          } else {
            next();
          }

        }

      } else {
        res.redirect('/');
      }
    });
  }

  /* for joining a chatroom that is already in existence */
  app.post('/join', noNameRepeat, function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    Chatroom.addUser(joinCode, name);

    req.session.chatroom = joinCode;
    req.session.admin = false;
    req.session.name = name;

    var data = {
      name: name,
      joinCode: joinCode
    }

    io.sockets.emit("join", data);
    res.redirect('/' + joinCode);

  });

  /* this makes sure that a user can't just type a url to join a chatroom
  they half to aculy join it */
  function didJoin(req, res, next) {
    console.log("session for chatroom " + req.session.chatroom);
    var userJoinCode = req.session.chatroom;
    var urlJoinCode = req.params.joinCode;

    //console.log("the user joinCode is " + userJoinCode);
    //console.log("the url joinCode is " + urlJoinCode);

    if(userJoinCode == urlJoinCode) {
      console.log("passed user join code: " + userJoinCode);
      next();
    } else {
      console.log("failed user join code: " + userJoinCode);
      res.redirect('/');
    }

  }

  /*the get method for rendering the chatroom page */
  app.get('/:joinCode', didJoin, function(req, res) {
    var joinCode = req.params.joinCode;
    var admin = req.session.admin;
    var name = req.session.name;

    var promise = Chatroom.find(joinCode);

    console.log(name + " users admin " + admin);

    promise.then(function(chatroom) {

      res.render('chatroom', {
        admin: admin,
        chatroom: chatroom,
        joinCode: joinCode
      });

    });

  });


  /* this is for leaving a chatroom that will no be destroyed*/
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

  /* check to make sure the user is an admin before they destroy a
  chat room */
  function isAdmin(req, res, next) {
    var admin = req.session.admin

    if(admin) {
      next();
    } else {
      res.redirect('/');
    }

  }

  /* for the creator of a chatroom to destroy it */
  app.post('/destroy', isAdmin, function(req, res) {
    var joinCode = req.session.chatroom;

    if(joinCode) {
      io.sockets.emit("destroy", joinCode);
      Chatroom.destroy(joinCode)

      req.session.chatroom = null;
      req.session.admin = null;
    }

    res.redirect('/');
  });
}
