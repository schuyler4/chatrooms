/* this file is for when users do stupid stuff
leave chatrooms without destroying them */

var joinCode = window.location.pathname.substr(1);

/* do stuff when the window is unloaded */
$(window).unload(function() {
  $.ajax({
    url: '/destroy',
    method: 'POST',
    data {
      joinCode: joinCode
    },
    success: function() {
      console.log("sucksessful");
    }
    error: function(err) {
      console.error(err);
    }
  });

});
