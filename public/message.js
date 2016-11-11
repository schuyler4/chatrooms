/* this file is for all the client side sockets and changing the ui based on
them*/

$(document).ready(function() {
  var socket = io();
  /* get the joinCode via url */
  var pathname = window.location.pathname;
  var room = pathname.substr(1);

  /* make everything draggable */
  $("#messagesContainer").draggable();
  $("#streamDiv").draggable();
  $(".message").draggable();

  /* get the create and emit it back the server so the creator can join there
  chatroom */
  socket.on("create", function(joinCode) {
    socket.emit("create", joinCode)
  });

  /*get the join add the name to the list and add a message that they joined */
  socket.on("join", function(data) {
    console.log("got join")

    if(data.room == room) {
      console.log(data.name + "joined")

      /*if(!messageAdded) {
        $("#streamDiv").prepend("<div class='message'><p>" + data.name +
          "joined </p></div>");
        messageAdded = true
      }*/

      $("#usersList").prepend('<li>' + data.name + '</li>');
    }

  });

  /*get the destory and emit it back to the server */
  socket.on("destroy", function(joinCode) {


    if(room == joinCode) {
      $('body').append('<div id="destroyDiv"><h1>the creator of this chatroom '+
        'has destroyed it go <a href="/">home</a> </h1></div');

      $("#messageButton").attr('disabled', true);
      $("#endBtn").attr('disabled', true);
      $("#messagesContainer",$gallery).draggable();
      $("#streamDiv",$gallery).draggable();
      $(".message",$gallery).draggable();

    }
  });

  /* get the leave back from the server and remove it from the list
  and display a message that they left */
  function displayLeave(data) {
    console.log("got join");

    if(room == data.room) {
      console.log(data.name + "left");
      var messageAdded = false

      /*if(!messageAdded) {
        $("#streamDiv").prepend("<div class='message'><p>" + data.name +
          "left </p></div>");
        messageAdded = true;
      }*/

      $("#usersList:contains(" + data.name + ")").remove();
    }
  }

  socket.on("leave", displayLeave);

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
    }

    return false;
  });

  /* display the message when it comes back from the server */
  socket.on("message", function(message) {
    var addedMessage = false;

    if(message.room == room) {
      messageAdded = true;

      $("#streamDiv").prepend("<div class='message'><p>" + message.message +
        "</p></div>");
    }

  });

});
