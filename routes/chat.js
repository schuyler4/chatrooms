var express = require('express');

/*this file is for all the routes and server sockets in the chatroom and
 creating it*/

module.exports = function(app, io) {
  var Chatroom = require('../data/chatroom.js');

  /*this is where the websockets are */
  io.on("connection", function(socket) {

    /* to join the correct room when users join it */
    socket.on("create", function(joinCode) {
      //socket.join(joinCode);
    });

    /*for when someone leaves a chatroom that will contiue running */
    socket.on("leave", function(data) {
      socket.leave(data.code);
    });

    /* for the people in the chatroom to chat */
    socket.on("message", function(message) {
      Chatroom.message(message.message, message.room);
      io.emit("message", message);
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

  /* middle ware for making sure people can't be in two chatrooms at once and
  override sessions from the other */
  function notJoined(req, res, next) {
    if(req.session.name) {
      res.redirect('/');
    } else {
      next();
    }
  }

  /* destroy sessions if the users go home */
  function destroySession(req, res, next) {
    var admin = req.session.admin;
    var joinCode = req.session.chatroom;
    var name = req.session.name;

    if(admin) {
      io.sockets.emit("destroy", joinCode);
      Chatroom.destroy(joinCode)
    } else {
      Chatroom.leave(joinCode, name);

      var leaveData = {
        room: joinCode,
        name: name
      }

      io.sockets.emit("leave", leaveData);
    }

    req.session.chatroom = null;
    req.session.admin = null;
    req.session.name = null;
    next();
  }

  /* get the home and render flash messages */
  app.get('/', destroySession, function(req, res) {
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
        console.log("passed no join code repeat");
        next();
      } else {
        console.log("failed no join code repeat");
        req.flash('Err', 'there is already a chatroom going with that joinCode');
        res.redirect('/');
      }

    });
  }

  /*create a chatroom */
  app.post('/', noJoinCodeRepeat, notJoined, function(req, res) {
    console.log("posting /")
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    req.session.chatroom = joinCode;
    req.session.admin = true;
    req.session.name = name;

    Chatroom.create(joinCode, name);
    io.sockets.emit("create", joinCode);
    res.redirect('/' + joinCode);
    console.log("should have redirected");
  });

  /* middle ware for making sure there are no name repeats when
  joining a chatroom */
  function noNameRepeat(req, res, next) {
    var name = req.body.name;
    var joinCode = req.body.joinCode;
    var promise = Chatroom.findUser(joinCode, name);


    promise.then(function(user) {
      console.log(user);
      if(user != null) {
        console.log("failed name repeat");
        req.flash("Err", "there is already someone in that chatroom" +
          "with that name");
        res.redirect('/');
      } else {
        next();
      }
    });
  }

  /* for joining a chatroom that is already in existence */
  app.post('/join', noNameRepeat, notJoined, function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    console.log(joinCode);
    req.session.chatroom = joinCode
    req.session.admin = false
    req.session.name = name

    var data = {
      name: name,
      joinCode: joinCode
    }

    Chatroom.addUser(joinCode, name)
    io.sockets.emit("join", data);

    res.redirect('/' + joinCode);

  });

  /*the get method for rendering the chatroom page */
  app.get('/:joinCode', function(req, res) {
    console.log("get chatroom");
    console.log("got the chatroom");
    var admin = req.session.admin;
    var name = req.session.name;
    var joinCode = req.session.joinCode;

    if(admin) {
      console.log("this user is an admin");
    } else {
      console.log("this user is not an admin");
    }

    var joinCode = req.params.joinCode;
    var promise = Chatroom.find(joinCode);

    promise.then(function(chatroom) {
      console.log(chatroom);

      var users = chatroom.users;
      var messages = chatroom.messages;


      res.render('chatroom', {
        admin: admin,
        users: users,
        joinCode: joinCode,
        messages: messages
      });

    });

  });


  /* this is for leaving a chatroom that will no be destroyed*/
  app.post('/leave', function(req, res) {
    var joinCode = req.session.chatroom;
    var name = req.session.name;

    console.log(name + " leaveing " + joinCode);

    Chatroom.leave(joinCode, name);

    var leaveData = {
      room: joinCode,
      name: name
    }

    io.sockets.emit("leave", leaveData);
    console.log("emited leave");
    res.redirect('/');
  });

  /* check to make sure the user is an admin before they destroy a
  chat room */
  function isAdmin(req, res, next) {
    var admin = req.session.admin
    var joinCode = req.session.chatroom;

    if(admin) {
      console.log("passed is admin");
      next();
    } else {
      console.log("failed is admin");
      res.redirect('/' + joinCode);
    }

  }

  /* for the creator of a chatroom to destroy it */
  app.post('/destroy', isAdmin, function(req, res) {
    var joinCode = req.session.joinCode;
    console.log("destroying " + joinCode )

    io.sockets.emit("destroy", joinCode);
    Chatroom.destroy(joinCode)

    req.session.chatroom = null;
    req.session.admin = null;
    req.session.name = null;

    res.redirect('/');
  });
}
