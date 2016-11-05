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

  /*get the join add the name to the list and add a message that they joined */
  socket.on("join", function(data) {
    console.log("recived join");
    console.log(data.room);
    console.log(room);

    if(data.room == room) {
      $("#usersList ul").append('<li>' + data.name + '</li>');
      //add the message that they joined to the chat
      $("div").append("<div><p>" + data.name + " joined </p></div>");
    }
  });

  /*get the destory and emit it back to the server */
  socket.on("destroy", function(joinCode) {
    //console.log("room destroyed");
    //console.log(joinCode + " has been destroyed" );

    if(room == joinCode) {
      console.log("appended end div");

      $('body').append('<div id="#destroyDiv"><h1>the creator of this chatroom'+
      'has destroyed it go <a href="/">home</a> </h1></div');
    }
  });

  /* get the leave back from the server and remove it from the list
  and display a message that they left */
  socket.on("leave", function(data) {
    console.log("recived leave")
    console.log(data.name);
    console.log(data.room);
    if(room == data.room) {
      $("div").append("<div><p>" + data.name + "left </p></div>");
      $("li:contains(" + data.name + ")").remove();
      console.log(data.name);
      console.log(data.room);
    }
  });

  /* emit a message to the server when a button is pressed */
  $("#messageButton").click(function() {
    var message = $('#chatText').val()

    var messageData = {
      message: message,
      room: room
    }

    if($('#chatText').val() != '') {
      socket.emit("message", messageData);
      $("#chatText").val("");
      console.log("sending message " + messageData.message);
    }
    return false;
  });

  /* display the message when they get it back from the server */
  socket.on("message", function(message) {
    var addedMessage = false;

    if(message.room == room) {
      messageAdded = true;
      $("#messagesContainer").append("<div><p>" + message.message + "</p></div>");
    }

  });

});
