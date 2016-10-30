var socket = io();
socket.on('user join', function(user) {
  console.log(user);
});
