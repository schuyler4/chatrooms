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

  join: function(joinCode) {
    var promise = Chatroom.findOne({joinCode: joinCode});
    return promise;
  },

  addUser: function(id, name) {
    const user = {
      name: name,
      messages: []
    }

    Chatroom.findByIdAndUpdate(id, {$push: {"users": user}},
      {safe: true, upsert: true}, function(err, user) {
      if(err)
        console.error(err);
    });
  },

  leave: function(joinCode, name) {
    Chatroom.findOne({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);

      console.log("the chatrooms object is " + chatroom);

      for (i = 0; i < chatroom.users.length; i++) {
        if(chatroom.users[i].name == name) {

          var pull = {$pull: {"users": chatroom.users[i]}};
          Chatroom.findOneAndUpdate({joinCode: joinCode}, pull, {safe: true},
            function(err, user) {
              if(err)
                console.error(err);
          });
        }
      }

    });
  },

  message: function() {

  },

  destroy: function(joinCode) {
    console.log("destroy triggered");
    Chatroom.remove({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);

      console.log(joinCode + " destryed");
    });
  }
}
