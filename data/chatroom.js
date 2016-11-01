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

  findRooms: function() {
    var promise = Chatroom.find({});
    return promise;
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

  findUsers: function(joinCode) {
    var promise = Chatroom.findOne({joinCode: joinCode});
    return promise;
  },

  checkAdmin: function() {
    var promise = Chatroom.findOne
  },

  leave: function(joinCode, name) {
    Chatroom.findOne({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);

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

  message: function(message, joinCode, user) {
    console.log(message);
    console.log(joinCode);
    console.log(user);
  },

  destroy: function(joinCode) {
    Chatroom.remove({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);
    });
  }
}
