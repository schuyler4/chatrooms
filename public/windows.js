/* this file is for when users do stupid stuff
leave chatrooms without destroying them */

var joinCode = window.location.pathname.substr(1);
var button = $("#destroyBtn").html() || $("#endBtn").html();
console.log(button);

/* update data, destoying or leaving chatroom when a user leaves the
page */
$(window).unload(function() {
  /* if the button is the value of the creator destroy it else
  leave it */
  var creator;
  if(button == 'End Chat Session') {
    creator = true;
  } else {
    creator = false;
  }

  socket.emit("window upload", creator);

});
