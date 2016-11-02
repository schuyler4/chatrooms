/* this file is for when users do stupid stuff
leave chatrooms without destroying them */

var joinCode = window.location.pathname.substr(1);
var socket = io();

/* do stuff when the window is unloaded */
$(window).unload(function() {
  socket.emit("destroy", joinCode);
});
