$(document).ready(function() {
  var pathname = window.location.pathname;
  var chatroom = pathname.substr(1);

  var socket = io('/:joinCode');

  /*socket.on("join", function(user) {
    $("#usersList").append('<li>' + user.name + '</li>');

    console.log(socket.io.engine.id);
    socket.io.engine.id = user.joinCode;
    console.log(socket.io.engine.id);
  });

  socket.on("destroy", function(joinCode) {
    console.log("destroy");
    console.log(socket.io.engine.id);
    if(socket.io.engine.id == joinCode) {
      console.log("your chat session has been destryed")
    }
  });*/

  socket.on("connect", function() {
    console.log("connected");
  })

});
