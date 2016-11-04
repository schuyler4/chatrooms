var mongoose = require('mongoose');
/* this file is for everything with the chatrooms database */

/*the schema for a chatroom joinCode then users with messages */
var chatroomSchema = mongoose.Schema({
  joinCode: String,
  messages: [],
  users: [{
    name: String,
  }]
});

var Chatroom = mongoose.model('Chatroom', chatroomSchema);

/* all the functionaty with the data create, destory, query */
module.exports = {
  /* create a chatroom and save it */
  create: function(joinCode, name) {
    var chatroom = new Chatroom({
      joinCode: joinCode,
      messages: [],
      users: [{
        name: name,
      }]
    });

    chatroom.save();
  },

  /* find all the chatrooms so repeats can be checked */
  findRooms: function() {
    var promise = Chatroom.find({});
    return promise;
  },

  /* used for find a chatroom*/
  find: function(joinCode) {
    var promise = Chatroom.findOne({joinCode: joinCode});
    return promise;
  },

    /* used for adding a user when they join the chatroom */
  addUser: function(joinCode, name) {
    const user = {
      name: name,
      messages: []
    }

    Chatroom.findOneAndUpdate({joinCode: joinCode}, {$push: {"users": user}},
      {safe: true, upsert: true}, function(err, user) {
      if(err)
        console.error(err);
    });
  },

  /* used to find all the users in a chatroom to check repeats */
  findUsers: function(joinCode) {
    var promise = Chatroom.findOne({joinCode: joinCode});
    return promise;
  },

  /* used to pull a user from a chatroom when they leave */
  leave: function(joinCode, name) {
    Chatroom.findOne({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);

      var pull = {$pull: {"users": name}};
      Chatroom.findOneAndUpdate({joinCode: joinCode}, pull, {safe: true},
        function(err, user) {
          if(err) {
            console.error(err);
          }

        })
    });
  },

  /* used to add a message when a user messages */
  message: function(message, joinCode) {
    var push = {$push: {"messages": message}};

    Chatroom.findOneAndUpdate({joinCode: joinCode}, push,
      {safe: true, upsert: true}, function(err, message) {
        if(err)
          console.error(err);
    });

  },

  /* find all the messages in a chatroom so they can be displayed*/
  findMessages: function(joinCode) {
    var promise = Chatroom.find({joinCode: joinCode})
    .select('users')
    .select('messages')
    .find({});

    return promise;
  },

  /* used to delete a chatroom from the database when
  it's creator destroys it */
  destroy: function(joinCode) {
    Chatroom.remove({joinCode: joinCode}, function(err, chatroom) {
      if(err)
        console.error(err);
    });
  },
  findUser: function(joinCode,name) {
    var promise = Chatroom.findOne({joinCode: joinCode, 'user.name':
    {$elemMatch: {name: name}}});
    return promise;
  }
}
