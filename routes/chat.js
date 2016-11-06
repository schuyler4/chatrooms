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
      } else {
        req.flash('Err', 'there is already a chatroom going with that joinCode');
        res.redirect('/');
      }

    });
  }

  /*create a chatroom */
  app.post('/', noJoinCodeRepeat, function(req, res) {
    console.log("posting /")
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    /*req.session.chatroom = joinCode;
    req.session.admin = true;
    req.session.name = name;

    var chatroom = req.session.chatroom;
    var admin = req.session.admin;
    var name = req.session.name*/

    sess = req.session;
    sess.chatroom = joinCode
    sess.admin = true;
    sess.name = name

    sess.save(function(err) {
      if(err)
        console.error(err);

      console.log("saved session data");
    });

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
  app.post('/join', noNameRepeat, function(req, res) {
    var joinCode = req.body.joinCode;
    var name = req.body.name;

    Chatroom.addUser(joinCode, name);
    sess=req.session
    sess.chatroom = joinCode;
    sess.admin = false;
    sess.name = name;

    sess.save(function(err) {
      if(err)
        console.error(err);
    });

    var data = {
      name: name,
      room: joinCode
    }

    io.sockets.emit("join", data);
    res.redirect('/' + joinCode);

  });

  /* this makes sure that a user can't just type a url to join a chatroom
  they half to aculy join it */
  function didJoin(req, res, next) {
    var userJoinCode = req.session.chatroom;
    var urlJoinCode = req.params.joinCode;

    if(userJoinCode == urlJoinCode) {
      next();
    } else {
      res.redirect('/');
    }

  }

  /*the get method for rendering the chatroom page */
  app.get('/:joinCode', /*didJoin,*/ function(req, res) {
    console.log("get chatroom");
    console.log("got the chatroom");
    sess = req.session
    sess.reload(function(err) {
      if(err) {
        console.error(err);
      }
      var joinCode = sess.chatroom
      var admin = sess.admin
      var name = sess.name

      console.log(joinCode)
      console.log(name);
    });

    var joinCode = req.params.joinCode;
    var promise = Chatroom.find(joinCode);

    promise.then(function(chatroom) {
      //console.log(chatroom);

      res.render('chatroom', {
        admin: true,
        chatroom: chatroom,
        joinCode: joinCode
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

    if(admin) {
      next();
    } else {
      res.redirect('/');
    }

  }

  /* for the creator of a chatroom to destroy it */
  app.post('/destroy', /*isAdmin,*/ function(req, res) {
    console.log("should be destroying");
    sess = req.session;
    var joinCode = sess.chatroom;
    console.log(joinCode);

    if(joinCode) {

      io.sockets.emit("destroy", joinCode);
      Chatroom.destroy(joinCode)

      req.session.chatroom = null;
      req.session.admin = null;
    }

    res.redirect('/');
  });
}
