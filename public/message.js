/* this file is for all the client side sockets and changing the ui based on
them*/

$(document).ready(function() {
  var socket = io();
  /* get the joinCode via url */
  var pathname = window.location.pathname;
  var room = pathname.substr(1);

  /* get the create and emit it back the server so the creator can join there
  chatroom */
  socket.on("create", function(joinCode) {
    socket.emit("create", joinCode)
  });

  /*get the join and emit it back to the server so it can be joined*/
  socket.on("join", function(joinCode) {
    socket.emit("join", joinCode)
  })

  /*get the destory and emit it back to the server */
  socket.on("destroy", function(joinCode) {
    console.log("room destroyed");
    //socket.to(joinCode).emit("destroy");
    socket.emit("destroy", joinCode);
  });

  /* after the join is finished update the ui */
  socket.on("finish join", function(name) {
    $("#usersList ul").append('<li>' + name + '</li>');
    console.log("finished join " + name)
  });

  /* get the leave and emit it back to the server */
  socket.on("leave", function(data) {
    //console.log(data.code);
    //console.log(data.name);
    socket.emit("leave", data)
  });

  /* emit a message to the server when a button is pressed */
  $("#messageButton").click(function() {
    var message = $('#chatText').val()

    var messageData = {
      message: message,
      room: room
    }

    socket.emit("message", messageData);
    $("#chatText").val("");
    console.log("sending message " + messageData.message);
  });

  /* recive message back from server so it can be displayed */
  socket.on("message", function(message) {
    console.log("we recived a message");
    $("#messageContainer").append("<div class='message'><p class='messageTest'>" +
    message + "</p></div>");
    console.log($("#messageContainer"));
    console.log("a message: " + message.message);
  });

});
