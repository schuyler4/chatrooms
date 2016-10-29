var mongoose = require('mongoose');

var chatroomSchema = mongoose.Schema({
  joinCode: String,
  users: [{
    name: String,
    messages: []
  }]
});

var Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = {
  create: function(joinCode, name) {
    var chatroom = new Chatroom({
      joinCode: joinCode,
      users: [{
        name: name,
        messages: []
      }]
    });

    chatroom.save();
  },

  join: function(joinCode, name) {
    console.log(joinCode);
    /*Chatroom.findOne({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);

      if(chatroom) {
        console.log("panda");
        console.log(chatroom);
        return true;
      } else {
        console.log("goose");
        console.log("this chat room does not exist");
        return false;
      }
    });*/
    var promise = Chatroom.findOne({joinCode: joinCode});
    return promise;
  },

  message: function() {

  },

  destroy: function(joinCode) {
    Chatroom.remove({joinCode: joinCode});
  }
}
