var joinCode = window.location.pathname.substr(1);
var socket = io();

$(window).unload(function() {
  socket.emit("destroy", joinCode);
});
