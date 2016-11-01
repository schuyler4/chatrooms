$(document).ready(function() {
  var socket = io();
  var pathname = window.location.pathname;
  var room = pathname.substr(1);

  socket.on('connect', function() {

    socket.on("create", function(joinCode) {
      //console.log("recived create");
      //socket.emit("create");
      //console.log("created " + joinCode);
      console.log("recived create " + joinCode);
      socket.emit("create", joinCode);
    });

    socket.on("join", function(data) {
      //console.log("someone joined " + joinCode);
      //socket.join(joinCode);
      //socket.to(joinCode).emit("join", joinCode);
      socket.emit("join", data)

    })

    socket.on("finish join", function(name) {
      $("#usersList").append("<li>" + name + "</li>");
      console.log("finished join " + name);
    });

    socket.on("destroy", function(joinCode) {
      console.log("room destroyed");
      socket.emit("destroy", joinCode);
    });

    socket.on("finish destroy", function(joinCode) {
      console.log("your room is being destroyed");
    })

    socket.on("leave", function(data) {
      console.log(data.code);
      console.log(data.name);
      socket.emit("leave", data)
    });

  });

  $("#messageButton").click(function() {
    var message = $('#chatText').val()

    var messageData = {
      message: message,
      room: room
    }

    socket.emit("message", messageData);
    $("#chatText").val("");
  });

  socket.on("message", function(message) {
    console.log("message recived");
    console.log(message);
  });

});
