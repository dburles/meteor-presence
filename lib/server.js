var connections = {};

var expire = function(id) {
  Presences.remove(id);
  delete connections[id];
};

var tick = function(id) {
  connections[id].lastSeen = Date.now();
};

Meteor.startup(function() {
  if (!process.env.PRESENCE_DONT_CLEAR) {
    var filter = {};
    if (process.env.PRESENCE_INSTANCE) {
      filter = {
        instance: process.env.PRESENCE_INSTANCE
      };
      Presences.remove(filter);
    }
  }
});

Meteor.onConnection(function(connection) {
  // console.log('connectionId: ' + connection.id + ' userId: ' + this.userId);
  var update = { $set: {} };
  
  if (process.env.PRESENCE_INSTANCE)
    update.$set.instance = process.env.PRESENCE_INSTANCE;

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
