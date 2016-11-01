$(document).ready(function() {
  var socket = io();
  var pathname = window.location.pathname;
  var room = pathname.substr(1);
  console.log(room);

  socket.on("create", function(joinCode) {
    socket.emit("create", joinCode)
  });

  socket.on("join", function(joinCode) {
    socket.emit("join", joinCode)
  })

  socket.on("destroy", function(joinCode) {
    console.log("room destroyed");
    //socket.to(joinCode).emit("destroy");
    socket.emit("destroy", joinCode);
  });

  socket.on("finish join", function(data) {
    console.log("the destroy finished");
  });

  socket.on("leave", function(data) {
    console.log(data.code);
    console.log(data.name);
    socket.emit("leave", data)
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
