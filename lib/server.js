var connections = {};

// create a new instance when the server restarts
var serverInstanceId = new Meteor.Collection.ObjectID()._str;

var expire = function(id) {
  Presences.remove(id);
  delete connections[id];
};

var tick = function(id) {
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function() {
  if (!process.env.PRESENCE_DONT_CLEAR) {
    //console.log('presence: clear presence collection')
    //console.log("presence: server instance (" + serverInstanceId + ")")
    
    var filter = {};
    
    if (process.env.PRESENCE_INSTANCE) {
      //console.log("presence: multi-server filter - "+ process.env.PRESENCE_INSTANCE)
      filter = {
        'instance.name': process.env.PRESENCE_INSTANCE,
        'instance.id': {$ne: serverInstanceId}
      };
    }
    //console.log(filter);
    Presences.remove(filter);
  } else {
    //console.log("presence: don't clear presence collection")
  }
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id + ' userId: ' + this.userId);
  var update = { $set: {} };
  
  if (process.env.PRESENCE_INSTANCE) {
    update.$set.instance = {
      name: process.env.PRESENCE_INSTANCE,
      id: serverInstanceId
    }
  }

  Presences.upsert(connection.id, update);
  connections[connection.id] = {};
  tick(connection.id);

  connection.onClose(function() {
    // console.log('connection closed: ' + connection.id);
    expire(connection.id);
  });
});

Meteor.methods({
  updatePresence: function(state) {
    check(state, Match.Any);
    if (this.connection.id) {
      // console.log('updatePresence: ' + this.connection.id);
      var update = { $set: {} };
      
      update.$set.state = state;
      if (this.userId)
        update.$set.userId = this.userId;
      else
        update.$unset = { userId: '' };
      
      var filter = {
        _id: this.connection.id
      };
      
      Presences.upsert(filter, update);
    }
  },
  presenceTick: function() {
    check(arguments, [Match.Any]);
    if (this.connection && connections[this.connection.id])
      tick(this.connection.id);
  }
});

Meteor.setInterval(function() {
  _.each(connections, function(connection, id) {
    if (connection.lastSeen < (Date.now() - 10000))
      expire(id);
  });
}, 5000);
